"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const analytics_service_1 = require("./analytics.service");
const config_1 = require("@nestjs/config");
let ReportsService = class ReportsService {
    prisma;
    analyticsService;
    configService;
    slackWebhookUrl;
    constructor(prisma, analyticsService, configService) {
        this.prisma = prisma;
        this.analyticsService = analyticsService;
        this.configService = configService;
        this.slackWebhookUrl = this.configService.get('SLACK_WEBHOOK_URL') || '';
    }
    async sendDailyReport() {
        console.log('\n📊 Generating daily report...');
        try {
            const orgs = await this.prisma.organization.findMany({
                select: { id: true, name: true },
            });
            for (const org of orgs) {
                await this.generateAndSendReport(org.id, org.name);
            }
            console.log('✅ Daily reports sent to all organizations');
        }
        catch (error) {
            console.error('❌ Failed to send daily reports:', error);
        }
    }
    async generateAndSendReport(orgId, orgName) {
        const endDate = new Date();
        endDate.setHours(0, 0, 0, 0);
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 1);
        const [slaMetrics, rootCauses, teamPerf] = await Promise.all([
            this.analyticsService.getSLAMetrics(orgId, startDate, endDate),
            this.analyticsService.getRootCauseStats(orgId, startDate, endDate),
            this.analyticsService.getTeamPerformance(orgId, startDate, endDate),
        ]);
        const slackMessage = this.buildSlackMessage(orgName, startDate, slaMetrics, rootCauses, teamPerf);
        await this.sendToSlack(slackMessage);
    }
    buildSlackMessage(orgName, date, slaMetrics, rootCauses, teamPerf) {
        const dateStr = date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
        const statusEmoji = slaMetrics.slaComplianceRate >= 95 ? '✅' : slaMetrics.slaComplianceRate >= 80 ? '⚠️' : '🚨';
        const slackMessage = {
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
        if (teamPerf.length > 0) {
            const topPerformers = teamPerf.slice(0, 3);
            const perfText = topPerformers
                .map((p) => `• *${p.userName}*: ${p.incidentsHandled} incidents | ${p.slaComplianceRate}% SLA`)
                .join('\n');
            slackMessage.blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*👥 Top Performers*\n${perfText}`,
                },
            });
        }
        slackMessage.blocks.push({
            type: 'divider',
        }, {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*SLA Performance*\n• Acknowledged On Time: ${slaMetrics.acknowledgedOnTime} / ${slaMetrics.acknowledgedOnTime + slaMetrics.acknowledgedLate}\n• Resolved On Time: ${slaMetrics.resolvedOnTime} / ${slaMetrics.resolvedOnTime + slaMetrics.resolvedLate}`,
            },
        });
        return slackMessage;
    }
    async sendToSlack(message) {
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
        }
        catch (error) {
            console.error('❌ Failed to send to Slack:', error);
        }
    }
    async sendTestReport(orgId) {
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
};
exports.ReportsService = ReportsService;
__decorate([
    (0, schedule_1.Cron)('0 9 * * *', {
        name: 'daily-report',
        timeZone: 'America/New_York',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportsService.prototype, "sendDailyReport", null);
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        analytics_service_1.AnalyticsService,
        config_1.ConfigService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map