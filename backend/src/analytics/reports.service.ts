import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from './analytics.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReportsService {
    private slackWebhookUrl: string;

    constructor(
        private prisma: PrismaService,
        private analyticsService: AnalyticsService,
        private configService: ConfigService,
    ) {
        this.slackWebhookUrl = this.configService.get<string>('SLACK_WEBHOOK_URL') || '';
    }

    /**
     * Send daily report every day at 9 AM
     */
    @Cron('0 9 * * *', {
        name: 'daily-report',
        timeZone: 'America/New_York', // Change to your timezone
    })
    async sendDailyReport() {
        console.log('\n📊 Generating daily report...');

        try {
            // Get all active organizations
            const orgs = await this.prisma.organization.findMany({
                select: { id: true, name: true },
            });

            for (const org of orgs) {
                await this.generateAndSendReport(org.id, org.name);
            }

            console.log('✅ Daily reports sent to all organizations');
        } catch (error) {
            console.error('❌ Failed to send daily reports:', error);
        }
    }

    /**
     * Generate and send report for a specific organization
     */
    private async generateAndSendReport(orgId: string, orgName: string) {
        // Get yesterday's date range
        const endDate = new Date();
        endDate.setHours(0, 0, 0, 0);
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 1);

        // Get metrics
        const [slaMetrics, rootCauses, teamPerf] = await Promise.all([
            this.analyticsService.getSLAMetrics(orgId, startDate, endDate),
            this.analyticsService.getRootCauseStats(orgId, startDate, endDate),
            this.analyticsService.getTeamPerformance(orgId, startDate, endDate),
        ]);

        // Build Slack message
        const slackMessage = this.buildSlackMessage(
            orgName,
            startDate,
            slaMetrics,
            rootCauses,
            teamPerf,
        );

        // Send to Slack
        await this.sendToSlack(slackMessage);
    }

    /**
     * Build formatted Slack message
     */
    private buildSlackMessage(
        orgName: string,
        date: Date,
        slaMetrics: any,
        rootCauses: any[],
        teamPerf: any[],
    ) {
        const dateStr = date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });

        const statusEmoji =
            slaMetrics.slaComplianceRate >= 95 ? '✅' : slaMetrics.slaComplianceRate >= 80 ? '⚠️' : '🚨';

        const slackMessage: any = {
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: `📊 Daily Incident Report - ${dateStr}`,
                        emoji: true,
                    },
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*${orgName}* | Generated at ${new Date().toLocaleTimeString()}`,
                    },
                },
                {
                    type: 'divider',
                },
                {
                    type: 'section',
                    fields: [
                        {
                            type: 'mrkdwn',
                            text: `*Total Incidents*\n${slaMetrics.totalIncidents}`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*SLA Compliance ${statusEmoji}*\n${slaMetrics.slaComplianceRate}%`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Avg Ack Time*\n${slaMetrics.avgAcknowledgmentTimeMinutes} min`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Avg Resolve Time*\n${Math.round(slaMetrics.avgResolutionTimeMinutes / 60)} hours`,
                        },
                    ],
                },
                {
                    type: 'section',
                    fields: [
                        {
                            type: 'mrkdwn',
                            text: `*🚨 P1 Critical*\n${slaMetrics.p1Count}`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*⚠️ P2 High*\n${slaMetrics.p2Count}`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*ℹ️ P3 Medium*\n${slaMetrics.p3Count}`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*📝 P4 Low*\n${slaMetrics.p4Count}`,
                        },
                    ],
                },
                {
                    type: 'divider',
                },
            ],
        };

        // Add root causes section if available
        if (rootCauses.length > 0) {
            const topCauses = rootCauses.slice(0, 3);
            const causesText = topCauses
                .map((c) => `• *${c.category}*: ${c.count} incidents (${c.percentage}%)`)
                .join('\n');

            slackMessage.blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*🔍 Top Root Causes*\n${causesText}`,
                },
            });
        }

        // Add team performance section if available
        if (teamPerf.length > 0) {
            const topPerformers = teamPerf.slice(0, 3);
            const perfText = topPerformers
                .map(
                    (p) =>
                        `• *${p.userName}*: ${p.incidentsHandled} incidents | ${p.slaComplianceRate}% SLA`,
                )
                .join('\n');

            slackMessage.blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*👥 Top Performers*\n${perfText}`,
                },
            });
        }

        // Add SLA status section
        slackMessage.blocks.push(
            {
                type: 'divider',
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*SLA Performance*\n• Acknowledged On Time: ${slaMetrics.acknowledgedOnTime} / ${slaMetrics.acknowledgedOnTime + slaMetrics.acknowledgedLate}\n• Resolved On Time: ${slaMetrics.resolvedOnTime} / ${slaMetrics.resolvedOnTime + slaMetrics.resolvedLate}`,
                },
            },
        );

        return slackMessage;
    }

    /**
     * Send message to Slack
     */
    private async sendToSlack(message: any) {
        try {
            const response = await fetch(this.slackWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            });

            if (!response.ok) {
                throw new Error(`Slack API error: ${response.statusText}`);
            }

            console.log('✅ Daily report sent to Slack');
        } catch (error) {
            console.error('❌ Failed to send to Slack:', error);
        }
    }

    /**
     * Manual trigger for testing
     */
    async sendTestReport(orgId: string) {
        const org = await this.prisma.organization.findUnique({
            where: { id: orgId },
            select: { name: true },
        });

        if (!org) {
            throw new Error('Organization not found');
        }

        const endDate = new Date();
        const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

        await this.generateAndSendReport(orgId, org.name);

        return { message: 'Test report sent to Slack' };
    }
}