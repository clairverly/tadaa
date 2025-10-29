# AI Extraction System - User Guide

## Overview

The Tadaa AI Assistant now features an advanced **persona-based information extraction system** that automatically detects and extracts structured information from natural conversations. This allows users to create tasks, reminders, bills, schedules, and payment methods simply by talking to the AI assistant.

## Features

### 🤖 Conversational AI with Extraction
- Natural language understanding
- Automatic detection of tasks, reminders, bills, appointments, and payment details
- Step-by-step information gathering
- Real-time extraction status visualization

### 📊 Smart Information Extraction
The AI can extract and organize:
- **Tasks/Errands**: Type, description, priority, preferred date
- **Reminders**: Title, date, time, recurrence
- **Bills**: Name, amount, due date, category, recurrence
- **Appointments**: Title, date, time, location, type
- **Payment Methods**: Card, PayNow, or bank account details

### ✅ Validation & Completion
- Tracks missing required fields
- Asks for missing information conversationally
- Shows extraction progress in real-time
- One-click save when all information is complete

## How to Use

### 1. Open the AI Assistant
Click the 🤖 button in the bottom-right corner of any page (when logged in).

### 2. Start a Conversation
Simply tell the AI what you need to do. Examples:

**For Bills:**
```
"I need to pay my electricity bill of $150 by next Friday"
"My internet bill is $89.99 due on the 15th of each month"
```

**For Tasks:**
```
"I need to buy groceries tomorrow"
"Remind me to clean the house this weekend, it's urgent"
```

**For Appointments:**
```
"Schedule a doctor's appointment next Monday at 2pm at City Clinic"
"I have a family dinner on Friday at 7pm at Marina Bay"
```

**For Reminders:**
```
"Remind me to call mom tomorrow at 5pm"
"Set a reminder for my anniversary on December 25th"
```

**For Payment Methods:**
```
"Add my Visa card ending in 1234, expires 12/25"
"Save my PayNow number 91234567"
```

### 3. Provide Missing Information
The AI will ask for any missing required fields:
- Answer naturally in the conversation
- The AI extracts information as you provide it
- Watch the extraction panel update in real-time

### 4. Review & Save
Once all required information is collected:
- Review the extracted data in the status panel
- Click the "Save" button to save the item
- The item is automatically added to the appropriate section

## Extraction Status Indicators

| Icon | Status | Meaning |
|------|--------|---------|
| 🔄 | Extracting | AI is currently gathering information |
| ⚠️ | Incomplete | Some required fields are still missing |
| ✅ | Complete | All required information collected, ready to save |
| 💾 | Saved | Item has been saved successfully |

## Required Fields by Type

### Task/Errand
- ✅ Type (home-maintenance, cleaning, gardening, groceries, delivery, pharmacy)
- ✅ Description
- ✅ Priority (urgent or normal)
- ⭕ Preferred Date (optional)

### Reminder
- ✅ Title
- ✅ Reminder Date
- ✅ Reminder Time
- ⭕ Recurrence (optional)

### Bill
- ✅ Name
- ✅ Amount
- ✅ Due Date
- ✅ Category (utilities, telco-internet, insurance, subscriptions, credit-loans, general)
- ⭕ Recurrence (optional)

### Appointment/Schedule
- ✅ Title
- ✅ Date
- ✅ Time
- ✅ Location
- ⭕ Type (personal, family, medical) (optional)

### Payment Method
- ✅ Type (card, paynow, bank)
- ✅ Nickname

**For Card:**
- ✅ Card Brand
- ✅ Last 4 Digits
- ✅ Expiry Month & Year
- ✅ Cardholder Name

**For PayNow:**
- ✅ Mobile Number

**For Bank:**
- ✅ Bank Name
- ✅ Account Last 4 Digits
- ✅ Account Holder Name

## Tips for Best Results

### 1. Be Specific
❌ "I have a bill"
✅ "I need to pay my electricity bill of $150 by next Friday"

### 2. Include Key Details
Provide as much information as possible in your first message:
- Amounts with currency
- Specific dates or relative dates (tomorrow, next Monday)
- Categories or types
- Priorities (urgent, important)

### 3. Answer Follow-up Questions
The AI will ask for missing information one field at a time. Answer naturally:
```
AI: "What category would this bill fall under?"
You: "utilities"
```

