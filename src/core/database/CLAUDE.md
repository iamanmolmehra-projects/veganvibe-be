# CLAUDE.md - Database Configuration

This file provides guidance for working with the database configuration and abstractions.

## Database Architecture

The application template provides **implementations for both database paradigms** - teams choose one per deployment:

```
database/
├── config/
│   ├── database-config.type.ts    # TypeScript interfaces
│   └── database.config.ts         # Configuration service
├── migrations/                    # TypeORM migrations
├── seeds/                        # Database seeding
│   ├── document/                 # MongoDB seeds
│   └── relational/               # SQL seeds
├── data-source.ts                # TypeORM DataSource (CLI operations)
├── typeorm-config.service.ts     # TypeORM configuration
└── mongoose-config.service.ts    # MongoDB configuration
```

## Configuration System

### Database Type Selection
Configuration determines which database implementation to use via `isDocumentDatabase` flag:

```typescript
// database.config.ts:42
isDocumentDatabase: ['mongodb'].includes(process.env.DATABASE_TYPE ?? '')
```

**Deployment Choices** (select ONE per service):
- **Document Database**: Set `DATABASE_TYPE=mongodb` to use MongoDB implementation
- **Relational Database**: Set `DATABASE_TYPE=postgres|mysql|sqlite` etc. to use SQL implementation

**Important**: Each service deployment uses either MongoDB OR a SQL database, not both simultaneously.

### Environment Variables
**Required for all configurations**:
- `DATABASE_TYPE` - Database type identifier
- `DATABASE_NAME` - Database name

**Connection URL (Optional)**:
- `DATABASE_URL` - Full connection string (overrides individual parameters)

**Individual Parameters** (used when `DATABASE_URL` not provided):
- `DATABASE_HOST` - Database host
- `DATABASE_PORT` - Database port (default: 5432 for PostgreSQL, 27017 for MongoDB)
- `DATABASE_USERNAME` - Database username  
- `DATABASE_PASSWORD` - Database password

## TypeORM Configuration (Relational Databases)

### Configuration Service
`TypeOrmConfigService` (lines 10-31) provides TypeORM module configuration:

**Key Settings**:
- **Connection pooling**: Enabled with `keepConnectionAlive: true`
- **Logging**: Disabled in production (line 22-23)
- **Entities**: Auto-discovered via glob pattern `**/*.entity{.ts,.js}`
- **Migrations**: Located in `migrations/` directory

**Connection Pool** (`data-source.ts:25-30`):
- Maximum connections: 100 (configurable via `DATABASE_MAX_CONNECTIONS`)
- Connection timeout and retry logic built into TypeORM

### Migrations
- **Generate**: `npm run migration:generate -- src/database/migrations/MigrationName`
- **Run**: `npm run migration:run`
- **Revert**: `npm run migration:revert`
- **Location**: `src/database/migrations/`

**Important**: Migrations only apply to relational databases. Document databases use schema-less approach.

## Mongoose Configuration (Document Databases)

### Configuration Service
`MongooseConfigService` (lines 14-25) provides Mongoose module configuration:

**Key Features**:
- **Auto-population**: Enabled via `mongoose-autopopulate` plugin (line 21)
- **Connection URI**: Uses full URI format for connection
- **Authentication**: Username/password passed as separate parameters

### Schema Management
Document schemas are auto-discovered but don't use migrations:
- Schema changes applied automatically on startup
- Use Mongoose schema versioning for breaking changes
- Consider data transformation scripts for major schema updates

## Database Switching Logic

### Module-Level Abstraction
Each domain module conditionally loads the appropriate persistence layer:

```typescript
// Example from app.module.ts
const infrastructureDatabaseModule = (databaseConfig() as DatabaseConfig)
  .isDocumentDatabase
  ? MongooseModule.forRootAsync({ useClass: MongooseConfigService })
  : TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService });
```

### Repository Pattern Implementation
Each domain provides template implementations for both database choices:
- **Abstract repository interface**: Defines data access contract (same for both)
- **Document implementation**: Mongoose-based with schemas (used when `DATABASE_TYPE=mongodb`)
- **Relational implementation**: TypeORM-based with entities (used when `DATABASE_TYPE=postgres` etc.)

