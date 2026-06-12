import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { EntityRelationalHelper } from '../../../../../../common/utils/relational-entity-helper';
import { RestaurantEntity } from '../../../../../restaurants/infrastructure/persistence/relational/entities/restaurant.entity';
import { ScanEntity } from '../../../../../scans/infrastructure/persistence/relational/entities/scan.entity';
import { DishStatus } from '../../../../enums/dish.enum';

@Entity({ name: 'dishes' })
export class DishEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'restaurant_id', type: 'int' })
  restaurantId: number;

  @ManyToOne(() => RestaurantEntity, (restaurant) => restaurant.dishes)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: RestaurantEntity;

  @Column({ name: 'scan_id', type: 'int', nullable: true })
  scanId?: number;

  @ManyToOne(() => ScanEntity, (scan) => scan.dishes, { nullable: true })
  @JoinColumn({ name: 'scan_id' })
  scan?: ScanEntity;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'food_type', type: 'varchar', nullable: true })
  foodType?: string;

  @Column({ name: 'image_url', type: 'jsonb', nullable: true })
  imageUrl?: string[];

  @Column({ type: 'jsonb', nullable: true })
  ingredients?: string[];

  @Column({ name: 'menu_category', type: 'varchar', nullable: true })
  menuCategory?: string;

  @Column({ name: 'cuisine_type', type: 'varchar' })
  cuisineType: string;

  @Column({ name: 'is_vegan', type: 'boolean', default: false })
  isVegan: boolean;

  @Column({ type: 'int', nullable: true, default: 0 })
  ratings?: number;

  @Column({ type: 'varchar', nullable: true })
  tags?: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'enum', enum: DishStatus, default: DishStatus.ACTIVE })
  status: DishStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
