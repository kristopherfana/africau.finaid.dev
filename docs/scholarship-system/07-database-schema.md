# Database Schema

## Database Design Overview

The Scholarship Management System uses PostgreSQL as the primary database with Prisma ORM for type-safe database operations. The design follows normalization principles to ensure data integrity and optimal performance.

## Detailed Table Specifications

### Users Table
Primary table for user authentication and identification.

**Fields:**
- `id`: UUID (Primary Key, Auto-generated)
- `clerkId`: VARCHAR(255) (Unique, Not Null) - Clerk authentication ID
- `email`: VARCHAR(255) (Unique, Not Null) - User email address
- `role`: ENUM('STUDENT', 'ADMIN') (Not Null, Default: 'STUDENT') - User role
- `isActive`: BOOLEAN (Default: true) - Account status
- `createdAt`: TIMESTAMP (Default: CURRENT_TIMESTAMP) - Record creation time
- `updatedAt`: TIMESTAMP (Default: CURRENT_TIMESTAMP) - Last update time

**Indexes:**
- Primary: id
- Unique: clerkId, email
- Index: role

**Relationships:**
- One-to-One with Profiles (users.id → profiles.userId)
- One-to-Many with Applications (users.id → applications.userId)
- One-to-Many with Documents (users.id → documents.userId)
- One-to-Many with ApplicationReviews (users.id → applicationReviews.reviewerId)
- One-to-Many with AuditLog (users.id → auditLog.userId)

### Profiles Table
Extended user information storage with academic and personal details.

**Fields:**
- `id`: UUID (Primary Key, Auto-generated)
- `userId`: UUID (Foreign Key, Unique, Not Null) → References users.id
- `firstName`: VARCHAR(100) (Not Null) - First name
- `lastName`: VARCHAR(100) (Not Null) - Last name
- `dateOfBirth`: DATE - Date of birth
- `gender`: ENUM('MALE', 'FEMALE') - Gender
- `nationality`: VARCHAR(100) - Nationality
- `phone`: VARCHAR(20) - Phone number
- `address`: TEXT - Physical address
- `studentId`: VARCHAR(50) (Unique) - University student ID
- `program`: VARCHAR(200) - Academic program
- `level`: ENUM('UNDERGRADUATE', 'MASTERS', 'PHD') - Academic level
- `yearOfStudy`: INTEGER - Current year of study
- `gpa`: DECIMAL(3,2) - Grade Point Average
- `profilePicture`: TEXT - Profile picture URL
- `createdAt`: TIMESTAMP (Default: CURRENT_TIMESTAMP)
- `updatedAt`: TIMESTAMP (Default: CURRENT_TIMESTAMP)

**Indexes:**
- Primary: id
- Unique: userId, studentId
- Index: studentId, level

**Relationships:**
- One-to-One with Users (profiles.userId → users.id) ON DELETE CASCADE

### Sponsors Table
Organizations or individuals funding scholarships.

**Fields:**
- `id`: UUID (Primary Key, Auto-generated)
- `name`: VARCHAR(255) (Not Null) - Sponsor name
- `type`: ENUM('INDIVIDUAL', 'ORGANIZATION', 'GOVERNMENT') (Not Null) - Sponsor type
- `contactPerson`: VARCHAR(255) - Contact person name
- `email`: VARCHAR(255) - Contact email
- `phone`: VARCHAR(20) - Contact phone
- `address`: TEXT - Sponsor address
- `website`: VARCHAR(255) - Website URL
- `logoUrl`: TEXT - Logo image URL
- `totalFunding`: DECIMAL(12,2) (Default: 0) - Total funding committed
- `isActive`: BOOLEAN (Default: true) - Active status
- `createdAt`: TIMESTAMP (Default: CURRENT_TIMESTAMP)
- `updatedAt`: TIMESTAMP (Default: CURRENT_TIMESTAMP)

**Indexes:**
- Primary: id
- Index: name, type, isActive

**Relationships:**
- One-to-Many with Scholarships (sponsors.id → scholarships.sponsorId)

### Scholarships Table
Core scholarship information and configuration.

