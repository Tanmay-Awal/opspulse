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
exports.SlackChannel = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let SlackChannel = class SlackChannel {
    configService;
    name = 'slack';
    webhookUrl;
    constructor(configService) {
        this.configService = configService;
        this.webhookUrl = this.configService.get('SLACK_WEBHOOK_URL') || '';
    }
    async send(recipient, payload) {
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
        }
        catch (error) {
            console.error('❌ Slack notification failed:', error.message);
            return {
                success: false,
                channel: 'slack',
                error: error.message,
            };
        }
    }
    getPriorityEmoji(priority) {
        const emojis = {
            p1_critical: '🚨',
            p2_high: '⚠️',
            p3_medium: 'ℹ️',
            p4_low: '📝',
        };
        return emojis[priority] || 'ℹ️';
    }
    getPriorityColor(priority) {
        const colors = {
            p1_critical: '#E63946',
            p2_high: '#F77F00',
            p3_medium: '#FCBF49',
            p4_low: '#06AED5',
        };
        return colors[priority] || '#06AED5';
    }
};
exports.SlackChannel = SlackChannel;
exports.SlackChannel = SlackChannel = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SlackChannel);
//# sourceMappingURL=slack.channel.js.map