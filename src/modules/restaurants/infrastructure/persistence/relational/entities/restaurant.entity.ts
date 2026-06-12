import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { EntityRelationalHelper } from '../../../../../../common/utils/relational-entity-helper';
import { DishEntity } from '../../../../../dishes/infrastructure/persistence/relational/entities/dish.entity';

@Entity({ name: 'restaurants' })
export class RestaurantEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ name: 'google_place_id', type: 'varchar', nullable: true, unique: true })
  googlePlaceId?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', nullable: true })
  city?: string;

  @Column({ type: 'varchar', nullable: true })
  state?: string;

  @Column({ type: 'varchar', nullable: true, default: 'India' })
  country?: string;

  @Column({ name: 'zip_code', type: 'varchar', nullable: true })
  zipCode?: string;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitude?: number;

  @Column({ name: 'phone_number', type: 'varchar', nullable: true })
  phoneNumber?: string;

  @Column({ name: 'website_url', type: 'varchar', nullable: true })
  websiteUrl?: string;

  @Column({ name: 'cuisine_type', type: 'varchar', array: true, nullable: true })
  cuisineType?: string[];

  @Column({ name: 'price_range', type: 'smallint', nullable: true })
  priceRange?: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  rating?: number;

  @Column({ name: 'total_reviews', type: 'int', default: 0 })
  totalReviews: number;

  @Column({ name: 'opening_hours', type: 'jsonb', nullable: true })
  openingHours?: Record<string, string>;

  @Column({ type: 'jsonb', nullable: true })
  photos?: string[];

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  tags?: string[];

  @Column({ type: 'varchar', nullable: true })
  source?: string;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => DishEntity, (dish) => dish.restaurant)
  dishes?: DishEntity[];
}
