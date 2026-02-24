import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { DeduplicationService } from './services/deduplication.service';
import { SeverityClassifierService } from './services/severity-classifier.service';
import { OnCallService } from './services/oncall.service';
import { EscalationService } from './services/escalation.service';
import { SlaTrackerService } from './services/sla-tracker.service';

@Module({
  controllers: [WebhooksController],
  providers: [
    WebhooksService,
    DeduplicationService,
    SeverityClassifierService,
    OnCallService,
    EscalationService,     // ADD THIS
    SlaTrackerService,
  ],
  exports: [WebhooksService],
})
export class WebhooksModule { }