import type { Params } from 'nestjs-pino';
import type { DatabaseConfig } from '../../core/database/config/database-config.type';
import type { AppConfig } from './app-config.type';

export interface AllConfigType {
  app: AppConfig;
  database: DatabaseConfig;
  logger: Params;
}
