import { Module } from '@nestjs/common';

import { RelationalRestaurantPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';

@Module({
  imports: [RelationalRestaurantPersistenceModule],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}
