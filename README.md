# Backend Service Template

A production-ready starter template for building scalable and maintainable server-side applications using NestJS. This template follows clean architecture principles, includes comprehensive logging, supports dual database paradigms, and provides enterprise-grade developer utilities.

## 🚀 Features

### Core Framework & Architecture
- [x] **NestJS Framework** - TypeScript-first Node.js framework with decorators
- [x] **Clean Architecture** - Domain-driven design with clear separation of concerns
- [x] **Database Choice** - Support both [TypeORM](https://www.npmjs.com/package/typeorm) (SQL) and [Mongoose](https://www.npmjs.com/package/mongoose) (MongoDB)
- [x] **Configuration Management** - Type-safe configuration with validation
- [x] **API Versioning** - URI-based versioning strategy

### Security & Authentication
- [x] **JWT Authentication** - Secure token-based authentication
- [x] **Role-Based Access Control** - Admin and User roles with guards
- [x] **Social Authentication** - Apple, Facebook, Google OAuth integration
- [x] **Input Validation** - Comprehensive request validation with sanitization
- [x] **Security Headers** - CORS configuration and security middleware ready

### Observability & Monitoring
- [x] **Structured Logging** - High-performance [Pino](https://www.npmjs.com/package/pino) logging
- [x] **Request Tracing** - Correlation IDs for distributed tracing
- [x] **HTTP Request Logging** - Consolidated request-response logging
- [x] **Health Checks** - Kubernetes-compatible health endpoints (planned)
- [x] **API Documentation** - Interactive Swagger/OpenAPI documentation

### Development Experience
- [x] **TypeScript** - Full TypeScript support with strict typing
- [x] **Code Generation** - Hygen templates for consistent resource creation
- [x] **Database Seeding** - Automated data seeding for both database types
- [x] **Database Migrations** - TypeORM migrations for SQL databases
- [x] **Hot Reload** - Development server with automatic restart
- [x] **Linting & Formatting** - ESLint and Prettier configuration

### File Handling & Communication
- [x] **File Uploads** - Support for local and Amazon S3 storage drivers
- [x] **Email Service** - [Nodemailer](https://www.npmjs.com/package/nodemailer) integration
- [x] **Internationalization** - I18N support with [nestjs-i18n](https://www.npmjs.com/package/nestjs-i18n)

### Testing & Quality
- [x] **Unit Testing** - Jest-based unit tests with coverage reporting
- [x] **E2E Testing** - End-to-end API testing with database variants
- [x] **Test Isolation** - Database-specific test configurations
- [x] **Code Quality** - Automated linting and formatting checks

### DevOps & Deployment
- [x] **Docker Support** - Containerization ready
- [x] **Environment Configuration** - Multiple environment support
- [x] **CI/CD Ready** - GitHub Actions integration (planned)
- [x] **Production Optimizations** - Build and deployment configurations

## 🏗️ Project Structure

```
├── src/
│   ├── config/                     # Configuration management
│   │   ├── app.config.ts          # Application configuration
│   │   ├── logger.config.ts       # Logging configuration
│   │   └── config.type.ts         # Configuration type definitions
│   ├── database/                   # Database configuration & migrations
│   │   ├── config/                # Database-specific configuration
│   │   ├── migrations/            # TypeORM migrations (SQL databases)
│   │   ├── seeds/                 # Database seeding for both DB types
│   │   ├── typeorm-config.service.ts
│   │   └── mongoose-config.service.ts
│   ├── utils/                      # Shared utilities & common functionality
│   │   ├── logger.service.ts      # Structured logging service
│   │   ├── consolidated-http-logging.interceptor.ts
│   │   ├── request-context.service.ts
│   │   ├── correlation-id.middleware.ts
│   │   ├── response-interceptor.ts # API response standardization
│   │   ├── validation-options.ts  # Global validation configuration
│   │   └── types/                 # TypeScript type definitions
│   ├── [domain]/                  # Domain modules (users, roles, etc.)
│   │   ├── domain/                # Business entities (database-agnostic)
│   │   ├── dto/                   # Data transfer objects with validation
│   │   ├── infrastructure/
│   │   │   └── persistence/
│   │   │       ├── document/      # MongoDB implementation
│   │   │       └── relational/    # SQL database implementation
│   │   ├── [domain].controller.ts # HTTP endpoints
│   │   ├── [domain].service.ts    # Business logic
│   │   └── [domain].module.ts     # Module configuration
│   ├── app.module.ts              # Root application module
│   └── main.ts                    # Application bootstrap
├── test/                          # Testing infrastructure
│   ├── admin/                     # Admin-specific E2E tests
│   ├── user/                      # User-specific E2E tests
│   └── utils/                     # Test utilities and fixtures
├── env-example-document           # Environment template for MongoDB
├── env-example-relational        # Environment template for SQL databases
├── CLAUDE.md                     # AI assistant guidance documentation
├── LOGGING.md                    # Comprehensive logging documentation
└── OPERATIONAL_PLAN.md          # Implementation roadmap
```

## 🚦 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- Database: PostgreSQL/MySQL OR MongoDB (choose one)

### 1. Clone and Install
```bash
git clone <repository-url>
cd backend-service-template
npm install
```

### 2. Environment Setup
Choose your database type and copy the appropriate environment template:

```bash
# For MongoDB
cp env-example-document .env

# For PostgreSQL/MySQL  
cp env-example-relational .env
```

Edit `.env` file with your database credentials and configuration.

### 3. Database Setup
```bash
# For SQL databases - run migrations
npm run migration:run

# Seed database with initial data
npm run seed:run:relational  # For SQL
npm run seed:run:document    # For MongoDB
```

### 4. Start Development Server
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000` with Swagger documentation at `http://localhost:3000/docs`.

## 🛠️ Development Commands

### Application Lifecycle
```bash
npm run start:dev        # Start development server with hot reload
npm run start:prod       # Start production server
npm run build           # Build for production
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
```

### Database Operations
```bash
# Migrations (SQL databases only)
npm run migration:generate -- src/database/migrations/MigrationName
npm run migration:run
npm run migration:revert

# Seeding
npm run seed:run:relational   # Seed SQL database
npm run seed:run:document     # Seed MongoDB
```

### Code Generation
```bash
# Generate complete CRUD resources
npm run generate:resource:all-db        # Both database implementations
npm run generate:resource:relational    # SQL implementation only  
npm run generate:resource:document      # MongoDB implementation only

# Create new seeds
npm run seed:create:relational
npm run seed:create:document
```

### Testing
```bash
npm run test            # Unit tests
npm run test:watch      # Watch mode for unit tests
npm run test:cov        # Unit tests with coverage
npm run test:e2e        # End-to-end tests

# Docker-based E2E testing
npm run test:e2e:document:docker     # E2E with MongoDB
npm run test:e2e:relational:docker   # E2E with PostgreSQL
```

## 🗃️ Database Architecture

This template supports **database choice architecture** - teams select either MongoDB OR a SQL database per deployment, not both simultaneously.

### Supported Databases
- **Document Database**: MongoDB with Mongoose
- **Relational Databases**: PostgreSQL, MySQL, SQLite via TypeORM

### Implementation Strategy
Each domain module provides both implementations:
- Abstract repository interface (database-agnostic)
- Document implementation (MongoDB/Mongoose)
- Relational implementation (SQL/TypeORM)

The application loads the appropriate implementation based on `DATABASE_TYPE` environment variable.

### Domain Module Structure
```typescript
users/
├── domain/user.ts              # Business entity
├── dto/                        # Request/response DTOs  
├── infrastructure/persistence/
│   ├── user.repository.ts      # Abstract interface
│   ├── document/               # MongoDB implementation
│   └── relational/             # SQL implementation
├── users.controller.ts         # HTTP endpoints
├── users.service.ts           # Business logic
└── users.module.ts            # Module configuration
```

## 📊 Logging & Observability

### Comprehensive Logging System
- **Structured JSON Logging** with Pino (5x faster than Winston)
- **Single Log Per HTTP Request** with complete request-response cycle
- **Correlation ID Tracking** for distributed tracing
- **Automatic Sensitive Data Sanitization**
- **Business Logic Logging** throughout the application

### Log Types
1. **HTTP Request Logs** - Consolidated request-response with timing
2. **Application Logs** - Business logic events and debugging
3. **Error Logs** - Exception tracking with correlation IDs

### Example HTTP Request Log
```json
{
  "level": "info",
  "timestamp": "2024-08-23T23:45:12.123Z",
  "correlationId": "req-abc-123",
  "message": "HTTP Request Completed",
  "method": "POST",
  "url": "/api/v1/users",
  "statusCode": 201,
  "responseTime": 145,
  "controller": "UsersController",
  "operation": "create_user",
  "userId": "user-456"
}
```

For detailed logging documentation, see [LOGGING.md](./LOGGING.md).

## 🔧 Configuration

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment type |
| `APP_PORT` | `3000` | Server port |
| `DATABASE_TYPE` | - | `mongodb` or `postgres`/`mysql` |
| `DATABASE_URL` | - | Full database connection string |
| `LOG_LEVEL` | `info` | Logging level |
| `JWT_SECRET` | - | JWT signing secret |

### Database Choice
Set `DATABASE_TYPE` to choose your database implementation:
- `mongodb` - Uses MongoDB with Mongoose
- `postgres`, `mysql`, `sqlite` - Uses SQL with TypeORM

## 📋 API Documentation

### Swagger UI
Interactive API documentation available at `/docs` when running the application.

### API Versioning
- Base URL: `/api/v1/`
- Versioning strategy: URI-based (`/api/v1/`, `/api/v2/`)

### Standard Response Format
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request processed successfully", 
  "data": {},
  "hasNextPage": false
}
```

## 🧪 Testing Strategy

### Test Types
- **Unit Tests** - Service and utility testing with Jest
- **Integration Tests** - Database and external service testing
- **E2E Tests** - Full API workflow testing
- **Database Variant Testing** - Tests for both MongoDB and SQL implementations

### Test Organization
```
test/
├── admin/          # Admin user workflow tests
├── user/           # Regular user workflow tests  
├── utils/          # Test utilities and fixtures
└── jest-e2e.json   # E2E test configuration
```

## 📈 Performance & Scalability

### Built-in Optimizations
- **High-performance logging** with Pino
- **Connection pooling** for databases
- **Request correlation** for debugging
- **Efficient data validation** with class-validator
- **Response caching** headers ready

### Monitoring Ready
- Structured logs for ELK/Splunk/Datadog
- Health check endpoints for Kubernetes
- Correlation IDs for distributed tracing
- Performance metrics collection points

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)  
- Social OAuth integration
- Password hashing with bcrypt

### Data Protection
- Input validation and sanitization
- Sensitive data redaction in logs
- CORS configuration
- Security headers ready for implementation

### Security Headers (Ready for Implementation)
- Helmet.js integration points
- Rate limiting preparation
- Request size limits configuration

## 🚀 Production Deployment

### Build & Deploy
```bash
npm run build
npm run start:prod
```

### Docker Support
```bash
# Build image
docker build -t backend-service .

# Run container
docker run -p 3000:3000 --env-file .env backend-service
```

### Environment Checklist
- [ ] Set strong `JWT_SECRET`
- [ ] Configure production database
- [ ] Set appropriate `LOG_LEVEL`
- [ ] Enable security middleware
- [ ] Configure CORS for production domains
- [ ] Set up health check monitoring

## 🔄 Roadmap & Implementation Plan

This template includes a comprehensive implementation plan in [OPERATIONAL_PLAN.md](./OPERATIONAL_PLAN.md) covering:

### Phase 1: Security & Reliability ✅
- [x] Structured logging with Pino
- [ ] Global exception filters
- [ ] Security middleware (Helmet, rate limiting)
- [ ] Health check endpoints

### Phase 2: Observability
- [ ] Prometheus metrics and OpenTelemetry tracing
- [ ] Redis caching layer  
- [ ] Dynamic configuration management
- [ ] Comprehensive testing framework

### Phase 3: Advanced Features  
- [ ] CI/CD pipeline automation
- [ ] Performance monitoring
- [ ] Advanced security features
- [ ] Scalability enhancements

## 📚 Documentation

- [CLAUDE.md](./CLAUDE.md) - AI assistant guidance for development
- [LOGGING.md](./LOGGING.md) - Comprehensive logging documentation  
- [OPERATIONAL_PLAN.md](./OPERATIONAL_PLAN.md) - Implementation roadmap
- Domain-specific documentation in each module's `CLAUDE.md` files
- 

## 🤝 Contributing

This template is designed for teams to customize for their specific needs:

1. Choose your database type (MongoDB or SQL)
2. Implement your business domains using the provided patterns
3. Extend the logging system with custom business metrics
4. Add your security requirements and middleware
5. Customize the testing strategy for your use cases

## 📧 Support

For support and questions, please contact [anmol@kiwiinsurance.com]

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ using NestJS, TypeScript, and modern Node.js practices**
