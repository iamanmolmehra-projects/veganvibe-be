import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { DishDto } from '../../dishes/dto/dish.dto';
import { RestaurantDto } from '../../restaurants/dto/restaurant.dto';

export class ScanListItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiPropertyOptional({ example: 1 })
  restaurantId?: number;

  @ApiProperty({ example: ['uploads/1715028537_menu.jpg'], type: [String] })
  imageUrl: string[];

  @ApiPropertyOptional({ example: 'Extracted menu text...' })
  ocrRawText?: string;

  @ApiPropertyOptional({ example: { restaurant_name: 'Cafe', dishes: [] } })
  parsedJson?: Record<string, any>;

  @ApiProperty({ example: 'completed' })
  status: string;

  @ApiPropertyOptional({ example: null })
  rejectionReason?: string;

  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: RestaurantDto, description: 'Associated restaurant' })
  restaurant?: RestaurantDto;

  @ApiProperty({ type: [DishDto], description: 'Dishes created from this scan' })
  dishes: DishDto[];
}

export class ScanListResponseDto {
  @ApiProperty({ type: [ScanListItemDto] })
  data: ScanListItemDto[];

  @ApiProperty({ example: 30 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;
}
