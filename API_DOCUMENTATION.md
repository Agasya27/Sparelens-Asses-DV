# API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "user@example.com",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "string",
    "email": "user@example.com",
    "role": "Member",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### POST /auth/login
Authenticate and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "string"
}
```

**Response:** Same as signup

## User Management

### GET /users/me
Get current authenticated user information.

**Headers:** Requires authentication

**Response:**
```json
{
  "id": 1,
  "username": "string",
  "email": "user@example.com",
  "role": "Member",
  "created_at": "2025-01-01T00:00:00Z"
}
```

### GET /users
List all users (Admin only).

**Headers:** Requires authentication (Admin role)

**Response:**
```json
[
  {
    "id": 1,
    "username": "string",
    "email": "user@example.com",
    "role": "Admin",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

## File Management

### POST /files/upload
Upload a CSV or Excel file.

**Headers:** 
- Requires authentication
- Content-Type: multipart/form-data

**Request Body:**
```
file: <binary file data>
```

**Response:**
```json
{
  "id": 1,
  "filename": "sales_data.csv",
  "row_count": 100,
  "columns": ["date", "product", "category", "revenue"],
  "message": "File uploaded and parsed successfully"
}
```

### GET /files
List all uploaded files (paginated).

**Headers:** Requires authentication

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `page_size` (integer, default: 10) - Items per page

**Response:**
```json
{
  "total": 5,
  "files": [
    {
      "id": 1,
      "filename": "sales_data.csv",
      "uploaded_at": "2025-01-01T00:00:00Z",
      "row_count": 100,
      "columns_json": {
        "columns": ["date", "product"],
        "types": {"date": "string", "product": "string"}
      }
    }
  ]
}
```

### GET /files/{file_id}
Get file metadata.

**Headers:** Requires authentication

**Response:**
```json
{
  "id": 1,
  "filename": "sales_data.csv",
  "uploaded_at": "2025-01-01T00:00:00Z",
  "row_count": 100,
  "columns_json": {
    "columns": ["date", "product", "revenue"],
    "types": {"date": "string", "product": "string", "revenue": "number"}
  }
}
```

### DELETE /files/{file_id}
Delete a file.

**Headers:** Requires authentication

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

## Data Access

### GET /data/{file_id}/rows
Retrieve data rows with filtering, sorting, and pagination.

**Headers:** Requires authentication

**Query Parameters:**
- `page` (integer, default: 1)
- `page_size` (integer, default: 50, max: 500)
- `sort_by` (string, optional) - Column name to sort by
- `sort_dir` (string, default: "asc") - "asc" or "desc"
- `search` (string, optional) - Global search term
- `filters` (JSON string, optional) - Column-specific filters

**Filter Examples:**
```
filters={"product": "Laptop"}
filters={"revenue": {"min": 1000, "max": 5000}}
```

**Response:**
```json
{
  "total": 100,
  "page": 1,
  "page_size": 50,
  "rows": [
    {
      "date": "2024-01-15",
      "product": "Laptop",
      "revenue": 4500
    }
  ]
}
```

### POST /data/{file_id}/aggregate
Get aggregated data for charts.

**Headers:** Requires authentication

**Request Body:**
```json
{
  "group_by": ["category"],
  "metrics": [
    {
      "col": "revenue",
      "agg": "sum"
    }
  ],
  "filters": {
    "region": "North"
  }
}
```

**Supported Aggregations:**
- `sum` - Sum of values
- `avg` - Average of values
- `min` - Minimum value
- `max` - Maximum value
- `count` - Count of values

**Response:**
```json
{
  "data": [
    {
      "category": "Electronics",
      "revenue_sum": 15000
    },
    {
      "category": "Furniture",
      "revenue_sum": 8000
    }
  ]
}
```

### GET /data/{file_id}/columns
Get column metadata with types and sample values.

**Headers:** Requires authentication

**Response:**
```json
[
  {
    "name": "date",
    "type": "string",
    "sample_values": ["2024-01-15", "2024-01-16", "2024-01-17"]
  },
  {
    "name": "revenue",
    "type": "number",
    "sample_values": [4500, 300, 2400]
  }
]
```

## Health Check

### GET /health
Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "message": "API is running"
}
```

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "detail": "Error message describing what went wrong"
}
```

**401 Unauthorized:**
```json
{
  "detail": "Could not validate credentials"
}
```

**403 Forbidden:**
```json
{
  "detail": "Not enough permissions"
}
```

**404 Not Found:**
```json
{
  "detail": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing rate limiting middleware.

## CORS

CORS is configured to allow all origins in development. For production, restrict to specific domains.
