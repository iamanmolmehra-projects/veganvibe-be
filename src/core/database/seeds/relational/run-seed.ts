import { NestFactory } from '@nestjs/core';

import { DishSeedService } from './dish/dish-seed.service';
import { RestaurantSeedService } from './restaurant/restaurant-seed.service';
import { RoleSeedService } from './role/role-seed.service';
import { ScanSeedService } from './scan/scan-seed.service';
import { SeedModule } from './seed.module';
import { UserSeedService } from './user/user-seed.service';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  await app.get(RoleSeedService).run();
  await app.get(UserSeedService).run();
  await app.get(RestaurantSeedService).run();
  await app.get(ScanSeedService).run();
  await app.get(DishSeedService).run();

  await app.close();
};

void runSeed();
