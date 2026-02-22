import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SlackChannel } from './channels/slack.channel';
import { SmsChannel } from './channels/sms.channel';
import { EmailChannel } from './channels/email.channel';
import { NotificationResult } from './channels/notification-channel.interface';
export declare class NotificationsService {
    private prisma;
    private configService;
    private slackChannel;
    private smsChannel;
    private emailChannel;
    private twilioEnabled;
    constructor(prisma: PrismaService, configService: ConfigService, slackChannel: SlackChannel, smsChannel: SmsChannel, emailChannel: EmailChannel);
    notifyIncidentCreated(incident: any): Promise<NotificationResult[]>;
    private getChannelsForPriority;
    private getUser;
    private getUserName;
    private logNotifications;
    notifyIncidentAcknowledged(incident: any, acknowledgedBy: string): Promise<void>;
    notifyIncidentResolved(incident: any, resolvedBy: string): Promise<void>;
}
