# Project Setup and Codebase Overview

This document explains the repository layout, key files, and how the parts fit together for the Data Visualization Dashboard.

If you’re looking for API request/response details, see `API_DOCUMENTATION.md`. For run instructions and environment variables, see `README.md`.

## Repository layout

```
DataVizDash/
├── API_DOCUMENTATION.md      # Endpoint-level API docs
├── LICENSE                   # MIT license
├── README.md                 # Features, setup, and how to run
├── setup-explanation.md      # You are here
├── start_all.sh              # Convenience script (Linux/macOS)
├── sample_data/              # Example CSV for testing
├── uploads/                  # Local uploads (ignored in git)
├── backend/
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Sample environment variables
│   ├── .env                  # Local secrets (ignored in git)
│   ├── tests/                # Backend tests (pytest)
│   └── app/
│       ├── main.py           # FastAPI app factory and bootstrapping
│       ├── api/
│       │   └── v1/
│       │       ├── __init__.py           # API router assembly (no AI routes mounted)
│       │       └── endpoints/
│       │           ├── auth.py           # Signup/login, token issuance
│       │           ├── users.py          # Current user and admin-only user list
│       │           ├── files.py          # Uploads metadata and file lifecycle
│       │           ├── data.py           # Rows access, filtering, aggregation
│       │           └── ai.py             # Legacy/unused — not included in router
│       ├── core/
│       │   ├── config.py       # Pydantic Settings: DB URL, JWT, CORS, admin bootstrap
│       │   ├── database.py     # SQLAlchemy engine/Base/SessionLocal
│       │   ├── deps.py         # FastAPI dependency helpers (auth, DB session)
│       │   └── security.py     # Password hashing, JWT creation/validation
│       ├── models/
│       │   ├── user.py         # User model + role enum (Admin/Member)
│       │   ├── file.py         # File model (owner, path, columns, counts)
│       │   └── row.py          # Row model storing parsed JSON per file
│       ├── schemas/
│       │   ├── user.py         # Pydantic schemas for auth/user payloads
│       │   ├── file.py         # Pydantic schemas for file metadata
│       │   └── data.py         # Pydantic schemas for rows/aggregation
│       └── services/
│           ├── data_service.py # Filtering/aggregation via pandas
│           └── file_service.py # File save/parse (CSV/Excel) and metadata
└── frontend/
    ├── package.json            # Frontend dependencies and scripts
    ├── vite.config.js          # Vite dev server and /api proxy to 127.0.0.1:8000
    ├── tailwind.config.js      # Tailwind setup
    ├── postcss.config.js       # Tailwind/PostCSS pipeline
    ├── index.html              # Root HTML template
    └── src/
        ├── main.jsx            # App bootstrap; wraps providers and renders App
        ├── App.jsx             # Routes and protected layout
        ├── index.css           # Global styles (includes Tailwind base)
        ├── context/
        │   ├── AuthContext.jsx  # JWT auth state; login/signup/logout helpers
        │   └── ThemeContext.jsx # Dark/light state; applies html.dark class
        ├── services/
        │   └── api.js           # Axios instance + endpoint wrappers
        ├── components/
        │   ├── Navbar.jsx       # Top navigation (only when logged in)
        │   ├── DataTable.jsx    # Sort/filter/paginate table UI
        │   ├── Charts.jsx       # Chart.js bar/line/pie and PNG/PDF export
        │   └── AskAI.jsx        # Legacy/unused component (not rendered)
        ├── pages/
        │   ├── Login.jsx        # Login form + theme toggle
        │   ├── Signup.jsx       # Signup form
        │   ├── FilesList.jsx    # List/manage uploaded files
        │   ├── Upload.jsx       # CSV/Excel upload
        │   └── Dashboard.jsx    # Data table + charts for a selected file
        ├── assets/              # Static assets
        └── utils/               # (Reserved) utility helpers
```
## Run Command
- Terminal-1:-cd frontend
npm run dev.
- Terminal-2:- cd c:\Users\ASUS\Downloads\DataVizDash\DataVizDash\backend
if (Test-Path .\.venv\Scripts\Activate.ps1) { . .\.venv\Scripts\Activate.ps1 }
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload.

## Backend overview

### Entry point: `backend/app/main.py`
- Creates tables via `Base.metadata.create_all(bind=engine)`.
- Configures CORS. In dev, you can allow all by setting `DEV_CORS=true` (see `config.py`).
- Includes API router under `/api/v1`.
- Exposes `GET /api/v1/health` for health checks.
- Startup hook `bootstrap_admin()` can create/promote an admin user using env vars.

