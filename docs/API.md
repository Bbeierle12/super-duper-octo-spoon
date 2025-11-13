# API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## API Endpoints

### Authentication

#### POST /auth/register

Register a new user and create a tenant.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "tenantName": "John's Garage"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "tenantId": "uuid"
  },
  "token": "jwt-token"
}
```

#### POST /auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "user": { ... },
  "token": "jwt-token"
}
```

#### GET /auth/me

Get current user profile (requires authentication).

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "tenantId": "uuid",
  "role": "owner"
}
```

### Tenants

#### GET /tenants/me

Get current tenant information.

**Response:**
```json
{
  "id": "uuid",
  "name": "John's Garage",
  "plan": "free",
  "isActive": true,
  "limits": {
    "maxProjects": 3,
    "maxUsers": 1,
    "maxStorageMb": 100
  }
}
```

### Projects

#### GET /projects

Get all projects for current tenant.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "1969 Camaro Pro-Touring",
      "vehicleMake": "Chevrolet",
      "vehicleModel": "Camaro",
      "vehicleYear": 1969,
      "status": "planning",
      "totalBudget": 75000,
      "totalSpent": 15000
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

#### GET /projects/:id

Get a specific project by ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "1969 Camaro Pro-Touring",
  "description": "Complete pro-touring build",
  "vehicleMake": "Chevrolet",
  "vehicleModel": "Camaro",
  "vehicleYear": 1969,
  "status": "planning",
  "goals": ["street", "track"],
  "totalBudget": 75000,
  "totalSpent": 15000,
  "categories": [...],
  "tasks": [...],
  "media": [...]
}
```

#### POST /projects

Create a new project.

**Request Body:**
```json
{
  "name": "1969 Camaro Pro-Touring",
  "description": "Complete pro-touring build",
  "vehicleMake": "Chevrolet",
  "vehicleModel": "Camaro",
  "vehicleYear": 1969,
  "status": "planning",
  "goals": ["street", "track"],
  "totalBudget": 75000,
  "vehiclePurchasePrice": 15000
}
```

#### PATCH /projects/:id

Update a project.

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "status": "teardown",
  "totalBudget": 85000
}
```

#### DELETE /projects/:id

Delete a project (soft delete).

#### GET /projects/:id/stats

Get project statistics and budget analysis.

**Response:**
```json
{
  "projectId": "uuid",
  "totalBudget": 75000,
  "totalPlanned": 65000,
  "totalActual": 15000,
  "budgetRemaining": 60000,
  "budgetVariance": -50000,
  "percentComplete": 25,
  "status": "teardown"
}
```

### Categories

#### GET /categories/project/:projectId

Get all categories for a project.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Suspension",
    "type": "suspension",
    "budgetAllocated": 8000,
    "totalSpent": 2500,
    "budgetRemaining": 5500,
    "parts": [...]
  }
]
```

#### GET /categories/:id

Get a specific category.

#### POST /categories

Create a custom category.

**Request Body:**
```json
{
  "name": "Custom Category",
  "type": "custom",
  "projectId": "uuid",
  "budgetAllocated": 5000
}
```

### Parts

#### GET /parts/category/:categoryId

Get all parts for a category.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Hotchkis Sport Suspension Kit",
    "manufacturer": "Hotchkis",
    "partNumber": "80115-1",
    "quantity": 1,
    "listPrice": 2499.99,
    "status": "planned",
    "vendor": "Summit Racing",
    "totalCost": 2499.99
  }
]
```

#### GET /parts/:id

Get a specific part.

#### POST /parts

Add a new part.

**Request Body:**
```json
{
  "name": "Hotchkis Sport Suspension Kit",
  "manufacturer": "Hotchkis",
  "partNumber": "80115-1",
  "listPrice": 2499.99,
  "quantity": 1,
  "categoryId": "uuid",
  "vendor": "Summit Racing",
  "status": "planned"
}
```

#### PATCH /parts/:id

Update a part.

#### DELETE /parts/:id

Delete a part.

### Labor

#### GET /labor/project/:projectId

Get all labor items for a project.

### Tasks

#### GET /tasks/project/:projectId

Get all tasks for a project.

### Media

#### GET /media/project/:projectId

Get all media assets for a project.

### Analytics

#### GET /analytics/dashboard

Get overall dashboard analytics for current tenant.

**Response:**
```json
{
  "totalProjects": 5,
  "activeProjects": 3,
  "completedProjects": 2,
  "totalBudget": 250000,
  "totalSpent": 125000,
  "budgetRemaining": 125000
}
```

#### GET /analytics/project/:projectId/breakdown

Get cost breakdown by category for a project.

**Response:**
```json
[
  {
    "categoryId": "uuid",
    "categoryName": "Suspension",
    "budgetAllocated": 8000,
    "actualSpent": 2500,
    "variance": -5500,
    "partsCount": 5
  }
]
```

## Error Responses

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Rate Limiting

API requests are rate-limited to 100 requests per minute per IP address.

## Interactive API Documentation

When running in development mode, visit:
```
http://localhost:3001/api/docs
```

This provides an interactive Swagger UI for testing all API endpoints.
