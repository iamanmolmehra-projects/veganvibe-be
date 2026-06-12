import { registerAs } from '@nestjs/config';
import { IsInt, IsString, Max, Min, ValidateIf } from 'class-validator';

import validateConfig from '../../../common/utils/validate-config';

import { DatabaseConfig } from './database-config.type';

class EnvironmentVariablesValidator {
  @ValidateIf((envValues: Record<string, unknown>) => Boolean(envValues.DATABASE_URL))
  @IsString()
  DATABASE_URL: string;

  @ValidateIf((envValues: Record<string, unknown>) => Boolean(envValues.DATABASE_URL))
  @IsString()
  DATABASE_TYPE: string;

  @ValidateIf((envValues: Record<string, unknown>) => Boolean(envValues.DATABASE_URL))
  @IsString()
  DATABASE_HOST: string;

  @ValidateIf((envValues: Record<string, unknown>) => Boolean(envValues.DATABASE_URL))
  @IsInt()
  @Min(0)
  @Max(65_535)
  DATABASE_PORT: number;

  @ValidateIf((envValues: Record<string, unknown>) => Boolean(envValues.DATABASE_URL))
  @IsString()
  DATABASE_PASSWORD: string;

  @ValidateIf((envValues: Record<string, unknown>) => Boolean(envValues.DATABASE_URL))
  @IsString()
  DATABASE_NAME: string;

  @ValidateIf((envValues: Record<string, unknown>) => Boolean(envValues.DATABASE_URL))
  @IsString()
  DATABASE_USERNAME: string;
}

export default registerAs<DatabaseConfig>('database', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    host: process.env.DATABASE_HOST,
    isDocumentDatabase: ['mongodb'].includes(process.env.DATABASE_TYPE ?? ''),
    name: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT !== undefined
      ? Number.parseInt(process.env.DATABASE_PORT, 10)
      : 5432,
    type: process.env.DATABASE_TYPE,
    url: process.env.DATABASE_URL,
    username: process.env.DATABASE_USERNAME,
  };
});
