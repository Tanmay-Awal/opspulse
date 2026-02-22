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
exports.SmsChannel = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const twilio_1 = require("twilio");
let SmsChannel = class SmsChannel {
    configService;
    name = 'sms';
    twilioClient;
    fromNumber;
    constructor(configService) {
        this.configService = configService;
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID') || '';
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN') || '';
        this.fromNumber = this.configService.get('TWILIO_PHONE_NUMBER') || '';
        this.twilioClient = new twilio_1.Twilio(accountSid, authToken);
    }
    async send(recipient, payload) {
        try {
            if (!recipient.phoneNumber) {
                throw new Error('Recipient phone number not provided');
            }
            const priorityEmoji = this.getPriorityEmoji(payload.priority);
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
        }
        catch (error) {
            console.error('❌ SMS notification failed:', error.message);
            return {
                success: false,
                channel: 'sms',
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
};
exports.SmsChannel = SmsChannel;
exports.SmsChannel = SmsChannel = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SmsChannel);
//# sourceMappingURL=sms.channel.js.map