**Fields:**
- `id`: UUID (Primary Key, Auto-generated)
- `sponsorId`: UUID (Foreign Key, Not Null) → References sponsors.id
- `name`: VARCHAR(255) (Not Null) - Scholarship name
- `description`: TEXT - Detailed description
- `amount`: DECIMAL(10,2) (Not Null) - Award amount
- `currency`: VARCHAR(3) (Default: 'USD') - Currency code
- `totalSlots`: INTEGER (Not Null) - Total available slots
- `availableSlots`: INTEGER (Not Null) - Current available slots
- `applicationStartDate`: DATE (Not Null) - Application period start
- `applicationEndDate`: DATE (Not Null) - Application period end
- `academicYear`: VARCHAR(9) (Not Null) - Academic year (e.g., '2025-2026')
- `durationMonths`: INTEGER (Not Null) - Award duration in months
- `disbursementSchedule`: ENUM('MONTHLY', 'QUARTERLY', 'SEMESTER', 'ANNUAL') - Payment schedule
- `status`: ENUM('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED') (Default: 'DRAFT') - Status
- `createdBy`: UUID → References users.id (Admin who created)
- `createdAt`: TIMESTAMP (Default: CURRENT_TIMESTAMP)
- `updatedAt`: TIMESTAMP (Default: CURRENT_TIMESTAMP)

**Indexes:**
- Primary: id
- Index: sponsorId, status, applicationStartDate, applicationEndDate
- Composite: (status, applicationStartDate, applicationEndDate)

**Relationships:**
- Many-to-One with Sponsors (scholarships.sponsorId → sponsors.id)
- One-to-Many with ScholarshipCriteria (scholarships.id → scholarshipCriteria.scholarshipId)
- One-to-Many with Applications (scholarships.id → applications.scholarshipId)

### ScholarshipCriteria Table
Flexible criteria storage for scholarship eligibility.

**Fields:**
- `id`: UUID (Primary Key, Auto-generated)
- `scholarshipId`: UUID (Foreign Key, Not Null) → References scholarships.id
- `criteriaType`: VARCHAR(50) (Not Null) - Type of criteria
- `criteriaValue`: JSONB (Not Null) - Criteria values in JSON format
- `isMandatory`: BOOLEAN (Default: true) - Whether criteria is mandatory
- `createdAt`: TIMESTAMP (Default: CURRENT_TIMESTAMP)

**Indexes:**
- Primary: id
- Index: scholarshipId, criteriaType

**Relationships:**
- Many-to-One with Scholarships (scholarshipCriteria.scholarshipId → scholarships.id) ON DELETE CASCADE

**Criteria Types and JSON Structure:**
- `MIN_GPA`: `{"value": 3.5}`
- `NATIONALITY`: `{"values": ["zimbabwe", "botswana"]}`
- `GENDER`: `{"value": "FEMALE"}`
- `ACADEMIC_LEVEL`: `{"values": ["UNDERGRADUATE", "MASTERS"]}`
- `PROGRAM`: `{"values": ["Computer Science", "Engineering"]}`
- `YEAR_OF_STUDY`: `{"min": 2, "max": 4}`

### Applications Table
Student scholarship applications with complete lifecycle tracking.

**Fields:**
- `id`: UUID (Primary Key, Auto-generated)
- `applicationNumber`: VARCHAR(20) (Unique, Auto-generated) - Format: APP2025000001
- `userId`: UUID (Foreign Key, Not Null) → References users.id
- `scholarshipId`: UUID (Foreign Key, Not Null) → References scholarships.id
- `status`: ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN') (Default: 'DRAFT')
- `motivationLetter`: TEXT - Student motivation letter
- `additionalInfo`: JSONB - Additional information in flexible format
- `submittedAt`: TIMESTAMP - Submission timestamp
- `reviewedAt`: TIMESTAMP - Review completion timestamp
- `decisionAt`: TIMESTAMP - Decision made timestamp
- `decisionBy`: UUID → References users.id (Admin who made decision)
- `decisionNotes`: TEXT - Decision reasoning
- `score`: DECIMAL(5,2) - Application score
- `createdAt`: TIMESTAMP (Default: CURRENT_TIMESTAMP)
- `updatedAt`: TIMESTAMP (Default: CURRENT_TIMESTAMP)

