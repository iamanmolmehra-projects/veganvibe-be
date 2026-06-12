import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryRestaurantDto {
  @ApiPropertyOptional({ example: 'Green Leaf', description: 'Search by restaurant name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'Chennai', description: 'Filter by city' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Indian', description: 'Filter by cuisine type' })
  @IsOptional()
  @IsString()
  cuisineType?: string;

  @ApiPropertyOptional({ example: true, description: 'Filter by verification status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ example: 4.0, description: 'Minimum rating filter' })
  @IsOptional()
  @Transform(({ value }) => value != null ? parseFloat(value) : undefined)
  @IsNumber()
  minRating?: number;

  @ApiPropertyOptional({ example: 1000, description: 'Filter by price range (1=₹, 2=₹₹, 3=₹₹₹)' })
  @IsOptional()
  @Transform(({ value }) => value != null ? parseInt(value) : undefined)
  @IsNumber()
  priceRange?: number;

  @ApiPropertyOptional({ example: 1, description: 'Page number', default: 1 })
  @IsOptional()
  @Transform(({ value }) => value != null ? parseInt(value) : 1)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Items per page', default: 10 })
  @IsOptional()
  @Transform(({ value }) => value != null ? parseInt(value) : 10)
  @IsNumber()
  limit?: number;
}
