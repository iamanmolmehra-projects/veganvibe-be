# CLAUDE.md - Test Directory

This file provides guidance for working with the testing infrastructure and test suites.

## Test Architecture

The testing system uses **Jest** for both unit and end-to-end testing:

```
test/
├── admin/                    # Admin-specific E2E tests
│   ├── auth.e2e-spec.ts     # Admin authentication tests
│   └── users.e2e-spec.ts    # Admin user management tests
├── user/                     # User-specific E2E tests
│   └── auth.e2e-spec.ts     # User authentication tests
├── utils/                    # Test utilities and helpers
│   └── constants.ts         # Test configuration constants
└── jest-e2e.json           # Jest E2E configuration
```

## Logging Testing Considerations ✅

### Testing the Logging System

The comprehensive structured logging system requires specific testing approaches:

#### 1. Unit Testing LoggerService
```typescript
// src/utils/logger.service.spec.ts
describe('LoggerService', () => {
  it('should sanitize sensitive data', () => {
    const sensitiveData = { password: 'secret', token: 'abc123' };
    const sanitized = loggerService.sanitizeData(sensitiveData);
    expect(sanitized).toEqual({ password: '[REDACTED]', token: '[REDACTED]' });
  });
  
  it('should create child loggers with additional context', () => {
    const child = loggerService.child({ userId: 'user-123' });
    expect(child).toBeDefined();
  });
});
```

#### 2. Testing HTTP Logging Interceptor
```typescript
// src/utils/consolidated-http-logging.interceptor.spec.ts
describe('ConsolidatedHttpLoggingInterceptor', () => {
  it('should log single entry per HTTP request', () => {
    // Test that only one log entry is generated per request
    // Verify all request-response data is captured
  });
  
  it('should include correlation ID in logs', () => {
    // Test correlation ID propagation to logs
  });
});
```

#### 3. Testing RequestContextService
```typescript
describe('RequestContextService', () => {
  it('should add custom data to request context', () => {
    service.addLogData({ operation: 'test' });
    // Verify data is available in HTTP log
  });
  
  it('should handle missing request context gracefully', () => {
    // Test behavior when used outside request scope
  });
});
```

#### 4. E2E Logging Verification
```typescript
// test/logging.e2e-spec.ts - NEW FILE NEEDED
describe('Logging System E2E', () => {
  it('should generate correlation ID for each request', async () => {
    const response = await request(app)
      .get('/api/v1/users')
      .expect(200);
    
    expect(response.headers['x-correlation-id']).toBeDefined();
  });
  
  it('should accept and use provided correlation ID', async () => {
    const correlationId = 'test-correlation-123';
    const response = await request(app)
      .get('/api/v1/users')
      .set('x-correlation-id', correlationId)
      .expect(200);
    
    expect(response.headers['x-correlation-id']).toBe(correlationId);
  });
});
```

### Testing Environment Configuration

#### Silent Logging for Tests
```typescript
// test/jest.config.js
module.exports = {
  // ... other config
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};

// test/setup.ts
process.env.LOG_LEVEL = 'silent'; // Suppress logs during testing
process.env.NODE_ENV = 'test';
```

#### Log Capture for Assertions
```typescript
// Test utility for capturing logs
export class LogCapture {
  private logs: any[] = [];
  
  capture() {
    // Mock Pino logger to capture log entries
    return this.logs;
  }
  
  findLogByMessage(message: string) {
    return this.logs.find(log => log.message === message);
  }
  
  findLogsByCorrelationId(correlationId: string) {
    return this.logs.filter(log => log.correlationId === correlationId);
  }
}
```

### Performance Testing for Logging

#### Logging Performance Tests
```typescript
describe('Logging Performance', () => {
  it('should log HTTP requests with minimal overhead', async () => {
    const start = performance.now();
    
    await request(app)
      .get('/api/v1/users')
      .expect(200);
    
    const end = performance.now();
    const duration = end - start;
    
    // Logging should add < 10ms overhead
    expect(duration).toBeLessThan(200); 
  });
});
```

### Security Testing for Logging

#### Sensitive Data Redaction Tests
```typescript
describe('Log Security', () => {
  it('should redact passwords from request bodies', async () => {
    // Test that sensitive data doesn't appear in logs
    const logCapture = new LogCapture();
    
    await request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: 'test@example.com', password: 'secret123' });
    
    const logs = logCapture.capture();
    const requestLog = logs.find(log => log.message.includes('HTTP Request'));
    
    expect(requestLog.requestBody.password).toBe('[REDACTED]');
    expect(JSON.stringify(logs)).not.toContain('secret123');
  });
});
```

