import { ApiProperty } from '@nestjs/swagger';

import { DishDto } from '../../dishes/dto/dish.dto';

export class ScanUploadResponseDto {
  @ApiProperty({ example: 1 })
  scan_id: number;

  @ApiProperty({ example: 31 })
  restaurant_id: number;

  @ApiProperty({ example: 'Green Leaf Cafe' })
  restaurant_name: string;

  @ApiProperty({ example: 12 })
  dishes_created: number;

  @ApiProperty({ example: 'completed' })
  status: string;

  @ApiProperty({ type: [DishDto], description: 'List of dishes created from the scanned menu' })
  dishes: DishDto[];
}
