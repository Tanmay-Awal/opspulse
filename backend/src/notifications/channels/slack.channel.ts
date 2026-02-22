import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel, NotificationPayload, NotificationResult } from './notification-channel.interface';

@Injectable()
export class SlackChannel implements NotificationChannel {
    name = 'slack';
    private webhookUrl: string;

    constructor(private configService: ConfigService) {
        this.webhookUrl = this.configService.get<string>('SLACK_WEBHOOK_URL') || '';
    }

    async send(recipient: any, payload: NotificationPayload): Promise<NotificationResult> {
        try {
            const priorityEmoji = this.getPriorityEmoji(payload.priority);
            const priorityColor = this.getPriorityColor(payload.priority);

            const slackMessage = {
                blocks: [
                    {
                        type: 'header',
                        text: {
                            type: 'plain_text',
                            text: `${priorityEmoji} ${payload.priority.toUpperCase()} Incident`,
                            emoji: true,
                        },
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*${payload.title}*\n${payload.message}`,
                        },
                    },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `*Status:*\n${payload.status}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Priority:*\n${payload.priority}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Incident ID:*\n${payload.incidentId.substring(0, 8)}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Assigned To:*\n${payload.assignedTo || 'Unassigned'}`,
                            },
                        ],
                    },
                    {
                        type: 'actions',
                        elements: [
                            {
                                type: 'button',
                                text: {
                                    type: 'plain_text',
                                    text: '✅ Acknowledge',
                                    emoji: true,
                                },
                                style: 'primary',
                                url: payload.acknowledgeUrl,
                            },
                            {
                                type: 'button',
                                text: {
                                    type: 'plain_text',
                                    text: '👁️ View Details',
                                    emoji: true,
                                },
                                url: payload.viewUrl,
                            },
                        ],
                    },
                ],
                attachments: [
                    {
                        color: priorityColor,
                        fallback: `${payload.priority} incident: ${payload.title}`,
                    },
                ],
            };

            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(slackMessage),
            });

            if (!response.ok) {
                throw new Error(`Slack API error: ${response.statusText}`);
            }

            console.log('✅ Slack notification sent');

            return {
                success: true,
                channel: 'slack',
                deliveredAt: new Date(),
            };
        } catch (error) {
            console.error('❌ Slack notification failed:', error.message);
            return {
                success: false,
                channel: 'slack',
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

    private getPriorityColor(priority: string): string {
        const colors = {
            p1_critical: '#E63946', // Red
            p2_high: '#F77F00',     // Orange
            p3_medium: '#FCBF49',   // Yellow
            p4_low: '#06AED5',      // Blue
        };
        return colors[priority] || '#06AED5';
    }
}