### Configuration: `backend/app/core/config.py`
- Uses Pydantic Settings to load from `.env` (cwd and `backend/.env`).
- Important variables:
  - `DATABASE_URL` (defaults to a stable SQLite path under repo root)
  - `JWT_SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`
  - `UPLOAD_DIR` (default `../uploads` from backend folder)
  - `DEV_CORS`, `CORS_EXTRA_ORIGINS`
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_USERNAME`, `ADMIN_OVERWRITE`
- Note: Pydantic rejects unknown environment variables by default. Remove any obsolete vars (e.g., prior AI_* keys) to avoid startup errors.

### Database wiring
- `backend/app/core/database.py`: builds the SQLAlchemy engine (SQLite by default), `Base`, and `SessionLocal`.
- Models in `backend/app/models/` define the ORM schema:
  - `user.py`: users with `role` (Admin/Member), hashed passwords.
  - `file.py`: uploaded file metadata (owner, path, columns, counts).
  - `row.py`: stores each parsed row as JSON (flexible schema per dataset).

### Security and dependencies
- `backend/app/core/security.py`: password hashing (bcrypt via passlib), JWT token creation/validation.
- `backend/app/core/deps.py`: shared dependencies (DB session, auth extraction, role checks).

### API routes
- `backend/app/api/v1/__init__.py`: assembles the router; currently mounts only `auth`, `users`, `files`, and `data`.
- `auth.py`: `/auth/signup`, `/auth/login` — JWT issuance, returns user and token.
- `users.py`: `/users/me` and admin `/users`.
- `files.py`: Upload CSV/Excel, list files, get specific file, delete file.
- `data.py`: Get rows with server-side filtering/sorting/pagination; `POST /aggregate` for chart data.
- `ai.py`: present in the tree but not included in the router (not active).

### Services
- `file_service.py`: Handles saving uploads, parsing CSV/Excel with pandas, computing columns/types, and writing `Row` entries.
- `data_service.py`: Builds filtered/aggregated datasets for tables and charts using pandas.

### Schemas
- Pydantic schemas define request/response shapes for users, files, data (rows/aggregation).

### Tests
- `backend/tests/` contains pytest-based tests and fixtures (e.g., `conftest.py`). Run with `pytest` from `backend`.

## Frontend overview

### Bootstrapping
- `src/main.jsx`: wraps the app in `ThemeProvider` and `AuthProvider`, then renders `App`.
- `src/App.jsx`: sets up routes and simple protected app layout with `Navbar`.

### Contexts
- `AuthContext.jsx`: manages JWT token storage, login/signup/logout, and exposes current user.
- `ThemeContext.jsx`: persists dark/light theme in `localStorage` and toggles the `documentElement` `dark` class.

### Core UI
- `Navbar.jsx`: shows navigation and a theme toggle when logged in.
- `Login.jsx`/`Signup.jsx`: authentication screens; Login includes a theme toggle.
- `FilesList.jsx`: paginated list of uploaded files for the current user (admins see all).
- `Upload.jsx`: form to upload CSV/Excel; shows progress and on success links to Dashboard.
- `Dashboard.jsx`:
  - Fetches file data and columns, renders `DataTable` and `Charts`.
  - Table filtering/sorting updates the chart aggregation.

### Components
- `DataTable.jsx`: sticky header, per-column filters, sort toggles, and pagination.
- `Charts.jsx`: renders bar/line/pie via Chart.js; supports PNG and PDF downloads.

### Services
- `services/api.js`: axios instance with a request base of `/api` in dev; Vite proxies to `http://127.0.0.1:8000`.
  - Includes an axios timeout to avoid a stuck-loading UI during backend restarts.
  - Exposes grouped API helpers (auth/files/data, etc.).

### Build and tooling
- `vite.config.js`: dev server on port 5000; proxies `/api` to `http://127.0.0.1:8000`.
- `tailwind.config.js` + `postcss.config.js`: Tailwind setup; `index.css` imports Tailwind layers.
- `index.html`: root HTML template where Vite mounts the React app.

## Data flow (end-to-end)

1. User signs up or logs in; backend issues a JWT; frontend stores it.
2. User uploads a CSV/Excel in `Upload`. Backend stores the file under `uploads/` and parses rows into the DB as JSON.
3. In `FilesList`, user selects a file to open the `Dashboard`.
4. `Dashboard` requests:
   - Column metadata for building table/filters
   - Paginated rows for the `DataTable`
   - Aggregated series for `Charts` (bar/line/pie)
5. Users can filter/sort; the frontend requests updated rows/aggregates; charts and table refresh accordingly.
6. Charts can be downloaded as PNG or PDF.

## Configuration notes

- See `backend/.env.example` and `README.md` for variables. Typical local `.env`:
  - `DATABASE_URL`, `JWT_SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `UPLOAD_DIR`
  - Dev CORS: `DEV_CORS=true` to allow all origins (do not use in production)
  - `CORS_EXTRA_ORIGINS` to add specific origins for production
  - Admin bootstrap: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_USERNAME`, `ADMIN_OVERWRITE`
- Unknown env variables are rejected by default. If you have historical keys (e.g., AI_*), remove them from `.env` to prevent startup validation errors.

## Common paths and artifacts

- Database (SQLite default): created at repo root as `app.db` unless `DATABASE_URL` overrides it.
- Uploads: stored under `uploads/` (relative to repo root by default); ignored by git.
- Tests: run `pytest` inside `backend/` after activating your virtualenv.
- Dev URLs:
  - Frontend: `http://localhost:5000`
  - Backend API: `http://127.0.0.1:8000`
  - Docs: `http://127.0.0.1:8000/docs`

## Troubleshooting

- Backend fails to start with Pydantic `extra_forbidden` errors: remove unknown env keys from `.env` (e.g., old AI_* values).
- CORS during dev: the frontend proxies `/api` to the backend; do not set `VITE_API_URL` in local dev. If you use a network URL from Vite, either add it to `CORS_EXTRA_ORIGINS` or set `DEV_CORS=true` temporarily.
- File parsing errors: ensure the uploaded file is a valid CSV/Excel; pandas is used server-side for parsing.
