# Data Visualization Dashboard

A full-stack web application for uploading, analyzing, and visualizing CSV/Excel data with interactive tables and charts.

## Features

- **Secure Authentication**: JWT-based signup/login with role-based access control (Admin/Member)
- **File Upload**: Drag-and-drop CSV and Excel file upload with real-time progress tracking
- **Data Management**: Store and manage uploaded files with metadata
- **Interactive Tables**: Server-side pagination, sorting, searching, and column-level filtering
- **Dynamic Charts**: Bar, Line, and Pie charts with real-time updates based on filters
- **Theme Support**: Light/Dark mode toggle with localStorage persistence
- **Role-Based Access**: Admins can view all files, Members see only their own uploads

## Architecture

### Backend (FastAPI + Python)
- **Framework**: FastAPI with uvicorn ASGI server
- **Database**: PostgreSQL with SQLAlchemy ORM
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

### Health
- `GET /api/v1/health` - API health check

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://user:password@localhost/dbname
JWT_SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=../uploads
```

## Setup and Installation

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL database

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Option 1: Run Both Services (Recommended for Replit)

```bash
chmod +x start_all.sh
./start_all.sh
```

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
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

## Usage Guide

1. **Sign Up**: Create an account (default role: Member)
2. **Login**: Authenticate with your credentials
3. **Upload File**: Navigate to Upload page and drag/drop a CSV or Excel file
4. **View Dashboard**: Click "View Dashboard" on any file to see:
   - Interactive data table with filtering and sorting
   - Dynamic charts (Bar, Line, Pie)
   - Real-time chart updates when table filters change
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
- Parsed data is stored in PostgreSQL as JSON for flexible schema support

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
- FastAPI 0.104.1
- SQLAlchemy 2.0.23
- pandas 2.1.3
- python-jose 3.3.0
- passlib 1.7.4

**Frontend:**
- React 19.1.1
- Vite 7.1.7
- React Router 6.22.0
- Chart.js 4.4.1
- Tailwind CSS 3.4.0
- Axios 1.6.5

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

- CSV export of filtered data
- Background job processing for large files
- Row-level editing
- Advanced chart customization
- Real-time collaboration
- Data caching for improved performance
- Webhooks for data updates

## License

MIT License

## Support

For issues or questions, please open an issue in the repository.
