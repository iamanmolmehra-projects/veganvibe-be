# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS backend service template built with clean architecture principles. The template supports both relational (TypeORM) and document (MongoDB/Mongoose) databases through a configurable infrastructure layer.

## Development Commands

### Core Development
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests

### Logging & Debugging
- `LOG_LEVEL=debug npm run start:dev` - Enable debug logging
- `NODE_ENV=production npm run start:dev` - Test production log format locally
- `grep "correlationId" logs/*.log` - Filter logs by correlation ID

### Database Operations
- `npm run migration:generate -- src/database/migrations/MigrationName` - Generate TypeORM migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration
- `npm run seed:run:relational` - Run relational database seeds
- `npm run seed:run:document` - Run document database seeds

### Code Generation
- `npm run generate:resource:relational` - Generate new resource for relational DB
- `npm run generate:resource:document` - Generate new resource for document DB
- `npm run generate:resource:all-db` - Generate resource supporting both DB types
- `npm run seed:create:relational` - Create new relational seed
- `npm run seed:create:document` - Create new document seed

## Architecture

### Database Choice Architecture
The codebase provides **template implementations for both database paradigms** - teams choose ONE per deployment:
- **Configuration-based selection**: `src/database/config/database.config.ts` determines if `isDocumentDatabase` is true (MongoDB) or false (relational DB)
- **Module-level abstraction**: Each domain module (like `UsersModule`) conditionally imports either document OR relational persistence modules based on `DATABASE_TYPE`
- **Repository pattern**: Both database types implement the same repository interface, enabling teams to switch database choice without changing business logic
- **Deployment strategy**: Each service deployment uses either MongoDB OR PostgreSQL/MySQL, not both simultaneously

### Domain Structure
Each domain follows this structure:
```
src/[domain]/
├── domain/           # Business entities
├── dto/             # Data transfer objects
├── infrastructure/
│   └── persistence/
│       ├── document/    # MongoDB implementation
│       └── relational/  # TypeORM implementation
├── [domain].controller.ts
├── [domain].service.ts
└── [domain].module.ts
```

### Key Architectural Patterns
- **Clean Architecture**: Domain entities are separate from infrastructure concerns
- **Repository Pattern**: Database operations are abstracted behind repository interfaces
- **Database-agnostic modules**: The same service layer works with either database choice
- **Configuration-driven**: Database type chosen at deployment time via environment variables
- **Single database per deployment**: Teams select either MongoDB OR SQL for their service, not both

### Environment Configuration
- Copy `env-example-document` or `env-example-relational` to `.env` based on your **single database choice**
- The `DATABASE_TYPE` environment variable controls which persistence layer is used
- **Choose one**: `mongodb` for document database OR `postgres`/`mysql`/etc for relational database
- Each deployment runs with only one database type - the template provides both implementations as examples

### Logging System
**High-Performance Structured Logging** with Pino:
- **Consolidated HTTP Logging**: Single log entry per HTTP request with complete request-response cycle
- **Application Business Logic Logging**: Explicit logging throughout services with correlation IDs
- **Automatic Data Sanitization**: Passwords, tokens, and sensitive data automatically redacted
- **Environment-Based Configuration**: Pretty logs for development, structured JSON for production

**Key Features**:
- Correlation ID tracking across the entire request lifecycle
- Custom business data injection into HTTP logs via `RequestContextService`
- 5x faster performance compared to Winston
- Production-ready for log aggregation systems (ELK, Splunk, Datadog)

See detailed documentation in [LOGGING.md](./LOGGING.md).

### Code Generation with Hygen
The project uses Hygen templates for consistent code generation. Generated code includes:
- Complete CRUD operations for both database types
- DTOs with validation
- Repository implementations
- Module configurations
- Logging integration in generated services

### Testing Strategy
- Unit tests use Jest with TypeScript
- E2E tests can be run against either database type
- Docker compose files provided for isolated testing environments
- Logging system tested with both database configurations