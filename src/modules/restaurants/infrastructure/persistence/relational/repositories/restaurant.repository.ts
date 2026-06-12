import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QueryRestaurantDto } from '../../../../dto/query-restaurant.dto';
import { RestaurantRepository } from '../../restaurant.repository';
import { RestaurantEntity } from '../entities/restaurant.entity';

@Injectable()
export class RestaurantsRelationalRepository implements RestaurantRepository {
  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepo: Repository<RestaurantEntity>,
  ) {}

  async create(data: Partial<RestaurantEntity>): Promise<RestaurantEntity> {
    const entity = this.restaurantRepo.create(data);
    return this.restaurantRepo.save(entity);
  }

  async findAll(query: QueryRestaurantDto): Promise<{ data: RestaurantEntity[]; total: number }> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 10, 50);

    const qb = this.restaurantRepo
      .createQueryBuilder('restaurant')
      .where('restaurant.is_active = :isActive', { isActive: true });

    if (query.search) {
      qb.andWhere('restaurant.name ILIKE :search', { search: `%${query.search}%` });
    }

    if (query.city) {
      qb.andWhere('restaurant.city ILIKE :city', { city: `%${query.city}%` });
    }

    if (query.cuisineType) {
      qb.andWhere(':cuisine = ANY(restaurant.cuisine_type)', { cuisine: query.cuisineType });
    }

    if (query.isVerified !== undefined) {
      qb.andWhere('restaurant.is_verified = :isVerified', { isVerified: query.isVerified });
    }

    if (query.minRating !== undefined) {
      qb.andWhere('restaurant.rating >= :minRating', { minRating: query.minRating });
    }

    if (query.priceRange !== undefined) {
      qb.andWhere('restaurant.price_range <= :priceRange', { priceRange: query.priceRange });
    }

    qb.orderBy('restaurant.rating', 'DESC', 'NULLS LAST');

    const total = await qb.getCount();

    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findById(id: number): Promise<RestaurantEntity | null> {
    return this.restaurantRepo.findOne({
      where: { id },
      relations: ['dishes'],
    });
  }
}
