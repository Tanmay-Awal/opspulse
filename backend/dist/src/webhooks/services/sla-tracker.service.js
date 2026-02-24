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
exports.SlaTrackerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma/prisma.service");
const escalation_service_1 = require("./escalation.service");
let SlaTrackerService = class SlaTrackerService {
    prisma;
    escalationService;
    slaPolicies = [
        { priority: 'p1_critical', acknowledgeWithinMinutes: 10, resolveWithinMinutes: 60 },
        { priority: 'p2_high', acknowledgeWithinMinutes: 30, resolveWithinMinutes: 240 },
        { priority: 'p3_medium', acknowledgeWithinMinutes: 240, resolveWithinMinutes: 1440 },
        { priority: 'p4_low', acknowledgeWithinMinutes: 1440, resolveWithinMinutes: 4320 },
    ];
    constructor(prisma, escalationService) {
        this.prisma = prisma;
        this.escalationService = escalationService;
    }
    async checkSLABreaches() {
        await this.checkAcknowledgmentSLA();
        await this.checkResolutionSLA();
    }
    async checkAcknowledgmentSLA() {
        for (const policy of this.slaPolicies) {
            const deadline = new Date(Date.now() - policy.acknowledgeWithinMinutes * 60 * 1000);
            const breachedIncidents = await this.prisma.incident.findMany({
                where: {
                    status: 'open',
                    priority: policy.priority,
                    acknowledgedAt: null,
                    createdAt: {
                        lte: deadline,
                    },
                },
                include: {
                    organization: {
                        select: { id: true, name: true },
                    },
                },
            });
            for (const incident of breachedIncidents) {
                console.log(`⚠️  SLA breach: Incident #${incident.id.substring(0, 8)} not acknowledged within ${policy.acknowledgeWithinMinutes} min`);
                await this.escalationService.escalate(incident);
            }
        }
    }
    async checkResolutionSLA() {
        for (const policy of this.slaPolicies) {
            const deadline = new Date(Date.now() - policy.resolveWithinMinutes * 60 * 1000);
            const breachedIncidents = await this.prisma.incident.findMany({
                where: {
                    status: {
                        in: ['acknowledged', 'investigating'],
                    },
                    priority: policy.priority,
                    resolvedAt: null,
                    createdAt: {
                        lte: deadline,
                    },
                },
            });
            for (const incident of breachedIncidents) {
                console.log(`⚠️  Resolution SLA breach: Incident #${incident.id.substring(0, 8)} not resolved within ${policy.resolveWithinMinutes} min`);
            }
        }
    }
};
exports.SlaTrackerService = SlaTrackerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_30_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SlaTrackerService.prototype, "checkSLABreaches", null);
exports.SlaTrackerService = SlaTrackerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        escalation_service_1.EscalationService])
], SlaTrackerService);
//# sourceMappingURL=sla-tracker.service.js.map