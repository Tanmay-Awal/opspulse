import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { ReportsService } from './reports.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, ReportsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule { }