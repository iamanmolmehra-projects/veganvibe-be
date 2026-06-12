import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { lowerCaseTransformer } from '../../../common/utils/transformers/lower-case.transformer';
import { RoleDto } from '../../roles/dto/role.dto';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', type: String })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '+919876543210', type: String })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 946684800, description: 'Date of birth as Unix epoch (seconds)', type: Number })
  @IsOptional()
  @IsNumber()
  dob?: number;

  @ApiPropertyOptional({ example: 'Mumbai', type: String })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secret123', type: String })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ type: RoleDto })
  @IsOptional()
  @Type(() => RoleDto)
  role?: RoleDto | null;
}
