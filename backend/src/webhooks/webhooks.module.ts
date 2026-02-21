import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { DeduplicationService } from './services/deduplication.service';
import { SeverityClassifierService } from './services/severity-classifier.service';
import { OnCallService } from './services/oncall.service';

@Module({
  controllers: [WebhooksController],
  providers: [
    WebhooksService,
    DeduplicationService,
    SeverityClassifierService,
    OnCallService,
  ],
  exports: [WebhooksService],
})
export class WebhooksModule { }