# CLAUDE.md - Exception Handling System

This file provides comprehensive guidance for using the custom exception handling system in this NestJS application.

## System Overview

The exception handling system provides **structured, domain-specific error handling** with automatic logging integration and consistent API responses. It replaces generic HTTP exceptions with meaningful, contextual errors that improve debugging and user experience.

## Architecture

```
exceptions/
├── base.exception.ts              # Abstract base class for all custom exceptions
├── business.exception.ts          # Domain logic and resource exceptions
├── database.exception.ts          # Database operation exceptions  
├── validation.exception.ts        # Input validation exceptions
└── index.ts                      # Central exports for easy importing
```

## Exception Classes

### BaseException (`base.exception.ts`)

**Abstract base class** for all custom exceptions with structured error data:

```typescript
export abstract class BaseException extends HttpException {
  public readonly code: string;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: string, 
    status: HttpStatus,
    context?: Record<string, any>
  );
}
```

**Key Features**:
- Extends NestJS `HttpException` for framework compatibility
- Includes structured error codes for programmatic handling
- Optional context object for additional error metadata
- Consistent error response format across all custom exceptions

### Business Logic Exceptions (`business.exception.ts`)

#### ResourceNotFoundException
For missing resources (HTTP 404):
```typescript
// Basic usage
throw new ResourceNotFoundException('User', userId);
// With context
throw new ResourceNotFoundException('User', userId, { operation: 'delete' });

// Response:
{
  "status": "error",
  "statusCode": 404,
  "message": "User with identifier '123' not found",
  "code": "RESOURCE_NOT_FOUND_USER"
}
```

#### DuplicateResourceException  
For resource conflicts (HTTP 409):
```typescript
throw new DuplicateResourceException('User', 'email', 'john@example.com');

// Response:
{
  "status": "error", 
  "statusCode": 409,
  "message": "User with email 'john@example.com' already exists",
  "code": "DUPLICATE_RESOURCE_USER"
}
```

#### InvalidOperationException
For business rule violations (HTTP 400):
```typescript
throw new InvalidOperationException('delete_user', 'User has active sessions');

// Response:
{
  "status": "error",
  "statusCode": 400, 
  "message": "Cannot perform delete_user: User has active sessions",
  "code": "INVALID_OPERATION_DELETE_USER"
}
```

#### BusinessRuleViolationException
For domain-specific business rule violations (HTTP 422):
```typescript
throw new BusinessRuleViolationException(
  'Cannot delete admin user', 
  'ADMIN_DELETE',
  { userId: '123', userRole: 'admin' }
);
```

### Database Exceptions (`database.exception.ts`)

#### DatabaseException
For general database operation failures (HTTP 500):
```typescript
try {
  return await this.repository.create(userData);
} catch (error) {
  throw new DatabaseException('create user', error);
}

// Response:
{
  "status": "error",
  "statusCode": 500,
  "message": "Database operation failed: create user", 
  "code": "DATABASE_ERROR_CREATE_USER"
}
```

#### DatabaseConnectionException
For connection failures (HTTP 503):
```typescript
throw new DatabaseConnectionException(connectionString, originalError);

// Response: 
{
  "status": "error",
  "statusCode": 503,
  "message": "Failed to establish database connection",
  "code": "DATABASE_CONNECTION_FAILED"
}
```

#### DatabaseTransactionException  
For transaction failures (HTTP 500):
```typescript
throw new DatabaseTransactionException('commit', originalError);
```

#### DatabaseConstraintException
For constraint violations (HTTP 409):
```typescript
throw new DatabaseConstraintException('unique_email', 'insert', originalError);
```

### Validation Exceptions (`validation.exception.ts`)

#### ValidationException
For multiple validation errors (HTTP 422):
```typescript
throw new ValidationException([
  { field: 'email', message: 'Invalid email format' },
  { field: 'password', message: 'Password too short' }
]);

// Response:
{
  "status": "error",
  "statusCode": 422,
  "message": "Validation failed",
  "code": "VALIDATION_FAILED",
  "errors": {
    "email": "Invalid email format",
    "password": "Password too short"
  }
}
```

#### InvalidInputException
For single invalid inputs (HTTP 400):
```typescript
throw new InvalidInputException('birthDate', '2025-01-01', 'YYYY-MM-DD in the past');
```

## Global Exception Filter

The `GlobalExceptionFilter` automatically handles all exceptions and provides:

- **Consistent error response format** across all endpoints
- **Automatic correlation ID inclusion** in error logs
- **Context-aware logging** (4xx = warn, 5xx = error)
- **Sensitive data sanitization** in error responses
- **Integration with existing logging system**

