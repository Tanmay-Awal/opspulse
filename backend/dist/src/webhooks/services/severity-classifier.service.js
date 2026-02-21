"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeverityClassifierService = void 0;
const common_1 = require("@nestjs/common");
const dto_1 = require("../dto");
let SeverityClassifierService = class SeverityClassifierService {
    rules = [
        {
            condition: (e) => e.type === dto_1.WebhookEventType.DATABASE_ERROR,
            priority: 'p1_critical',
        },
        {
            condition: (e) => e.type === dto_1.WebhookEventType.DEPLOYMENT_FAILED &&
                e.source.includes('prod'),
            priority: 'p1_critical',
        },
        {
            condition: (e) => e.type === dto_1.WebhookEventType.DISK_FULL,
            priority: 'p1_critical',
        },
        {
            condition: (e) => (e.type === dto_1.WebhookEventType.HIGH_MEMORY || e.type === dto_1.WebhookEventType.HIGH_CPU) &&
                e.source.includes('prod'),
            priority: 'p2_high',
        },
        {
            condition: (e) => e.type === dto_1.WebhookEventType.CRON_FAILURE,
            priority: 'p2_high',
        },
        {
            condition: (e) => e.type === dto_1.WebhookEventType.WEBHOOK_FAILURE,
            priority: 'p3_medium',
        },
        {
            condition: (e) => e.type === dto_1.WebhookEventType.API_ERROR && e.severity === dto_1.WebhookSeverity.CRITICAL,
            priority: 'p1_critical',
        },
        {
            condition: (e) => e.type === dto_1.WebhookEventType.API_ERROR && e.severity === dto_1.WebhookSeverity.HIGH,
            priority: 'p2_high',
        },
    ];
    classify(event) {
        for (const rule of this.rules) {
            if (rule.condition(event)) {
                console.log(`📊 Severity classified: ${rule.priority} (matched rule)`);
                return rule.priority;
            }
        }
        const fallback = this.mapSeverityToPriority(event.severity);
        console.log(`📊 Severity classified: ${fallback} (fallback)`);
        return fallback;
    }
    mapSeverityToPriority(severity) {
        switch (severity) {
            case dto_1.WebhookSeverity.CRITICAL:
                return 'p1_critical';
            case dto_1.WebhookSeverity.HIGH:
                return 'p2_high';
            case dto_1.WebhookSeverity.MEDIUM:
                return 'p3_medium';
            case dto_1.WebhookSeverity.LOW:
                return 'p4_low';
            default:
                return 'p3_medium';
        }
    }
};
exports.SeverityClassifierService = SeverityClassifierService;
exports.SeverityClassifierService = SeverityClassifierService = __decorate([
    (0, common_1.Injectable)()
], SeverityClassifierService);
//# sourceMappingURL=severity-classifier.service.js.map