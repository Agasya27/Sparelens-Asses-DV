# Data Visualization Dashboard - Replit Project

## Project Overview
Full-stack data visualization dashboard built with FastAPI (Python) backend and React (Vite) frontend. Users can upload CSV/Excel files, view interactive tables with filtering/sorting, and visualize data with dynamic charts.

## Current State
- ✅ Backend API fully implemented with FastAPI
- ✅ PostgreSQL database configured
- ✅ JWT authentication with role-based access control
- ✅ React frontend with Vite
- ✅ All pages implemented (Login, Signup, Upload, Files List, Dashboard)
- ✅ Interactive charts with Chart.js
- ✅ Dark/Light theme toggle
- ✅ Both workflows configured and running

## Recent Changes (October 24, 2025)
- Initial project setup with FastAPI backend and React frontend
- Database models created: Users, Files, Rows
- Authentication system with JWT tokens
- File upload with CSV/Excel parsing using pandas
- Data endpoints with server-side pagination, sorting, filtering
- Aggregation endpoints for chart data
- React frontend with routing and context API
- Interactive table and chart components
- Theme toggle functionality
- Sample data file created
- Both workflows configured

## Project Architecture

### Backend (FastAPI)
- **Location**: `/backend`
- **Entry Point**: `app/main.py`
- **Port**: 8000
- **Database**: PostgreSQL (via Replit environment)
- **Key Features**:
  - JWT authentication
  - File upload and parsing
  - Server-side data processing
  - RESTful API at `/api/v1`

### Frontend (React)
- **Location**: `/frontend`
- **Entry Point**: `src/main.jsx`
- **Port**: 5000
- **Build Tool**: Vite
- **Key Features**:
  - React Router for navigation
  - Context API for state management
  - Tailwind CSS for styling
  - Chart.js for visualizations

## User Preferences
- None specified yet

## Environment Variables
The project uses the following environment variables:
- `DATABASE_URL` - PostgreSQL connection string (provided by Replit)
- `JWT_SECRET_KEY` - Secret key for JWT tokens
- `SESSION_SECRET` - Session secret (provided by Replit)

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login

### Users
- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/users` - List users (Admin only)

### Files
- `POST /api/v1/files/upload` - Upload CSV/Excel
- `GET /api/v1/files` - List uploaded files
- `GET /api/v1/files/{id}` - Get file details
- `DELETE /api/v1/files/{id}` - Delete file

### Data
- `GET /api/v1/data/{id}/rows` - Get data rows with filters
- `POST /api/v1/data/{id}/aggregate` - Get aggregated data
- `GET /api/v1/data/{id}/columns` - Get column metadata

## Running the Project
Both workflows are configured to run automatically:
- **Frontend**: Accessible via the Webview (port 5000)
- **Backend**: Running on port 8000

To manually restart:
1. Use the workflow controls in Replit
2. Or run `./start_all.sh` from the terminal

## Testing
1. Sign up for an account
2. Upload the sample file: `sample_data/sales_data.csv`
3. View the dashboard with interactive table and charts
4. Test filtering - charts update automatically
5. Test theme toggle (light/dark mode)

## Dependencies

### Backend
- FastAPI
- SQLAlchemy
- pandas
- python-jose
- passlib
- uvicorn

### Frontend
- React 19
- React Router
- Chart.js
- Tailwind CSS
- Axios
- React Dropzone

## Known Issues
None at this time

## Future Enhancements
- CSV export functionality
- Background job processing for large files
- Row-level editing
- Advanced analytics
- Multiple chart types per dashboard
