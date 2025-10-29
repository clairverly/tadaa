"""
Conversation and Extraction models for MongoDB
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ItemType(str, Enum):
    TASK = "task"
    REMINDER = "reminder"
    BILL = "bill"
    SCHEDULE = "schedule"
    PAYMENT = "payment"

class ExtractionStatus(str, Enum):
    EXTRACTING = "extracting"
    INCOMPLETE = "incomplete"
    COMPLETE = "complete"
    SAVED = "saved"

class Message(BaseModel):
    """Individual message in a conversation"""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Message timestamp")

class ExtractedItem(BaseModel):
    """Item extracted from conversation"""
    id: str = Field(..., description="Unique identifier for extracted item")
    item_type: Optional[ItemType] = Field(None, description="Type of item being extracted")
    status: ExtractionStatus = Field(default=ExtractionStatus.EXTRACTING, description="Extraction status")
    extracted_data: Dict[str, Any] = Field(default_factory=dict, description="Extracted data fields")
    missing_fields: List[str] = Field(default_factory=list, description="Fields that still need to be collected")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    saved_at: Optional[datetime] = Field(None, description="When item was saved to its final collection")

class Conversation(BaseModel):
    """Conversation document for MongoDB"""
    user_id: str = Field(..., description="User ID who owns this conversation")
    messages: List[Message] = Field(default_factory=list, description="Conversation messages")
    extracted_items: List[ExtractedItem] = Field(default_factory=list, description="Items extracted from conversation")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "507f1f77bcf86cd799439011",
                "messages": [
                    {
                        "role": "user",
                        "content": "I need to pay my electricity bill of $150 by next Friday",
                        "timestamp": "2024-01-15T10:30:00Z"
                    }
                ],
                "extracted_items": [
                    {
                        "id": "item_123",
                        "item_type": "bill",
                        "status": "incomplete",
                        "extracted_data": {
                            "name": "Electricity Bill",
                            "amount": 150,
                            "dueDate": "2024-01-19"
                        },
                        "missing_fields": ["category", "recurrence"]
                    }
                ]
            }
        }

class ConversationResponse(Conversation):
    """Conversation response with ID"""
    id: str = Field(..., alias="_id")
    
    class Config:
        populate_by_name = True