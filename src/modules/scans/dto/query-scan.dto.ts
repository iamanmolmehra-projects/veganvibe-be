import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class QueryScanDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number', default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value != null ? parseInt(value) : 1))
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Items per page', default: 10 })
  @IsOptional()
  @Transform(({ value }) => (value != null ? parseInt(value) : 10))
  @IsNumber()
  limit?: number;
}
