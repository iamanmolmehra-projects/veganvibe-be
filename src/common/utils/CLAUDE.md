# CLAUDE.md - Utils Directory

This file provides guidance for working with shared utilities and common functionality.

## Utilities Architecture

The utils directory contains **framework-level utilities** and **cross-cutting concerns**:

```
utils/
├── dto/                                    # Shared DTOs
│   └── infinity-pagination-response.dto.ts
├── transformers/                          # Data transformers
│   └── lower-case.transformer.ts
├── types/                                 # TypeScript type definitions
│   ├── deep-partial.type.ts
│   ├── maybe.type.ts
│   ├── nullable.type.ts
│   ├── or-never.type.ts
│   └── pagination-options.ts
├── logger.service.ts                      # ✅ Structured logging service
├── consolidated-http-logging.interceptor.ts  # ✅ Single log per HTTP request
├── request-context.service.ts            # ✅ Add custom data to HTTP logs  
├── correlation-id.middleware.ts          # ✅ Generate/track correlation IDs
├── global-exception.filter.ts           # ✅ Global exception handling with structured logging
├── exceptions/                          # ✅ Custom exception classes
│   ├── base.exception.ts                # ✅ Abstract base exception class
│   ├── business.exception.ts            # ✅ Domain-specific business logic exceptions
│   ├── database.exception.ts            # ✅ Database operation exceptions
│   ├── validation.exception.ts          # ✅ Input validation exceptions
│   └── index.ts                         # ✅ Exception exports
├── response-interceptor.ts              # HTTP response standardization (error handling removed)
├── serializer.interceptor.ts            # Promise resolution interceptor
├── deep-resolver.ts                      # Promise resolution utility
├── document-entity-helper.ts            # MongoDB entity utilities
├── infinity-pagination.ts               # Pagination implementation
├── mongo-id-validator.ts               # MongoDB ID validation
├── relational-entity-helper.ts         # SQL entity utilities  
├── validate-config.ts                  # Configuration validation
└── validation-options.ts              # Global validation configuration
```

## Key Utilities

### Logging System (✅ IMPLEMENTED)

#### LoggerService (`logger.service.ts`)
High-performance structured logging service with automatic data sanitization:

**Key Features**:
- Structured JSON logging methods (`info`, `warn`, `error`, `debug`, `verbose`)
- Automatic sensitive data sanitization (passwords, tokens, API keys)
- Child logger creation for contextual logging
- HTTP request/response logging methods
- Performance optimized with Pino (5x faster than Winston)

**Usage Example**:
```typescript
@Injectable()
export class UsersService {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('UsersService');
  }

  async create(data: CreateUserDto): Promise<User> {
    this.logger.info('Creating user', { email: data.email });
    // Business logic...
    this.logger.info('User created successfully', { userId: user.id });
  }
}
```

#### ConsolidatedHttpLoggingInterceptor (`consolidated-http-logging.interceptor.ts`)
**Single log entry per HTTP request** with complete request-response cycle:

**Features**:
- One comprehensive log per HTTP request (not separate request/response logs)
- Automatic correlation ID inclusion
- Request/response timing and size tracking
- Controller and handler identification
- Custom business data injection support
- Automatic sensitive data sanitization

#### RequestContextService (`request-context.service.ts`)
**Request-scoped service** for adding custom business data to HTTP logs:

**Usage Examples**:
```typescript
// Add custom business data
this.requestContext.addLogData({
  operation: 'create_user',
  userId: user.id,
  customField: 'value'
});

// Add timing information
this.requestContext.addTiming('database_query', 45);

// Set user/tenant context
this.requestContext.setUserId('user-123');
this.requestContext.setTenantId('tenant-456');
```

#### CorrelationIdMiddleware (`correlation-id.middleware.ts`)
Generates and tracks correlation IDs across requests:

**Features**:
- Accepts correlation ID from `x-correlation-id` header
- Generates UUID if no correlation ID provided
- Adds correlation ID to response headers
- Makes correlation ID available throughout request lifecycle

### Exception Handling System (✅ IMPLEMENTED)

#### GlobalExceptionFilter (`global-exception.filter.ts`)
**Centralized exception handling** with structured logging integration:

**Key Features**:
- Catches all unhandled exceptions globally
- Provides consistent error response format across all endpoints
- Integrates with existing logging system (`LoggerService` and `RequestContextService`)
- Automatically adds error context to HTTP logs with correlation IDs
- Different logging levels based on HTTP status (4xx = warn, 5xx = error)
- Sanitizes sensitive data from error responses

