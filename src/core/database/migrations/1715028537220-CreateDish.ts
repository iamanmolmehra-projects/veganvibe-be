import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateDish1715028537220 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "dish_status_enum" AS ENUM ('active', 'inactive', 'out_of_stock')`,
    );

    await queryRunner.createTable(
      new Table({
        name: 'dishes',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'restaurant_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'scan_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'food_type',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'image_url',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'ingredients',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'menu_category',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'cuisine_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'is_vegan',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'ratings',
            type: 'int',
            isNullable: true,
            default: 0,
          },
          {
            name: 'tags',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'dish_status_enum',
            default: "'active'",
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'NOW()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'dishes',
      new TableIndex({
        name: 'IDX_DISHES_RESTAURANT_ID',
        columnNames: ['restaurant_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'dishes',
      new TableForeignKey({
        name: 'FK_DISHES_RESTAURANT_ID',
        columnNames: ['restaurant_id'],
        referencedTableName: 'restaurants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      }),
    );

    await queryRunner.createForeignKey(
      'dishes',
      new TableForeignKey({
        name: 'FK_DISHES_SCAN_ID',
        columnNames: ['scan_id'],
        referencedTableName: 'scans',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'NO ACTION',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('dishes');
    await queryRunner.query(`DROP TYPE "dish_status_enum"`);
  }
}
