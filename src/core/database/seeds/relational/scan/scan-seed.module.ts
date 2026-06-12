import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScanEntity } from '../../../../../modules/scans/infrastructure/persistence/relational/entities/scan.entity';

import { ScanSeedService } from './scan-seed.service';

@Module({
  exports: [ScanSeedService],
  imports: [TypeOrmModule.forFeature([ScanEntity])],
  providers: [ScanSeedService],
})
export class ScanSeedModule {}
