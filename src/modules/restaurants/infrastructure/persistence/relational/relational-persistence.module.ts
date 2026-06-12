import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RestaurantRepository } from '../restaurant.repository';

import { RestaurantEntity } from './entities/restaurant.entity';
import { RestaurantsRelationalRepository } from './repositories/restaurant.repository';

@Module({
  exports: [RestaurantRepository],
  imports: [TypeOrmModule.forFeature([RestaurantEntity])],
  providers: [
    {
      provide: RestaurantRepository,
      useClass: RestaurantsRelationalRepository,
    },
  ],
})
export class RelationalRestaurantPersistenceModule {}
