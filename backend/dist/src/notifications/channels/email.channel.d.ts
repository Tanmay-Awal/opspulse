import { ConfigService } from '@nestjs/config';
import { NotificationChannel, NotificationPayload, NotificationResult } from './notification-channel.interface';
export declare class EmailChannel implements NotificationChannel {
    private configService;
    name: string;
    private fromEmail;
    private fromName;
    private mailService;
    constructor(configService: ConfigService);
    send(recipient: {
        email: string;
        name: string;
    }, payload: NotificationPayload): Promise<NotificationResult>;
    private buildEmailHtml;
    private getPriorityColor;
}
