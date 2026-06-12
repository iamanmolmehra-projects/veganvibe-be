import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'Rahul Sharma' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '15/08/1995', description: 'Date of birth in dd/mm/yyyy format' })
  @IsNotEmpty()
  @IsString()
  dob: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ example: 'rahul@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '9876543210' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'MySecret@123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
