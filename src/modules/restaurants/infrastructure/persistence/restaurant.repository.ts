import { RestaurantEntity } from './relational/entities/restaurant.entity';
import { QueryRestaurantDto } from '../../dto/query-restaurant.dto';

export abstract class RestaurantRepository {
  abstract create(data: Partial<RestaurantEntity>): Promise<RestaurantEntity>;
  abstract findAll(query: QueryRestaurantDto): Promise<{ data: RestaurantEntity[]; total: number }>;
  abstract findById(id: number): Promise<RestaurantEntity | null>;
}
