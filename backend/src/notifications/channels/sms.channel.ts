import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TwilioSDK from 'twilio';
import { Twilio } from 'twilio';
import { NotificationChannel, NotificationPayload, NotificationResult } from './notification-channel.interface';

@Injectable()
export class SmsChannel implements NotificationChannel {
    name = 'sms';
    private twilioClient: Twilio;
    private fromNumber: string;

    constructor(private configService: ConfigService) {
        const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID') || '';
        const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN') || '';
        this.fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER') || '';

        this.twilioClient = new Twilio(accountSid, authToken);
    }

    async send(recipient: { phoneNumber: string }, payload: NotificationPayload): Promise<NotificationResult> {
        try {
            if (!recipient.phoneNumber) {
                throw new Error('Recipient phone number not provided');
            }

            const priorityEmoji = this.getPriorityEmoji(payload.priority);

            // SMS has 160 char limit, so keep it concise
            const smsBody = `${priorityEmoji} ${payload.priority.toUpperCase()}: ${payload.title.substring(0, 80)}\n\nAck: ${payload.acknowledgeUrl}`;

            const message = await this.twilioClient.messages.create({
                to: recipient.phoneNumber,
                from: this.fromNumber,
                body: smsBody,
            });

            console.log(`✅ SMS sent to ${recipient.phoneNumber} (${message.sid})`);

            return {
                success: true,
                channel: 'sms',
                messageId: message.sid,
                deliveredAt: new Date(),
            };
        } catch (error) {
            console.error('❌ SMS notification failed:', error.message);
            return {
                success: false,
                channel: 'sms',
                error: error.message,
            };
        }
    }

    private getPriorityEmoji(priority: string): string {
        const emojis = {
            p1_critical: '🚨',
            p2_high: '⚠️',
            p3_medium: 'ℹ️',
            p4_low: '📝',
        };
        return emojis[priority] || 'ℹ️';
    }
}