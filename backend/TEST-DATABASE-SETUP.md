# Test Database Setup

## Overview

The AU Scholarship Backend now has a comprehensive test database setup that provides:

- **Isolated Test Environment**: Separate SQLite database for testing
- **Automated Setup/Teardown**: Database lifecycle management
- **Seed Data**: Pre-populated test users and scholarships
- **Environment Configuration**: Proper environment variable handling

## Database Configuration

### Environment Files

1. **`.env.test`** - Test-specific environment variables
   ```bash
   DATABASE_URL="file:./test.db"
   JWT_SECRET="test-jwt-secret-key-for-testing-only"
   NODE_ENV="test"
   PORT=3001
   ```

2. **`.env.example`** - Template for environment configuration

### Database Location
- **Test Database**: `backend/test.db`
- **Backup Database**: `backend/test.db.backup`
- **Development Database**: `backend/dev.db`

## Setup Scripts

### Database Setup Script (`test/setup-test-db.ts`)

Advanced TypeScript script that handles:

```bash
# Setup fresh test database with seed data
npm run test:db:setup

# Clean up test database
npm run test:db:cleanup  

# Reset database (cleanup + setup)
npm run test:db:reset

# Restore from backup
ts-node test/setup-test-db.ts restore
```

### Features
- ✅ **Automatic Environment Loading**
- ✅ **Database Backup/Restore**
- ✅ **Prisma Migration Handling**
- ✅ **Seed Data Generation**
- ✅ **Error Handling & Logging**
- ✅ **Colored Terminal Output**

## Seed Data

The test database is automatically populated with:

### Test Users

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| `admin@test.com` | `admin123` | ADMIN | System administrator |
| `sponsor@test.com` | `sponsor123` | SPONSOR | Test sponsor organization |
| `student@test.com` | `student123` | STUDENT | Test student user |

### Test Data Structure

```javascript
// Admin User + Profile
Admin User {
  id: uuid,
  email: "admin@test.com", 
  role: "ADMIN",
  profile: {
    firstName: "Test",
    lastName: "Admin",
    phone: "+1234567890"
  }
}

// Sponsor + Organization
Sponsor Organization {
  name: "Test Foundation",
  type: "ORGANIZATION",
  contactPerson: "Test Sponsor",
  email: "sponsor@test.com",
  user: { role: "SPONSOR" }
}

// Student + Profile
Student User {
  email: "student@test.com",
  role: "STUDENT", 
  profile: {
    firstName: "Test",
    lastName: "Student",
    studentId: "STU001",
    program: "Computer Science",
    level: "UNDERGRADUATE",
    gpa: 3.5
  }
}

// Test Scholarship
Scholarship {
  name: "Test Scholarship",
  amount: 10000,
  totalSlots: 10,
  academicYear: "2025-2026",
  status: "ACTIVE"
}
```

## Test Integration

### Jest Configuration

Updated `test/jest-e2e.json` includes:

```json
{
  "testTimeout": 30000,
  "setupFilesAfterEnv": ["<rootDir>/test/setup.ts"],
  "collectCoverageFrom": ["src/**/*.(t|j)s"],
  "coverageDirectory": "./coverage"
}
```

### Global Test Setup

The `test/setup.ts` file automatically:

1. **Loads Test Environment**: `.env.test` variables
2. **Initializes Database**: Fresh database for each test run
3. **Sets Timeouts**: 30 second timeout for database operations
4. **Custom Matchers**: UUID, email, JWT validation helpers

### Test Utilities Integration

```typescript
// TestUtils class works with the test database
await TestUtils.cleanDatabase(prisma)      // Clean between tests
await TestUtils.createTestUser(...)        // Create test users  
await TestUtils.createTestScholarship(...) // Create scholarships
await TestUtils.createTestApplication(...) // Create applications
```

## Usage in Tests

### Automatic Setup (Recommended)

Tests automatically get a fresh database:

```typescript
describe('MyController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await TestUtils.createTestApp(); // Database already setup
    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await TestUtils.cleanDatabase(prisma); // Clean between tests
  });
  
  it('should work with test data', async () => {
    // Test with pre-seeded users: admin@test.com, sponsor@test.com, student@test.com
  });
});
```

### Manual Database Operations

```typescript
// Get pre-created test users
const adminUser = await prisma.user.findUnique({ 
  where: { email: 'admin@test.com' }
});

const student = await prisma.user.findUnique({
  where: { email: 'student@test.com' },
  include: { profile: true }
});

// Use existing test scholarship
const scholarship = await prisma.scholarship.findFirst({
  where: { name: 'Test Scholarship' }
});
```

## CI/CD Integration

### GitHub Actions Workflow

The `.github/workflows/backend-tests.yml` handles:

```yaml
- name: Setup test database
  run: npm run test:db:setup
  
- name: Run E2E tests with coverage  
  run: npm run test:coverage
  env:
    DATABASE_URL: file:./test.db
    JWT_SECRET: test-jwt-secret
    
- name: Cleanup test database
  if: always()
  run: npm run test:db:cleanup
```

### Test Scripts

```bash
# NPM Scripts for testing
npm run test:e2e          # E2E tests (auto setup/cleanup)
npm run test:auth         # Authentication tests only  
npm run test:users        # User management tests only
npm run test:scholarships # Scholarship tests only
npm run test:applications # Application tests only
npm run test:coverage     # Tests with coverage report
```

## Database Schema Compatibility

The test database uses the exact same Prisma schema as development/production:

- **SQLite**: Fast, file-based database for testing
- **Full Schema**: All models, relationships, indexes
- **Migrations**: Proper migration handling
- **Constraints**: Foreign keys, unique constraints maintained

## Troubleshooting

### Common Issues

1. **Database Lock Errors**
   ```bash
   # Kill any hanging database connections
   npm run test:db:cleanup
   npm run test:db:reset
   ```

2. **Schema Mismatch**
   ```bash
   # Regenerate Prisma client
   npx prisma generate
   npm run test:db:reset
   ```

3. **Permission Errors**
   ```bash
   # Ensure test directory is writable
   chmod 755 backend/
   rm -f backend/test.db*
   ```

### Debug Mode

```bash
# Run with verbose logging
DEBUG=* npm run test:db:setup

# Manual database inspection  
sqlite3 backend/test.db ".tables"
sqlite3 backend/test.db "SELECT * FROM users;"
```

## Best Practices

### Test Isolation
- ✅ Clean database between test cases
- ✅ Use transactions where possible
- ✅ Avoid test data pollution

### Performance
- ✅ SQLite for fast test execution
- ✅ Parallel test execution support
- ✅ Minimal seed data creation

### Maintenance
- ✅ Automated setup/cleanup
- ✅ Version controlled configuration
- ✅ Comprehensive error handling

## Security Considerations

### Test Environment Safety

- 🔒 **Isolated Database**: Test data never touches production
- 🔒 **Weak Passwords**: Test passwords are intentionally simple
- 🔒 **Test JWT Secret**: Separate secret for testing
- 🔒 **No Sensitive Data**: Only test/mock data in seed

### Environment Separation

```bash
# Different databases per environment
Development: backend/dev.db
Testing:     backend/test.db  
Production:  PostgreSQL/MySQL (remote)
```

The test database setup provides a robust, automated foundation for comprehensive backend testing while maintaining complete isolation from development and production data.