### Integration Testing with Logging

#### Database Operation Logging
```typescript
describe('Service Logging Integration', () => {
  it('should log business operations with context', async () => {
    const logCapture = new LogCapture();
    
    const user = await usersService.create({
      email: 'test@example.com',
      password: 'password123'
    });
    
    const logs = logCapture.capture();
    expect(logs).toContainEqual(
      expect.objectContaining({
        message: 'Creating new user',
        email: 'test@example.com'
      })
    );
  });
});
```

## Testing Strategy

### Test Types
1. **Unit Tests**: Located in `src/` alongside source files (`.spec.ts`)
2. **End-to-End Tests**: Located in `test/` directory (`.e2e-spec.ts`)
3. **Integration Tests**: **Missing** - needs implementation in Phase 2

### Current E2E Test Coverage
- **Authentication**: Admin and user login flows
- **User Management**: CRUD operations via admin API
- **API Contract**: Basic HTTP status code and response structure validation

## Jest Configuration

### E2E Configuration (`jest-e2e.json`)
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" }
}
```

### Unit Test Configuration
Defined in `package.json:150-166`:
- **Root directory**: `src/`
- **Test pattern**: `.*\\.spec\\.ts$`
- **Coverage directory**: `../coverage`
- **Transform**: TypeScript with `ts-jest`

## Test Utilities

### Constants (`utils/constants.ts`)
**Test Configuration**:
- `APP_URL`: Application base URL for E2E tests
- `ADMIN_EMAIL/PASSWORD`: Admin credentials for testing
- `TESTER_EMAIL/PASSWORD`: Standard user credentials

**Security Issue**: Hardcoded credentials in test files - should be environment variables.

### Authentication Pattern
E2E tests authenticate by:
1. POST to `/api/v1/auth/email/login` with test credentials
2. Extract token from response
3. Use token in `Authorization: Bearer` headers

Example from `admin/users.e2e-spec.ts:10-17`:
```typescript
beforeAll(async () => {
  await request(app)
    .post('/api/v1/auth/email/login')
    .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    .then(({ body }) => {
      apiToken = body.token;
    });
});
```

## Test Execution

### Available Commands
- `npm run test` - Run unit tests
- `npm run test:watch` - Watch mode for unit tests  
- `npm run test:cov` - Unit tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:debug` - Debug unit tests

### Database Choice Testing
- `npm run test:e2e:document:docker` - E2E tests with MongoDB deployment configuration
- `npm run test:e2e:relational:docker` - E2E tests with PostgreSQL deployment configuration

**Pattern**: Spins up Docker containers with chosen database type, runs tests, then cleans up. Each test run validates one database deployment choice.

## Current Test Quality Issues

### Critical Issues

**1. Test Isolation** (`admin/users.e2e-spec.ts`):
- Tests create real data in database
- No cleanup between tests  
- Potential for test interference
- **Phase 2 Fix**: Implement database transaction rollback or dedicated test databases

**2. Hardcoded Test Data**:
```typescript
const newUserEmail = `user-first.${Date.now()}@example.com`;
```
- Uses timestamps for uniqueness
- No systematic test data management
- **Phase 2 Fix**: Implement test data factories

**3. Missing Test Coverage**:
- No integration tests for business logic
- No contract testing for API specifications  
- No performance/load testing
- No database-specific testing (dual database support)

**4. Database Choice Testing Gaps**:
- No validation that both MongoDB and SQL implementations work correctly
- Tests don't verify deployment scenarios with single database choice
- Missing tests for configuration validation per database type

**5. Security Testing Gaps**:
- No authentication/authorization testing
- No input validation testing
- No security vulnerability testing

## Phase 1 Testing Improvements

### Week 1: Test Infrastructure
1. **Environment-based test configuration**:
   ```typescript
   // Replace hardcoded values
   export const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@test.com';
   export const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'test-secret';
   ```

2. **Test database isolation**:
   - Separate test database configuration
   - Automatic cleanup after test runs
   - Database state reset between test suites

### Week 2: Security Testing
1. **Authentication tests**:
   - Invalid credentials handling
   - Token expiration scenarios
   - Rate limiting verification

2. **Authorization tests**:
   - Role-based access control validation
   - Endpoint protection verification
   - User data access restrictions

## Phase 2 Testing Enhancements

