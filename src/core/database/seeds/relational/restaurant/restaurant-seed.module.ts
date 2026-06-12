import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RestaurantEntity } from '../../../../../modules/restaurants/infrastructure/persistence/relational/entities/restaurant.entity';

import { RestaurantSeedService } from './restaurant-seed.service';

@Module({
  exports: [RestaurantSeedService],
  imports: [TypeOrmModule.forFeature([RestaurantEntity])],
  providers: [RestaurantSeedService],
})
export class RestaurantSeedModule {}
