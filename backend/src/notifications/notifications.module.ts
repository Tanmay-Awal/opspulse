import { Module, Global } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SlackChannel } from './channels/slack.channel';
import { SmsChannel } from './channels/sms.channel';
import { EmailChannel } from './channels/email.channel';

@Global() // Make it available everywhere
@Module({
  providers: [
    NotificationsService,
    SlackChannel,
    SmsChannel,
    EmailChannel,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule { }