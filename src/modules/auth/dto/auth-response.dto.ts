import { ApiProperty } from '@nestjs/swagger';

export class SignupResponseDto {
  @ApiProperty({ example: 'User registered successfully' })
  message: string;

  @ApiProperty({ example: 1 })
  userId: number;
}

export class LoginUserResponseDto {
  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 'Rahul Sharma' })
  name: string;

  @ApiProperty({ example: 'rahul@example.com' })
  email: string;

  @ApiProperty({ example: 2 })
  roleId: number;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'Login successful' })
  message: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  token: string;

  @ApiProperty({ type: LoginUserResponseDto })
  user: LoginUserResponseDto;
}