**Error Response Format**:
```typescript
{
  status: 'error',
  statusCode: 404,
  message: 'User with identifier \'123\' not found',
  timestamp: '2024-01-15T10:30:00.000Z',
  path: '/api/v1/users/123',
  errors?: { field: 'validation error' } // For validation errors
}
```

#### Custom Exception Classes (`exceptions/`)
**Domain-specific exceptions** with proper HTTP status codes:

**Base Exception** (`base.exception.ts`):
- Abstract base class for all custom exceptions
- Includes error codes, context, and structured error responses
- Extends NestJS `HttpException` for framework compatibility

**Business Logic Exceptions** (`business.exception.ts`):
```typescript
// Resource not found (404)
throw new ResourceNotFoundException('User', userId);

// Duplicate resource conflict (409)
throw new DuplicateResourceException('User', 'email', email);

// Invalid operation (400)
throw new InvalidOperationException('delete_user', 'User has active sessions');

// Business rule violation (422)
throw new BusinessRuleViolationException('Cannot delete admin user', 'ADMIN_DELETE');
```

**Database Exceptions** (`database.exception.ts`):
```typescript
// General database error (500)
throw new DatabaseException('create user', originalError);

// Connection failure (503)
throw new DatabaseConnectionException(connectionString, originalError);

// Transaction failure (500)
throw new DatabaseTransactionException('commit', originalError);

// Constraint violation (409)
throw new DatabaseConstraintException('unique_email', 'insert', originalError);
```

**Validation Exceptions** (`validation.exception.ts`):
```typescript
// Multiple validation errors (422)
throw new ValidationException([
  { field: 'email', message: 'Invalid email format' },
  { field: 'password', message: 'Password too short' }
]);

// Single input error (400)
throw new InvalidInputException('birthDate', '2025-01-01', 'YYYY-MM-DD in the past');
```

**Usage Example in Services**:
```typescript
async create(dto: CreateUserDto): Promise<User> {
  // Check for duplicates
  const existing = await this.repository.findByEmail(dto.email);
  if (existing) {
    throw new DuplicateResourceException('User', 'email', dto.email);
  }

  // Wrap database operations
  try {
    return await this.repository.create(dto);
  } catch (error) {
    throw new DatabaseException('create user', error);
  }
}

async findByIdOrFail(id: string): Promise<User> {
  const user = await this.findById(id);
  if (!user) {
    throw new ResourceNotFoundException('User', id);
  }
  return user;
}
```

### Validation System

#### Global Validation Options (`validation-options.ts`)
Configured for all controllers via `ValidationPipe` in `main.ts:31`:

**Key Features**:
- **Transform**: Automatically transform payloads to DTO types
- **Whitelist**: Strip properties not in DTO (security feature)
- **Error formatting**: Structured error responses with field-level details

**Error Response Format**:
```typescript
{
  status: 422,
  errors: {
    email: "email must be a valid email",
    password: "password is too short, password must contain uppercase letter"
  }
}
```

#### Configuration Validation (`validate-config.ts`)
Used throughout configuration system to validate environment variables:
- Validates configuration objects against class-validator decorators
- Throws descriptive errors on startup if configuration invalid
- Ensures type safety for configuration access

### Pagination System

#### Infinity Pagination (`infinity-pagination.ts`)
Implements cursor-based pagination pattern:

```typescript
// Usage example
const result = infinityPagination(users, { page: 1, limit: 10 });
// Returns: { data: User[], hasNextPage: boolean }
```

**Key Characteristics**:
- **hasNextPage logic**: `data.length === options.limit`
- **Simple implementation**: Suitable for basic pagination needs
- **Performance consideration**: May not scale well with large datasets

**Phase 2 Enhancement Needed**: Replace with proper cursor-based pagination for better performance.

### Response Handling

#### Response Interceptor (`response-interceptor.ts`)
**Updated Implementation** (✅ Phase 1.1 changes applied):
- Standardizes all API responses with consistent format
- ✅ **Error handling removed** - moved to global exception filter (Phase 1.2)
- Excludes root path (`/`) from standardization
- Now focuses purely on response formatting

**Response Format**:
```typescript
{
  status: 'success',
  statusCode: number,
  message: string,
  data: any,
  hasNextPage?: boolean
}
```

**Phase 1.2 Next**: Global exception filter will handle all error responses with correlation IDs and structured error logging.

#### Promise Resolution (`serializer.interceptor.ts`)
Resolves nested promises in response objects:
- Uses `deep-resolver.ts` to traverse object structure
- Ensures all promises resolved before serialization
- Prevents "[object Promise]" in API responses

### Database Utilities

#### Entity Helpers
**Document Helper** (`document-entity-helper.ts`):
- MongoDB-specific entity utilities
- Schema validation helpers
- Document transformation utilities

