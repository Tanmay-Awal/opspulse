import { ConfigService } from '@nestjs/config';
import { NotificationChannel, NotificationPayload, NotificationResult } from './notification-channel.interface';
export declare class SmsChannel implements NotificationChannel {
    private configService;
    name: string;
    private twilioClient;
    private fromNumber;
    constructor(configService: ConfigService);
    send(recipient: {
        phoneNumber: string;
    }, payload: NotificationPayload): Promise<NotificationResult>;
    private getPriorityEmoji;
}