**Deployment Strategy**: Teams can remove the implementation they don't need, keeping only their chosen database type.

## Seeding System

### Relational Database Seeds
- **Location**: `src/database/seeds/relational/`
- **Command**: `npm run seed:run:relational`
- **Structure**: Modular seeds per domain (users, roles, statuses)

### Document Database Seeds  
- **Location**: `src/database/seeds/document/`
- **Command**: `npm run seed:run:document`
- **Structure**: Same modular approach as relational

### Creating New Seeds
- **Relational**: `npm run seed:create:relational`
- **Document**: `npm run seed:create:document`

## Security Considerations

### Current Issues
- **Connection credentials**: Stored in plain text environment variables
- **No connection encryption**: TLS/SSL not enforced
- **No credential rotation**: Static database passwords

### Phase 1 Security Improvements Needed
1. **Environment variable validation**: Ensure required variables present and valid
2. **Connection encryption**: Enforce TLS/SSL connections
3. **Connection timeout**: Add connection and query timeouts
4. **Error handling**: Don't expose database errors to clients

### Phase 2 Security Enhancements
1. **Credential encryption**: Encrypt database passwords at rest
2. **Connection pooling security**: Implement proper pool cleanup
3. **Query monitoring**: Log slow/suspicious queries
4. **Access auditing**: Track database access patterns

## Performance Considerations

### Connection Management
**Current State**:
- Connection pooling enabled for TypeORM (max 100 connections)
- Keep-alive enabled to reduce connection overhead
- No explicit pooling configuration for Mongoose

**Phase 2 Improvements**:
- Configure Mongoose connection pooling
- Implement connection health checks
- Add connection metrics monitoring
- Optimize pool sizes based on load testing

### Query Performance
**Current Issues**:
- No query performance monitoring
- Missing database indexes on frequently queried fields
- No slow query detection

**Recommendations**:
- Add database indexes for common query patterns
- Implement query performance monitoring
- Add connection retry logic with backoff

## Troubleshooting

### Common Issues

**Database Connection Failures**:
1. Check environment variables are correctly set
2. Verify database server is running and accessible
3. Confirm credentials are valid
4. Check network connectivity and firewall rules

**Migration Issues**:
1. Ensure database exists before running migrations
2. Check migration file syntax
3. Verify database user has DDL permissions
4. Review migration history in `migrations` table

**Deploying with Different Database Types**:
1. Set `DATABASE_TYPE` environment variable to your choice (`mongodb` or `postgres`/etc.)
2. Use corresponding environment template: `env-example-document` or `env-example-relational`
3. Ensure your chosen database server is running and accessible
4. Run appropriate seeds: `npm run seed:run:relational` or `npm run seed:run:document`
5. Restart application with new configuration

### Configuration Validation

The configuration system validates required environment variables on startup. Invalid configuration prevents application launch with clear error messages.

**Phase 1 Enhancement**: Add comprehensive configuration validation with specific error messages for missing/invalid database configuration.

## Development Workflow

### Adding New Entities/Schemas
For template development (maintaining both implementations):
1. Create domain entity in `domain/` directory
2. Create both relational entity (`.entity.ts`) and document schema (`.schema.ts`)
3. Update repository implementations for both database types
4. Create migration for relational database: `npm run migration:generate`
5. Update seeds for both database types

For production deployment (using one database choice):
1. Create domain entity in `domain/` directory
2. Create either relational entity OR document schema (based on your `DATABASE_TYPE`)
3. Update repository implementation for your chosen database type
4. Create migration (SQL) or handle schema evolution (MongoDB)
5. Update seeds for your chosen database type

### Testing Database Changes
For template maintenance:
1. Test with both database configurations separately
2. Run seeds to verify data creation works for both types
3. Test migrations rollback/forward for SQL, schema evolution for MongoDB
4. Validate performance with realistic data volumes

For deployment testing:
1. Test with your chosen database configuration
2. Validate seeds work correctly
3. Test migration strategy appropriate to your database choice
4. Performance test with expected production data volumes