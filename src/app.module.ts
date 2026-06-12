import {
  MiddlewareConsumer,
  Module,
  NestModule,
  Scope,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { DataSource, DataSourceOptions } from 'typeorm';

import appConfig from './common/config/app.config';
import claudeConfig from './common/config/claude.config';
import loggerConfig from './common/config/logger.config';
import openaiConfig from './common/config/openai.config';
import { ConsolidatedHttpLoggingInterceptor } from './common/utils/consolidated-http-logging.interceptor';
import { CorrelationIdMiddleware } from './common/utils/correlation-id.middleware';
import { GlobalExceptionFilter } from './common/utils/global-exception.filter';
import { UtilitiesLoggerModule } from './common/utils/logger.module';
import databaseConfig from './core/database/config/database.config';
import { TypeOrmConfigService } from './core/database/typeorm-config.service';
import { AuthModule } from './modules/auth/auth.module';
import { HomeModule } from './modules/home/home.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { ScansModule } from './modules/scans/scans.module';
import { UsersModule } from './modules/users/users.module';

// <database-block>
const infrastructureDatabaseModule = TypeOrmModule.forRootAsync({
      dataSourceFactory: async (options: DataSourceOptions) =>
        new DataSource(options).initialize(),
      useClass: TypeOrmConfigService,
    });
// </database-block>

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      load: [databaseConfig, appConfig, loggerConfig, claudeConfig, openaiConfig],
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const loggerConfig = configService.get('logger', { infer: true });
        return loggerConfig ?? {};
      },
    }),
    UtilitiesLoggerModule,
    infrastructureDatabaseModule,
    UsersModule,
    HomeModule,
    AuthModule,
    RestaurantsModule,
    ScansModule,
  ],
  providers: [
    ConsolidatedHttpLoggingInterceptor,
    {
      provide: APP_FILTER,
      scope: Scope.REQUEST,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