### 4. Review Before Saving
Always check the extraction panel to ensure all information is correct before clicking Save.

### 5. Multiple Items
You can create multiple items in one conversation. After saving one item, just start describing the next one.

## Example Conversations

### Example 1: Creating a Bill
```
You: I need to pay my electricity bill of $150 by next Friday

AI: I can help you track that electricity bill! I've noted it's $150 
    and due next Friday. What category would this fall under? 
    (utilities, telco-internet, insurance, subscriptions, credit-loans, or general)

[Extraction Panel shows: Bill - Incomplete]
✓ Name: Electricity Bill
✓ Amount: $150
✓ Due Date: 2024-01-19
⚠️ Still needed: category

You: utilities

AI: Perfect! I've saved your electricity bill. It's $150, due next Friday, 
    and categorized as utilities. Would you like to set up reminders or enable auto-pay?

[Extraction Panel shows: Bill - Complete]
✓ Name: Electricity Bill
✓ Amount: $150
✓ Due Date: 2024-01-19
✓ Category: utilities
[Save Button Available]
```

### Example 2: Creating a Task
```
You: I need to buy groceries tomorrow, it's urgent

AI: I'll help you create that task! I've noted it's a groceries task 
    for tomorrow with urgent priority. Could you describe what groceries 
    you need to buy?

[Extraction Panel shows: Task - Incomplete]
✓ Type: groceries
✓ Priority: urgent
✓ Preferred Date: 2024-01-16
⚠️ Still needed: description

You: Milk, eggs, bread, and vegetables

AI: Great! I've created your urgent groceries task for tomorrow. 
    The task includes: Milk, eggs, bread, and vegetables.

[Extraction Panel shows: Task - Complete]
✓ Type: groceries
✓ Description: Milk, eggs, bread, and vegetables
✓ Priority: urgent
✓ Preferred Date: 2024-01-16
[Save Button Available]
```

## Technical Details

### Backend API Endpoints
- `POST /api/ai/extract/chat` - Send message with extraction
- `GET /api/ai/extract/conversations` - Get all conversations
- `GET /api/ai/extract/conversations/{id}` - Get specific conversation
- `POST /api/ai/extract/conversations/{id}/save-item/{item_id}` - Save extracted item

### Frontend Components
- `AIChatExtractionWidget` - Main chat interface with extraction visualization
- `ai-extraction.ts` - Service layer for API communication
- Extraction types defined in `types/index.ts`

### Data Flow
1. User sends message → Frontend
2. Frontend calls `/api/ai/extract/chat` → Backend
3. Backend sends to Claude AI with extraction prompt
4. Claude responds with message + extraction data (JSON)
5. Backend stores conversation and extracted items
6. Frontend displays message and extraction status
7. User reviews and clicks Save
8. Frontend calls save endpoint
9. Backend moves item to appropriate collection (bills, tasks, etc.)

## Troubleshooting

### AI doesn't detect my item
- Be more specific about what you're trying to create
- Use keywords like "bill", "task", "reminder", "appointment"
- Include key details (amounts, dates, descriptions)

### Missing fields not being asked
- The AI asks for one field at a time
- Answer the current question before it moves to the next
- If stuck, try rephrasing your answer

### Save button not appearing
- Ensure all required fields are filled (check the extraction panel)
- The status should show "Complete" with no missing fields
- Try refreshing the conversation if needed

### Item not saving
- Check that you're logged in
- Verify all required fields are present
- Check browser console for errors
- Ensure backend is running

## Privacy & Security

- All conversations are stored securely in MongoDB
- Conversations are tied to your user account
- Only you can see your conversations and extracted items
- Data is encrypted in transit (HTTPS)
- Sensitive payment information follows PCI compliance guidelines

## Future Enhancements

- Voice input support
- Multi-language support
- Bulk item creation
- Smart suggestions based on history
- Integration with calendar apps
- Email parsing for automatic bill detection
- Receipt scanning with OCR

## Support

If you encounter any issues or have questions:
1. Check this guide first
2. Review the example conversations
3. Try rephrasing your request
4. Contact support if the issue persists

---

**Version:** 1.0.0  
**Last Updated:** January 2024  
**AI Model:** Claude 3.5 Sonnet