import { RoleEntity } from '../../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { User } from '../../../../dto/user.dto';
import { UserEntity } from '../entities/user.entity';

export const UserMapper = {
  toDomain(raw: UserEntity): User {
    const domainEntity = new User();
    domainEntity.id = raw.id;
    domainEntity.name = raw.name;
    domainEntity.phone = raw.phone;
    domainEntity.dob = raw.dob ? Number(raw.dob) : undefined;
    domainEntity.location = raw.location;
    domainEntity.email = raw.email;
    domainEntity.password = raw.password;
    domainEntity.role = raw.role;
    domainEntity.createdAt = Number(raw.createdAt);
    domainEntity.updatedAt = Number(raw.updatedAt);
    return domainEntity;
  },

  toPersistence(domainEntity: User): UserEntity {
    let role: RoleEntity | undefined = undefined;

    if (domainEntity.role) {
      role = new RoleEntity();
      role.id = Number(domainEntity.role.id);
    }

    const persistenceEntity = new UserEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.name = domainEntity.name;
    persistenceEntity.phone = domainEntity.phone;
    persistenceEntity.dob = domainEntity.dob;
    persistenceEntity.location = domainEntity.location;
    persistenceEntity.email = domainEntity.email;
    persistenceEntity.password = domainEntity.password;
    persistenceEntity.role = role;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    return persistenceEntity;
  },
};
