import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SlackChannel } from './channels/slack.channel';
import { SmsChannel } from './channels/sms.channel';
import { EmailChannel } from './channels/email.channel';
import { NotificationPayload, NotificationResult } from './channels/notification-channel.interface';

@Injectable()
export class NotificationsService {
    private twilioEnabled: boolean;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private slackChannel: SlackChannel,
        private smsChannel: SmsChannel,
        private emailChannel: EmailChannel,
    ) {
        this.twilioEnabled = this.configService.get<string>('TWILIO_ENABLED') === 'true';
    }

    /**
     * Send notifications for a new incident based on priority
     */
    async notifyIncidentCreated(incident: any) {
        console.log(`\n📬 Sending notifications for incident #${incident.id.substring(0, 8)}`);

        // Build notification payload
        const payload: NotificationPayload = {
            incidentId: incident.id,
            title: incident.title,
            priority: incident.priority,
            status: incident.status,
            message: `Source: ${incident.source} | Type: ${incident.eventType}`,
            assignedTo: incident.assignedTo ? await this.getUserName(incident.assignedTo) : 'Unassigned',
            acknowledgeUrl: `${this.configService.get('APP_BASE_URL')}/incidents/${incident.id}/acknowledge`,
            viewUrl: `${this.configService.get('APP_BASE_URL')}/incidents/${incident.id}`,
        };

        // Get recipient (assigned user)
        const recipient = incident.assignedTo
            ? await this.getUser(incident.assignedTo)
            : null;

        // Determine which channels to use based on priority
        const channels = this.getChannelsForPriority(incident.priority);

        const results: NotificationResult[] = [];

        // Send via each channel
        for (const channel of channels) {
            if (channel === 'slack') {
                const result = await this.slackChannel.send(null, payload);
                results.push(result);
            }

            if (channel === 'sms' && this.twilioEnabled && recipient && recipient.phoneNumber) {
                const result = await this.smsChannel.send({ phoneNumber: recipient.phoneNumber }, payload);
                results.push(result);
            }

            if (channel === 'email' && recipient) {
                const result = await this.emailChannel.send({ email: recipient.email, name: recipient.name }, payload);
                results.push(result);
            }
        }

        // Log delivery results
        await this.logNotifications(incident.id, results);

        console.log(`✅ Notifications sent via: ${channels.join(', ')}`);

        return results;
    }

    /**
     * Determine which notification channels to use based on incident priority
     */
    private getChannelsForPriority(priority: string): string[] {
        const policies = {
            p1_critical: ['slack', 'email', 'sms'], // Everything for P1
            p2_high: ['slack', 'email'],            // Slack + Email for P2
            p3_medium: ['slack'],                   // Just Slack for P3
            p4_low: ['email'],                      // Just Email for P4 (can batch)
        };

        return policies[priority] || ['slack'];
    }

    /**
     * Get user details for notifications
     */
    private async getUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
            },
        });

        return user;
    }

    /**
     * Get user name for display
     */
    private async getUserName(userId: string): Promise<string> {
        const user = await this.getUser(userId);
        return user?.name || 'Unknown';
    }

    /**
     * Log notification delivery results to database
     */
    private async logNotifications(incidentId: string, results: any[]) {
        // We'll create a notifications table later for tracking
        // For now, just console log
        for (const result of results) {
            if (result.success) {
                console.log(`  ✅ ${result.channel}: delivered`);
            } else {
                console.error(`  ❌ ${result.channel}: ${result.error}`);
            }
        }
    }

    /**
     * Send notification when incident is acknowledged
     */
    async notifyIncidentAcknowledged(incident: any, acknowledgedBy: string) {
        const user = await this.getUser(acknowledgedBy);

        const message = {
            text: `✅ Incident #${incident.id.substring(0, 8)} acknowledged by ${user?.name || 'Unknown'}`,
        };

        // Send update to Slack
        await this.slackChannel.send(null, {
            incidentId: incident.id,
            title: `Incident Acknowledged`,
            priority: incident.priority,
            status: 'acknowledged',
            message: `${user?.name} is now handling this incident.`,
            acknowledgeUrl: '',
            viewUrl: `${this.configService.get('APP_BASE_URL')}/incidents/${incident.id}`,
        });
    }

    /**
     * Send notification when incident is resolved
     */
    async notifyIncidentResolved(incident: any, resolvedBy: string) {
        const user = await this.getUser(resolvedBy);

        // Send to Slack
        await this.slackChannel.send(null, {
            incidentId: incident.id,
            title: `✅ Incident Resolved`,
            priority: incident.priority,
            status: 'resolved',
            message: `Resolved by ${user?.name}. Root cause: ${incident.rootCauseCategory || 'Not specified'}`,
            acknowledgeUrl: '',
            viewUrl: `${this.configService.get('APP_BASE_URL')}/incidents/${incident.id}`,
        });
    }
}