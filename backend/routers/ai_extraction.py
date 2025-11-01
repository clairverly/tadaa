"""
AI Extraction Router - Enhanced Claude AI with Information Extraction
Handles conversational AI with automatic extraction of tasks, reminders, bills, schedules, and payments
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import anthropic
import os
import json
from datetime import datetime
from bson import ObjectId
from models.conversation import (
    Conversation, Message, ExtractedItem, ItemType,
    ExtractionStatus, ConversationResponse
)
from database import get_database

router = APIRouter(prefix="/api/ai/extract", tags=["ai-extraction"])

# Initialize Anthropic client
anthropic_client = None

def get_anthropic_client():
    global anthropic_client
    if anthropic_client is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="ANTHROPIC_API_KEY not configured"
            )
        anthropic_client = anthropic.Anthropic(api_key=api_key)
    return anthropic_client

# System prompt for extraction persona
EXTRACTION_SYSTEM_PROMPT = """You are Tadaa AI Assistant, a helpful personal concierge with a special ability to extract structured information from conversations.

Your primary role is to help users manage their personal life by:
1. Having natural, friendly conversations
2. Automatically detecting when users mention tasks, reminders, bills, schedules, or payment details
3. Extracting relevant information into structured JSON format
4. Asking for missing required fields in a conversational way
5. Helping users delete/remove items with proper confirmation

## Extraction Categories:

### TASK
Required fields: type (home-maintenance|cleaning|gardening|groceries|delivery|pharmacy|others), description, priority (urgent|normal)
Optional fields: preferredDate, notes

**Note:** Use "others" type for tasks that don't fit the specific categories, such as buying gifts, personal shopping, or miscellaneous errands.

### REMINDER
Required fields: title, reminderDate, reminderTime
Optional fields: notes, recurrence

### BILL
Required fields: name, amount, dueDate, category (utilities|telco-internet|insurance|subscriptions|credit-loans|general)
Optional fields: recurrence (one-time|monthly|yearly), reminderDays, autoPayEnabled

### SCHEDULE (Appointment)
Required fields: title, date, time, location
Optional fields: type (personal|family|medical), notes, recurrence

**IMPORTANT DATE AND TIME HANDLING:**

**Year Clarification:**
- When a user provides a date without explicitly stating the year, you MUST clarify which year they mean
- Ask: "Just to confirm, is this appointment for [month day], [current year] or [next year]?"
- This is especially important for dates that could be in either the current or next year
- Only mark date as complete once the year is confirmed
- Current date context: Use the current date to make intelligent assumptions, but ALWAYS confirm

**Time Clarification:**
- When a user provides a time without AM/PM (e.g., "3pm", "3:00", "3 o'clock"), you MUST clarify if it's AM or PM
- Ask: "Just to confirm, is that [time] in the morning (AM) or afternoon/evening (PM)?"
- Only mark time as complete once AM/PM is confirmed
- Convert to 24-hour format for storage: "3:00 PM" → "15:00", "9:00 AM" → "09:00"
- If user says "morning" or "afternoon/evening", infer AM/PM accordingly

### PAYMENT
Required fields: type (card|paynow|bank), nickname
For card: cardBrand, cardLast4, cardExpiryMonth, cardExpiryYear, cardHolderName
For paynow: payNowMobile
For bank: bankName, bankAccountLast4, bankAccountHolderName

## DELETION HANDLING:

When a user wants to delete/remove an item (task, reminder, bill, schedule, or payment):

1. **Detect deletion intent**: Look for keywords like "delete", "remove", "cancel", "get rid of"
2. **Clarify the item**: If the user doesn't specify which item, ask them to clarify
   - Example: "Which [item type] would you like to delete? Please provide the name or description."
3. **Confirm before deletion**: ALWAYS confirm with the user before proceeding
   - Example: "Just to confirm, you want to delete the [item name/description]? This action cannot be undone."
4. **Wait for explicit confirmation**: Only proceed after user confirms with "yes", "confirm", "delete it", etc.
5. **Use deletion response format**: When ready to delete, use the deletion response format below

## Response Format:

You MUST respond with valid JSON in this exact format:

### For Extraction (Creating/Updating Items):
{
  "message": "Your conversational response to the user",
  "extraction": {
    "detected": true/false,
    "item_type": "task|reminder|bill|schedule|payment|null",
    "extracted_data": {
      // Fields you've extracted so far
    },
    "missing_fields": ["field1", "field2"],
    "status": "extracting|incomplete|complete",
    "confidence": 0.0-1.0
  }
}

