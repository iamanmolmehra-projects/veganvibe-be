import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { HomeService } from './home.service';

@ApiTags('Home')
@Controller()
export class HomeController {
  constructor(private readonly service: HomeService) {}

  @Get()
  appInfo(): { serviceStatus: string; status: string; timestamp: Date; uptime: number } {
    return {
      serviceStatus: this.service.appInfo(),
      status: 'ok',
      timestamp: new Date(),
      uptime: process.uptime(),
    };
  }
}
