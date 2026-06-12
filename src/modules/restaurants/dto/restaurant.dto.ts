import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { DishDto } from '../../dishes/dto/dish.dto';

export class RestaurantDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Green Leaf Cafe' })
  name: string;

  @ApiPropertyOptional({ example: 'ChIJ2eUgeAK6j4ARbn5u_wAGqWA' })
  googlePlaceId?: string;

  @ApiPropertyOptional({ example: '45, Khader Nawaz Khan Rd, Nungambakkam' })
  address?: string;

  @ApiPropertyOptional({ example: 'Chennai' })
  city?: string;

  @ApiPropertyOptional({ example: 'Tamil Nadu' })
  state?: string;

  @ApiPropertyOptional({ example: 'India' })
  country?: string;

  @ApiPropertyOptional({ example: '600006' })
  zipCode?: string;

  @ApiPropertyOptional({ example: 13.06015 })
  latitude?: number;

  @ApiPropertyOptional({ example: 80.24286 })
  longitude?: number;

  @ApiPropertyOptional({ example: '+914428331234' })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'https://greenleafcafe.in' })
  websiteUrl?: string;

  @ApiPropertyOptional({ example: ['Indian', 'Vegan'], type: [String] })
  cuisineType?: string[];

  @ApiPropertyOptional({ example: 2, description: '1=₹, 2=₹₹, 3=₹₹₹' })
  priceRange?: number;

  @ApiPropertyOptional({ example: 4.5 })
  rating?: number;

  @ApiPropertyOptional({ example: 128 })
  totalReviews?: number;

  @ApiPropertyOptional({ example: { mon: '9am-10pm', tue: '9am-10pm' } })
  openingHours?: Record<string, string>;

  @ApiPropertyOptional({ example: ['https://example.com/photo1.jpg'] })
  photos?: string[];

  @ApiPropertyOptional({ example: 'A cozy vegan restaurant in the heart of the city' })
  description?: string;

  @ApiPropertyOptional({ example: ['rooftop', 'parking', 'delivery'] })
  tags?: string[];

  @ApiPropertyOptional({ example: 'google' })
  source?: string;

  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  updatedAt: Date;
}

export class RestaurantDetailDto extends RestaurantDto {
  @ApiProperty({ type: [DishDto], description: 'List of dishes for this restaurant' })
  dishes: DishDto[];
}