### Week 7: Comprehensive Testing Strategy

**1. Integration Test Framework**:
```typescript
// test/integration/
├── database/           # Database layer testing
├── services/          # Business logic testing  
├── external-apis/     # Third-party service testing
└── fixtures/          # Test data management
```

**2. Test Data Factories**:
```typescript
// test/factories/user.factory.ts
export class UserFactory {
  static createValidUser(overrides = {}) {
    return {
      email: faker.internet.email(),
      password: 'Test123!',
      firstName: faker.person.firstName(),
      ...overrides
    };
  }
}
```

**3. Contract Testing**:
```typescript
// test/contracts/
├── api-schemas/       # OpenAPI contract validation
├── database-schemas/  # Database contract testing
└── external-apis/     # Third-party API contracts
```

**4. Performance Testing**:
```typescript
// test/performance/
├── load-tests/        # API load testing
├── database-tests/    # Database performance testing  
└── benchmarks/        # Performance regression testing
```

## Database Choice Testing Strategy

### Current Challenge
Template provides both MongoDB and PostgreSQL implementations - tests should validate both deployment scenarios work independently:

### Recommended Approach for Template Validation
```typescript
// test/database-choices.e2e-spec.ts
describe.each([
  { type: 'mongodb', name: 'MongoDB Deployment' },
  { type: 'postgresql', name: 'PostgreSQL Deployment' }
])('$name', ({ type }) => {
  beforeAll(async () => {
    // Test each database choice as separate deployment scenario
    process.env.DATABASE_TYPE = type;
    // Reinitialize application with chosen database
  });
  
  // Run same API tests against both database implementation choices
  // Validates that business logic works regardless of database choice
});
```

### Production Testing Strategy
For actual deployments, teams only test their chosen database type:
```typescript
// Only test the database type your deployment uses
const dbType = process.env.DATABASE_TYPE; // mongodb OR postgres
describe(`Production Database: ${dbType}`, () => {
  // Test only your deployment's database choice
});
```

## Test Development Guidelines

### Writing E2E Tests
1. **Setup**: Authenticate and prepare test data
2. **Action**: Perform the operation being tested
3. **Assertion**: Verify expected outcomes
4. **Cleanup**: Remove test data if needed

### Writing Unit Tests
1. **Mock external dependencies**: Database, HTTP clients, etc.
2. **Test business logic**: Focus on service layer logic
3. **Validate edge cases**: Error handling, boundary conditions
4. **Maintain isolation**: Each test should be independent

### Test Naming
- **Descriptive names**: What is being tested and expected outcome
- **Consistent patterns**: `should [expected behavior] when [condition]`
- **Grouped tests**: Use `describe` blocks for logical grouping

## Testing Best Practices

### Test Organization
```typescript
describe('UsersService', () => {
  describe('create', () => {
    it('should create user with valid data', () => {});
    it('should throw error with invalid email', () => {});
    it('should hash password before saving', () => {});
  });
  
  describe('findByEmail', () => {
    it('should return user when email exists', () => {});
    it('should return null when email not found', () => {});
  });
});
```

### Mock Strategies
```typescript
// Mock repository for service tests
const mockUserRepository = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  update: jest.fn(),
};
```

### Assertion Patterns
```typescript
// Structured assertions
expect(response.status).toBe(200);
expect(response.body).toMatchObject({
  status: 'success',
  data: expect.objectContaining({
    id: expect.any(String),
    email: testUser.email,
  }),
});
```

## CI/CD Integration

### Current State
- Basic Jest configuration
- No CI/CD pipeline defined
- No automated test execution

### Phase 3 Enhancements
- GitHub Actions integration
- Test coverage reporting
- Performance regression detection
- Database compatibility testing

## Troubleshooting Tests

### Common Issues

**E2E Test Failures**:
1. Ensure application is running on correct port
2. Check database connectivity and seed data
3. Verify authentication tokens are valid
4. Confirm API endpoints match test expectations

**Unit Test Failures**:
1. Check mock configurations
2. Verify import paths and module resolution  
3. Ensure TypeScript compilation is successful
4. Validate test data meets validation requirements

**Database Choice Test Issues**:
1. Confirm correct `DATABASE_TYPE` environment variable is set
2. Verify seed data exists for your chosen database type
3. Check database connection configuration matches your choice (MongoDB vs SQL)
4. Ensure proper cleanup between tests
5. For template testing: validate both database choices work independently
6. For deployment testing: focus only on your chosen database implementation