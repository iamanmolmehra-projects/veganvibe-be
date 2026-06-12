# CLAUDE.md - Configuration Management

This file provides guidance for working with the application configuration system.

## Configuration Architecture

The configuration system uses **NestJS Config Module** with TypeScript-based validation:

```
config/
├── app-config.type.ts     # AppConfig interface
├── app.config.ts          # Application configuration service
└── config.type.ts         # Unified configuration type
```

## Configuration Pattern

### Type-Safe Configuration
Each configuration domain has:
1. **Type definition**: Interface defining configuration structure
2. **Configuration service**: Loads and validates environment variables  
3. **Validator class**: Class-validator rules for environment variables
4. **Registration**: Registered with `registerAs()` for dependency injection

### Current Configuration Domains
- **App Configuration**: Application-level settings (port, domain, API prefix)
- **Database Configuration**: Database connection and type settings (see `../database/config/`)

## App Configuration (`app.config.ts`)

### Environment Variables
**Required Variables**: None (all have defaults)

**Optional Variables**:
- `NODE_ENV` - Environment type (`development`, `production`, `test`)
- `APP_PORT` or `PORT` - Server port (default: 3000)
- `APP_NAME` - Application name (default: 'app')
- `FRONTEND_DOMAIN` - Frontend application URL
- `BACKEND_DOMAIN` - Backend application URL (default: 'http://localhost')
- `API_PREFIX` - API path prefix (default: 'api')
- `APP_FALLBACK_LANGUAGE` - Default language (default: 'en')
- `APP_HEADER_LANGUAGE` - Language header name (default: 'x-custom-lang')

### Validation Rules
Environment variables validated using class-validator (lines 20-50):
- **NODE_ENV**: Must be valid Environment enum value
- **APP_PORT**: Integer between 0-65535
- **FRONTEND_DOMAIN/BACKEND_DOMAIN**: Valid URL format (TLD not required for local development)
- **String fields**: Basic string validation

### Access Pattern
Configuration accessed via ConfigService injection:
```typescript
constructor(private configService: ConfigService<AllConfigType>) {}

const port = this.configService.get('app.port', { infer: true });
const apiPrefix = this.configService.get('app.apiPrefix', { infer: true });
```

## Configuration System Integration

### Global Configuration (`config.type.ts`)
`AllConfigType` unifies all configuration domains:
```typescript
export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
};
```

**Adding New Configuration Domains**:
1. Create new config type and service files
2. Add to `AllConfigType` interface
3. Register in `app.module.ts` ConfigModule load array

### Module Registration
Configuration loaded globally in `app.module.ts:30-37`:
```typescript
ConfigModule.forRoot({
  isGlobal: true,
  load: [databaseConfig, appConfig],
  envFilePath: ['.env'],
})
```

## Security Considerations

### Current Security Issues
- **No encryption**: Sensitive configuration stored in plain text
- **Weak validation**: Optional validation allows missing critical settings
- **Environment exposure**: Configuration accessible throughout application

### Phase 1 Security Improvements
1. **Enhanced Validation** (Week 3):
   - Make critical configuration required
   - Add stronger validation rules (password complexity, URL schemes)
   - Validate configuration relationships (e.g., frontend/backend domain compatibility)

2. **Secure Configuration Loading** (Week 3):
   - Add configuration encryption for sensitive values
   - Implement configuration audit logging
   - Add configuration change detection

### Recommended Security Enhancements

**Immediate (Phase 1)**:
```typescript
// Enhanced validation example
class EnvironmentVariablesValidator {
  @IsEnum(Environment)
  NODE_ENV: Environment; // Remove @IsOptional() - require in production

  @IsInt()
  @Min(1024)
  @Max(65535)
  APP_PORT: number; // Require secure port range

  @IsUrl({ protocols: ['https'], require_tld: true })
  @ValidateIf((o) => o.NODE_ENV === 'production')
  FRONTEND_DOMAIN: string; // Require HTTPS in production
}
```

## Configuration Best Practices

### Environment-Specific Configuration
**Development**: `.env` file with defaults
**Staging**: Override specific values, validate SSL requirements
**Production**: All required values set, enforce security constraints

### Adding New Configuration

1. **Create Configuration Type**:
```typescript
// new-feature-config.type.ts
export type NewFeatureConfig = {
  enabled: boolean;
  apiKey: string;
  timeout: number;
};
```

2. **Create Configuration Service**:
```typescript
// new-feature.config.ts
export default registerAs<NewFeatureConfig>('newFeature', () => {
  validateConfig(process.env, NewFeatureValidator);
  
  return {
    enabled: process.env.NEW_FEATURE_ENABLED === 'true',
    apiKey: process.env.NEW_FEATURE_API_KEY,
    timeout: parseInt(process.env.NEW_FEATURE_TIMEOUT, 10) || 5000,
  };
});
```

3. **Update Global Type**:
```typescript
// config.type.ts
export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  newFeature: NewFeatureConfig; // Add new configuration
};
```

4. **Register in Module**:
```typescript
// app.module.ts
ConfigModule.forRoot({
  load: [databaseConfig, appConfig, newFeatureConfig], // Add to load array
})
```

## Configuration Validation

### Validation Flow
1. **Startup**: Environment variables validated against validator classes
2. **Failure**: Application fails to start with validation errors
3. **Success**: Configuration available throughout application via injection

### Custom Validation
Create custom validators for complex business rules:
```typescript
@ValidatorConstraint({ name: 'portRange', async: false })
class PortRangeValidator implements ValidatorConstraintInterface {
  validate(port: number, args: ValidationArguments) {
    const env = (args.object as any).NODE_ENV;
    if (env === 'production') {
      return port >= 443 && port <= 65535; // Production must use secure ports
    }
    return port >= 1024 && port <= 65535; // Development allows unprivileged ports
  }
}
```

## Phase 2 Configuration Enhancements

### Dynamic Configuration (Week 6-7)
- **Hot reload**: Configuration changes without restart
- **Configuration API**: Admin interface for configuration management
- **Configuration backup**: Version control for configuration changes

### Feature Flags Integration
```typescript
export type FeatureFlagsConfig = {
  enhancedSecurity: boolean;
  distributedTracing: boolean;
  advancedCaching: boolean;
};
```

### Configuration Monitoring
- Configuration change auditing
- Configuration drift detection
- Configuration validation in CI/CD pipeline

## Troubleshooting

### Common Issues

**Application Won't Start**:
1. Check validation errors in console output
2. Verify all required environment variables are set
3. Validate environment variable formats (URLs, numbers, enums)

**Configuration Not Loading**:
1. Ensure `.env` file exists and is readable
2. Check ConfigModule registration in app.module.ts
3. Verify configuration service is properly registered with `registerAs()`

**Type Errors**:
1. Ensure new configuration added to `AllConfigType`
2. Check TypeScript inference with `{ infer: true }`
3. Validate configuration service return type matches interface

### Development Workflow

**Adding Configuration**: Follow the 4-step process above
**Modifying Configuration**: Update type, service, and validation simultaneously  
**Environment Setup**: Copy appropriate `env-example-*` file to `.env`
**Testing**: Validate configuration works in both development and production modes