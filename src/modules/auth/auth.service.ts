import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';

import { RoleEnum } from '../roles/roles.enum';
import { UserRepository } from '../users/infrastructure/persistence/user.repository';

import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    // Check if email already exists
    const existingUser = await this.usersRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Convert dob from dd/mm/yyyy to epoch (milliseconds)
    const [day, month, year] = dto.dob.split('/').map(Number);
    const dob = new Date(year, month - 1, day).getTime(); // month - 1 because js index starts from 0 only for months

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // Create user with role_id = 2 (user)
    const user = await this.usersRepository.create({
      name: dto.name,
      phone: dto.phone,
      dob,
      location: dto.location,
      email: dto.email,
      password: hashedPassword,
      role: { id: RoleEnum.user },
    });

    return {
      message: 'User registered successfully',
      userId: user.id,
    };
  }

  async login(dto: LoginDto) {
    // Find user by email
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare password
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const payload = {
      userId: user.id,
      roleId: user.role?.id,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      token,
      user: {
        userId: user.id,
        name: user.name,
        email: user.email,
        roleId: user.role?.id,
      },
    };
  }
}
