import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

import { RoleEnum } from '../../../../../modules/roles/roles.enum';
import { UserEntity } from '../../../../../modules/users/infrastructure/persistence/relational/entities/user.entity';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async run(): Promise<void> {
    const countAdmin = await this.repository.count({
      where: {
        role: {
          id: RoleEnum.admin,
        },
      },
    });

    if (countAdmin === 0) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      await this.repository.save(
        this.repository.create({
          name: 'Super Admin',
          phone: '+919000000001',
          dob: 631152000,
          location: 'Mumbai',
          email: 'admin@kiwiinsurance.com',
          password,
          role: {
            id: RoleEnum.admin,
            name: 'Admin',
          },
        }),
      );
    }

    const countUser = await this.repository.count({
      where: {
        role: {
          id: RoleEnum.user,
        },
      },
    });

    if (countUser === 0) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      await this.repository.save(
        this.repository.create({
          name: 'Anmol Mehra',
          phone: '+919876543210',
          dob: 946684800,
          location: 'Delhi',
          email: 'anmol.mehra@kiwiinsurance.com',
          password,
          role: {
            id: RoleEnum.user,
            name: 'User',
          },
        }),
      );
    }
  }
}
