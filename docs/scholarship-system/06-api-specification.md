# API Specification

## API Overview

The Scholarship Management System API follows RESTful principles and provides endpoints for all system operations. The API is built using Supabase backend services with Prisma ORM.

## Base Configuration
- Development and production environments
- JSON data format for all endpoints
- UTF-8 encoding standard
- API versioning through URL paths

## Authentication
All API requests require authentication using JWT tokens provided by Clerk. Tokens must be included in the Authorization header of each request.

## API Endpoints

### User Management

#### User Profile Operations
- **Get Current User**: Retrieve authenticated user's profile information
- **Update Profile**: Modify user profile details
- **Upload Profile Picture**: Add or update profile image
- **Get User Applications**: List all applications submitted by the user

### Scholarship Endpoints

#### Scholarship Operations
- **List Scholarships**: Get paginated list of available scholarships with filtering options
- **Get Scholarship Details**: Retrieve complete information about a specific scholarship
- **Search Scholarships**: Full-text search across scholarship titles and descriptions
- **Get Eligibility Criteria**: Fetch detailed criteria for a scholarship

#### Administrative Scholarship Management
- **Create Scholarship**: Add new scholarship (Admin only)
- **Update Scholarship**: Modify existing scholarship details (Admin only)
- **Archive Scholarship**: Soft delete scholarship (Admin only)
- **Manage Slots**: Update available slots count (Admin only)

### Application Endpoints

#### Student Application Operations
- **Submit Application**: Create new scholarship application
- **Update Draft Application**: Modify application before submission
- **Withdraw Application**: Cancel submitted application
- **Get Application Status**: Check current status and history
- **List My Applications**: View all applications with filtering

#### Document Management
- **Upload Document**: Add supporting documents to application
- **List Documents**: Get all documents for an application
- **Delete Document**: Remove uploaded document
- **Download Document**: Retrieve document file

#### Administrative Application Management
- **Review Applications**: Get list of applications for review (Admin only)
- **Update Application Status**: Change application status (Admin only)
- **Add Review Comments**: Attach notes to application (Admin only)
- **Batch Process Applications**: Bulk status updates (Admin only)
- **Export Applications**: Generate CSV/Excel export (Admin only)

### Sponsor Management

#### Sponsor Operations (Admin only)
- **List Sponsors**: Get all scholarship sponsors
- **Create Sponsor**: Add new sponsor organization
- **Update Sponsor**: Modify sponsor details
- **Get Sponsor Scholarships**: List scholarships by sponsor
- **Sponsor Statistics**: Get funding and allocation metrics

### Reporting Endpoints

#### Analytics and Reports (Admin only)
- **Dashboard Statistics**: Get overview metrics
- **Application Analytics**: Detailed application statistics
- **Scholarship Performance**: Allocation and utilization reports
- **Demographic Analysis**: Gender and nationality distribution
- **Financial Reports**: Funding and disbursement summaries
- **Generate Custom Report**: Create filtered reports
- **Export Report**: Download report in various formats

## Request/Response Formats

### Standard Response Structure
All API responses follow a consistent format with:
- Success indicator
- Data payload
- Error messages (if applicable)
- Pagination metadata (for list endpoints)

### Pagination
List endpoints support pagination with:
- Page number parameter
- Items per page limit
- Total count in response
- Next/previous page indicators

### Filtering and Sorting
- Query parameter-based filtering
- Multiple filter combinations
- Sort by various fields
- Ascending/descending order

## Error Handling

### Error Response Format
Consistent error responses including:
- Error code
- Human-readable message
- Field-specific validation errors
- Suggested actions (when applicable)

### Common Error Codes
- 400: Bad Request - Invalid input data
- 401: Unauthorized - Missing or invalid authentication
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource doesn't exist
- 409: Conflict - Duplicate or conflicting data
- 429: Too Many Requests - Rate limit exceeded
- 500: Internal Server Error - System error

## Rate Limiting

### Limits by Endpoint Category
- Standard endpoints: 100 requests per minute
- Authentication: 5 requests per minute
- File operations: 10 requests per minute
- Report generation: 5 requests per hour
- Bulk operations: 2 requests per minute

### Rate Limit Headers
Response headers include:
- Current limit
- Remaining requests
- Reset timestamp
- Retry-after duration (when limited)

## File Handling

### Upload Specifications
- Maximum file size: 10MB
- Supported formats: PDF, JPG, PNG, DOC, DOCX
- Multiple file upload support
- Progress tracking capability

### Download Operations
- Secure URL generation
- Temporary download links
- Compression for multiple files
- Resume support for large files

## Real-time Updates

### WebSocket Events
Real-time updates available for:
- Application status changes
- New scholarship announcements
- Document verification updates
- System-wide announcements

### Subscription Management
- Subscribe to specific events
- Filter by user role
- Connection management
- Automatic reconnection

## Search Capabilities

### Full-text Search
- Scholarship title and description
- Sponsor names
- Application content
- Fuzzy matching support

### Advanced Filtering
- Multiple criteria combinations
- Date range queries
- Numeric comparisons
- Boolean operations

## Data Validation

### Input Validation Rules
- Required field enforcement
- Format validation (email, phone, etc.)
- Length restrictions
- Type checking
- Custom business rules

### Validation Response
- Field-level error messages
- Validation rule descriptions
- Example valid inputs
- Multiple error aggregation

## API Versioning

### Version Strategy
- URL-based versioning (/api/v1, /api/v2)
- Backward compatibility maintenance
- Deprecation notices in headers
- Migration guides for breaking changes

### Version Support
- Current version: v1
- Legacy support duration: 6 months
- Feature flags for gradual rollout
- Version-specific documentation

## Security Considerations

### Request Security
- HTTPS only
- CORS configuration
- Request signing (for sensitive operations)
- IP whitelisting (optional)

### Data Security
- Field-level encryption for sensitive data
- Audit logging for all operations
- Data masking in responses
- Secure token handling

## Performance Optimization

### Response Optimization
- Field selection support
- Compression for large responses
- Caching headers
- Conditional requests (ETags)

### Batch Operations
- Multiple resource creation
- Bulk updates
- Transaction support
- Partial success handling

## Integration Guidelines

### Third-party Integration
- Webhook support for external systems
- OAuth 2.0 for partner access
- API key management
- Rate limit adjustments for partners

### SDK Support
- JavaScript/TypeScript client
- React hooks for common operations
- Auto-generated types from schema
- Example implementations