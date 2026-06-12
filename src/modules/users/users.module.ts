import { Module } from '@nestjs/common';
import { RelationalUserPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';


@Module({
  controllers: [UsersController],
  exports: [UsersService, RelationalUserPersistenceModule],
  imports: [RelationalUserPersistenceModule],
  providers: [UsersService],
})
export class UsersModule {}
