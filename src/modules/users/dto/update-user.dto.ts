import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEmail, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

import { lowerCaseTransformer } from '../../../common/utils/transformers/lower-case.transformer';
import { RoleDto } from '../../roles/dto/role.dto';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe', type: String })
  @IsOptional()
  @IsString()
  name?: string;

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

  @ApiPropertyOptional({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'newpassword123', type: String })
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ type: () => RoleDto })
  @IsOptional()
  @Type(() => RoleDto)
  role?: RoleDto | null;
}
