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
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const deduplication_service_1 = require("./services/deduplication.service");
const severity_classifier_service_1 = require("./services/severity-classifier.service");
const oncall_service_1 = require("./services/oncall.service");
let WebhooksService = class WebhooksService {
    prisma;
    deduplicationService;
    severityClassifier;
    onCallService;
    constructor(prisma, deduplicationService, severityClassifier, onCallService) {
        this.prisma = prisma;
        this.deduplicationService = deduplicationService;
        this.severityClassifier = severityClassifier;
        this.onCallService = onCallService;
    }
    async processIncomingWebhook(orgId, webhookDto) {
        console.log(`\n🔔 Incoming webhook: ${webhookDto.source} - ${webhookDto.type}`);
        const { source, type, severity, message, correlationKey, idempotencyKey, metadata } = webhookDto;
        const existingIncident = await this.deduplicationService.findDuplicate(orgId, source, type, correlationKey);
        if (existingIncident) {
            await this.prisma.incidentEvent.create({
                data: {
                    incidentId: existingIncident.id,
                    source,
                    eventType: type,
                    message,
                    severity,
                    payload: metadata || {},
                },
            });
            return {
                action: 'deduplicated',
                incidentId: existingIncident.id,
                message: `Event added to existing incident #${existingIncident.id.substring(0, 8)}`,
            };
        }
        const priority = this.severityClassifier.classify({
            type,
            severity,
            source,
            metadata,
        });
        const onCallUserId = await this.onCallService.getCurrentOnCall(orgId);
        const incident = await this.prisma.incident.create({
            data: {
                orgId,
                source,
                eventType: type,
                title: this.generateTitle(source, type, message),
                priority,
                status: 'open',
                assignedTo: onCallUserId,
                eventCount: 1,
                metadata: {
                    ...(metadata || {}),
                    correlationKey,
                    idempotencyKey,
                },
            },
            include: {
                organization: {
                    select: { id: true, name: true },
                },
            },
        });
        await this.prisma.incidentEvent.create({
            data: {
                incidentId: incident.id,
                source,
                eventType: type,
                message,
                severity,
                payload: metadata || {},
            },
        });
        console.log(`✅ Incident created: #${incident.id.substring(0, 8)} (${priority})`);
        return {
            action: 'created',
            incidentId: incident.id,
            priority,
            assignedTo: onCallUserId,
            message: `New incident created: ${incident.title}`,
        };
    }
    generateTitle(source, type, message) {
        const cleanMessage = message.substring(0, 80);
        return `[${source}] ${type.replace(/_/g, ' ')}: ${cleanMessage}`;
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        deduplication_service_1.DeduplicationService,
        severity_classifier_service_1.SeverityClassifierService,
        oncall_service_1.OnCallService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map