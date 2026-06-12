import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateScan1715028537219 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "scan_status_enum" AS ENUM ('pending', 'processing', 'completed', 'failed', 'rejected')`,
    );

    await queryRunner.createTable(
      new Table({
        name: 'scans',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'restaurant_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'image_url',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'ocr_raw_text',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'parsed_json',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'scan_status_enum',
            default: "'pending'",
            isNullable: false,
          },
          {
            name: 'rejection_reason',
            type: 'text',
            isNullable: true,
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
      'scans',
      new TableIndex({
        name: 'IDX_SCANS_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'scans',
      new TableForeignKey({
        name: 'FK_SCANS_USER_ID',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      }),
    );

    await queryRunner.createForeignKey(
      'scans',
      new TableForeignKey({
        name: 'FK_SCANS_RESTAURANT_ID',
        columnNames: ['restaurant_id'],
        referencedTableName: 'restaurants',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'NO ACTION',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('scans');
    await queryRunner.query(`DROP TYPE "scan_status_enum"`);
  }
}
