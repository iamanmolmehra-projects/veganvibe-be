import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ScanEntity } from '../../../../../modules/scans/infrastructure/persistence/relational/entities/scan.entity';
import { ScanStatus } from '../../../../../modules/scans/enums/scan.enum';

@Injectable()
export class ScanSeedService {
  constructor(
    @InjectRepository(ScanEntity)
    private readonly repository: Repository<ScanEntity>,
  ) {}

  async run(): Promise<void> {
    const count = await this.repository.count();
    if (count > 0) return;

    const scans: Partial<ScanEntity>[] = [];
    for (let i = 1; i <= 30; i++) {
      scans.push({
        userId: i <= 2 ? i : (i % 2) + 1, // alternate between user 1 and 2
        restaurantId: i,
        imageUrl: [`uploads/menu_scan_${i}.jpg`],
        ocrRawText: `Sample OCR text for restaurant ${i} menu`,
        parsedJson: {
          restaurant_name: `Restaurant ${i}`,
          dishes: [{ name: `Dish from scan ${i}`, price: 200 + i * 10, food_type: 'vegan' }],
        },
        status: ScanStatus.COMPLETED,
      });
    }

    await this.repository.save(this.repository.create(scans));
  }
}
