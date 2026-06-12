import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

import { AllConfigType } from '../../common/config/config.type';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      cli: {
        entitiesDir: 'src',

        subscribersDir: 'subscriber',
      },
      database: this.configService.get('database.name', { infer: true }),
      dropSchema: false,
      entities: [`${__dirname}/../../**/*.entity{.ts,.js}`],
      host: this.configService.get('database.host', { infer: true }),
      keepConnectionAlive: true,
      logging:
        this.configService.get('app.nodeEnv', { infer: true }) !== 'production',

      migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],
      password: this.configService.get('database.password', { infer: true }),
      port: this.configService.get('database.port', { infer: true }),
      type: this.configService.get('database.type', { infer: true }),
      url: this.configService.get('database.url', { infer: true }),
      username: this.configService.get('database.username', { infer: true }),
    } as TypeOrmModuleOptions;
  }
}