**Indexes:**
- Primary: id
- Unique: applicationNumber, (userId, scholarshipId)
- Index: userId, scholarshipId, status, submittedAt

**Relationships:**
- Many-to-One with Users (applications.userId → users.id)
- Many-to-One with Scholarships (applications.scholarshipId → scholarships.id)
- One-to-Many with ApplicationDocuments (applications.id → applicationDocuments.applicationId)
- One-to-Many with ApplicationReviews (applications.id → applicationReviews.applicationId)
- One-to-Many with ApplicationHistory (applications.id → applicationHistory.applicationId)

### Documents Table
File metadata and management for all uploaded documents.

**Fields:**
- `id`: UUID (Primary Key, Auto-generated)
- `userId`: UUID (Foreign Key, Not Null) → References users.id
- `documentType`: ENUM('TRANSCRIPT', 'RECOMMENDATION', 'FINANCIAL', 'IDENTITY', 'OTHER') (Not Null)
- `fileName`: VARCHAR(255) (Not Null) - Original filename
- `filePath`: TEXT (Not Null) - Storage path/URL
- `fileSize`: INTEGER (Not Null) - File size in bytes
- `mimeType`: VARCHAR(100) (Not Null) - MIME type
- `checksum`: VARCHAR(64) - SHA-256 hash for integrity
- `isVerified`: BOOLEAN (Default: false) - Verification status
- `verifiedBy`: UUID → References users.id (Admin who verified)
- `verifiedAt`: TIMESTAMP - Verification timestamp
- `expiryDate`: DATE - Document expiry date
- `createdAt`: TIMESTAMP (Default: CURRENT_TIMESTAMP)

**Indexes:**
- Primary: id
- Index: userId, documentType, isVerified

**Relationships:**
- Many-to-One with Users (documents.userId → users.id)
- One-to-Many with ApplicationDocuments (documents.id → applicationDocuments.documentId)

### ApplicationDocuments Table
Junction table linking applications to documents.

**Fields:**
- `id`: UUID (Primary Key, Auto-generated)
- `applicationId`: UUID (Foreign Key, Not Null) → References applications.id
- `documentId`: UUID (Foreign Key, Not Null) → References documents.id
- `isRequired`: BOOLEAN (Default: true) - Whether document is required
- `createdAt`: TIMESTAMP (Default: CURRENT_TIMESTAMP)

**Constraints:**
- Unique: (applicationId, documentId) - Prevents duplicate links

**Indexes:**
- Primary: id
- Unique: (applicationId, documentId)
- Index: applicationId

**Relationships:**
- Many-to-One with Applications (applicationDocuments.applicationId → applications.id) ON DELETE CASCADE
- Many-to-One with Documents (applicationDocuments.documentId → documents.id)

### ApplicationReviews Table
Review process tracking for applications.

**Fields:**
- `id`: UUID (Primary Key, Auto-generated)
- `applicationId`: UUID (Foreign Key, Not Null) → References applications.id
- `reviewerId`: UUID (Foreign Key, Not Null) → References users.id
- `score`: DECIMAL(5,2) - Review score
- `comments`: TEXT - Review comments
- `recommendation`: ENUM('APPROVE', 'REJECT', 'WAITLIST') - Review recommendation
- `reviewedAt`: TIMESTAMP (Default: CURRENT_TIMESTAMP)

**Indexes:**
- Primary: id
- Index: applicationId, reviewerId

**Relationships:**
- Many-to-One with Applications (applicationReviews.applicationId → applications.id)
- Many-to-One with Users (applicationReviews.reviewerId → users.id)

### ApplicationHistory Table
Complete application lifecycle tracking.

**Fields:**
- `id`: UUID (Primary Key, Auto-generated)
- `applicationId`: UUID (Foreign Key, Not Null) → References applications.id
- `action`: VARCHAR(50) (Not Null) - Action performed
- `performedBy`: UUID → References users.id - User who performed action
- `notes`: TEXT - Additional notes
- `metadata`: JSONB - Additional metadata
- `createdAt`: TIMESTAMP (Default: CURRENT_TIMESTAMP)

