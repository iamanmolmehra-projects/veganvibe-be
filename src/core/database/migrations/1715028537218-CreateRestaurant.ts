import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateRestaurant1715028537218 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'restaurants',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'google_place_id',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'address',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'state',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'country',
            type: 'varchar',
            isNullable: true,
            default: "'India'",
          },
          {
            name: 'zip_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 9,
            scale: 6,
            isNullable: true,
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 9,
            scale: 6,
            isNullable: true,
          },
          {
            name: 'phone_number',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'website_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'cuisine_type',
            type: 'varchar[]',
            isNullable: true,
          },
          {
            name: 'price_range',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'rating',
            type: 'decimal',
            precision: 2,
            scale: 1,
            isNullable: true,
          },
          {
            name: 'total_reviews',
            type: 'int',
            default: 0,
          },
          {
            name: 'opening_hours',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'photos',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'tags',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'source',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'is_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'restaurants',
      new TableIndex({
        name: 'IDX_RESTAURANTS_CITY',
        columnNames: ['city'],
      }),
    );

    await queryRunner.createIndex(
      'restaurants',
      new TableIndex({
        name: 'IDX_RESTAURANTS_CUISINE',
        columnNames: ['cuisine_type'],
      }),
    );

    await queryRunner.createIndex(
      'restaurants',
      new TableIndex({
        name: 'IDX_RESTAURANTS_LATLONG',
        columnNames: ['latitude', 'longitude'],
      }),
    );

    await queryRunner.createIndex(
      'restaurants',
      new TableIndex({
        name: 'IDX_RESTAURANTS_RATING',
        columnNames: ['rating'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('restaurants');
  }
}
