import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { EntityRelationalHelper } from '../../../../../../common/utils/relational-entity-helper';
import { RoleEntity } from '../../../../../roles/infrastructure/persistence/relational/entities/role.entity';

@Entity({
  name: 'users',
})
export class UserEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @Column({ type: 'bigint', nullable: true })
  dob?: number;

  @Column({ type: 'varchar', nullable: true })
  location?: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @ManyToOne(() => RoleEntity, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role?: RoleEntity | null;

  @Column({ name: 'created_at', type: 'bigint', default: () => 'EXTRACT(EPOCH FROM NOW())::bigint' })
  createdAt: number;

  @Column({ name: 'updated_at', type: 'bigint', default: () => 'EXTRACT(EPOCH FROM NOW())::bigint' })
  updatedAt: number;
}
