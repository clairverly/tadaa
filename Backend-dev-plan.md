
# Backend Development Plan — Tadaa Personal Concierge

---

## 1️⃣ Executive Summary

**What Will Be Built:**
A FastAPI backend for Tadaa, a personal task management application that handles bills, errands, appointments, urgent alerts, notifications, and payment methods. The backend provides REST APIs for all frontend features with MongoDB Atlas persistence.

**Key Constraints:**
- FastAPI (Python 3.13, async)
- MongoDB Atlas using Motor and Pydantic v2
- No Docker
- Manual testing after every task via frontend UI
- Single branch Git workflow (`main`)
- API base path: `/api/v1/*`
- Background tasks: synchronous by default, `BackgroundTasks` only if necessary

**Sprint Structure:**
Dynamic sprints (S0 → Sn) covering all frontend-visible features with per-task manual testing.

---

## 2️⃣ In-Scope & Success Criteria

**In-Scope Features:**
- User authentication (signup, login, logout, profile management)
- Bill management (CRUD, payment tracking, auto-pay, reminders)
- Errand management (CRUD, status workflow, admin updates)
- Appointment management (CRUD, reminders, recurring)
- Urgent alerts (send to trusted contacts, history)
- Notifications (generate, mark read, delete)
- Payment methods (CRUD, set default)
- Trusted contacts (CRUD)
- Dashboard aggregation (stats, analytics)
- Health check endpoint

**Success Criteria:**
- All frontend features functional end-to-end
- All task-level tests pass via UI
- Each sprint's code pushed to `main` after verification
- MongoDB Atlas connection stable
- JWT authentication working

---

## 3️⃣ API Design

**Base Path:** `/api/v1`

**Error Envelope:** `{ "error": "message" }`

### Health & System
- **GET /healthz**
  - Purpose: Health check with DB ping
  - Response: `{ "status": "ok", "database": "connected", "timestamp": "ISO8601" }`

### Authentication
- **POST /api/v1/auth/signup**
  - Purpose: Register new user
  - Request: `{ "name": "string", "email": "string", "password": "string" }`
  - Response: `{ "id": "string", "name": "string", "email": "string", "token": "jwt" }`
  - Validation: Email format, password min 8 chars

- **POST /api/v1/auth/login**
  - Purpose: User login
  - Request: `{ "email": "string", "password": "string" }`
  - Response: `{ "id": "string", "name": "string", "email": "string", "token": "jwt" }`

- **POST /api/v1/auth/logout**
  - Purpose: Logout (client-side token clear)
  - Response: `{ "message": "Logged out successfully" }`

- **GET /api/v1/auth/me**
  - Purpose: Get current user profile
  - Response: Full UserProfile object
  - Auth: Required

### User Profile
- **GET /api/v1/profile**
  - Purpose: Get user profile
  - Response: `{ "id", "name", "email", "trustedContacts", "notificationPreferences", "twoFactorAuth" }`
  - Auth: Required

- **PATCH /api/v1/profile**
  - Purpose: Update profile fields
  - Request: Partial profile fields
  - Response: Updated profile
  - Auth: Required

### Trusted Contacts
- **GET /api/v1/contacts**
  - Purpose: List trusted contacts
  - Response: Array of contacts
  - Auth: Required

- **POST /api/v1/contacts**
  - Purpose: Add trusted contact
  - Request: `{ "name": "string", "email": "string", "phone": "string?" }`
  - Response: Created contact
  - Auth: Required

- **PATCH /api/v1/contacts/{id}**
  - Purpose: Update contact
  - Request: Partial contact fields
  - Response: Updated contact
  - Auth: Required

- **DELETE /api/v1/contacts/{id}**
  - Purpose: Delete contact
  - Response: `{ "message": "Contact deleted" }`
  - Auth: Required

### Bills
- **GET /api/v1/bills**
  - Purpose: List all bills for user
  - Query: `?status=upcoming|overdue|paid&category=utilities|telco-internet|insurance|subscriptions|credit-loans|general`
  - Response: Array of bills
  - Auth: Required

- **POST /api/v1/bills**
  - Purpose: Create bill
  - Request: Bill object (name, amount, dueDate, recurrence, category, reminderDays, etc.)
  - Response: Created bill
  - Auth: Required

- **GET /api/v1/bills/{id}**
  - Purpose: Get bill details
  - Response: Bill object
  - Auth: Required

- **PATCH /api/v1/bills/{id}**
  - Purpose: Update bill
  - Request: Partial bill fields
  - Response: Updated bill
  - Auth: Required

- **DELETE /api/v1/bills/{id}**
  - Purpose: Delete bill
  - Response: `{ "message": "Bill deleted" }`
  - Auth: Required

- **POST /api/v1/bills/{id}/pay**
  - Purpose: Mark bill as paid
  - Request: `{ "amount": "number", "paymentMethodId": "string?" }`
  - Response: Updated bill with payment record
  - Auth: Required

### Errands
- **GET /api/v1/errands**
  - Purpose: List errands
  - Query: `?status=pending|in-progress|done&category=home-maintenance|cleaning|gardening|groceries|delivery|pharmacy&priority=normal|urgent`
  - Response: Array of errands
  - Auth: Required

- **POST /api/v1/errands**
  - Purpose: Create errand
  - Request: Errand object (type, description, priority, preferredDate, groceryList, etc.)
  - Response: Created errand with status "pending"
  - Auth: Required

- **GET /api/v1/errands/{id}**
  - Purpose: Get errand details
  - Response: Errand object
  - Auth: Required

- **PATCH /api/v1/errands/{id}**
  - Purpose: Update errand (user can edit if pending)
  - Request: Partial errand fields
  - Response: Updated errand
  - Auth: Required
  - Validation: Only pending errands can be edited by users

- **DELETE /api/v1/errands/{id}**
  - Purpose: Cancel errand
  - Response: `{ "message": "Errand cancelled" }`
  - Auth: Required
  - Validation: Only pending errands can be deleted

- **PATCH /api/v1/errands/{id}/status**
  - Purpose: Update errand status (admin only)
  - Request: `{ "status": "pending|in-progress|done", "adminNotes": "string?" }`
  - Response: Updated errand
  - Auth: Required (admin role)

### Appointments
- **GET /api/v1/appointments**
  - Purpose: List appointments
  - Query: `?type=personal|family|medical&upcoming=true|false`
  - Response: Array of appointments
  - Auth: Required

- **POST /api/v1/appointments**
  - Purpose: Create appointment
  - Request: Appointment object (title, date, time, location, type, notes, recurrence, etc.)
  - Response: Created appointment
  - Auth: Required

- **GET /api/v1/appointments/{id}**
  - Purpose: Get appointment details
  - Response: Appointment object
  - Auth: Required

