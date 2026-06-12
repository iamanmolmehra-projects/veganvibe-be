import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { QueryRestaurantDto } from './dto/query-restaurant.dto';
import { RestaurantEntity } from './infrastructure/persistence/relational/entities/restaurant.entity';
import { RestaurantRepository } from './infrastructure/persistence/restaurant.repository';

@Injectable()
export class RestaurantsService {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  /** Create a new restaurant — used by scan pipeline and public API */
  async create(dto: CreateRestaurantDto): Promise<RestaurantEntity> {
    return this.restaurantRepository.create(dto);
  }

  async findAll(query: QueryRestaurantDto): Promise<{
    data: RestaurantEntity[];
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
  }> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 10, 50);

    const { data, total } = await this.restaurantRepository.findAll(query);

    return {
      data,
      total,
      page,
      limit,
      hasNextPage: page * limit < total,
    };
  }

  async findById(id: number): Promise<RestaurantEntity> {
    const restaurant = await this.restaurantRepository.findById(id);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with id ${id} not found`);
    }
    return restaurant;
  }
}
