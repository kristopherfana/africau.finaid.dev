# AU Scholarship Backend - Test Suite

This directory contains comprehensive end-to-end tests for the Africa University Scholarship Management System backend.

## Test Structure

### 📁 Test Files

- **`auth.e2e-spec.ts`** - Authentication endpoints (login, register, JWT)
- **`users.e2e-spec.ts`** - User management endpoints
- **`scholarships.e2e-spec.ts`** - Scholarship CRUD operations
- **`applications.e2e-spec.ts`** - Application lifecycle management
- **`test-utils.ts`** - Shared testing utilities and helpers
- **`setup.ts`** - Jest global setup and custom matchers

### 🔧 Test Infrastructure

- **`jest-e2e.json`** - Jest configuration for E2E tests
- **`test-runner.ts`** - Advanced test runner with filtering options

## Running Tests

### Prerequisites

Ensure you have a test database configured:

```bash
# Set up test database URL in .env or .env.test
TEST_DATABASE_URL="file:./test.db"
# or
DATABASE_URL="file:./test.db"
```

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test suites
npm run test:runner auth          # Authentication tests only
npm run test:runner users         # User management tests only
npm run test:runner scholarships  # Scholarship tests only
npm run test:runner applications  # Application tests only

# Run with coverage
npm run test:runner coverage

# Run in watch mode
npm run test:runner watch
```

### Advanced Usage

```bash
# Setup test environment
npm run test:runner setup

# Run specific test patterns
npx jest --config ./test/jest-e2e.json --testNamePattern="should login"

# Run tests with verbose output
npx jest --config ./test/jest-e2e.json --verbose
```

## Test Coverage

The test suite covers:

### 🔐 Authentication (`auth.e2e-spec.ts`)
- User registration (students, sponsors, admins)
- Login with email/password
- JWT token generation and validation
- Protected route access
- Input validation and error handling
- User activation/deactivation scenarios

### 👥 User Management (`users.e2e-spec.ts`)
- User profile retrieval
- User listing with filtering and pagination
- User updates and validation
- Password changes with security checks
- Role-based access control
- Admin-only operations (activate/deactivate)

### 🎓 Scholarship Management (`scholarships.e2e-spec.ts`)
- Scholarship creation by sponsors/admins
- Scholarship listing with filters (category, level, search)
- Scholarship retrieval with application counts
- Scholarship updates (owner permissions)
- Scholarship deletion (with application checks)
- Sponsor ownership validation

### 📋 Application Management (`applications.e2e-spec.ts`)
- Application creation by students
- Application status lifecycle (draft → submitted → reviewed → approved/rejected)
- Application withdrawal by students
- Application scoring by reviewers
- Status updates by sponsors/admins
- Duplicate application prevention
- Role-based access controls

## Test Data & Utilities

### TestUtils Class

The `TestUtils` class provides helper methods for:

```typescript
// Create test application instance
TestUtils.createTestApp()

// Clean database between tests
TestUtils.cleanDatabase(prisma)

// Create test users with different roles
TestUtils.createTestUser(prisma, {
  email: 'test@example.com',
  password: 'password123',
  role: 'STUDENT'
})

// Create test scholarships
TestUtils.createTestScholarship(prisma, sponsorUserId, {
  title: 'Test Scholarship',
  amount: 10000
})

// Create test applications
TestUtils.createTestApplication(prisma, studentId, scholarshipId)
```

### Custom Jest Matchers

Additional matchers for common validations:

```typescript
// UUID validation
expect(userId).toBeValidUUID()

// Email validation  
expect(userEmail).toBeValidEmail()

// JWT token validation
expect(accessToken).toBeValidJWT()
```

## Test Scenarios

### Authentication Flow
1. **Registration** - Create new users with different roles
2. **Login** - Authenticate with valid credentials
3. **Token Usage** - Access protected endpoints with JWT
4. **Security** - Reject invalid tokens and inactive users

### User Management Flow
1. **Profile Access** - Users can view their own profiles
2. **Admin Operations** - Admins can manage all users
3. **Restrictions** - Students/sponsors have limited access
4. **Updates** - Users can update their own information

### Scholarship Lifecycle
1. **Creation** - Sponsors create scholarships
2. **Discovery** - Students browse and search scholarships
3. **Management** - Sponsors update their scholarships
4. **Restrictions** - Proper ownership validation

### Application Lifecycle
1. **Draft** - Student creates application
2. **Submission** - Student submits for review
3. **Review** - Sponsor/admin reviews application
4. **Decision** - Application approved or rejected
5. **Withdrawal** - Student can withdraw if needed

## Database Management

### Test Isolation
- Each test suite cleans the database before running
- Tests use transactions where possible
- Foreign key constraints are properly handled

### Test Data Creation
- Users are created with hashed passwords
- Related profiles (student/sponsor) are auto-created
- Scholarships include proper sponsor relationships
- Applications maintain referential integrity

## Continuous Integration

### GitHub Actions / CI Pipeline
```yaml
- name: Run Backend Tests
  run: |
    cd backend
    npm install
    npm run test:runner setup
    npm run test:runner coverage
```

### Coverage Requirements
- Minimum 80% line coverage
- All critical paths tested
- Error scenarios covered

## Debugging Tests

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Ensure test database is accessible
   npx prisma db push --force-reset
   ```

2. **Timeout Issues**
   ```bash
   # Increase timeout in jest config
   "testTimeout": 30000
   ```

3. **Port Conflicts**
   ```bash
   # Kill existing processes
   npx kill-port 3000
   ```

### Debug Mode
```bash
# Run tests with debug information
DEBUG=* npm run test:runner auth

# Run single test file
npx jest --config ./test/jest-e2e.json test/auth.e2e-spec.ts
```

## Best Practices

### Test Writing Guidelines

1. **Use Descriptive Names**
   ```typescript
   it('should not allow student to update other students applications', ...)
   ```

2. **Test Edge Cases**
   - Invalid inputs
   - Boundary conditions  
   - Permission scenarios

3. **Clean Setup/Teardown**
   ```typescript
   beforeEach(async () => {
     await TestUtils.cleanDatabase(prisma)
     // Setup test data
   })
   ```

4. **Assertions**
   - Test both success and error responses
   - Verify database state changes
   - Check response structure

### Performance Considerations

- Use database transactions for cleanup
- Limit test data creation to necessary minimum
- Run tests in parallel where possible
- Use connection pooling appropriately

## Contributing

When adding new endpoints or features:

1. Add corresponding test cases
2. Update test utilities if needed
3. Maintain test coverage above 80%
4. Test both success and failure scenarios
5. Document any new test patterns

## Troubleshooting

### Common Fixes

```bash
# Reset test database
rm -f test.db*
npx prisma db push --force-reset

# Clear Jest cache
npx jest --clearCache

# Regenerate Prisma client
npx prisma generate
```

For additional help, check the main project README or create an issue in the repository.