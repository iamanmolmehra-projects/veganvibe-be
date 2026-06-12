import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { useContainer } from 'class-validator';
import 'dotenv/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import type { AllConfigType } from './common/config/config.type';
import { ConsolidatedHttpLoggingInterceptor } from './common/utils/consolidated-http-logging.interceptor';
import { ResolvePromisesInterceptor } from './common/utils/serializer.interceptor';
import validationOptions from './common/utils/validation-options';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Buffer logs until Pino logger is ready
    cors: true,
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService<AllConfigType>);

  // Replace NestJS default logger with Pino
  app.useLogger(app.get(Logger));

  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalInterceptors(
    app.get(ConsolidatedHttpLoggingInterceptor),
    new ResolvePromisesInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  const options = new DocumentBuilder()
    .setTitle('Veganvibe API')
    .setDescription(
      `
      Comprehensive API for fetching data from vegan restaurants wrt the user

      ## Features
      ## Authentication
      - **API Key**: Required for all endpoints via \`x-api-key\` header
      - **JWT Bearer Token**: Optional for additional authentication

      ## Versioning
      All endpoints are versioned using URI versioning (e.g., \`/api/v1/commission\`)
    `,
    )
    .setVersion('1.0.0')
    .setContact('Veganvibe Engineering', '', 'engineering@veganvibe.com')
    .setLicense('Proprietary', '')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'API Key for authentication. Required for all endpoints.',
      },
      'api-key',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token for additional authentication',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Home', 'Application health and status endpoints')
    .addServer(
      `${configService.getOrThrow('app.backendDomain', { infer: true })}`,
      'Development server',
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('docs', app, document, {
    swaggerUiEnabled: false,
  });

  app.use(
    '/docs',
    apiReference({
      content: document,
      theme: 'default',
      darkMode: true,
      showOperationId: true,
      title: 'Veganvibe API Reference',
    }),
  );

  
  await app.listen(configService.getOrThrow('app.port', { infer: true }));
}
void bootstrap();
