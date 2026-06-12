import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateScanDto {
  @ApiPropertyOptional({ example: 13.06015, description: 'Latitude of the restaurant location' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 80.24286, description: 'Longitude of the restaurant location' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    example: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
    description: 'Photo URLs of the restaurant',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  photos?: string[];

  @ApiPropertyOptional({ example: 'Green Leaf Cafe', description: 'Name of the restaurant' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '123 Vegan Street, Chennai', description: 'Address of the restaurant' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 4.5, description: 'Rating of the restaurant' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional({ example: 120, description: 'Total number of reviews for the restaurant' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalReviews?: number;

  @ApiPropertyOptional({ example: 'A cozy vegan cafe with fresh ingredients', description: 'Description of the restaurant' })
  @IsOptional()
  @IsString()
  description?: string;
}
