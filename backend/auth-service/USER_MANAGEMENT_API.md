# User Management API Endpoints

This document describes the new user management endpoints added to the Admin API for managing students and users in the Study4Ever platform.

## Base URL
All endpoints are prefixed with: `/api/v1/admin`

## Endpoints

### Dashboard Summary
- **GET** `/summary`
- **Description**: Get user statistics summary for dashboard
- **Response**: `UserSummaryDto`
```json
{
  "totalUsers": 150,
  "totalStudents": 120,
  "totalInstructors": 25,
  "activeUsers": 140,
  "inactiveUsers": 10
}
```

### Student Management

#### Get All Students
- **GET** `/students`
- **Description**: Retrieve all users with ROLE_STUDENT (excluding instructors)
- **Response**: `List<UserResponse>`

#### Search Students
- **GET** `/students/search?q={searchTerm}`
- **Description**: Search students by username, email, first name, last name, or full name
- **Parameters**: 
  - `q` (required): Search term
- **Response**: `List<UserResponse>`

### Instructor Management (Enhanced)

#### Search Instructors
- **GET** `/instructors/search?q={searchTerm}`
- **Description**: Search instructors by username, email, first name, last name, or full name
- **Parameters**: 
  - `q` (required): Search term
- **Response**: `List<UserResponse>`

### General User Management

#### Get All Users
- **GET** `/users`
- **Description**: Retrieve all users regardless of role
- **Response**: `List<UserResponse>`

#### Get User by ID
- **GET** `/users/{id}`
- **Description**: Get detailed information for a specific user
- **Parameters**: 
  - `id` (required): User UUID
- **Response**: `UserResponse`

#### Search All Users
- **GET** `/users/search?q={searchTerm}`
- **Description**: Search all users by username, email, first name, last name, or full name
- **Parameters**: 
  - `q` (required): Search term
- **Response**: `List<UserResponse>`

## Response Models

### UserResponse
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "roles": ["ROLE_STUDENT", "ROLE_INSTRUCTOR"],
  "enabled": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### UserSummaryDto
```json
{
  "totalUsers": "number",
  "totalStudents": "number", 
  "totalInstructors": "number",
  "activeUsers": "number",
  "inactiveUsers": "number"
}
```

## Business Logic

### Role Filtering
- **Students**: Users with `ROLE_STUDENT` but NOT `ROLE_INSTRUCTOR`
- **Instructors**: Users with `ROLE_INSTRUCTOR` (may also have `ROLE_STUDENT`)
- **All Users**: No role filtering applied

### Search Functionality
Search is case-insensitive and matches against:
- Username
- Email address
- First name
- Last name
- Full name (first + last name)

### User Status
- **Active Users**: Users with `enabled = true`
- **Inactive Users**: Users with `enabled = false`

## Next Steps

The backend implementation is now complete. The next phase involves implementing the frontend components:

1. Add navigation links for Students and Instructors in the admin dashboard drawer
2. Create user management pages with summary cards
3. Implement search and filtering functionality
4. Create modal components for detailed user views
5. Integrate with the new backend APIs

## Testing

To test the new endpoints, ensure the auth-service is running and use the following sample requests:

```bash
# Get user summary
GET /api/v1/admin/summary

# Get all students
GET /api/v1/admin/students

# Search students
GET /api/v1/admin/students/search?q=john

# Get all users
GET /api/v1/admin/users

# Search users
GET /api/v1/admin/users/search?q=doe
```