- **PATCH /api/v1/appointments/{id}**
  - Purpose: Update appointment
  - Request: Partial appointment fields
  - Response: Updated appointment
  - Auth: Required

- **DELETE /api/v1/appointments/{id}**
  - Purpose: Delete appointment
  - Response: `{ "message": "Appointment deleted" }`
  - Auth: Required

### Urgent Alerts
- **GET /api/v1/alerts**
  - Purpose: Get alert history
  - Response: Array of urgent alerts
  - Auth: Required

- **POST /api/v1/alerts**
  - Purpose: Send urgent alert to trusted contacts
  - Request: `{ "message": "string?" }`
  - Response: Created alert
  - Auth: Required
  - Note: Triggers email/notification to all trusted contacts

### Notifications
- **GET /api/v1/notifications**
  - Purpose: Get user notifications
  - Query: `?unread=true|false`
  - Response: Array of notifications
  - Auth: Required

- **PATCH /api/v1/notifications/{id}/read**
  - Purpose: Mark notification as read
  - Response: `{ "message": "Marked as read" }`
  - Auth: Required

- **DELETE /api/v1/notifications/{id}**
  - Purpose: Delete notification
  - Response: `{ "message": "Notification deleted" }`
  - Auth: Required

- **DELETE /api/v1/notifications**
  - Purpose: Clear all notifications
  - Response: `{ "message": "All notifications cleared" }`
  - Auth: Required

### Payment Methods
- **GET /api/v1/payment-methods**
  - Purpose: List payment methods
  - Response: Array of payment methods
  - Auth: Required

- **POST /api/v1/payment-methods**
  - Purpose: Add payment method
  - Request: `{ "type": "card|paynow|bank", "nickname": "string", "isDefault": "boolean", ...type-specific fields }`
  - Response: Created payment method
  - Auth: Required

- **PATCH /api/v1/payment-methods/{id}**
  - Purpose: Update payment method
  - Request: Partial payment method fields
  - Response: Updated payment method
  - Auth: Required

- **DELETE /api/v1/payment-methods/{id}**
  - Purpose: Delete payment method
  - Response: `{ "message": "Payment method deleted" }`
  - Auth: Required

- **POST /api/v1/payment-methods/{id}/set-default**
  - Purpose: Set as default payment method
  - Response: `{ "message": "Default payment method updated" }`
  - Auth: Required

### Dashboard
- **GET /api/v1/dashboard/stats**
  - Purpose: Get dashboard statistics
  - Response: `{ "upcomingBills": "number", "overdueBills": "number", "activeErrands": "number", "upcomingAppointments": "number" }`
  - Auth: Required

- **GET /api/v1/dashboard/analytics**
  - Purpose: Get spending analytics
  - Response: `{ "totalMonthly": "number", "totalYearly": "number", "categoryBreakdown": [...], "monthOverMonth": "number", "trend": "string" }`
  - Auth: Required

---

## 4️⃣ Data Model (MongoDB Atlas)

### Collection: `users`
**Fields:**
- `_id`: ObjectId (MongoDB auto)
- `name`: string (required)
- `email`: string (required, unique, indexed)
- `password_hash`: string (required, Argon2)
- `trusted_contacts`: array of embedded documents
  - `id`: string
  - `name`: string
  - `email`: string
  - `phone`: string (optional)
- `notification_preferences`: embedded document
  - `bill_reminders`: boolean (default: true)
  - `appointment_reminders`: boolean (default: true)
  - `errand_updates`: boolean (default: true)
  - `payment_failures`: boolean (default: true)
- `two_factor_auth`: embedded document (optional)
  - `enabled`: boolean
  - `secret`: string
  - `backup_codes`: array of strings
  - `last_verified`: datetime
- `created_at`: datetime
- `updated_at`: datetime

