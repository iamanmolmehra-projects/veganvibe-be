import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { DishEntity } from '../dishes/infrastructure/persistence/relational/entities/dish.entity';
import { ExternalApiModule } from '../external-api/external-api.module';
import { RestaurantEntity } from '../restaurants/infrastructure/persistence/relational/entities/restaurant.entity';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';

import { ScanEntity } from './infrastructure/persistence/relational/entities/scan.entity';
import { ScansController } from './scans.controller';
import { ScansService } from './scans.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScanEntity, RestaurantEntity, DishEntity, UserEntity]),
    ExternalApiModule,
    AuthModule,
  ],
  controllers: [ScansController],
  providers: [ScansService],
  exports: [ScansService],
})
export class ScansModule {}
