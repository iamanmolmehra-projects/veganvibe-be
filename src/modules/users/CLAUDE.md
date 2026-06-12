# CLAUDE.md - Users Domain

This file provides guidance for working with the Users domain module.

## Domain Architecture

The Users module follows **Clean Architecture** with clear separation between business logic and infrastructure:

```
users/
├── domain/
│   └── user.ts              # Business entity (database-agnostic)
├── dto/                     # Data transfer objects
│   ├── create-user.dto.ts   # Create user validation
│   ├── update-user.dto.ts   # Update user validation  
│   ├── query-user.dto.ts    # Query/filtering DTOs
│   └── user.dto.ts          # Response DTO
├── infrastructure/
│   └── persistence/
│       ├── user.repository.ts      # Abstract repository interface
│       ├── document/               # MongoDB implementation
│       │   ├── entities/user.schema.ts
│       │   ├── mappers/user.mapper.ts
│       │   ├── repositories/user.repository.ts
│       │   └── document-persistence.module.ts
│       └── relational/             # SQL implementation  
│           ├── entities/user.entity.ts
│           ├── mappers/user.mapper.ts
│           ├── repositories/user.repository.ts
│           └── relational-persistence.module.ts
├── users.controller.ts      # HTTP endpoints
├── users.service.ts         # Business logic
└── users.module.ts          # Module configuration
```

## Key Patterns

### Repository Pattern
The abstract `UserRepository` (line 8-40 in `infrastructure/persistence/user.repository.ts`) defines the contract for data access, implemented by both database types.

**Critical Methods**:
- `create()` - User creation with password hashing
- `findByEmail()` - Authentication lookup
- `findById()` - User profile retrieval
- `findManyWithPagination()` - User listing with filtering
- `update()` - Profile updates
- `remove()` - Soft delete (preserves audit trail)

### Business Logic Layer
`UsersService` contains all business rules with robust exception handling:
- Password hashing (bcrypt) in `create()` method
- Role assignment logic (defaults to user role)
- Status management (active/inactive users)
- Validation of business constraints
- **Custom domain exceptions** for specific error scenarios
- **Database error handling** with try-catch blocks around repository operations
- **Resource validation** with `findByIdOrFail()` method for proper 404 handling

**Important**: Service layer is database-agnostic - same logic works with both persistence implementations.

### Exception Handling Patterns
The Users module implements comprehensive exception handling:

**Domain-Specific Exceptions**:
- `DuplicateResourceException` for email conflicts during user creation/updates
- `ResourceNotFoundException` for missing users, roles, or statuses  
- `DatabaseException` for repository operation failures

**Usage Examples**:
```typescript
// Email already exists
throw new DuplicateResourceException('User', 'email', createUserDto.email);

// User not found
throw new ResourceNotFoundException('User', id);

// Role doesn't exist
throw new ResourceNotFoundException('Role', createUserDto.role.id);

// Database operation failed
try {
  user = await this.usersRepository.create(userData);
} catch (error) {
  throw new DatabaseException('create user', error);
}
```

## Security Considerations

### Password Management
- Passwords hashed with bcrypt before storage (`users.service.ts:29`)
- Salt rounds configurable (currently using bcrypt defaults)
- Passwords never returned in API responses (excluded by serialization)

**Phase 1 Improvements Needed**:
- Add password strength validation
- Implement password history prevention
- Add rate limiting for password attempts

### Authentication Integration
- Controller requires JWT authentication: `@UseGuards(AuthGuard('jwt'))`
- Admin role required: `@Roles(RoleEnum.admin)`
- Uses role-based access control via `RolesGuard`

### Data Serialization
- `@SerializeOptions({ groups: ['admin'] })` controls field visibility
- Sensitive fields excluded from public responses
- Different serialization groups for different user types

## API Design

### Endpoints
All endpoints now provide structured error responses with proper HTTP status codes:

