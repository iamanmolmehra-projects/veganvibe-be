import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { DishStatus, FoodType } from '../enums/dish.enum';

export class DishDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  restaurantId: number;

  @ApiProperty({ example: 'Avocado Toast' })
  name: string;

  @ApiPropertyOptional({ example: 'Creamy avocado on sourdough with microgreens and cherry tomatoes' })
  description?: string;

  @ApiPropertyOptional({ example: 'VEGAN', enum: FoodType })
  foodType?: string;

  @ApiPropertyOptional({ example: 'https://foodsharingvegan.com/wp-content/uploads/2023/01/Rhodes-Avocado-Toast-Plant-Based-on-a-Budget-1-2.jpg' })
  imageUrl?: string;

  @ApiPropertyOptional({ example: ['avocado', 'sourdough', 'cherry tomatoes', 'microgreens', 'lemon'] })
  ingredients?: string[];

  @ApiPropertyOptional({ example: 'Starter' })
  menuCategory?: string;

  @ApiProperty({ example: 'Continental' })
  cuisineType: string;

  @ApiProperty({ example: true })
  isVegan: boolean;

  @ApiPropertyOptional({ example: 5 })
  ratings?: number;

  @ApiPropertyOptional({ example: 'popular' })
  tags?: string;

  @ApiProperty({ example: 350 })
  price: number;

  @ApiProperty({ example: 'active', enum: DishStatus })
  status: DishStatus;

  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  updatedAt: Date;
}
