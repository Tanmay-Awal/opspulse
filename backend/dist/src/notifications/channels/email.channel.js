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
exports.EmailChannel = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mail_1 = require("@sendgrid/mail");
let EmailChannel = class EmailChannel {
    configService;
    name = 'email';
    fromEmail;
    fromName;
    mailService;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('SENDGRID_API_KEY') || '';
        this.mailService = new mail_1.MailService();
        this.mailService.setApiKey(apiKey);
        this.fromEmail = this.configService.get('SENDGRID_FROM_EMAIL') || '';
        this.fromName = this.configService.get('SENDGRID_FROM_NAME') || '';
    }
    async send(recipient, payload) {
        try {
            if (!recipient.email) {
                throw new Error('Recipient email not provided');
            }
            const emailHtml = this.buildEmailHtml(payload);
            const msg = {
                to: recipient.email,
                from: {
                    email: this.fromEmail,
                    name: this.fromName,
                },
                subject: `[${payload.priority.toUpperCase()}] ${payload.title}`,
                html: emailHtml,
            };
            const response = await this.mailService.send(msg);
            console.log(`✅ Email sent to ${recipient.email}`);
            return {
                success: true,
                channel: 'email',
                messageId: response[0].headers['x-message-id'],
                deliveredAt: new Date(),
            };
        }
        catch (error) {
            console.error('❌ Email notification failed:', error.message);
            return {
                success: false,
                channel: 'email',
                error: error.message,
            };
        }
    }
    buildEmailHtml(payload) {
        const priorityColor = this.getPriorityColor(payload.priority);
        return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${priorityColor}; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
    .button { display: inline-block; padding: 12px 24px; background: #1a56db; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
    .button:hover { background: #1035a0; }
    .details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .detail-row { margin: 8px 0; }
    .label { font-weight: bold; color: #555; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">${payload.priority.toUpperCase()} Incident</h1>
    </div>
    <div class="content">
      <h2>${payload.title}</h2>
      <p>${payload.message}</p>
      
      <div class="details">
        <div class="detail-row">
          <span class="label">Incident ID:</span> ${payload.incidentId.substring(0, 8)}
        </div>
        <div class="detail-row">
          <span class="label">Priority:</span> ${payload.priority}
        </div>
        <div class="detail-row">
          <span class="label">Status:</span> ${payload.status}
        </div>
        <div class="detail-row">
          <span class="label">Assigned To:</span> ${payload.assignedTo || 'Unassigned'}
        </div>
      </div>

      <div style="text-align: center; margin: 20px 0;">
        <a href="${payload.acknowledgeUrl}" class="button">✅ Acknowledge Incident</a>
        <a href="${payload.viewUrl}" class="button" style="background: #6c757d;">👁️ View Details</a>
      </div>

      <p style="font-size: 12px; color: #999; margin-top: 30px;">
        This is an automated alert from OpsPulse. Do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
    `;
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
exports.EmailChannel = EmailChannel;
exports.EmailChannel = EmailChannel = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailChannel);
//# sourceMappingURL=email.channel.js.map