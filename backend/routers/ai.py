"""
AI Chat Router - Claude AI Integration
Handles chat interactions with Claude AI for task management
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import anthropic
import os

router = APIRouter(prefix="/api/ai", tags=["ai"])

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


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    message: str
    role: str = "assistant"


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
            
            context_info = f"""
You are Tadaa AI Assistant, helping users manage their personal tasks and life.

Current Context:
- Bills: {len(bills)} total
- Tasks: {len(errands)} total  
- Appointments: {len(appointments)} total

You can help with:
1. Creating new tasks through conversation (ask for: task type, description, priority, and optional preferred date)
2. Answering questions about bills, tasks, and appointments
3. Providing summaries and insights
4. Managing schedules and reminders

When creating tasks, you MUST ask for missing mandatory fields:
- Task Type (required): Home Maintenance, Cleaning, Gardening, Groceries, Delivery, or Pharmacy
- Description (required): What needs to be done
- Priority (required): Urgent or Normal
- Preferred Date (optional): When it should be completed, or "anytime"

Be conversational, helpful, and guide the user step-by-step when creating tasks.
"""
        
        # Convert messages to Claude format
        claude_messages = []
        for msg in request.messages:
            if msg.role in ["user", "assistant"]:
                claude_messages.append({
                    "role": msg.role,
                    "content": msg.content
                })
        
        # Call Claude API
        response = client.messages.create(
            model="claude-3-haiku-20240307",
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