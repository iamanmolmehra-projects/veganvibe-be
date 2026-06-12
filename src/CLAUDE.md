# CLAUDE.md - src/ Directory

This file provides guidance for working with the main source code directory.

## Directory Architecture

This follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── config/           # Application configuration
├── database/         # Database configuration and abstractions
├── utils/           # Shared utilities and common functionality
├── [domain]/        # Domain modules (users, roles, statuses, etc.)
├── app.module.ts    # Root application module
└── main.ts          # Application bootstrap
```

## Key Patterns

### Database Choice Architecture
The application template provides implementations for both **relational** (TypeORM) and **document** (MongoDB) databases. **Teams choose ONE database type per deployment**:

```typescript
// Each module conditionally loads persistence layer based on DATABASE_TYPE
const infrastructurePersistenceModule = (databaseConfig() as DatabaseConfig)
  .isDocumentDatabase
  ? DocumentUserPersistenceModule  // MongoDB deployment choice
  : RelationalUserPersistenceModule; // SQL deployment choice
```

**Important**: Each deployment uses either MongoDB OR SQL, not both. The template provides both implementations as examples for teams to choose from.

### Logging Integration
The application includes comprehensive structured logging:
- **ConsolidatedHttpLoggingInterceptor** logs every HTTP request/response in a single entry
- **LoggerService** provides structured business logic logging throughout the application  
- **CorrelationIdMiddleware** generates unique IDs to track requests across services
- **RequestContextService** allows services to add custom data to HTTP logs

All logging integrates with the existing application flow without impacting performance.

### Exception Handling System
**Comprehensive structured error handling** with custom domain exceptions:
- **GlobalExceptionFilter**: Catches all unhandled exceptions and provides consistent error responses
- **Custom Exception Classes**: Domain-specific exceptions with proper HTTP status codes and structured error data
- **Logging Integration**: All exceptions automatically logged with correlation IDs and error context
- **Response Standardization**: Consistent error response format across all endpoints

**Key Features**:
- Business logic exceptions (`ResourceNotFoundException`, `DuplicateResourceException`)
- Database exceptions (`DatabaseException`, `DatabaseConstraintException`)  
- Validation exceptions (`ValidationException`, `InvalidInputException`)
- Automatic error context injection into HTTP logs
- Production-ready error sanitization and appropriate logging levels

### Domain Module Structure
Each domain follows this consistent structure:
```
[domain]/
├── domain/              # Business entities (database-agnostic)
├── dto/                # Data transfer objects with validation
├── infrastructure/
│   └── persistence/
│       ├── document/    # MongoDB-specific implementation
│       └── relational/  # SQL database implementation  
├── [domain].controller.ts
├── [domain].service.ts
└── [domain].module.ts
```

## Important Files

### main.ts:19-45
Application bootstrap with integrated structured logging:
- ✅ **Pino logger**: Replaces default NestJS logger with high-performance structured logging
- ✅ **HTTP logging**: `ConsolidatedHttpLoggingInterceptor` provides single log per request
- ✅ **Correlation IDs**: Automatic request tracking across services
- **Still needed**: Security middleware (Helmet, rate limiting), health check endpoints

### app.module.ts:55-63
Core service providers and global configuration:
- ✅ **LoggerModule**: Pino integration with environment-based configuration
- ✅ **CorrelationIdMiddleware**: Applied to all routes for request tracking
- ✅ **Logging services**: `LoggerService`, `ConsolidatedHttpLoggingInterceptor`, `RequestContextService`
- ✅ **Global Exception Filter**: `GlobalExceptionFilter` registered via `APP_FILTER` for consistent error handling

### app.module.ts:20-26
Database module selection logic. **Be careful** when modifying this conditional logic as it affects the entire persistence layer.

## Development Guidelines

### Adding New Domains
1. Use Hygen generators: `npm run generate:resource:all-db`
2. This creates both document and relational implementations as templates
3. Teams can remove the implementation they don't need for their deployment
4. Follow the existing domain structure exactly
5. Update imports in `app.module.ts`

### Modifying Existing Domains
1. Modify the implementation that matches your deployment's database choice
2. For template maintenance: ensure changes work for both database implementations
3. Ensure DTOs remain database-agnostic
4. Keep business logic in the service layer
5. Only update the persistence implementation your deployment uses

### Exception Handling Best Practices
- **Use domain-specific exceptions** instead of generic HTTP exceptions
- **Wrap repository operations** in try-catch blocks to handle database errors
- **Provide meaningful error messages** that help developers debug issues
- **Use appropriate HTTP status codes** from NestJS `HttpStatus` enum
- **Include error context** for better debugging and monitoring
- **Never expose sensitive data** in error responses (automatically sanitized)

### Security Considerations
- **Logging security**: Sensitive data automatically sanitized in logs (passwords, tokens, API keys)
- **Exception security**: Error responses sanitized to prevent information leakage
- **Never manually log sensitive data** - the logging system handles sanitization
- **Validate all inputs** using class-validator in DTOs
- **Use proper HTTP status codes** and error responses
- **Implement proper authentication** on all protected endpoints
- **Correlation ID security**: Use correlation IDs for security audit trails

### Performance Considerations
- **Logging performance**: Pino provides 5x faster logging than Winston with minimal overhead
- Database queries should use appropriate indexes
- Implement pagination for list endpoints (current limit: 50 items)
- Consider caching for frequently accessed data  
- Use connection pooling for database connections
- **HTTP logging**: Single log entry per request reduces I/O operations

## Configuration Management

Environment-based configuration loading in `app.module.ts:30-37`:
```typescript
ConfigModule.forRoot({
  isGlobal: true,
  load: [databaseConfig, appConfig],
  envFilePath: ['.env'],
})
```

**Important**: Configuration validation happens at startup. Invalid configuration will prevent application start.

## Middleware and Interceptors

Current global middleware (in `main.ts:31-35`):
- `ValidationPipe` - Input validation
- `ResolvePromisesInterceptor` - Response serialization  
- `ClassSerializerInterceptor` - DTO serialization

**Phase 1 Changes Required**:
- Replace response interceptor error handling with global exception filter
- Add structured logging middleware
- Add security middleware stack

## API Versioning

API versioning enabled with URI versioning:
```typescript
app.enableVersioning({
  type: VersioningType.URI,
});
```

Controllers specify version: `@Controller({ path: 'users', version: '1' })`

## Swagger Documentation

Swagger UI available at `/docs` endpoint. All controllers should:
- Use `@ApiTags()` for grouping
- Add `@ApiResponse()` decorators  
- Use `@ApiBearerAuth()` for protected endpoints
- Document all DTOs properly

## Error Handling

**Current State**: Basic error handling in `ResponseInterceptor`
**Phase 1 Target**: Global exception filter with structured error responses

See `OPERATIONAL_PLAN.md` Phase 1.2 for implementation details.