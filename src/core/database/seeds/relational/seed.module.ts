import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

import appConfig from '../../../../common/config/app.config';
import databaseConfig from '../../config/database.config';
import { TypeOrmConfigService } from '../../typeorm-config.service';

import { DishSeedModule } from './dish/dish-seed.module';
import { RestaurantSeedModule } from './restaurant/restaurant-seed.module';
import { RoleSeedModule } from './role/role-seed.module';
import { ScanSeedModule } from './scan/scan-seed.module';
import { UserSeedModule } from './user/user-seed.module';

@Module({
  imports: [
    RoleSeedModule,
    UserSeedModule,
    RestaurantSeedModule,
    ScanSeedModule,
    DishSeedModule,
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      load: [databaseConfig, appConfig],
    }),
    TypeOrmModule.forRootAsync({
      dataSourceFactory: async (options: DataSourceOptions) =>
        new DataSource(options).initialize(),
      useClass: TypeOrmConfigService,
    }),
  ],
})
export class SeedModule {}
