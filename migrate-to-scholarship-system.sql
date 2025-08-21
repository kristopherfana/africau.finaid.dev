-- Migration script to transform existing database to scholarship system
-- This script preserves existing User data by migrating it to the new schema

BEGIN;

-- Step 1: Create sequence for application numbers
CREATE SEQUENCE IF NOT EXISTS application_number_seq START 1;

-- Step 2: Create all enums
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ADMIN');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');
CREATE TYPE "AcademicLevel" AS ENUM ('UNDERGRADUATE', 'MASTERS', 'PHD');
CREATE TYPE "SponsorType" AS ENUM ('INDIVIDUAL', 'ORGANIZATION', 'GOVERNMENT');
CREATE TYPE "ScholarshipStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE "DocumentType" AS ENUM ('TRANSCRIPT', 'RECOMMENDATION', 'FINANCIAL', 'IDENTITY', 'OTHER');
CREATE TYPE "DisbursementSchedule" AS ENUM ('MONTHLY', 'QUARTERLY', 'SEMESTER', 'ANNUAL');
CREATE TYPE "ReviewRecommendation" AS ENUM ('APPROVE', 'REJECT', 'WAITLIST');

-- Step 3: Create temporary table to hold existing user data
CREATE TEMP TABLE temp_users AS 
SELECT id, email, name, "createdAt", "updatedAt" FROM "User";

-- Step 4: Drop existing tables (will be recreated by Prisma)
DROP TABLE IF EXISTS "Post";
DROP TABLE IF EXISTS "User";

-- Step 5: Create new users table with updated schema
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Step 6: Create unique indexes
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");

-- Step 7: Migrate existing user data
INSERT INTO "users" ("id", "email", "role", "isActive", "createdAt", "updatedAt")
SELECT 
    id, 
    email, 
    'STUDENT' as role,
    true as "isActive",
    "createdAt", 
    "updatedAt"
FROM temp_users;

-- Step 8: Create profiles table
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" DATE,
    "gender" "Gender",
    "nationality" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "studentId" TEXT,
    "program" TEXT,
    "level" "AcademicLevel",
    "yearOfStudy" INTEGER,
    "gpa" DECIMAL(3,2),
    "profilePicture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");
CREATE UNIQUE INDEX "profiles_studentId_key" ON "profiles"("studentId");
CREATE INDEX "profiles_studentId_idx" ON "profiles"("studentId");
CREATE INDEX "profiles_level_idx" ON "profiles"("level");

ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 9: Create sponsors table
CREATE TABLE "sponsors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SponsorType" NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "totalFunding" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sponsors_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "sponsors_name_idx" ON "sponsors"("name");
CREATE INDEX "sponsors_type_idx" ON "sponsors"("type");
CREATE INDEX "sponsors_isActive_idx" ON "sponsors"("isActive");

-- Step 10: Create scholarships table
CREATE TABLE "scholarships" (
    "id" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "totalSlots" INTEGER NOT NULL,
    "availableSlots" INTEGER NOT NULL,
    "applicationStartDate" DATE NOT NULL,
    "applicationEndDate" DATE NOT NULL,
    "academicYear" TEXT NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "disbursementSchedule" "DisbursementSchedule" NOT NULL,
    "status" "ScholarshipStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scholarships_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "scholarships_sponsorId_idx" ON "scholarships"("sponsorId");
CREATE INDEX "scholarships_status_idx" ON "scholarships"("status");
CREATE INDEX "scholarships_applicationStartDate_applicationEndDate_idx" ON "scholarships"("applicationStartDate", "applicationEndDate");

ALTER TABLE "scholarships" ADD CONSTRAINT "scholarships_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "sponsors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "scholarships" ADD CONSTRAINT "scholarships_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 11: Create scholarship_criteria table
CREATE TABLE "scholarship_criteria" (
    "id" TEXT NOT NULL,
    "scholarshipId" TEXT NOT NULL,
    "criteriaType" TEXT NOT NULL,
    "criteriaValue" JSONB NOT NULL,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scholarship_criteria_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "scholarship_criteria_scholarshipId_idx" ON "scholarship_criteria"("scholarshipId");
CREATE INDEX "scholarship_criteria_criteriaType_idx" ON "scholarship_criteria"("criteriaType");

ALTER TABLE "scholarship_criteria" ADD CONSTRAINT "scholarship_criteria_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 12: Create applications table
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "applicationNumber" TEXT NOT NULL DEFAULT ('APP' || TO_CHAR(CURRENT_DATE, 'YYYY') || LPAD(NEXTVAL('application_number_seq')::text, 6, '0')),
    "userId" TEXT NOT NULL,
    "scholarshipId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "motivationLetter" TEXT,
    "additionalInfo" JSONB,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "decisionAt" TIMESTAMP(3),
    "decisionBy" TEXT,
    "decisionNotes" TEXT,
    "score" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "applications_applicationNumber_key" ON "applications"("applicationNumber");
CREATE UNIQUE INDEX "applications_userId_scholarshipId_key" ON "applications"("userId", "scholarshipId");
CREATE INDEX "applications_userId_idx" ON "applications"("userId");
CREATE INDEX "applications_scholarshipId_idx" ON "applications"("scholarshipId");
CREATE INDEX "applications_status_idx" ON "applications"("status");
CREATE INDEX "applications_submittedAt_idx" ON "applications"("submittedAt");

ALTER TABLE "applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "applications" ADD CONSTRAINT "applications_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "scholarships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 13: Create documents table
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "checksum" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "expiryDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "documents_userId_idx" ON "documents"("userId");
CREATE INDEX "documents_documentType_idx" ON "documents"("documentType");
CREATE INDEX "documents_isVerified_idx" ON "documents"("isVerified");

ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 14: Create application_documents table
CREATE TABLE "application_documents" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_documents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "application_documents_applicationId_documentId_key" ON "application_documents"("applicationId", "documentId");
CREATE INDEX "application_documents_applicationId_idx" ON "application_documents"("applicationId");

ALTER TABLE "application_documents" ADD CONSTRAINT "application_documents_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "application_documents" ADD CONSTRAINT "application_documents_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 15: Create application_reviews table
CREATE TABLE "application_reviews" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "score" DECIMAL(5,2),
    "comments" TEXT,
    "recommendation" "ReviewRecommendation",
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_reviews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "application_reviews_applicationId_idx" ON "application_reviews"("applicationId");
CREATE INDEX "application_reviews_reviewerId_idx" ON "application_reviews"("reviewerId");

ALTER TABLE "application_reviews" ADD CONSTRAINT "application_reviews_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "application_reviews" ADD CONSTRAINT "application_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 16: Create application_history table
CREATE TABLE "application_history" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "application_history_applicationId_idx" ON "application_history"("applicationId");
CREATE INDEX "application_history_createdAt_idx" ON "application_history"("createdAt");

ALTER TABLE "application_history" ADD CONSTRAINT "application_history_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "application_history" ADD CONSTRAINT "application_history_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 17: Create audit_log table
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_log_userId_idx" ON "audit_log"("userId");
CREATE INDEX "audit_log_entityType_entityId_idx" ON "audit_log"("entityType", "entityId");
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");

ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;