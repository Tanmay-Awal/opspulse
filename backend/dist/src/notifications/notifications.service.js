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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const slack_channel_1 = require("./channels/slack.channel");
const sms_channel_1 = require("./channels/sms.channel");
const email_channel_1 = require("./channels/email.channel");
let NotificationsService = class NotificationsService {
    prisma;
    configService;
    slackChannel;
    smsChannel;
    emailChannel;
    twilioEnabled;
    constructor(prisma, configService, slackChannel, smsChannel, emailChannel) {
        this.prisma = prisma;
        this.configService = configService;
        this.slackChannel = slackChannel;
        this.smsChannel = smsChannel;
        this.emailChannel = emailChannel;
        this.twilioEnabled = this.configService.get('TWILIO_ENABLED') === 'true';
    }
    async notifyIncidentCreated(incident) {
        console.log(`\n📬 Sending notifications for incident #${incident.id.substring(0, 8)}`);
        const payload = {
            incidentId: incident.id,
            title: incident.title,
            priority: incident.priority,
            status: incident.status,
            message: `Source: ${incident.source} | Type: ${incident.eventType}`,
            assignedTo: incident.assignedTo ? await this.getUserName(incident.assignedTo) : 'Unassigned',
            acknowledgeUrl: `${this.configService.get('APP_BASE_URL')}/incidents/${incident.id}/acknowledge`,
            viewUrl: `${this.configService.get('APP_BASE_URL')}/incidents/${incident.id}`,
        };
        const recipient = incident.assignedTo
            ? await this.getUser(incident.assignedTo)
            : null;
        const channels = this.getChannelsForPriority(incident.priority);
        const results = [];
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
        await this.logNotifications(incident.id, results);
        console.log(`✅ Notifications sent via: ${channels.join(', ')}`);
        return results;
    }
    getChannelsForPriority(priority) {
        const policies = {
            p1_critical: ['slack', 'email', 'sms'],
            p2_high: ['slack', 'email'],
            p3_medium: ['slack'],
            p4_low: ['email'],
        };
        return policies[priority] || ['slack'];
    }
    async getUser(userId) {
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
    async getUserName(userId) {
        const user = await this.getUser(userId);
        return user?.name || 'Unknown';
    }
    async logNotifications(incidentId, results) {
        for (const result of results) {
            if (result.success) {
                console.log(`  ✅ ${result.channel}: delivered`);
            }
            else {
                console.error(`  ❌ ${result.channel}: ${result.error}`);
            }
        }
    }
    async notifyIncidentAcknowledged(incident, acknowledgedBy) {
        const user = await this.getUser(acknowledgedBy);
        const message = {
            text: `✅ Incident #${incident.id.substring(0, 8)} acknowledged by ${user?.name || 'Unknown'}`,
        };
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
    async notifyIncidentResolved(incident, resolvedBy) {
        const user = await this.getUser(resolvedBy);
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
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        slack_channel_1.SlackChannel,
        sms_channel_1.SmsChannel,
        email_channel_1.EmailChannel])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map