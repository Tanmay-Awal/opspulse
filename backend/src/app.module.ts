import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { IncidentsModule } from './incidents/incidents.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { NotificationsModule } from './notifications/notifications.module';  // ADD THIS
import { AuditModule } from './audit/audit.module';
import { EscalationService } from './webhooks/services/escalation.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalyticsModule } from './analytics/analytics.module';
import { RemediationModule } from './remediation/remediation.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    IncidentsModule,
    WebhooksModule,
    NotificationsModule,
    AuditModule,
    AnalyticsModule,
    RemediationModule,
  ],
  controllers: [AppController],
  providers: [AppService, EscalationService],
})
export class AppModule { }