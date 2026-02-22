import { ConfigService } from '@nestjs/config';
import { NotificationChannel, NotificationPayload, NotificationResult } from './notification-channel.interface';
export declare class SlackChannel implements NotificationChannel {
    private configService;
    name: string;
    private webhookUrl;
    constructor(configService: ConfigService);
    send(recipient: any, payload: NotificationPayload): Promise<NotificationResult>;
    private getPriorityEmoji;
    private getPriorityColor;
}
