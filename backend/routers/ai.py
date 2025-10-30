"""
AI Chat Router - Claude AI Integration
Handles chat interactions with Claude AI for task management
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Union, Dict, Any
import anthropic
import os
from dotenv import load_dotenv

router = APIRouter(prefix="/api/ai", tags=["ai"])

# Initialize Anthropic client
anthropic_client = None
load_dotenv()
def get_anthropic_client():
    global anthropic_client
    if anthropic_client is None:
        api_key = settings.ANTHROPIC_API_KEY
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="ANTHROPIC_API_KEY not configured"
            )
        anthropic_client = anthropic.Anthropic(api_key=api_key)
    return anthropic_client


class ChatMessage(BaseModel):
    role: str
    content: Union[str, Dict[str, Any]]


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    message: str
    role: str = "assistant"


@router.options("/chat")
async def chat_options():
    """Handle CORS preflight requests"""
    return {}


@router.post("/chat", response_model=ChatResponse)
async def chat_with_claude(
    request: ChatRequest
):
    """
    Send a message to Claude AI and get a response
    No authentication required for demo purposes
    """
    try:
        client = get_anthropic_client()
        
        # Build context information
        context_info = ""
        if request.context:
            bills = request.context.get("bills", [])
            errands = request.context.get("errands", [])
            appointments = request.context.get("appointments", [])
            
            context_info = r"""
                                You are Tadaa AI Assistant, a helpful personal concierge with a special ability to extract structured information from conversations.
                                Your primary role is to help users manage their personal life by:
                                1. Having natural, friendly conversations
                                2. Automatically detecting when users mention tasks, reminders, bills, schedules, or payment details
                                3. Extracting relevant information into structured JSON format
                                4. Asking for missing required fields in a conversational way
                                ## Extraction Categories:
                                ### TASK
                                Required fields: type (home-maintenance|cleaning|gardening|groceries|delivery|pharmacy), description, priority (urgent|normal)
                                Optional fields: preferredDate, notes
                                ### REMINDER
                                Required fields: title, reminderDate, reminderTime
                                Optional fields: notes, recurrence
                                ### BILL
                                Required fields: name, amount, dueDate, category (utilities|telco-internet|insurance|subscriptions|credit-loans|general)
                                Optional fields: recurrence (one-time|monthly|yearly), reminderDays, autoPayEnabled
                                ### SCHEDULE (Appointment)
                                Required fields: title, date, time, location
                                Optional fields: type (personal|family|medical), notes, recurrence
                                ### PAYMENT
                                Required fields: type (card|paynow|bank), nickname
                                For card: cardBrand, cardLast4, cardExpiryMonth, cardExpiryYear, cardHolderName
                                For paynow: payNowMobile
                                For bank: bankName, bankAccountLast4, bankAccountHolderName
                                ## Response Format:
                                You MUST respond with valid JSON in this exact format:
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
                                Remember: Always respond with valid JSON. Be conversational but structured.
                                """
        
        # Convert messages to Claude format
        claude_messages = []
        for msg in request.messages:
            if msg.role in ["user", "assistant"]:
                claude_messages.append({
                    "role": msg.role,
                    "content": msg.content if isinstance(msg.content, str) else msg.content.get("message", "")
                })
        
        # Call Claude API
        response = client.messages.create(
            model="claude-sonnet-4-5-20250929",  # Updated to Sonnet 4.5
            max_tokens=1024,
            system=context_info,
            messages=claude_messages
        )
        
        # Extract response text
        response_text = response.content[0].text
        
        return ChatResponse(
            message=response_text,
            role="assistant"
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