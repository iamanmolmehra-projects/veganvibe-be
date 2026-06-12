import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DishEntity } from '../../../../../modules/dishes/infrastructure/persistence/relational/entities/dish.entity';

import { DishSeedService } from './dish-seed.service';

@Module({
  exports: [DishSeedService],
  imports: [TypeOrmModule.forFeature([DishEntity])],
  providers: [DishSeedService],
})
export class DishSeedModule {}
