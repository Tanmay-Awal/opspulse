import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return 'OpsPulse Backend API - Running';
  }

  @Get('health')
  async getHealth() {
    return this.appService.getHealth();
  }
}