## Usage Patterns

### Service Layer Exception Handling

```typescript
@Injectable()
export class UsersService {
  async create(dto: CreateUserDto): Promise<User> {
    // Check for business rule violations
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      throw new DuplicateResourceException('User', 'email', dto.email);
    }

    // Validate related resources
    if (dto.roleId && !await this.isValidRole(dto.roleId)) {
      throw new ResourceNotFoundException('Role', dto.roleId);
    }

    // Wrap database operations
    try {
      return await this.repository.create(dto);
    } catch (error) {
      this.logger.error('Database error during user creation', { 
        error: error.message,
        email: dto.email 
      });
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

  async delete(id: string): Promise<void> {
    const user = await this.findByIdOrFail(id); // Throws 404 if not found
    
    if (user.role === 'admin' && await this.isLastAdmin()) {
      throw new BusinessRuleViolationException(
        'Cannot delete last admin user',
        'LAST_ADMIN_DELETE'
      );
    }

    try {
      await this.repository.remove(id);
    } catch (error) {
      throw new DatabaseException('delete user', error);
    }
  }
}
```

### Controller Layer Exception Handling

Controllers should use the service layer exceptions and let the global filter handle them:

```typescript
@Controller('users')
export class UsersController {
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<User> {
    // Service throws appropriate exceptions, controller just calls service
    return this.usersService.create(dto);
  }

  @Get(':id') 
  async findOne(@Param('id') id: string): Promise<User> {
    // Use findByIdOrFail for automatic 404 handling
    return this.usersService.findByIdOrFail(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<User> {
    const user = await this.usersService.update(id, dto);
    if (!user) {
      throw new ResourceNotFoundException('User', id);
    }
    return user;
  }
}
```

## Best Practices

### 1. **Use Specific Exceptions**
```typescript
// ❌ Don't use generic exceptions
throw new NotFoundException('User not found');

// ✅ Use domain-specific exceptions  
throw new ResourceNotFoundException('User', userId);
```

### 2. **Wrap Database Operations**
```typescript
// ❌ Don't let database errors bubble up
return await this.repository.create(data);

// ✅ Wrap in try-catch with domain exceptions
try {
  return await this.repository.create(data);
} catch (error) {
  throw new DatabaseException('create user', error);
}
```

### 3. **Provide Context for Complex Errors**
```typescript
// ❌ Generic error without context
throw new InvalidOperationException('delete_user', 'Operation not allowed');

// ✅ Rich context for debugging
throw new InvalidOperationException('delete_user', 'User has active sessions', {
  userId: user.id,
  activeSessionCount: sessions.length,
  userRole: user.role
});
```

### 4. **Use Consistent Resource Names**
```typescript
// ✅ Use consistent resource naming
throw new ResourceNotFoundException('User', id);        // Not 'user'
throw new DuplicateResourceException('User', 'email', email); // Not 'USER'
```

### 5. **Log Before Throwing**
```typescript
// ✅ Log error context before throwing
this.logger.error('Failed to create user', { 
  error: error.message,
  email: dto.email,
  operation: 'create'
});
throw new DatabaseException('create user', error);
```

## HTTP Status Code Mapping

| Exception Type | HTTP Status | When to Use |
|---|---|---|
| `ResourceNotFoundException` | 404 | Resource doesn't exist |
| `DuplicateResourceException` | 409 | Resource already exists |
| `InvalidOperationException` | 400 | Malformed request/operation |
| `BusinessRuleViolationException` | 422 | Domain rule violation |  
| `ValidationException` | 422 | Input validation failure |
| `InvalidInputException` | 400 | Invalid input format |
| `DatabaseException` | 500 | Database operation error |
| `DatabaseConnectionException` | 503 | Database unavailable |
| `DatabaseTransactionException` | 500 | Transaction failure |
| `DatabaseConstraintException` | 409 | Constraint violation |

## Integration with Existing Systems

### Logging Integration
All exceptions automatically integrate with the existing logging system:
- Error context added to HTTP logs via `RequestContextService`
- Correlation IDs included for distributed tracing
- Appropriate log levels based on HTTP status codes
- Sensitive data automatically sanitized

### Response Format
All exceptions produce consistent API responses:
```json
{
  "status": "error",
  "statusCode": 404,
  "message": "User with identifier '123' not found", 
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users/123",
  "code": "RESOURCE_NOT_FOUND_USER",
  "context": {
    "resource": "User",
    "identifier": "123"
  },
  "errors": {
    "field": "validation error message"
  }
}
```

This exception handling system provides production-ready error management with excellent developer experience and comprehensive observability.