**Indexes:**
- Primary: id
- Index: applicationId, createdAt

**Relationships:**
- Many-to-One with Applications (applicationHistory.applicationId → applications.id)
- Many-to-One with Users (applicationHistory.performedBy → users.id)

**Common Actions:**
- 'CREATED', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED', 'WITHDRAWN', 'DOCUMENT_ADDED'

### AuditLog Table
System-wide audit trail for all critical operations.

**Fields:**
- `id`: UUID (Primary Key, Auto-generated)
- `userId`: UUID → References users.id - User who performed action
- `action`: VARCHAR(100) (Not Null) - Action description
- `entityType`: VARCHAR(50) (Not Null) - Entity type affected
- `entityId`: UUID - ID of affected entity
- `oldValues`: JSONB - Previous values before change
- `newValues`: JSONB - New values after change
- `ipAddress`: INET - IP address of request
- `userAgent`: TEXT - Browser/client information
- `createdAt`: TIMESTAMP (Default: CURRENT_TIMESTAMP)

**Indexes:**
- Primary: id
- Index: userId, entityType, entityId, createdAt

**Relationships:**
- Many-to-One with Users (auditLog.userId → users.id)

## Entity Relationship Diagram

```
Users (1) ←→ (1) Profiles
  ↓ (1)
  ↓
  ↓ (M) Applications (M) ←→ (1) Scholarships ←→ (1) Sponsors
  ↓                           ↓ (1)
  ↓ (M)                       ↓
Documents ←→ ApplicationDocuments ←→ Applications
  ↓ (M)                       ↓ (1)
ApplicationReviews              ↓
                           ApplicationHistory
```

## Database Constraints and Rules

### Foreign Key Constraints
- All foreign key relationships have appropriate CASCADE or RESTRICT rules
- Users deletion cascades to Profiles
- Applications preserve history even if scholarships are archived
- Document deletion removes application links

### Check Constraints
- `gpa` must be between 0.00 and 4.00
- `availableSlots` must be ≤ `totalSlots`
- `applicationEndDate` must be > `applicationStartDate`
- `amount` must be > 0

### Unique Constraints
- (userId, scholarshipId) in Applications - prevents duplicate applications
- (applicationId, documentId) in ApplicationDocuments - prevents duplicate document links
- studentId in Profiles - ensures unique student IDs

## Triggers and Functions

### Auto-Update Triggers
- `updated_at` field automatically updated on record modification
- `applicationNumber` automatically generated on application creation
- `availableSlots` decremented when application is approved

### Business Logic Triggers
- Audit log entry created for all critical table modifications
- Email queue entry created for status changes
- Statistics cache invalidation on data changes

## Data Types Reference

### Enumerations
- **UserRole**: STUDENT, ADMIN
- **Gender**: MALE, FEMALE
- **AcademicLevel**: UNDERGRADUATE, MASTERS, PHD
- **SponsorType**: INDIVIDUAL, ORGANIZATION, GOVERNMENT
- **ScholarshipStatus**: DRAFT, ACTIVE, INACTIVE, ARCHIVED
- **ApplicationStatus**: DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, WITHDRAWN
- **DocumentType**: TRANSCRIPT, RECOMMENDATION, FINANCIAL, IDENTITY, OTHER
- **DisbursementSchedule**: MONTHLY, QUARTERLY, SEMESTER, ANNUAL
- **ReviewRecommendation**: APPROVE, REJECT, WAITLIST

### JSON Schema Examples
**ScholarshipCriteria.criteriaValue:**
```json
// Minimum GPA requirement
{"value": 3.5}

// Multiple nationality options
{"values": ["zimbabwe", "south_africa", "botswana"]}

// Academic level requirements
{"values": ["UNDERGRADUATE", "MASTERS"]}

// Year of study range
{"min": 2, "max": 4}
```

**Applications.additionalInfo:**
```json
{
  "emergencyContact": {
    "name": "John Doe",
    "phone": "+263771234567",
    "relationship": "parent"
  },
  "workExperience": true,
  "extracurriculars": ["debate club", "volunteering"]
}
```