### For Deletion:
{
  "message": "Your conversational response to the user",
  "deletion": {
    "detected": true,
    "item_type": "task|reminder|bill|schedule|payment",
    "item_identifier": "name or description of the item to delete",
    "status": "clarifying|confirming|confirmed",
    "confidence": 0.0-1.0
  }
}

**Deletion Status Values:**
- "clarifying": Need to clarify which item to delete
- "confirming": Asking user to confirm deletion
- "confirmed": User has confirmed, ready to delete

## Conversation Guidelines:

1. Be warm, friendly, and conversational
2. When you detect an item, acknowledge it naturally: "I can help you with that!"
3. Extract information as the user provides it
4. Ask for ONE missing field at a time in a natural way
5. Once all required fields are collected, set status to "complete"
6. Provide helpful suggestions and context

## Examples:

User: "I need to pay my electricity bill of $150 by next Friday"
Response:
{
  "message": "I can help you track that electricity bill! I've noted it's $150 and due next Friday. What category would this fall under? (utilities, telco-internet, insurance, subscriptions, credit-loans, or general)",
  "extraction": {
    "detected": true,
    "item_type": "bill",
    "extracted_data": {
      "name": "Electricity Bill",
      "amount": 150,
      "dueDate": "2024-01-19"
    },
    "missing_fields": ["category"],
    "status": "incomplete",
    "confidence": 0.9
  }
}

User: "utilities"
Response:
{
  "message": "Perfect! I've saved your electricity bill. It's $150, due next Friday, and categorized as utilities. Would you like to set up reminders or enable auto-pay?",
  "extraction": {
    "detected": true,
    "item_type": "bill",
    "extracted_data": {
      "name": "Electricity Bill",
      "amount": 150,
      "dueDate": "2024-01-19",
      "category": "utilities"
    },
    "missing_fields": [],
    "status": "complete",
    "confidence": 1.0
  }
}

User: "I have a doctor's appointment on January 15th at 3"
Response:
{
  "message": "I'll help you schedule that doctor's appointment! Just to confirm, is this for January 15th, 2025? And is the appointment at 3:00 in the morning (AM) or afternoon (PM)?",
  "extraction": {
    "detected": true,
    "item_type": "schedule",
    "extracted_data": {
      "title": "Doctor's Appointment"
    },
    "missing_fields": ["date", "time", "location"],
    "status": "incomplete",
    "confidence": 0.8
  }
}

User: "Yes 2025, and it's in the afternoon"
Response:
{
  "message": "Perfect! January 15th, 2025 at 3:00 PM. Where is this appointment located?",
  "extraction": {
    "detected": true,
    "item_type": "schedule",
    "extracted_data": {
      "title": "Doctor's Appointment",
      "date": "2025-01-15",
      "time": "15:00"
    },
    "missing_fields": ["location"],
    "status": "incomplete",
    "confidence": 0.9
  }
}

## Deletion Examples:

User: "Delete my electricity bill"
Response:
{
  "message": "I found your Electricity Bill. Just to confirm, you want to delete the Electricity Bill that's due on [date] for $[amount]? This action cannot be undone.",
  "deletion": {
    "detected": true,
    "item_type": "bill",
    "item_identifier": "Electricity Bill",
    "status": "confirming",
    "confidence": 0.9
  }
}

User: "Yes, delete it"
Response:
{
  "message": "I've deleted your Electricity Bill. It has been removed from your bills list.",
  "deletion": {
    "detected": true,
    "item_type": "bill",
    "item_identifier": "Electricity Bill",
    "status": "confirmed",
    "confidence": 1.0
  }
}

User: "Remove my appointment"
Response:
{
  "message": "Which appointment would you like to remove? Please tell me the name or date of the appointment.",
  "deletion": {
    "detected": true,
    "item_type": "schedule",
    "item_identifier": "",
    "status": "clarifying",
    "confidence": 0.7
  }
}

