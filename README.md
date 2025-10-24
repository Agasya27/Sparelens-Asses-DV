# Data Visualization Dashboard

A full-stack web application for uploading, analyzing, and visualizing CSV/Excel data with interactive tables and charts.

## Features

- **Secure Authentication**: JWT-based signup/login with role-based access control (Admin/Member)
- **File Upload**: Drag-and-drop CSV and Excel file upload with real-time progress tracking
- **Data Management**: Store and manage uploaded files with metadata
- **Interactive Tables**: Server-side pagination, sorting, searching, and column-level filtering
- **Dynamic Charts**: Bar, Line, and Pie charts with real-time updates based on filters
- **Export**: Download filtered data as CSV and charts as PNG
- **Theme Support**: Light/Dark mode toggle with localStorage persistence
- **Role-Based Access**: Admins can view all files, Members see only their own uploads

## Architecture

### Backend (FastAPI + Python)
- **Framework**: FastAPI with uvicorn ASGI server
- **Database**: SQLite by default (SQLAlchemy ORM). PostgreSQL optional via `DATABASE_URL`.
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Processing**: pandas for CSV/Excel parsing and data manipulation
- **API Structure**: RESTful endpoints at `/api/v1/`

### Frontend (React + Vite)
- **Framework**: React 19 with Vite build tool
- **Routing**: React Router for navigation
- **State Management**: Context API for auth and theme
- **Styling**: Tailwind CSS for responsive design
- **Charts**: Chart.js with react-chartjs-2
- **File Upload**: React Dropzone for drag-and-drop

### Database Schema

**users**
- id, username, email, password_hash, role (Admin|Member), created_at

**files**
- id, user_id, filename, storage_path, uploaded_at, row_count, columns_json

**rows**
- id, file_id, raw_json (stores parsed CSV/Excel rows as JSON)

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Create new user account
- `POST /api/v1/auth/login` - Login and receive JWT token

### User Management
- `GET /api/v1/users/me` - Get current user info
- `GET /api/v1/users` - List all users (Admin only)

### File Management
- `POST /api/v1/files/upload` - Upload CSV/Excel file
- `GET /api/v1/files` - List uploaded files (paginated)
- `GET /api/v1/files/{file_id}` - Get file metadata
- `DELETE /api/v1/files/{file_id}` - Delete file

### Data Access
- `GET /api/v1/data/{file_id}/rows` - Get rows with pagination, sorting, filtering
- `POST /api/v1/data/{file_id}/aggregate` - Get aggregated data for charts
- `GET /api/v1/data/{file_id}/columns` - Get column information with types
  
### AI
Feature removed.

### Health
- `GET /api/v1/health` - API health check

## Environment Variables

Create a `.env` file in the `backend` directory (defaults are safe for local dev):

```env
DATABASE_URL=sqlite:///./app.db
JWT_SECRET_KEY=change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=../uploads

# CORS (development): set DEV_CORS=true to allow all origins (do NOT use in production)
DEV_CORS=false
# Optional extra origins (comma-separated) for production
CORS_EXTRA_ORIGINS=

# Optional: Bootstrap an admin user at startup if none exists
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_USERNAME=admin
ADMIN_OVERWRITE=false
```

## Setup and Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (optional; SQLite is default)

### Backend Setup

Windows (PowerShell):

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

macOS/Linux:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Run Backend and Frontend (separate terminals)

**Terminal 1 - Backend:**
```powershell
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

Note: During development, the frontend uses a Vite dev proxy so API calls to `/api` automatically forward to `http://127.0.0.1:8000`. Do not set `VITE_API_URL` during local dev unless you intentionally want to target a different backend.

## Usage Guide

1. **Sign Up**: Create an account (default role: Member)
2. **Login**: Authenticate with your credentials
3. **Upload File**: Navigate to Upload page and drag/drop a CSV or Excel file
4. **View Dashboard**: Click "View Dashboard" on any file to see:
   - Interactive data table with filtering and sorting
   - Dynamic charts (Bar, Line, Pie)
   - Real-time chart updates when table filters change
   - Download the chart as PNG or PDF
5. **Manage Files**: View all your files and delete as needed

## Sample Data

A sample CSV file is provided in `sample_data/sales_data.csv` for testing.

## Key Implementation Details

### Server-Side Processing
All data operations (filtering, sorting, aggregation) are performed server-side using pandas for optimal performance with large datasets.

### Role-Based Access Control
- **Admin**: Can view and manage all files from all users
- **Member**: Can only view and manage their own files

### File Storage
- Uploaded files are stored in the filesystem (`uploads/` directory)
- Parsed rows are stored in the database using a JSON column for flexible schema support

### Chart Data
Charts are generated from backend aggregation endpoints, ensuring data consistency and supporting complex aggregations.

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- HTTP-only bearer tokens
- CORS configuration for cross-origin requests
- SQL injection protection via SQLAlchemy ORM
- Input validation with Pydantic models

## Technology Stack

**Backend:**
- FastAPI
- SQLAlchemy
- pandas
- python-jose
- passlib[bcrypt]

**Frontend:**
- React + Vite
- React Router
- Chart.js + react-chartjs-2
- Tailwind CSS
- Axios

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/  # API route handlers
│   │   ├── core/              # Config, security, database
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   └── main.py           # FastAPI application
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── context/          # Context providers
│   │   ├── pages/            # Page components
│   │   ├── services/         # API client
│   │   └── App.jsx
│   └── package.json
├── sample_data/              # Sample CSV files
├── uploads/                  # Uploaded files storage
├── start_all.sh             # Startup script
└── README.md
```

## Assumptions and Limitations

- Designed for small to medium datasets (tested up to 100K rows)
- Each uploaded file becomes a separate dataset
- Files are stored on the filesystem; for production, consider cloud storage
- Single-server deployment; for scaling, consider microservices architecture
- Basic CSV/Excel parsing; complex Excel features may not be supported

## Future Enhancements

- Background job processing for large files
- Row-level editing
- Advanced chart customization
- Real-time collaboration
- Data caching for improved performance
- Webhooks for data updates



## Deployment notes (Render or similar)

- Create two services: a Python web service for the FastAPI backend and a static site for the Vite-built frontend.
- Ensure the backend exposes port 8000 and serves the FastAPI app. Set environment variables from `.env` (do not enable `DEV_CORS` in production).
- Configure the frontend to point to the backend by setting `VITE_API_URL` to your backend URL (e.g., `https://your-backend.onrender.com`).
- Add a persistent disk or volume for SQLite database and uploads if you need to preserve data across deploys. Mount it and set `DATABASE_URL` and `UPLOAD_DIR` accordingly.
