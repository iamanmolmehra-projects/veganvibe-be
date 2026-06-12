import { Global, Module } from '@nestjs/common';

import { LoggerService } from './logger.service';
import { RequestContextService } from './request-context.service';

@Global()
@Module({
  exports: [LoggerService, RequestContextService],
  providers: [LoggerService, RequestContextService],
})
export class UtilitiesLoggerModule {}