**Relational Helper** (`relational-entity-helper.ts`):
- TypeORM entity utilities  
- SQL-specific transformations
- Relationship mapping helpers

#### MongoDB ID Validation (`mongo-id-validator.ts`)
Custom validator for MongoDB ObjectId format:
```typescript
@IsMongoId() // Custom decorator
id: string;
```

### Type System

#### Utility Types (`types/`)
**Deep Partial** (`deep-partial.type.ts`):
- Makes all properties optional recursively
- Used for update operations and partial data handling

**Nullable/Maybe Types**:
- `NullableType<T>` = `T | null`
- `MaybeType<T>` = `T | undefined`  
- Consistent null handling across the application

**Or Never** (`or-never.type.ts`):
- Advanced conditional types for type-safe operations
- Used in repository patterns and complex data operations

### Data Transformers (`transformers/`)

#### Lower Case Transformer (`lower-case.transformer.ts`)
Class-transformer utility for automatic case conversion:
```typescript
@Transform(({ value }) => value?.toLowerCase?.(), {
  toClassOnly: true,
})
email: string;
```

## Security Considerations

### Current Security Issues

**Response Interceptor Logging** (`response-interceptor.ts:60`):
```typescript
this.logger.error(JSON.stringify(exception, null, 2));
```
- **Risk**: Logs entire exception object including potentially sensitive data
- **Phase 1 Fix**: Implement structured logging with data sanitization

**Input Validation**:
- Good: Whitelist enabled (strips unknown properties)
- Good: Transform enabled (type coercion)
- **Issue**: No input sanitization for injection attacks

### Phase 1 Security Enhancements

1. **Replace Response Interceptor** (Week 1):
   - Move error handling to global exception filter
   - Add structured logging with correlation IDs
   - Sanitize sensitive data from logs

2. **Enhanced Input Validation** (Week 2):
   - Add input sanitization middleware
   - Implement XSS protection
   - Add SQL injection prevention
   - Rate limit validation failures

3. **Secure Logging** (Week 1):
   - Replace basic logger with structured logging service
   - Add log sanitization for sensitive fields
   - Implement log correlation IDs

## Performance Considerations

### Current Performance Issues

**Pagination**: Simple offset-based pagination doesn't scale well
**Promise Resolution**: Synchronous deep object traversal could be expensive
**Response Interceptor**: Applies to all routes (except `/`)

### Phase 2 Performance Improvements

1. **Enhanced Pagination** (Week 6):
   - Implement cursor-based pagination
   - Add database indexing recommendations
   - Cache pagination results

2. **Optimized Response Handling**:
   - Implement selective response transformation
   - Add response caching headers
   - Optimize promise resolution performance

## Development Guidelines

### Adding New Utilities

1. **Determine Scope**: Ensure utility is truly cross-cutting (used by multiple domains)
2. **Type Safety**: Add proper TypeScript types and interfaces
3. **Testing**: Create comprehensive unit tests
4. **Documentation**: Document usage patterns and limitations

### Utility Categories

**Framework Utilities**: Core application concerns (validation, responses, etc.)
**Domain Utilities**: Business logic helpers (should go in domain directories)
**Infrastructure Utilities**: Database, external services (should go in appropriate modules)

### Common Patterns

**Validation Decorators**: Create custom validators in this directory
**Response Transformers**: Standardize API response formats
**Type Utilities**: Reusable TypeScript type definitions
**Helper Functions**: Pure functions for common operations

## Integration Points

### Main Application (`main.ts`)
- **ValidationPipe**: Uses `validation-options.ts`
- **Interceptors**: Registers `ResolvePromisesInterceptor` globally
- **Response Interceptor**: **Should be replaced** with global exception filter

### Configuration System
- **validate-config.ts**: Used by all configuration services
- Ensures type-safe configuration loading
- Provides clear error messages for invalid configuration

### All Controllers
- **Pagination**: Uses `infinity-pagination` for list endpoints
- **DTOs**: Inherit from base DTOs in `dto/` directory
- **Validation**: Automatic via global `ValidationPipe`

## Phase 1 Critical Changes Required

Based on `OPERATIONAL_PLAN.md`, this directory needs immediate attention:

1. **Week 1**: Remove error handling from `response-interceptor.ts`
2. **Week 1**: Create new structured logging service
3. **Week 2**: Add input sanitization utilities
4. **Week 2**: Create security middleware utilities

## Testing Utilities

Consider adding test utilities to this directory:
- **Test data factories**: For consistent test data creation
- **Mock utilities**: For database and external service mocking  
- **Assertion helpers**: For common test assertions
- **Performance test utilities**: For load testing support

This directory is foundational to the entire application - changes here affect all domains and should be thoroughly tested.