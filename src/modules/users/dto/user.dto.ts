import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

import { Role } from '../../roles/dto/role.dto';

export class User {
  @ApiProperty({ example: 1 })
  id: number | string;

  @ApiProperty({ example: 'John Doe', type: String })
  name: string;

  @ApiPropertyOptional({ example: '+919876543210', type: String })
  phone?: string;

  @ApiPropertyOptional({ example: 946684800, type: Number })
  dob?: number;

  @ApiPropertyOptional({ example: 'Mumbai, India', type: String })
  location?: string;

  @ApiProperty({ example: 'test@example.com', type: String })
  email: string;

  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiPropertyOptional({ type: () => Role })
  role?: Role | null;

  @ApiProperty({ example: 1715028537 })
  @Expose({ name: 'created_at' })
  createdAt: number;

  @ApiProperty({ example: 1715028537 })
  @Expose({ name: 'updated_at' })
  updatedAt: number;
}
