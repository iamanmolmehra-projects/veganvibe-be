import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AllConfigType } from '../../common/config/config.type';
import { LoggerService } from '../../common/utils/logger.service';

@Injectable()
export class HomeService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('HomeService');
  }

  appInfo(): string {
    const appName = this.configService.get('app.name', { infer: true });
    this.logger.debug('App info requested', { appName });
    return appName ?? 'Unknown App';
  }
}
