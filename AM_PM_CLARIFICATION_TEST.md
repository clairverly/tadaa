# Date & Time Clarification Feature - Test Documentation

## Overview
The AI extraction system now automatically detects when users provide appointment dates/times without year or AM/PM specification and asks for clarification.

## Feature Behavior

### When Year is Not Specified
The AI will:
1. Detect that a date was provided without explicit year
2. Ask for clarification: "Just to confirm, is this appointment for [month day], [current year] or [next year]?"
3. Keep the appointment in "incomplete" status until year is confirmed
4. Store the date with the confirmed year

### When Time Lacks AM/PM Specification
The AI will:
1. Detect that a time was provided without clear AM/PM indication
2. Ask for clarification: "Just to confirm, is that [time] in the morning (AM) or afternoon/evening (PM)?"
3. Keep the appointment in "incomplete" status until AM/PM is confirmed
4. Convert to 24-hour format once confirmed (e.g., "3:00 PM" → "15:00")

### Accepted User Responses
- **Explicit**: "AM", "PM", "am", "pm"
- **Contextual**: "morning", "afternoon", "evening"
- **Combined**: "3 PM", "3pm", "3:00 PM"

## Test Scenarios

### Scenario 1: Date Without Year and Time Without AM/PM
**User Input:** "I have a doctor's appointment on January 15th at 3"

**Expected AI Response:**
```json
{
  "message": "I'll help you schedule that doctor's appointment! Just to confirm, is this for January 15th, 2025? And is the appointment at 3:00 in the morning (AM) or afternoon (PM)?",
  "extraction": {
    "detected": true,
    "item_type": "schedule",
    "extracted_data": {
      "title": "Doctor's Appointment"
    },
    "missing_fields": ["date", "time", "location"],
    "status": "incomplete"
  }
}
```

**User Follow-up:** "Yes 2025, and it's in the afternoon"

**Expected AI Response:**
```json
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
    "status": "incomplete"
  }
}
```

### Scenario 2: Complete Date and Time Specified
**User Input:** "Schedule dentist appointment for January 20th, 2025 at 2:30 PM at Main Street Dental"

**Expected AI Response:**
```json
{
  "message": "Perfect! I've scheduled your dentist appointment for January 20th, 2025 at 2:30 PM at Main Street Dental. Would you like to set up a reminder?",
  "extraction": {
    "detected": true,
    "item_type": "schedule",
    "extracted_data": {
      "title": "Dentist Appointment",
      "date": "2025-01-20",
      "time": "14:30",
      "location": "Main Street Dental"
    },
    "missing_fields": [],
    "status": "complete"
  }
}
```

### Scenario 3: Year Clarification for Ambiguous Date
**User Input:** "Meeting on March 5th at 9 AM"

**Expected AI Response:**
```json
{
  "message": "I'll set up that meeting for March 5th at 9:00 AM. Just to confirm, is this for March 5th, 2025?",
  "extraction": {
    "detected": true,
    "item_type": "schedule",
    "extracted_data": {
      "title": "Meeting",
      "time": "09:00"
    },
    "missing_fields": ["date", "location"],
    "status": "incomplete"
  }
}
```

**User Follow-up:** "Yes"

**Expected AI Response:**
```json
{
  "message": "Great! March 5th, 2025 at 9:00 AM. Where will this meeting take place?",
  "extraction": {
    "detected": true,
    "item_type": "schedule",
    "extracted_data": {
      "title": "Meeting",
      "date": "2025-03-05",
      "time": "09:00"
    },
    "missing_fields": ["location"],
    "status": "incomplete"
  }
}
```

### Scenario 4: Using "Morning" Context (No Year Needed for "Tomorrow")
**User Input:** "Gym session tomorrow morning at 7"

**Expected AI Response:**
```json
{
  "message": "Great! I'll schedule your gym session for tomorrow morning at 7:00 AM. Where will this be?",
  "extraction": {
    "detected": true,
    "item_type": "schedule",
    "extracted_data": {
      "title": "Gym Session",
      "date": "2025-01-31",
      "time": "07:00"
    },
    "missing_fields": ["location"],
    "status": "incomplete"
  }
}
```

**Note:** When users say "tomorrow", "next week", etc., the year is automatically inferred and doesn't need clarification.

## Date & Time Conversion Rules

### Year Handling
| User Input | Clarification Needed | Notes |
|------------|---------------------|-------|
| "January 15th" | Yes | Ask if 2025 or 2026 |
| "March 5, 2025" | No | Year explicitly stated |
| "tomorrow" | No | Automatically calculated |
| "next Monday" | No | Automatically calculated |
| "in 2 weeks" | No | Automatically calculated |

### Time Conversion
| User Input | Stored Format | Notes |
|------------|---------------|-------|
| 3 PM | 15:00 | Standard afternoon |
| 3 AM | 03:00 | Early morning |
| 12 PM | 12:00 | Noon |
| 12 AM | 00:00 | Midnight |
| 3:30 PM | 15:30 | With minutes |
| 9 (morning) | 09:00 | Context-based |
| 9 (evening) | 21:00 | Context-based |

## Testing Instructions

1. Open the AI Chat Widget in the frontend
2. Try each test scenario above
3. Verify the AI asks for year clarification when dates lack explicit year
4. Verify the AI asks for AM/PM clarification when times lack it
5. Confirm dates are stored with correct year (2025, not 2024)
6. Confirm times are stored in 24-hour format
7. Check that complete date/time specifications don't trigger unnecessary clarifications

## Success Criteria

✅ AI detects dates without year specification
✅ AI asks for year clarification in a natural way
✅ AI detects times without AM/PM specification
✅ AI asks for AM/PM clarification in a natural, conversational way
✅ AI accepts various forms of responses (year numbers, AM, PM, morning, afternoon, evening)
✅ Dates are stored with correct year
✅ Times are correctly converted to 24-hour format
✅ Appointments with complete date/time proceed without extra questions
✅ The extraction status remains "incomplete" until all clarifications are confirmed
✅ Relative dates (tomorrow, next week) don't trigger year clarification