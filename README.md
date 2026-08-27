# Expense Tracker Application

# Exspend
![Project Screenshot](https://github.com/DineshPabboju/Exspend/blob/main/frontend/public/demo.png)
A full-stack expense tracker application with a **FastAPI** backend, **React** (Vite) frontend, and a **SQLite** database. Exspend lets users register, log in, track expenses against a monthly budget, and view a summary dashboard of their spending.

# Live Demo
- [Live Demo](https://exspend-seven.vercel.app/)

## Features

- 🔐 **User authentication** — registration and login secured with JWT access tokens and bcrypt-hashed passwords
- 💰 **Budget tracking** — set and update a monthly budget per user
- 🧾 **Expense management** — create, update, and delete expenses with title, amount, category, date, and description
- 🔎 **Filtering & search** — filter expenses by category, date range, and free-text search, with configurable sorting
- 📊 **Dashboard summary** — aggregated view of spending against your budget
- ⚡ **Modern frontend** — React 19 + Vite for a fast development experience

## Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — Python web framework
- [SQLAlchemy](https://www.sqlalchemy.org/) — ORM
- SQLite — database
- [PyJWT](https://pyjwt.readthedocs.io/) — JSON Web Tokens for auth
- [bcrypt](https://pypi.org/project/bcrypt/) — password hashing
- [Uvicorn](https://www.uvicorn.org/) — ASGI server

**Frontend**
- [React](https://react.dev/) 19
- [Vite](https://vitejs.dev/) — build tool / dev server
- [lucide-react](https://lucide.dev/) — icons
- [oxlint](https://oxc.rs/) — linting

## Project Structure

```
Exspend/
├── backend/
│   ├── main.py            # FastAPI app & API routes
│   ├── models.py          # SQLAlchemy models (User, Expense)
│   ├── schemas.py         # Pydantic request/response schemas
│   ├── crud.py            # Database access/query logic
│   ├── auth.py            # Password hashing & JWT handling
│   ├── database.py        # DB engine/session setup
│   ├── test_api.py        # API tests
│   └── requirements.txt   # Python dependencies
└── frontend/
    ├── src/
    │   ├── App.jsx         # Root React component
    │   ├── api.js          # API client for backend calls
    │   ├── components/     # UI components
    │   ├── assets/         # Static assets
    │   └── main.jsx        # React entry point
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js and npm

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`, with interactive docs at `http://127.0.0.1:8000/docs`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173` by default (Vite dev server). The backend is configured to accept requests from `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`, and `http://127.0.0.1:3000`.

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/token` | Log in and obtain a JWT access token |
| GET | `/api/users/me` | Get the current authenticated user's details |
| PUT | `/api/users/budget` | Update the current user's monthly budget |
| POST | `/api/expenses` | Create a new expense |
| GET | `/api/expenses` | List expenses (supports `category`, `search`, `start_date`, `end_date`, `sort_by` query params) |
| GET | `/api/expenses/summary` | Get dashboard summary (spending vs. budget) |
| PUT | `/api/expenses/{expense_id}` | Update an existing expense |
| DELETE | `/api/expenses/{expense_id}` | Delete an expense |

All expense and user endpoints (other than register/login) require a valid JWT bearer token.

## Building for Production

```bash
cd frontend
npm run build
```

This generates a production build of the frontend in `frontend/dist`, which can be served separately or alongside the FastAPI backend.

## License

No license has been specified for this project.
