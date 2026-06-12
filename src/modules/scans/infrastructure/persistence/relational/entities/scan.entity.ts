import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { EntityRelationalHelper } from '../../../../../../common/utils/relational-entity-helper';
import { DishEntity } from '../../../../../dishes/infrastructure/persistence/relational/entities/dish.entity';
import { RestaurantEntity } from '../../../../../restaurants/infrastructure/persistence/relational/entities/restaurant.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { ScanStatus } from '../../../../enums/scan.enum';

@Entity({ name: 'scans' })
export class ScanEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'restaurant_id', type: 'int', nullable: true })
  restaurantId?: number;

  @ManyToOne(() => RestaurantEntity, { nullable: true })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant?: RestaurantEntity;

  @Column({ name: 'image_url', type: 'jsonb' })
  imageUrl: string[];

  @Column({ name: 'ocr_raw_text', type: 'text', nullable: true })
  ocrRawText?: string;

  @Column({ name: 'parsed_json', type: 'jsonb', nullable: true })
  parsedJson?: Record<string, any>;

  @Column({ type: 'enum', enum: ScanStatus, default: ScanStatus.PENDING })
  status: ScanStatus;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => DishEntity, (dish) => dish.scan)
  dishes?: DishEntity[];
}
