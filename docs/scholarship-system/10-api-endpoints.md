# API Endpoints Reference

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <clerk_jwt_token>
```

---

## User Management Endpoints

### Get Current User
```http
GET /api/users/me
```
**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "STUDENT",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "studentId": "ST2025001"
  }
}
```

### Update User Profile
```http
PUT /api/users/me/profile
Content-Type: application/json
```
**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "2000-01-15",
  "gender": "MALE",
  "nationality": "zimbabwe",
  "phone": "+263771234567",
  "program": "Computer Science",
  "level": "UNDERGRADUATE",
  "yearOfStudy": 3,
  "gpa": 3.75
}
```

### Upload Profile Picture
```http
POST /api/users/me/profile/picture
Content-Type: multipart/form-data
```
**Form Data:**
- `file`: Image file (max 5MB)

---

## Scholarship Endpoints

### List Scholarships
```http
GET /api/scholarships
```
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): ACTIVE, INACTIVE, DRAFT, ARCHIVED
- `sponsor` (optional): Sponsor ID
- `search` (optional): Search term

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Excellence Scholarship",
      "description": "...",
      "amount": 5000,
      "currency": "USD",
      "availableSlots": 15,
      "applicationEndDate": "2025-03-31",
      "sponsor": {
        "name": "Excellence Foundation"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Get Scholarship Details
```http
GET /api/scholarships/{scholarshipId}
```

### Get Scholarship Criteria
```http
GET /api/scholarships/{scholarshipId}/criteria
```

### Create Scholarship (Admin)
```http
POST /api/scholarships
Content-Type: application/json
Authorization: Admin role required
```
**Request Body:**
```json
{
  "sponsorId": "uuid",
  "name": "New Scholarship",
  "description": "Scholarship description",
  "amount": 10000,
  "currency": "USD",
  "totalSlots": 20,
  "applicationStartDate": "2025-01-01",
  "applicationEndDate": "2025-03-31",
  "academicYear": "2025-2026",
  "durationMonths": 12,
  "disbursementSchedule": "SEMESTER",
  "criteria": [
    {
      "criteriaType": "MIN_GPA",
      "criteriaValue": {"value": 3.5},
      "isMandatory": true
    }
  ]
}
```

### Update Scholarship (Admin)
```http
PUT /api/scholarships/{scholarshipId}
```

### Archive Scholarship (Admin)
```http
DELETE /api/scholarships/{scholarshipId}
```

---

## Application Endpoints

### Submit Application
```http
POST /api/applications
Content-Type: application/json
```
**Request Body:**
```json
{
  "scholarshipId": "uuid",
  "motivationLetter": "My motivation...",
  "additionalInfo": {
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+263771234567"
    }
  },
  "documentIds": ["doc-uuid-1", "doc-uuid-2"]
}
```

### Get My Applications
```http
GET /api/applications/my
```
**Query Parameters:**
- `status` (optional): DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED
- `year` (optional): Academic year

### Get Application Details
```http
GET /api/applications/{applicationId}
```

### Update Draft Application
```http
PUT /api/applications/{applicationId}
```

### Withdraw Application
```http
POST /api/applications/{applicationId}/withdraw
```

### Get Application History
```http
GET /api/applications/{applicationId}/history
```

---

## Document Management Endpoints

### Upload Document
```http
POST /api/documents
Content-Type: multipart/form-data
```
**Form Data:**
- `file`: Document file (max 10MB)
- `documentType`: TRANSCRIPT, RECOMMENDATION, FINANCIAL, IDENTITY, OTHER

**Response:**
```json
{
  "id": "uuid",
  "fileName": "transcript.pdf",
  "documentType": "TRANSCRIPT",
  "fileSize": 1024000,
  "uploadedAt": "2025-01-20T10:00:00Z"
}
```

### List My Documents
```http
GET /api/documents/my
```

### Get Document
```http
GET /api/documents/{documentId}
```

### Download Document
```http
GET /api/documents/{documentId}/download
```

### Delete Document
```http
DELETE /api/documents/{documentId}
```

---

## Admin Application Management

### Get Applications for Review (Admin)
```http
GET /api/admin/applications
Authorization: Admin role required
```
**Query Parameters:**
- `status`: Filter by status
- `scholarshipId`: Filter by scholarship
- `page`, `limit`: Pagination

### Update Application Status (Admin)
```http
PUT /api/admin/applications/{applicationId}/status
Content-Type: application/json
```
**Request Body:**
```json
{
  "status": "APPROVED",
  "decisionNotes": "Excellent application",
  "score": 95.5
}
```

### Add Application Review (Admin)
```http
POST /api/admin/applications/{applicationId}/reviews
Content-Type: application/json
```
**Request Body:**
```json
{
  "score": 85.0,
  "comments": "Strong academic performance",
  "recommendation": "APPROVE"
}
```

### Batch Update Applications (Admin)
```http
POST /api/admin/applications/batch-update
Content-Type: application/json
```
**Request Body:**
```json
{
  "applicationIds": ["uuid1", "uuid2"],
  "status": "UNDER_REVIEW"
}
```

### Export Applications (Admin)
```http
POST /api/admin/applications/export
Content-Type: application/json
```
**Request Body:**
```json
{
  "format": "csv",
  "filters": {
    "scholarshipId": "uuid",
    "status": "APPROVED",
    "startDate": "2025-01-01",
    "endDate": "2025-12-31"
  }
}
```

---

## Sponsor Management (Admin)

### List Sponsors
```http
GET /api/admin/sponsors
Authorization: Admin role required
```

### Create Sponsor
```http
POST /api/admin/sponsors
Content-Type: application/json
```
**Request Body:**
```json
{
  "name": "New Foundation",
  "type": "ORGANIZATION",
  "contactPerson": "Dr. Smith",
  "email": "contact@newfoundation.org",
  "phone": "+263-4-123-4567",
  "website": "https://newfoundation.org",
  "address": "123 Main Street, Harare"
}
```

### Update Sponsor
```http
PUT /api/admin/sponsors/{sponsorId}
```

### Get Sponsor Statistics
```http
GET /api/admin/sponsors/{sponsorId}/statistics
```

---

## Reporting Endpoints (Admin)

### Get Dashboard Statistics
```http
GET /api/admin/dashboard/stats
Authorization: Admin role required
```
**Response:**
```json
{
  "totalScholarships": 25,
  "activeScholarships": 15,
  "totalApplications": 450,
  "pendingReviews": 23,
  "totalFunding": 1250000,
  "awardedAmount": 750000
}
```

### Get Application Analytics
```http
GET /api/admin/analytics/applications
```
**Query Parameters:**
- `startDate`: Start date for analytics
- `endDate`: End date for analytics
- `groupBy`: day, week, month

### Get Demographic Analytics
```http
GET /api/admin/analytics/demographics
```

### Generate Custom Report
```http
POST /api/admin/reports/generate
Content-Type: application/json
```
**Request Body:**
```json
{
  "type": "application_summary",
  "filters": {
    "scholarshipId": "uuid",
    "status": ["APPROVED", "REJECTED"],
    "startDate": "2025-01-01",
    "endDate": "2025-12-31"
  },
  "format": "pdf",
  "includeCharts": true
}
```

### Download Report
```http
GET /api/admin/reports/{reportId}/download
```

---

## Search Endpoints

### Search Scholarships
```http
GET /api/search/scholarships
```
**Query Parameters:**
- `q`: Search query
- `filters`: JSON string with filters
- `page`, `limit`: Pagination

### Search Applications (Admin)
```http
GET /api/admin/search/applications
```

---

## Webhook Endpoints

### Clerk Webhook
```http
POST /api/webhooks/clerk
Content-Type: application/json
```
Handles user creation, updates, and deletion from Clerk.

---

## Error Responses

All endpoints may return these error formats:

### 400 Bad Request
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "FORBIDDEN",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "NOT_FOUND",
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests",
  "retryAfter": 60
}
```

## Rate Limits

| Endpoint Category | Limit |
|------------------|-------|
| Authentication | 5 requests/minute |
| Standard API | 100 requests/minute |
| File Operations | 10 requests/minute |
| Reports | 5 requests/hour |
| Admin Operations | 200 requests/minute |