- `POST /api/v1/users` - Create user (admin only)
  - Returns 409 for duplicate email addresses
  - Returns 404 for invalid roles/statuses
  - Returns 500 for database errors
- `GET /api/v1/users` - List users with pagination (admin only)
- `GET /api/v1/users/:id` - Get user by ID (admin only)
  - Returns 404 if user not found (uses `findByIdOrFail()`)
- `PATCH /api/v1/users/:id` - Update user (admin only) 
  - Returns 404 if user not found
  - Returns 409 for duplicate email addresses
- `DELETE /api/v1/users/:id` - Soft delete user (admin only)
  - Returns 404 if user not found (validates existence first)

### Pagination
- Default limit: 10 users per page
- Maximum limit: 50 users per page (hardcoded in controller:75)
- Uses infinity pagination pattern with `page` and `limit` parameters

**Phase 1 Improvements Needed**:
- Make pagination limits configurable
- Add cursor-based pagination for large datasets
- Add filtering and sorting validation

### Validation
DTOs use class-validator decorators:
- `CreateUserDto` - Required fields, email format, password strength
- `UpdateUserDto` - Optional fields with partial validation
- `QueryUserDto` - Filtering and sorting parameters

## Database Abstractions

### Dual Implementation Support
Module conditionally loads persistence layer based on configuration:

```typescript
const infrastructurePersistenceModule = (databaseConfig() as DatabaseConfig)
  .isDocumentDatabase
  ? DocumentUserPersistenceModule
  : RelationalUserPersistenceModule;
```

### Document Database (MongoDB)
- Schema: `user.schema.ts` with Mongoose decorators
- Mapper: Converts between domain objects and MongoDB documents
- Repository: Implements MongoDB-specific queries

### Relational Database (SQL)
- Entity: `user.entity.ts` with TypeORM decorators  
- Mapper: Converts between domain objects and SQL entities
- Repository: Implements SQL-specific queries with relations

**Critical**: When modifying user fields:
1. Update domain object (`domain/user.ts`)
2. Update both schema/entity files
3. Update both mapper implementations
4. Update DTOs accordingly
5. Create database migration if needed

## Common Operations

### Adding New User Fields
1. Add field to domain object: `src/users/domain/user.ts`
2. Update DTOs: `src/users/dto/create-user.dto.ts`, `update-user.dto.ts`
3. Update both persistence implementations:
   - Document: `infrastructure/persistence/document/entities/user.schema.ts`
   - Relational: `infrastructure/persistence/relational/entities/user.entity.ts`
4. Update mappers in both implementations
5. Create database migration: `npm run migration:generate -- src/database/migrations/AddUserField`

### Adding Business Logic
1. Add method to `UsersService`
2. Add corresponding endpoint to `UsersController` if needed
3. Add DTOs for new operations
4. Update repository interface if new data access patterns needed
5. Implement in both repository implementations

### Testing Considerations
- Unit tests should mock the repository interface
- Integration tests should test against both database implementations
- E2E tests validate the full HTTP request/response cycle
- Test data factories should create valid user objects

## Phase 1 Security Enhancements

Based on `OPERATIONAL_PLAN.md`, this module needs:

1. **Enhanced Input Validation** (Week 2)
   - Add input sanitization middleware
   - Strengthen password validation rules
   - Add email verification requirements

2. **Improved Error Handling** (Week 1)  
   - Replace HTTP exceptions with domain-specific errors
   - Add structured error logging
   - Implement proper error correlation

3. **Security Headers** (Week 2)
   - Ensure sensitive data excluded from logs
   - Add audit logging for user operations
   - Implement rate limiting on user endpoints

## Performance Considerations

Current implementation areas for improvement:
- No caching of user lookups (frequent database calls)
- No bulk operations support
- Pagination could be optimized with database indexes
- No lazy loading of related entities (roles, status)

**Phase 2 Enhancements**: Add Redis caching for user profiles and implement connection pooling.