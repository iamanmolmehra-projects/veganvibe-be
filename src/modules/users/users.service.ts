import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';

import {
    DatabaseException,
    DuplicateResourceException,
    ResourceNotFoundException,
} from '../../common/utils/exceptions';
import { LoggerService } from '../../common/utils/logger.service';
import { RequestContextService } from '../../common/utils/request-context.service';
import { NullableType } from '../../common/utils/types/nullable.type';
import { IPaginationOptions } from '../../common/utils/types/pagination-options';
import { Role } from '../roles/dto/role.dto';
import { RoleEnum } from '../roles/roles.enum';

import { CreateUserDto } from './dto/create-user.dto';
import { FilterUserDto, SortUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './dto/user.dto';
import { UserRepository } from './infrastructure/persistence/user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly logger: LoggerService,
    private readonly requestContext: RequestContextService,
  ) {
    this.logger.setContext('UsersService');
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.info('Creating new user', {
      email: createUserDto.email,
      role: createUserDto.role?.id,
    });

    // Check for duplicate email
    const existingUser = await this.usersRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      this.logger.warn('User creation failed - email already exists', {
        email: createUserDto.email,
      });
      throw new DuplicateResourceException(
        'User',
        'email',
        createUserDto.email,
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(createUserDto.password, salt);

    // Validate role
    let role: Role | undefined = undefined;

    if (createUserDto.role?.id != null) {
      const roleExists = Object.values(RoleEnum)
        .map(String)
        .includes(String(createUserDto.role.id));
      if (!roleExists) {
        throw new ResourceNotFoundException('Role', createUserDto.role.id);
      }
      role = { id: createUserDto.role.id };
    }

    const dbStartTime = Date.now();
    let user: User;
    try {
      user = await this.usersRepository.create({
        name: createUserDto.name,
        phone: createUserDto.phone,
        dob: createUserDto.dob,
        location: createUserDto.location,
        email: createUserDto.email,
        password,
        role,
      });
    } catch (error) {
      this.logger.error('Database error during user creation', {
        email: createUserDto.email,
        error: error instanceof Error ? error.message : error,
      });
      throw new DatabaseException(
        'create user',
        error instanceof Error ? error : undefined,
      );
    }

    // Add user creation data to HTTP log context
    this.requestContext.addLogData({
      operation: 'create_user',
      userCreated: true,
      userId: user.id,
      userRole: user.role?.id,
    });

    // Add database timing
    this.requestContext.addTiming('database_create', Date.now() - dbStartTime);

    this.logger.info('User created successfully', {
      email: user.email,
      role: user.role?.id,
      userId: user.id,
    });

    return user;
  }

  findManyWithPagination({
    filterOptions,
    paginationOptions,
    sortOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]> {
    return this.usersRepository.findManyWithPagination({
      filterOptions,
      paginationOptions,
      sortOptions,
    });
  }

  async findById(id: User['id']): Promise<NullableType<User>> {
    try {
      return await this.usersRepository.findById(id);
    } catch (error) {
      this.logger.error('Database error during user lookup', {
        error: error instanceof Error ? error.message : error,
        userId: id,
      });
      throw new DatabaseException(
        'find user by id',
        error instanceof Error ? error : undefined,
      );
    }
  }

  async findByIdOrFail(id: User['id']): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new ResourceNotFoundException('User', id);
    }
    return user;
  }

  findByIds(ids: User['id'][]): Promise<User[]> {
    return this.usersRepository.findByIds(ids);
  }

  findByEmail(email: User['email']): Promise<NullableType<User>> {
    return this.usersRepository.findByEmail(email);
  }

  async update(
    id: User['id'],
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    let password: string | undefined = undefined;

    if (updateUserDto.password != null && updateUserDto.password !== '') {
      const userObject = await this.usersRepository.findById(id);

      if (userObject && userObject.password !== updateUserDto.password) {
        const salt = await bcrypt.genSalt();
        password = await bcrypt.hash(updateUserDto.password, salt);
      }
    }

    let email: string | undefined = undefined;

    if (updateUserDto.email != null && updateUserDto.email !== '') {
      const userObject = await this.usersRepository.findByEmail(
        updateUserDto.email,
      );

      if (userObject && userObject.id !== id) {
        throw new DuplicateResourceException(
          'User',
          'email',
          updateUserDto.email,
        );
      }

      email = updateUserDto.email;
    }

    let role: Role | undefined = undefined;

    if (updateUserDto.role?.id != null) {
      const roleExists = Object.values(RoleEnum)
        .map(String)
        .includes(String(updateUserDto.role.id));
      if (!roleExists) {
        throw new ResourceNotFoundException('Role', updateUserDto.role.id);
      }
      role = { id: updateUserDto.role.id };
    }

    return this.usersRepository.update(id, {
      name: updateUserDto.name,
      phone: updateUserDto.phone,
      dob: updateUserDto.dob,
      location: updateUserDto.location,
      email,
      password,
      role,
    });
  }

  async remove(id: User['id']): Promise<void> {
    await this.usersRepository.remove(id);
  }
}
