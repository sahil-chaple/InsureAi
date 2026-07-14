# InsureAI FastAPI Backend

This is the production-quality, AI-native FastAPI backend for **InsureAI**, an AI-driven insurance platform. It implements Role-Based Access Control (RBAC), transparent field-level encryption for sensitive medical data, append-only security logs, rate limiting, and standard database interfaces.

---

## Technical Stack & Features

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) with asynchronous endpoint support.
- **ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/) with database agnostic types (UUID, auto-encryption).
- **Authentication**: JWT authentication with short-lived access tokens (15 mins) and long-lived refresh tokens (7 days).
- **Authorization**: Fine-grained Role-Based Access Control (RBAC) dependency factory.
- **Encryption**: Application-level transparent database column encryption via `cryptography`'s Fernet (AES).
- **Audit Logs**: Immutability enforced at the database layer (preventing updates/deletes).
- **Rate Limiting**: `slowapi` endpoint rate limiter (limits logins & registration to 5 requests/minute).

---

## Directory Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application startup & routing
│   ├── core/
│   │   ├── config.py           # Configuration settings (pydantic-settings)
│   │   ├── security.py         # Passwords, JWT, and Fernet encryption
│   │   └── deps.py             # FastAPI dependency injections (RBAC, Current User)
│   ├── db/
│   │   ├── base.py             # Base metadata registry
│   │   └── session.py          # Session factory
│   ├── models/                 # Database ORM models
│   ├── schemas/                # Input/Output validation schemas
│   ├── services/               # Modular business logic
│   └── middleware/
│       └── rate_limit.py       # Rate limiter integration
├── alembic/                    # Database migration registry
├── tests/                      # Testing suite
├── docker-compose.yml          # Container configuration (Postgres, Redis, API)
├── requirements.txt            # Dependency list
└── seed.py                     # Database seeding script
```

---

## Local Installation

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   # On Windows (cmd/powershell):
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up your environment variables**:
   Create a `.env` file in the `backend/` directory. You can copy the values from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Note: Ensure you generate a valid Fernet key using the command provided in `.env.example`.*

---

## Running Database Migrations

This project uses **Alembic** to manage database migrations. 

- **Run migrations to bring database up to date**:
  ```bash
  alembic upgrade head
  ```

- **Generate a new migration after editing models**:
  ```bash
  alembic revision --autogenerate -m "Describe your changes"
  ```

---

## Database Seeding

To seed the database with test data (5 users representing different roles, insurance plans, sample claims, and audit entries), execute:

```bash
python seed.py
```

---

## Running the Application

To run the FastAPI server locally:

```bash
uvicorn app.main:app --reload --port 8000
```
The interactive Swagger API documentation will be available at `http://127.0.0.1:8000/docs`.

---

## Running the Automated Test Suite

To run tests (which utilize an isolated in-memory SQLite database):

```bash
pytest -v
```

---

## Example API Curl Commands

### 1. User Signup (default: `customer` role)
```bash
curl -X POST "http://127.0.0.1:8000/auth/signup" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "new_customer@insureai.com",
       "password": "securepassword123",
       "full_name": "John Doe",
       "phone": "+1555123456"
     }'
```

### 2. User Login (returns tokens)
```bash
curl -X POST "http://127.0.0.1:8000/auth/login" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "customer@insureai.com",
       "password": "password123"
     }'
```

### 3. Fetch Authenticated Profile (using Access Token)
```bash
curl -X GET "http://127.0.0.1:8000/auth/me" \
     -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 4. File a Claim (requires token)
```bash
curl -X POST "http://127.0.0.1:8000/claims" \
     -H "Authorization: Bearer <ACCESS_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{
       "policy_id": "REPLACE_WITH_VALID_POLICY_UUID",
       "incident_type": "Medical Emergency Outpatient",
       "claim_amount": 1500.00,
       "description": "Consultation and medicine reimbursement request."
     }'
```

### 5. Review Claims Queue (requires claims_reviewer or admin token)
```bash
curl -X GET "http://127.0.0.1:8000/claims/queue" \
     -H "Authorization: Bearer <REVIEWER_OR_ADMIN_ACCESS_TOKEN>"
```