Remember: Always respond with valid JSON. Be conversational but structured. ALWAYS confirm before deleting."""

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ExtractionResponse(BaseModel):
    detected: bool
    item_type: Optional[ItemType] = None
    extracted_data: Dict[str, Any] = {}
    missing_fields: List[str] = []
    status: ExtractionStatus = ExtractionStatus.EXTRACTING
    confidence: float = 0.0

class DeletionResponse(BaseModel):
    detected: bool
    item_type: Optional[ItemType] = None
    item_identifier: str = ""
    status: str = "clarifying"  # clarifying, confirming, confirmed
    confidence: float = 0.0

class ChatResponse(BaseModel):
    message: str
    conversation_id: str
    extraction: Optional[ExtractionResponse] = None
    deletion: Optional[DeletionResponse] = None

@router.post("/chat", response_model=ChatResponse)
async def chat_with_extraction(
    request: ChatRequest
):
    """
    Chat with AI assistant that automatically extracts structured information
    No authentication required for demo purposes
    """
    try:
        db = get_database()
        client = get_anthropic_client()
        
        # Use a default user_id for unauthenticated sessions
        user_id = "anonymous"
        
        # Get or create conversation
        if request.conversation_id:
            conversation_doc = await db.conversations.find_one({
                "_id": ObjectId(request.conversation_id)
            })
            if not conversation_doc:
                raise HTTPException(status_code=404, detail="Conversation not found")
            conversation = Conversation(**conversation_doc)
        else:
            conversation = Conversation(user_id=user_id)
        
        # Add user message
        user_message = Message(role="user", content=request.message)
        conversation.messages.append(user_message)
        
        # Build conversation history for Claude
        claude_messages = []
        for msg in conversation.messages:
            claude_messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Call Claude API with extraction prompt
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2048,
            system=EXTRACTION_SYSTEM_PROMPT,
            messages=claude_messages
        )
        
        # Parse Claude's response
        response_text = response.content[0].text
        
        try:
            # Try to parse as JSON
            response_json = json.loads(response_text)
            assistant_message = response_json.get("message", response_text)
            extraction_data = response_json.get("extraction")
            deletion_data = response_json.get("deletion")
        except json.JSONDecodeError:
            # Fallback if not JSON
            assistant_message = response_text
            extraction_data = None
            deletion_data = None
        
        # Add assistant message
        assistant_msg = Message(role="assistant", content=assistant_message)
        conversation.messages.append(assistant_msg)
        
        # Handle extraction
        extraction_response = None
        deletion_response = None
        
        if extraction_data and extraction_data.get("detected"):
            # Create or update extracted item
            item_id = f"item_{datetime.utcnow().timestamp()}"
            
            extracted_item = ExtractedItem(
                id=item_id,
                item_type=extraction_data.get("item_type"),
                status=ExtractionStatus(extraction_data.get("status", "extracting")),
                extracted_data=extraction_data.get("extracted_data", {}),
                missing_fields=extraction_data.get("missing_fields", []),
                updated_at=datetime.utcnow()
            )
            
            # Update or add to conversation
            existing_item_index = None
            for i, item in enumerate(conversation.extracted_items):
                if item.status != ExtractionStatus.SAVED and item.item_type == extracted_item.item_type:
                    existing_item_index = i
                    break
            
            if existing_item_index is not None:
                conversation.extracted_items[existing_item_index] = extracted_item
            else:
                conversation.extracted_items.append(extracted_item)
            
            extraction_response = ExtractionResponse(
                detected=True,
                item_type=extracted_item.item_type,
                extracted_data=extracted_item.extracted_data,
                missing_fields=extracted_item.missing_fields,
                status=extracted_item.status,
                confidence=extraction_data.get("confidence", 0.0)
            )
        
        # Handle deletion
        if deletion_data and deletion_data.get("detected"):
            deletion_response = DeletionResponse(
                detected=True,
                item_type=deletion_data.get("item_type"),
                item_identifier=deletion_data.get("item_identifier", ""),
                status=deletion_data.get("status", "clarifying"),
                confidence=deletion_data.get("confidence", 0.0)
            )
        
        # Save conversation
        conversation.updated_at = datetime.utcnow()
        conversation_dict = conversation.dict()
        
        if request.conversation_id:
            await db.conversations.update_one(
                {"_id": ObjectId(request.conversation_id)},
                {"$set": conversation_dict}
            )
            conv_id = request.conversation_id
        else:
            result = await db.conversations.insert_one(conversation_dict)
            conv_id = str(result.inserted_id)
        
        return ChatResponse(
            message=assistant_message,
            conversation_id=conv_id,
            extraction=extraction_response,
            deletion=deletion_response
        )
        
    except anthropic.APIError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Claude API error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat: {str(e)}"
        )

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations():
    """Get all conversations (no authentication required)"""
    try:
        db = get_database()
        conversations = await db.conversations.find({}).sort("updated_at", -1).to_list(100)
        
        return [ConversationResponse(id=str(conv["_id"]), **conv) for conv in conversations]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching conversations: {str(e)}"
        )

@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: str
):
    """Get a specific conversation (no authentication required)"""
    try:
        db = get_database()
        conversation = await db.conversations.find_one({
            "_id": ObjectId(conversation_id)
        })
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return ConversationResponse(id=str(conversation["_id"]), **conversation)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching conversation: {str(e)}"
        )

@router.post("/conversations/{conversation_id}/save-item/{item_id}")
async def save_extracted_item(
    conversation_id: str,
    item_id: str
):
    """
    Save an extracted item to its appropriate collection (bills, tasks, etc.)
    No authentication required for demo purposes
    """
    try:
        db = get_database()
        conversation = await db.conversations.find_one({
            "_id": ObjectId(conversation_id)
        })
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Find the extracted item
        extracted_item = None
        for item in conversation.get("extracted_items", []):
            if item["id"] == item_id:
                extracted_item = item
                break
        
        if not extracted_item:
            raise HTTPException(status_code=404, detail="Extracted item not found")
        
        if extracted_item["status"] != "complete":
            raise HTTPException(
                status_code=400,
                detail="Cannot save incomplete item. Please provide all required fields first."
            )
        
        # Save to appropriate collection based on item_type
        item_data = extracted_item["extracted_data"].copy()
        item_data["user_id"] = "anonymous"
        item_data["created_at"] = datetime.utcnow()
        item_data["updated_at"] = datetime.utcnow()
        
        collection_map = {
            "task": "errands",
            "reminder": "reminders",
            "bill": "bills",
            "schedule": "appointments",
            "payment": "payment_methods"
        }
        
        collection_name = collection_map.get(extracted_item["item_type"])
        if not collection_name:
            raise HTTPException(status_code=400, detail="Invalid item type")
        
        # Insert into appropriate collection
        result = await db[collection_name].insert_one(item_data)
        
        # Update extracted item status
        await db.conversations.update_one(
            {
                "_id": ObjectId(conversation_id),
                "extracted_items.id": item_id
            },
            {
                "$set": {
                    "extracted_items.$.status": "saved",
                    "extracted_items.$.saved_at": datetime.utcnow()
                }
            }
        )
        
        return {
            "success": True,
            "item_id": str(result.inserted_id),
            "collection": collection_name
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error saving item: {str(e)}"
        )

class DeleteItemRequest(BaseModel):
    item_type: ItemType
    item_identifier: str

@router.post("/delete-item")
async def delete_item(
    request: DeleteItemRequest
):
    """
    Delete an item (task, reminder, bill, schedule, or payment) from the database
    This endpoint is called after AI confirms deletion with the user
    No authentication required for demo purposes
    """
    try:
        db = get_database()
        
        collection_map = {
            "task": "errands",
            "reminder": "reminders",
            "bill": "bills",
            "schedule": "appointments",
            "payment": "payment_methods"
        }
        
        collection_name = collection_map.get(request.item_type)
        if not collection_name:
            raise HTTPException(status_code=400, detail="Invalid item type")
        
        # Search for the item by name/description
        # For anonymous user, we search across all items
        query = {
            "user_id": "anonymous",
            "$or": [
                {"name": {"$regex": request.item_identifier, "$options": "i"}},
                {"title": {"$regex": request.item_identifier, "$options": "i"}},
                {"description": {"$regex": request.item_identifier, "$options": "i"}},
                {"nickname": {"$regex": request.item_identifier, "$options": "i"}}
            ]
        }
        
        # Find the item
        item = await db[collection_name].find_one(query)
        
        if not item:
            raise HTTPException(
                status_code=404,
                detail=f"Could not find {request.item_type} matching '{request.item_identifier}'"
            )
        
        # Delete the item
        result = await db[collection_name].delete_one({"_id": item["_id"]})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=500,
                detail="Failed to delete item"
            )
        
        return {
            "success": True,
            "item_type": request.item_type,
            "item_id": str(item["_id"]),
            "collection": collection_name,
            "message": f"Successfully deleted {request.item_type}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting item: {str(e)}"
        )