**Example:**
```json
{
  "_id": "ObjectId(...)",
  "name": "Sarah Martinez",
  "email": "sarah@example.com",
  "password_hash": "$argon2id$...",
  "trusted_contacts": [
    {
      "id": "contact-1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  ],
  "notification_preferences": {
    "bill_reminders": true,
    "appointment_reminders": true,
    "errand_updates": true,
    "payment_failures": true
  },
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

### Collection: `bills`
**Fields:**
- `_id`: ObjectId
- `user_id`: ObjectId (reference to users, indexed)
- `name`: string (required)
- `amount`: float (required)
- `due_date`: datetime (required)
- `recurrence`: string (one-time, weekly, monthly, yearly, as-billed)
- `category`: string (utilities, telco-internet, insurance, subscriptions, credit-loans, general)
- `status`: string (upcoming, overdue, paid, payment-failed)
- `reminder_days`: array of integers (e.g., [7, 1, 0])
- `reminder_enabled`: boolean (default: true)
- `provider_emails`: array of strings
- `attachment_password`: string (optional)
- `payment_history`: array of embedded documents
  - `id`: string
  - `date`: datetime
  - `amount`: float
  - `status`: string (success, failed, pending)
  - `payment_method_id`: string (optional)
  - `failure_reason`: string (optional)
- `auto_pay_enabled`: boolean (default: false)
- `auto_pay_limit`: float (optional)
- `payment_method_id`: string (optional)
- `retry_count`: integer (default: 0)
- `last_payment_attempt`: datetime (optional)
- `created_at`: datetime
- `updated_at`: datetime

**Example:**
```json
{
  "_id": "ObjectId(...)",
  "user_id": "ObjectId(...)",
  "name": "Electric Bill",
  "amount": 150.50,
  "due_date": "2025-02-01T00:00:00Z",
  "recurrence": "monthly",
  "category": "utilities",
  "status": "upcoming",
  "reminder_days": [7, 1, 0],
  "reminder_enabled": true,
  "payment_history": [],
  "auto_pay_enabled": false,
  "retry_count": 0,
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

### Collection: `errands`
**Fields:**
- `_id`: ObjectId
- `user_id`: ObjectId (reference to users, indexed)
- `type`: string (home-maintenance, cleaning, gardening, groceries, delivery, pharmacy)
- `description`: string (required)
- `priority`: string (normal, urgent)
- `status`: string (pending, in-progress, done)
- `preferred_date`: datetime (required)
- `admin_notes`: string (default: "")
- `grocery_list`: array of embedded documents (optional)
  - `id`: string
  - `name`: string
  - `quantity`: integer
  - `unit`: string
  - `category`: string
  - `estimated_price`: float
  - `purchased`: boolean
- `scanned_image_url`: string (optional)
- `total_estimated_cost`: float (optional)
- `created_at`: datetime
- `updated_at`: datetime

**Example:**
```json
{
  "_id": "ObjectId(...)",
  "user_id": "ObjectId(...)",
  "type": "groceries",
  "description": "Weekly grocery shopping",
  "priority": "normal",
  "status": "pending",
  "preferred_date": "2025-01-20T00:00:00Z",
  "admin_notes": "",
  "grocery_list": [
    {
      "id": "item-1",
      "name": "Milk",
      "quantity": 2,
      "unit": "liters",
      "category": "dairy",
      "estimated_price": 5.50,
      "purchased": false
    }
  ],
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

### Collection: `appointments`
**Fields:**
- `_id`: ObjectId
- `user_id`: ObjectId (reference to users, indexed)
- `title`: string (required)
- `date`: datetime (required)
- `time`: string (required, format: "HH:MM")
- `location`: string (required)
- `type`: string (personal, family, medical)
- `notes`: string (default: "")
- `recurrence`: string (one-time, weekly, monthly, yearly)
- `reminder_minutes`: integer (default: 60)
- `reminder_enabled`: boolean (default: true)
- `created_at`: datetime
- `updated_at`: datetime

**Example:**
```json
{
  "_id": "ObjectId(...)",
  "user_id": "ObjectId(...)",
  "title": "Doctor Appointment",
  "date": "2025-01-25T00:00:00Z",
  "time": "14:30",
  "location": "City Medical Center",
  "type": "medical",
  "notes": "Annual checkup",
  "recurrence": "one-time",
  "reminder_minutes": 60,
  "reminder_enabled": true,
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

### Collection: `urgent_alerts`
**Fields:**
- `_id`: ObjectId
- `user_id`: ObjectId (reference to users, indexed)
- `message`: string (default: "I need urgent help!")
- `timestamp`: datetime (required)
- `acknowledged`: boolean (default: false)
- `sent_to`: array of strings (contact IDs)

**Example:**
```json
{
  "_id": "ObjectId(...)",
  "user_id": "ObjectId(...)",
  "message": "I need urgent help!",
  "timestamp": "2025-01-15T15:30:00Z",
  "acknowledged": false,
  "sent_to": ["contact-1", "contact-2"]
}
```

### Collection: `notifications`
**Fields:**
- `_id`: ObjectId
- `user_id`: ObjectId (reference to users, indexed)
- `type`: string (bill, appointment, errand, payment, payment-failure, system)
- `priority`: string (low, medium, high, urgent)
- `title`: string (required)
- `message`: string (required)
- `timestamp`: datetime (required)
- `is_read`: boolean (default: false)
- `action_url`: string (optional)
- `related_id`: string (optional, ID of related bill/errand/appointment)
- `customizable`: boolean (default: false)

**Example:**
```json
{
  "_id": "ObjectId(...)",
  "user_id": "ObjectId(...)",
  "type": "bill",
  "priority": "high",
  "title": "Bill Due Soon",
  "message": "Electric Bill is due in 3 days",
  "timestamp": "2025-01-15T10:00:00Z",
  "is_read": false,
  "action_url": "/bills",
  "related_id": "bill-123"
}
```

### Collection: `payment_methods`
**Fields:**
- `_id`: ObjectId
- `user_id`: ObjectId (reference to users, indexed)
- `type`: string (card, paynow, bank)
- `is_default`: boolean (default: false)
- `nickname`: string (required)
- `created_at`: datetime
- Card-specific fields (if type=card):
  - `card_brand`: string (visa, mastercard, amex, discover, other)
  - `card_last4`: string
  - `card_expiry_month`: string
  - `card_expiry_year`: string
  - `card_holder_name`: string
- PayNow-specific fields (if type=paynow):
  - `paynow_mobile`: string
- Bank-specific fields (if type=bank):
  - `bank_name`: string
  - `bank_account_last4`: string
  - `bank_account_holder_name`: string

**Example:**
```json
{
  "_id": "ObjectId(...)",
  "user_id": "ObjectId(...)",
  "type": "card",
  "is_default": true,
  "nickname": "Personal Visa",
  "card_brand": "visa",
  "card_last4": "4242",
  "card_expiry_month": "12",
  "card_expiry_year": "2027",
  "card_holder_name": "Sarah Martinez",
  "created_at": "2025-01-15T10:00:00Z"
}
```

---

## 5️⃣ Frontend Audit & Feature Map

### Dashboard (`/`)
- **Purpose:** Aggregated view of all tasks, bills, appointments
- **Data Needed:** Bills (upcoming/overdue), errands (active), appointments (upcoming), notifications, analytics
- **Endpoints:** `GET /api/v1/dashboard/stats`, `GET /api/v1/dashboard/analytics`, `GET /api/v1/bills`, `GET /api/v1/errands`, `GET /api/v1/appointments`, `GET /api/v1/notifications`
- **Auth:** Required

### Bills (`/bills`)
- **Purpose:** Manage bills by category, scan bills, email integration
- **Data Needed:** All bills with filtering by status/category
- **Endpoints:** `GET /api/v1/bills`, `POST /api/v1/bills`, `PATCH /api/v1/bills/{id}`, `DELETE /api/v1/bills/{id}`, `POST /api/v1/bills/{id}/pay`
- **Auth:** Required

### Errands (`/errands`)
- **Purpose:** Request and track errands with status workflow
- **Data Needed:** All errands with filtering by status/category/priority
- **Endpoints:** `GET /api/v1/errands`, `POST /api/v1/errands`, `PATCH /api/v1/errands/{id}`, `DELETE /api/v1/errands/{id}`, `PATCH /api/v1/errands/{id}/status` (admin)
- **Auth:** Required

### Appointments (`/appointments`)
- **Purpose:** Schedule and manage appointments
- **Data Needed:** All appointments with filtering by type
- **Endpoints:** `GET /api/v1/appointments`, `POST /api/v1/appointments`, `PATCH /api/v1/appointments/{id}`, `DELETE /api/v1/appointments/{id}`
- **Auth:** Required

### Urgent Help (`/urgent-help`)
- **Purpose:** Send urgent alerts to trusted contacts
- **Data Needed:** Trusted contacts, alert history
- **Endpoints:** `GET /api/v1/contacts`, `POST /api/v1/alerts`, `GET /api/v1/alerts`
- **Auth:** Required

### Settings (`/settings`)
- **Purpose:** Manage profile, notifications, payments, account security
- **Data Needed:** User profile, trusted contacts, notification preferences, payment methods, 2FA settings
- **Endpoints:** `GET /api/v1/profile`, `PATCH /api/v1/profile`, `GET /api/v1/contacts`, `POST /api/v1/contacts`, `PATCH /api/v1/contacts/{id}`, `DELETE /api/v1/contacts/{id}`, `GET /api/v1/notifications`, `PATCH /api/v1/notifications/{id}/read`, `DELETE /api/v1/notifications/{id}`, `GET /api/v1/payment-methods`, `POST /api/v1/payment-methods`, `DELETE /api/v1/payment-methods/{id}`
- **Auth:** Required

### Subscriptions (`/subscriptions`)
- **Purpose:** Coming soon feature (not implemented in backend)
- **Data Needed:** None
- **Endpoints:** None
- **Auth:** Not applicable

---

## 6️⃣ Configuration & ENV Vars

**Core Environment Variables:**
- `APP_ENV` — environment (development, production)
- `PORT` — HTTP port (default: 8000)
- `MONGODB_URI` — MongoDB Atlas connection string (required)
- `JWT_SECRET` — JWT signing key (required, min 32 chars)
- `JWT_EXPIRES_IN` — JWT expiry in seconds (default: 86400 = 24 hours)
- `CORS_ORIGINS` — Comma-separated allowed frontend URLs (e.g., "http://localhost:5173,https://app.tadaa.com")

**Optional:**
- `LOG_LEVEL` — Logging level (default: INFO)

---

## 7️⃣ Background Work

**Not Required for MVP:**
The frontend uses localStorage and does not require background jobs. All operations are synchronous request-response patterns.

**Future Consideration:**
If email notifications or scheduled reminders are added, use FastAPI's `BackgroundTasks` for simple async operations.

---

## 8️⃣ Integrations

**Not Required for MVP:**
The frontend currently uses mock data for:
- Bill scanning (OCR)
- Email integration
- Payment processing
- Calendar export

These features are UI-only and do not require backend integration in the initial implementation.

---

## 9️⃣ Testing Strategy (Manual via Frontend)

**Validation Method:**
All testing performed through frontend UI. No automated tests required.

**Per-Task Testing:**
Every task includes:
1. **Manual Test Step** — Exact UI action + expected result
2. **User Test Prompt** — Copy-paste instruction for testing

**Sprint Completion:**
- After all tasks in sprint pass → commit and push to `main`
- If any fail → fix and retest before pushing

---

## 🔟 Dynamic Sprint Plan & Backlog

---

## 🧱 S0 – Environment Setup & Frontend Connection

**Objectives:**
- Create FastAPI skeleton with `/api/v1` and `/healthz`
- Connect to MongoDB Atlas using `MONGODB_URI`
- `/healthz` performs DB ping and returns JSON status
- Enable CORS for frontend
- Replace dummy API URLs in frontend with real backend URLs
- Initialize Git only once at root, set default branch to `main`, and push to GitHub
- Create a single `.gitignore` file at root (ignore `__pycache__`, `.env`, `*.pyc`, etc.)

**User Stories:**
- As a developer, I need a working FastAPI server that connects to MongoDB Atlas
- As a developer, I need CORS enabled so the frontend can communicate with the backend
- As a developer, I need a health check endpoint to verify system status

**Tasks:**

### Task 1: Initialize FastAPI Project Structure
- Create `backend/` directory at project root
- Create `backend/main.py` with FastAPI app instance
- Create `backend/requirements.txt` with dependencies:
  - `fastapi==0.109.0`
  - `uvicorn[standard]==0.27.0`
  - `motor==3.3.2`
  - `pydantic==2.5.3`
  - `pydantic-settings==2.1.0`
  - `python-jose[cryptography]==3.3.0`
  - `passlib[argon2]==1.7.4`
  - `python-multipart==0.0.6`
- Create `backend/.env.example` with all required env vars
- Create `backend/config.py` for settings management using Pydantic Settings

**Manual Test Step:**
Run `cd backend && pip install -r requirements.txt` → all dependencies install successfully

**User Test Prompt:**
> "Navigate to the backend directory and install dependencies. Confirm no errors occur."

---

### Task 2: Implement Health Check Endpoint
- Create `backend/routers/health.py`
- Implement `GET /healthz` endpoint
- Endpoint pings MongoDB Atlas and returns connection status
- Response format: `{ "status": "ok", "database": "connected", "timestamp": "ISO8601" }`

**Manual Test Step:**
Start backend with `uvicorn main:app --reload` → visit `http://localhost:8000/healthz` → see JSON response with database status

**User Test Prompt:**
> "Start the backend server and navigate to http://localhost:8000/healthz in your browser. Confirm you see a JSON response showing database connection status."

---

### Task 3: Configure MongoDB Atlas Connection
- Create `backend/database.py` with Motor async client
- Implement connection function using `MONGODB_URI` from env
- Implement ping function for health check
- Add connection lifecycle (startup/shutdown events)

**Manual Test Step:**
Start backend → check logs for "Connected to MongoDB Atlas" message → `/healthz` returns `"database": "connected"`

**User Test Prompt:**
> "Start the backend and check the console logs. Confirm you see a message indicating successful MongoDB Atlas connection."

---

### Task 4: Enable CORS for Frontend
- Add CORS middleware to FastAPI app
- Configure allowed origins from `CORS_ORIGINS` env var
- Allow credentials, all methods, and common headers

**Manual Test Step:**
Start backend → open frontend dev tools → make request to `/healthz` → no CORS errors in console

**User Test Prompt:**
> "Start both backend and frontend. Open browser dev tools (F12) and check the Network tab. Confirm no CORS errors appear when the frontend loads."

---

### Task 5: Initialize Git Repository
- Run `git init` at project root (if not already initialized)
- Create `.gitignore` at root with:
  ```
  __pycache__/
  *.pyc
  *.pyo
  .env
  .venv/
  venv/
  *.log
  .DS_Store
  ```
- Set default branch to `main`: `git branch -M main`
- Create initial commit with S0 work
- Create GitHub repository and push

**Manual Test Step:**
Run `git status` → see clean working tree → run `git log` → see initial commit → check GitHub → see repository with code

**User Test Prompt:**
> "Run 'git status' to confirm all files are tracked correctly. Then check your GitHub repository to verify the code has been pushed."

---

**Definition of Done:**
- Backend runs locally on port 8000
- `/healthz` endpoint returns success with MongoDB Atlas connection status
- CORS configured for frontend communication
- Git repository initialized with `main` branch
- Code pushed to GitHub

---

## 🧩 S1 – Basic Auth (Signup / Login / Logout)

**Objectives:**
- Implement JWT-based signup, login, and logout
- Protect one backend route + one frontend page
- Store users in MongoDB with Argon2 password hashing

**User Stories:**
- As a user, I can create an account with email and password
- As a user, I can log in and receive a JWT token
- As a user, I can log out and my session is cleared
- As a user, I can access protected routes only when authenticated

**Tasks:**

### Task 1: Create User Model and Database Schema
- Create `backend/models/user.py` with Pydantic v2 User model
- Fields: `id`, `name`, `email`, `password_hash`, `trusted_contacts`, `notification_preferences`, `two_factor_auth`, `created_at`, `updated_at`
- Create database indexes on `email` field (unique)

**Manual Test Step:**
Start backend → check MongoDB Atlas → see `users` collection created with email index

**User Test Prompt:**
> "Start the backend and check your MongoDB Atlas dashboard. Confirm the 'users' collection exists with an index on the email field."

---

### Task 2: Implement Password Hashing with Argon2
- Create `backend/utils/security.py`
- Implement `hash_password(password: str) -> str` using Argon2
- Implement `verify_password(plain: str, hashed: str) -> bool`

**Manual Test Step:**
Create test script → hash password → verify correct password returns True → verify wrong password returns False

**User Test Prompt:**
> "Run a test script that hashes a password and verifies it. Confirm that correct passwords verify successfully and incorrect ones fail."

---

### Task 3: Implement JWT Token Generation
- Create `backend/utils/jwt.py`
- Implement `create_access_token(data: dict) -> str` using `JWT_SECRET` and `JWT_EXPIRES_IN`
- Implement `decode_access_token(token: str) -> dict` with error handling

**Manual Test Step:**
Create test script → generate token → decode token → verify payload matches

**User Test Prompt:**
> "Run a test script that generates and decodes a JWT token. Confirm the decoded payload matches the original data."

---

### Task 4: Implement Signup Endpoint
- Create `backend/routers/auth.py`
- Implement `POST /api/v1/auth/signup`
- Validate email format and password length (min 8 chars)
- Check for duplicate email
- Hash password with Argon2
- Create user in MongoDB
- Return user data with JWT token

**Manual Test Step:**
Open frontend → navigate to signup page → enter name, email, password → submit → see success message → redirected to dashboard

**User Test Prompt:**
> "Open the frontend and create a new account. Confirm you see a success message and are redirected to the dashboard."

---

### Task 5: Implement Login Endpoint
- Implement `POST /api/v1/auth/login` in `backend/routers/auth.py`
- Validate email and password
- Verify password hash
- Return user data with JWT token
- Handle invalid credentials with clear error message

**Manual Test Step:**
Open frontend → navigate to login page → enter valid credentials → submit → see success → redirected to dashboard

**User Test Prompt:**
> "Log in with your account credentials. Confirm you are successfully authenticated and redirected to the dashboard."

---

### Task 6: Implement Logout Endpoint
- Implement `POST /api/v1/auth/logout` in `backend/routers/auth.py`
- Return success message (token clearing handled client-side)

**Manual Test Step:**
Log in → click logout button → token cleared from frontend → redirected to login page → try accessing protected page → redirected back to login

**User Test Prompt:**
> "After logging in, click the logout button. Confirm you are redirected to the login page and cannot access protected pages without logging in again."

---

### Task 7: Implement Auth Middleware
- Create `backend/middleware/auth.py`
- Implement JWT verification dependency
- Extract user from token
- Protect `/api/v1/profile` endpoint as test

**Manual Test Step:**
Without login → try accessing `/api/v1/profile` → get 401 error → log in → access `/api/v1/profile` → get user data

**User Test Prompt:**
> "Try accessing a protected page without logging in. Confirm you get an error. Then log in and access the same page successfully."

---

**Definition of Done:**
- Users can sign up with email and password
- Users can log in and receive JWT token
- Users can log out (client-side token clear)
- Protected routes require valid JWT token
- All auth flows work end-to-end in frontend

**Post-sprint:**
- Commit and push to `main`

---

## 🧱 S2 – User Profile & Trusted Contacts

**Objectives:**
- Implement user profile management (view, update)
- Implement trusted contacts CRUD
- Enable profile settings in frontend

**User Stories:**
- As a user, I can view my profile information
- As a user, I can update my name, email, and notification preferences
- As a user, I can add, edit, and delete trusted contacts

**Tasks:**

### Task 1: Implement Get Profile Endpoint
- Implement `GET /api/v1/profile` in `backend/routers/profile.py`
- Return full user profile (exclude password_hash)
- Require authentication

**Manual Test Step:**
Log in → navigate to Settings → Profile tab → see user name and email displayed

**User Test Prompt:**
> "Log in and go to Settings > Profile. Confirm your name and email are displayed correctly."

---

### Task 2: Implement Update Profile Endpoint
- Implement `PATCH /api/v1/profile` in `backend/routers/profile.py`
- Allow updating name, email, notification_preferences
- Validate email format if changed
- Check for duplicate email if changed
- Return updated profile

**Manual Test Step:**
Settings → Profile tab → change name → save → see success message → refresh page → see updated name

**User Test Prompt:**
> "In Settings > Profile, change your name and save. Confirm you see a success message and the new name persists after refreshing."

---

### Task 3: Implement List Trusted Contacts Endpoint
- Implement `GET /api/v1/contacts` in `backend/routers/contacts.py`
- Return array of trusted contacts for authenticated user

**Manual Test Step:**
Settings → Profile tab → scroll to Trusted Contacts section → see empty state or existing contacts

**User Test Prompt:**
> "Go to Settings > Profile and scroll to the Trusted Contacts section. Confirm you see either an empty state or your existing contacts."

---

### Task 4: Implement Add Trusted Contact Endpoint
- Implement `POST /api/v1/contacts` in `backend/routers/contacts.py`
- Validate email format
- Generate unique contact ID
- Add to user's trusted_contacts array
- Return created contact

**Manual Test Step:**
Settings → Profile → Trusted Contacts → click "Add Contact" → fill form → save → see new contact in list

**User Test Prompt:**
> "Add a new trusted contact with name, email, and phone. Confirm the contact appears in your list immediately."

---

### Task 5: Implement Update Trusted Contact Endpoint
- Implement `PATCH /api/v1/contacts/{id}` in `backend/routers/contacts.py`
- Find contact by ID in user's trusted_contacts
- Update fields
- Return updated contact

**Manual Test Step:**
Settings → Profile → Trusted Contacts → click edit on contact → change name → save → see updated name

**User Test Prompt:**
> "Edit an existing trusted contact's name. Confirm the change is saved and displayed correctly."

---

### Task 6: Implement Delete Trusted Contact Endpoint
- Implement `DELETE /api/v1/contacts/{id}` in `backend/routers/contacts.py`
- Remove contact from user's trusted_contacts array
- Return success message

**Manual Test Step:**
Settings → Profile → Trusted Contacts → click delete on contact → confirm → contact removed from list

**User Test Prompt:**
> "Delete a trusted contact. Confirm you see a confirmation dialog and the contact is removed after confirming."

---

**Definition of Done:**
- Users can view and update their profile
- Users can manage trusted contacts (add, edit, delete)
- All profile operations work in frontend Settings page

**Post-sprint:**
- Commit and push to `main`

---

## 🧱 S3 – Bills Management

**Objectives:**
- Implement full CRUD for bills
- Support filtering by status and category
- Implement mark as paid functionality
- Handle payment history

**User Stories:**
- As a user, I can create bills with all required fields
- As a user, I can view all my bills filtered by status/category
- As a user, I can edit and delete bills
- As a user, I can mark bills as paid

**Tasks:**

### Task 1: Create Bill Model
- Create `backend/models/bill.py` with Pydantic v2 Bill model
- All fields from data model section
- Validation for enums (status, recurrence, category)

**Manual Test Step:**
Start backend → check MongoDB Atlas → see `bills` collection created with user_id index

**User Test Prompt:**
> "Start the backend and check MongoDB Atlas. Confirm the 'bills' collection exists with proper indexes."

---

### Task 2: Implement Create Bill Endpoint
- Implement `POST /api/v1/bills` in `backend/routers/bills.py`
- Validate required fields (name, amount, due_date, category)
- Set default values (status=upcoming, reminder_enabled=true, etc.)
- Store with user_id reference
- Return created bill

**Manual Test Step:**
Bills page → click "Add Bill" → fill form (name, amount, due date, category) → save → see bill in list

**User Test Prompt:**
> "Create a new bill with all required information. Confirm it appears in your bills list immediately."

---

### Task 3: Implement List Bills Endpoint
- Implement `GET /api/v1/bills` in `backend/routers/bills.py`
- Support query params: `?status=upcoming&category=utilities`
- Filter by user_id
- Return array of bills sorted by due_date

**Manual Test Step:**
Bills page → see all bills → use status filter → see filtered results → use category filter → see filtered results

**User Test Prompt:**
> "View your bills list and try different filters (status, category). Confirm the list updates correctly based on your selections."

---

### Task 4: Implement Get Bill Details Endpoint
- Implement `GET /api/v1/bills/{id}` in `backend/routers/bills.py`
- Verify bill belongs to authenticated user
- Return full bill details

**Manual Test Step:**
Bills page → click on a bill card → see bill details in dialog

**User Test Prompt:**
> "Click on any bill to view its details. Confirm all information is displayed correctly."

---

### Task 5: Implement Update Bill Endpoint
- Implement `PATCH /api/v1/bills/{id}` in `backend/routers/bills.py`
- Verify bill belongs to user
- Update provided fields
- Update `updated_at` timestamp
- Return updated bill

**Manual Test Step:**
Bills page → click edit on bill → change amount → save → see updated amount in list

**User Test Prompt:**
> "Edit a bill's amount and save. Confirm the new amount is displayed in the bills list."

---

### Task 6: Implement Delete Bill Endpoint
- Implement `DELETE /api/v1/bills/{id}` in `backend/routers/bills.py`
- Verify bill belongs to user
- Delete from database
- Return success message

**Manual Test Step:**
Bills page → click delete on bill → confirm deletion → bill removed from list

**User Test Prompt:**
> "Delete a bill. Confirm you see a confirmation dialog and the bill is removed after confirming."

---

### Task 7: Implement Mark Bill as Paid Endpoint
- Implement `POST /api/v1/bills/{id}/pay` in `backend/routers/bills.py`
- Create payment record with success status
- Add to payment_history array
- Update bill status to "paid"
- Return updated bill

**Manual Test Step:**
Bills page → click "Mark as Paid" on bill → see status change to "Paid" → click bill → see payment in history

**User Test Prompt:**
> "Mark a bill as paid. Confirm the status changes to 'Paid' and the payment appears in the bill's history."

---

**Definition of Done:**
- Users can create, view, edit, and delete bills
- Bills can be filtered by status and category
- Users can mark bills as paid
- Payment history is tracked

**Post-sprint:**
- Commit and push to `main`

---

## 🧱 S4 – Errands Management

**Objectives:**
- Implement full CRUD for errands
- Support status workflow (pending → in-progress → done)
- Support filtering by status, category, priority
- Handle grocery lists

**User Stories:**
- As a user, I can create errands with structured forms
- As a user, I can view and filter my errands
- As a user, I can edit pending errands
- As a user, I can delete pending errands
- As an admin, I can update errand status and add notes

**Tasks:**

### Task 1: Create Errand Model
- Create `backend/models/errand.py` with Pydantic v2 Errand model
- Include grocery_list as nested model
- Validation for enums (type, priority, status)

**Manual Test Step:**
Start backend → check MongoDB Atlas → see `errands` collection created

**User Test Prompt:**
> "Start the backend and check MongoDB Atlas. Confirm the 'errands' collection exists."

---

### Task 2: Implement Create Errand Endpoint
- Implement `POST /api/v1/errands` in `backend/routers/errands.py`
- Validate required fields (type, description, preferred_date)
- Set default status to "pending"
- Handle optional grocery_list array
- Return created errand

**Manual Test Step:**
Errands page → click "Request Errand" → select type → fill form → save → see errand in pending list

**User Test Prompt:**
> "Create a new errand. Confirm it appears in the pending errands list."

---

### Task 3: Implement List Errands Endpoint
- Implement `GET /api/v1/errands` in `backend/routers/errands.py`
- Support query params: `?status=pending&category=groceries&priority=urgent`
- Filter by user_id
- Return array of errands sorted by created_at

**Manual Test Step:**
Errands page → see all errands → use filters → see filtered results → switch tabs (pending/in-progress/done) → see correct errands

**User Test Prompt:**
> "View your errands and try different filters and tabs. Confirm the list updates correctly."

---

### Task 4: Implement Update Errand Endpoint
- Implement `PATCH /api/v1/errands/{id}` in `backend/routers/errands.py`
- Verify errand belongs to user
- Only allow updates if status is "pending"
- Return updated errand or error if not pending

**Manual Test Step:**
Errands page → click edit on pending errand → change description → save → see updated description

**User Test Prompt:**
> "Edit a pending errand's description. Confirm the change is saved. Try editing an in-progress errand and confirm it's not allowed."

---

### Task 5: Implement Delete Errand Endpoint
- Implement `DELETE /api/v1/errands/{id}` in `backend/routers/errands.py`
- Verify errand belongs to user
- Only allow deletion if status is "pending"
- Return success message or error

**Manual Test Step:**
Errands page → click delete on pending errand → confirm → errand removed

**User Test Prompt:**
> "Delete a pending errand. Confirm it's removed. Try deleting an in-progress errand and confirm it's not allowed."

---

### Task 6: Implement Update Errand Status Endpoint (Admin)
- Implement `PATCH /api/v1/errands/{id}/status` in `backend/routers/errands.py`
- For MVP, allow any authenticated user (admin role check can be added later)
- Update status and admin_notes
- Return updated errand

**Manual Test Step:**
Use API client (Postman/curl) → update errand status to "in-progress" → check frontend → see status updated

**User Test Prompt:**
> "Use an API client to update an errand's status to 'in-progress'. Refresh the frontend and confirm the status change is visible."

---

**Definition of Done:**
- Users can create, view, edit (if pending), and delete (if pending) errands
- Errands can be filtered by status, category, and priority
- Errand status can be updated (admin function)
- Grocery lists are supported

**Post-sprint:**
- Commit and push to `main`

---

## 🧱 S5 – Appointments Management

**Objectives:**
- Implement full CRUD for appointments
- Support filtering by type
- Handle recurring appointments
- Support reminders

**User Stories:**
- As a user, I can create appointments with all details
- As a user, I can view upcoming and past appointments
- As a user, I can edit and delete appointments
- As a user, I can set appointments to recur

**Tasks:**

### Task 1: Create Appointment Model
- Create `backend/models/appointment.py` with Pydantic v2 Appointment model
- Validation for enums (type, recurrence)
- Date and time validation

**Manual Test Step:**
Start backend → check MongoDB Atlas → see `appointments` collection created

**User Test Prompt:**
> "Start the backend and check MongoDB Atlas. Confirm the 'appointments' collection exists."

---

### Task 2: Implement Create Appointment Endpoint
- Implement `POST /api/v1/appointments` in `backend/routers/appointments.py`
- Validate required fields (title, date, time, location, type)
- Set defaults (recurrence=one-time, reminder_enabled=true)
- Return created appointment

**Manual Test Step:**
Appointments page → click "Schedule Appointment" → fill form → save → see appointment in upcoming list

**User Test Prompt:**
> "Create a new appointment. Confirm it appears in the upcoming appointments list."

---

### Task 3: Implement List Appointments Endpoint
- Implement `GET /api/v1/appointments` in `backend/routers/appointments.py`
- Support query params: `?type=medical&upcoming=true`
- Filter by user_id
- Return array sorted by date

**Manual Test Step:**
Appointments page → see all appointments → use type filter → see filtered results → switch to upcoming tab → see only future appointments

**User Test Prompt:**
> "View your appointments and try different filters and tabs. Confirm the list updates correctly."

---

### Task 4: Implement Update Appointment Endpoint
- Implement `PATCH /api/v1/appointments/{id}` in `backend/routers/appointments.py`
- Verify appointment belongs to user
- Update provided fields
- Return updated appointment

**Manual Test Step:**
Appointments page → click edit on appointment → change time → save → see updated time

**User Test Prompt:**
> "Edit an appointment's time. Confirm the change is saved and displayed correctly."

---

### Task 5: Implement Delete Appointment Endpoint
- Implement `DELETE /api/v1/appointments/{id}` in `backend/routers/appointments.py`
- Verify appointment belongs to user
- Delete from database
- Return success message

**Manual Test Step:**
Appointments page → click delete on appointment → confirm → appointment removed

**User Test Prompt:**
> "Delete an appointment. Confirm it's removed after confirmation."

---

**Definition of Done:**
- Users can create, view, edit, and delete appointments
- Appointments can be filtered by type
- Recurring appointments are supported
- All appointment operations work in frontend

**Post-sprint:**
- Commit and push to `main`

---

## 🧱 S6 – Urgent Alerts

**Objectives:**
- Implement urgent alert creation
- Store alert history
- Return alerts for display

**User Stories:**
- As a user, I can send urgent alerts to my trusted contacts
- As a user, I can view my alert history
- As a user, I can see which contacts received each alert

**Tasks:**

### Task 1: Create Urgent Alert Model
- Create `backend/models/urgent_alert.py` with Pydantic v2 UrgentAlert model
- Fields: id, user_id, message, timestamp, acknowledged, sent_to

**Manual Test Step:**
Start backend → check MongoDB Atlas → see `urgent_alerts` collection created

**User Test Prompt:**
> "Start the backend and check MongoDB Atlas. Confirm the 'urgent_alerts' collection exists."

---

### Task 2: Implement Send Urgent Alert Endpoint
- Implement `POST /api/v1/alerts` in `backend/routers/alerts.py`
- Get user's trusted contacts
- Create alert record with sent_to array
- Return created alert
- Note: Email sending is future enhancement, just store for now

**Manual Test Step:**
Urgent Help page → add optional message → click "Send Urgent Alert" → confirm → see success message → see alert in history

**User Test Prompt:**
> "Send an urgent alert with a custom message. Confirm you see a success message and the alert appears in your history."

---

### Task 3: Implement List Alerts Endpoint
- Implement `GET /api/v1/alerts` in `backend/routers/alerts.py`
- Filter by user_id
- Return array sorted by timestamp (newest first)

**Manual Test Step:**
Urgent Help page → scroll to Alert History → see all sent alerts with timestamps

**User Test Prompt:**
> "View your alert history. Confirm all sent alerts are displayed with correct timestamps."

---

**Definition of Done:**
- Users can send urgent alerts
- Alert history is stored and displayed
- All urgent alert features work in frontend

**Post-sprint:**
- Commit and push to `main`

---

## 🧱 S7 – Notifications Management

**Objectives:**
- Implement notification generation logic
- Implement notification CRUD operations
- Support mark as read and delete

**User Stories:**
- As a user, I can view all my notifications
- As a user, I can mark notifications as read
- As a user, I can delete individual notifications
- As a user, I can clear all notifications

**Tasks:**

### Task 1: Create Notification Model
- Create `backend/models/notification.py` with Pydantic v2 Notification model
- Validation for enums (type, priority)

**Manual Test Step:**
Start backend → check MongoDB Atlas → see `notifications` collection created

**User Test Prompt:**
> "Start the backend and check MongoDB Atlas. Confirm the 'notifications' collection exists."

---

### Task 2: Implement Notification Generation Logic
- Create `backend/services/notification_service.py`
- Implement functions to generate notifications for:
  - Bills due soon (7 days, 1 day, day of)
  - Overdue bills
  - Appointments upcoming (based on reminder_minutes)
  - Errand status changes
  - Payment failures
- Called during relevant operations (bill creation, status updates, etc.)

**Manual Test Step:**
Create bill with due date in 3 days → check notifications → see "Bill due soon" notification

**User Test Prompt:**
> "Create a bill due in 3 days. Check Settings > Notifications and confirm you see a reminder notification."

---

### Task 3: Implement List Notifications Endpoint
- Implement `GET /api/v1/notifications` in `backend/routers/notifications.py`
- Support query param: `?unread=true`
- Filter by user_id
- Return array sorted by timestamp (newest first)

**Manual Test Step:**
Settings → Notifications tab → see all notifications → unread notifications highlighted

**User Test Prompt:**
> "Go to Settings > Notifications. Confirm you see all your notifications with unread ones highlighted."

---

### Task 4: Implement Mark Notification as Read Endpoint
- Implement `PATCH /api/v1/notifications/{id}/read` in `backend/routers/notifications.py`
- Update is_read to true
- Return success message

**Manual Test Step:**
Settings → Notifications → click on unread notification → see it marked as read

**User Test Prompt:**
> "Click on an unread notification. Confirm it's marked as read."

---

### Task 5: Implement Delete Notification Endpoint
- Implement `DELETE /api/v1/notifications/{id}` in `backend/routers/notifications.py`
- Delete notification from database
- Return success message

**Manual Test Step:**
Settings → Notifications → click delete on notification → notification removed

**User Test Prompt:**
> "Delete a notification. Confirm it's removed from the list."

---

### Task 6: Implement Clear All Notifications Endpoint
- Implement `DELETE /api/v1/notifications` in `backend/routers/notifications.py`
- Delete all notifications for user
- Return success message

**Manual Test Step:**
Settings → Notifications → click "Clear All" → all notifications removed

**User Test Prompt:**
> "Click 'Clear All' in the notifications tab. Confirm all notifications are removed."

---

**Definition of Done:**
- Notifications are generated for relevant events
- Users can view, mark as read, and delete notifications
- Clear all functionality works

**Post-sprint:**
- Commit and push to `main`

---

## 🧱 S8 – Payment Methods Management

**Objectives:**
- Implement payment methods CRUD
- Support multiple payment types (card, paynow, bank)
- Handle default payment method

**User Stories:**
- As a user, I can add payment methods
- As a user, I can view all my payment methods
- As a user, I can set a default payment method
- As a user, I can delete payment methods

**Tasks:**

### Task 1: Create Payment Method Model
- Create `backend/models/payment_method.py` with Pydantic v2 PaymentMethod model
- Support discriminated union for different payment types
- Validation for card expiry, etc.

**Manual Test Step:**
Start backend → check MongoDB Atlas → see `payment_methods` collection created

**User Test Prompt:**
> "Start the backend and check MongoDB Atlas. Confirm the 'payment_methods' collection exists."

---

### Task 2: Implement Add Payment Method Endpoint
- Implement `POST /api/v1/payment-methods` in `backend/routers/payment_methods.py`
- Validate based on payment type
- If isDefault=true, unset default on other methods
- Return created payment method

**Manual Test Step:**
Settings → Payments → click "Add Payment Method" → fill card details → save → see payment method in list

**User Test Prompt:**
> "Add a new payment method. Confirm it appears in your payment methods list."

---

### Task 3: Implement List Payment Methods Endpoint
- Implement `GET /api/v1/payment-methods` in `backend/routers/payment_methods.py`
- Filter by user_id
- Return array with default method first

**Manual Test Step:**
Settings → Payments tab → see all payment methods → default method has badge

**User Test Prompt:**
> "View your payment methods. Confirm the default method is clearly marked."

---

### Task 4: Implement Set Default Payment Method Endpoint
- Implement `POST /api/v1/payment-methods/{id}/set-default` in `backend/routers/payment_methods.py`
- Unset default on all other methods
- Set isDefault=true on specified method
- Return success message

**Manual Test Step:**
Settings → Payments → click "Set as Default" on non-default method → see default badge move

**User Test Prompt:**
> "Set a different payment method as default. Confirm the default badge moves to the new method."

---

### Task 5: Implement Delete Payment Method Endpoint
- Implement `DELETE /api/v1/payment-methods/{id}` in `backend/routers/payment_methods.py`
- Delete payment method
- If was default and others exist, set first remaining as default
- Return success message

**Manual Test Step:**
Settings → Payments → click delete on payment method → confirm → method removed

**User Test Prompt:**
> "Delete a payment method. Confirm it's removed from the list."

---

**Definition of Done:**
- Users can add, view, and delete payment methods
- Default payment method can be set
- All payment method operations work in frontend

**Post-sprint:**
- Commit and push to `main`

---

## 🧱 S9 – Dashboard Aggregation

**Objectives:**
- Implement dashboard statistics endpoint
- Implement spending analytics endpoint
- Aggregate data from bills, errands, appointments

**User Stories:**
- As a user, I can see a summary of upcoming bills, active errands, and appointments
- As a user, I can see spending analytics and trends

**Tasks:**

### Task 1: Implement Dashboard Stats Endpoint
- Implement `GET /api/v1/dashboard/stats` in `backend/routers/dashboard.py`
- Count upcoming bills (status=upcoming)
- Count overdue bills (due_date < today and status != paid)
- Count active errands (status != done)
- Count upcoming appointments (date >= today)
- Return stats object

**Manual Test Step:**
Dashboard page → see stats cards with correct counts

**User Test Prompt:**
> "View the dashboard. Confirm the stats cards show correct counts for bills, errands, and appointments."

---

### Task 2: Implement Spending Analytics Endpoint
- Implement `GET /api/v1/dashboard/analytics` in `backend/routers/dashboard.py`
- Calculate total monthly spending (monthly + yearly/12)
- Calculate total yearly spending
- Calculate category breakdown with percentages
- Calculate month-over-month trend
- Return analytics object

**Manual Test Step:**
Dashboard page → scroll to Spending Analytics → see charts and breakdown

**User Test Prompt:**
> "View the Spending Analytics section on the dashboard. Confirm you see spending breakdown by category."

---

**Definition of Done:**
- Dashboard displays accurate statistics
- Spending analytics shows correct calculations
- All dashboard features work in frontend

**Post-sprint:**
- Commit and push to `main`

---

## ✅ STYLE & COMPLIANCE CHECKS

**Final Verification:**
- ✅ All endpoints use `/api/v1/*` base path
- ✅ MongoDB Atlas connection only (no local instance)
- ✅ Python 3.13 runtime
- ✅ FastAPI with async/await
- ✅ Pydantic v2 models
- ✅ Argon2 password hashing
- ✅ JWT authentication
- ✅ Manual testing after each task
- ✅ Single branch `main` workflow
- ✅ No Docker
- ✅ CORS enabled for frontend
- ✅ Error responses use `{ "error": "message" }` format

---

## 🎯 COMPLETION CRITERIA

**All Sprints Complete When:**
1. All frontend features are functional end-to-end
2. All manual tests pass via UI
3. MongoDB Atlas connection is stable
4. Authentication and authorization work correctly
5. All CRUD operations work for bills, errands, appointments
6. Notifications are generated and manageable
7. Dashboard shows accurate data
8. Code is pushed to GitHub `main` branch

**Next Steps After Completion:**
- Switch to orchestrator mode to execute the plan
- Follow each sprint sequentially
- Test thoroughly after each task
- Commit and push after each sprint

---

**END OF BACKEND DEVELOPMENT PLAN**