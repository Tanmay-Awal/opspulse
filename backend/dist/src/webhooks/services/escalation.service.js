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
exports.EscalationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_service_1 = require("../../notifications/notifications.service");
const audit_service_1 = require("../../audit/audit.service");
let EscalationService = class EscalationService {
    prisma;
    notificationsService;
    auditService;
    constructor(prisma, notificationsService, auditService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.auditService = auditService;
    }
    async escalate(incident) {
        console.log(`\n⬆️  Escalating incident #${incident.id.substring(0, 8)}`);
        const policy = await this.prisma.escalationPolicy.findFirst({
            where: {
                orgId: incident.orgId,
                isActive: true,
            },
        });
        if (!policy) {
            console.error('❌ No escalation policy found for organization');
            return;
        }
        const levels = policy.levels;
        const currentLevel = incident.escalationLevel || 0;
        const nextLevel = currentLevel + 1;
        if (nextLevel >= levels.length) {
            console.log('⚠️  No more escalation levels - alerting entire team');
            await this.alertFullTeam(incident);
            return;
        }
        const nextResponder = levels[nextLevel];
        const updatedIncident = await this.prisma.incident.update({
            where: { id: incident.id },
            data: {
                escalationLevel: nextLevel,
                assignedTo: nextResponder.userId,
            },
            include: {
                organization: { select: { id: true, name: true } },
            },
        });
        const user = await this.prisma.user.findUnique({
            where: { id: nextResponder.userId },
            select: { name: true, email: true },
        });
        console.log(`✅ Escalated to Level ${nextLevel}: ${user?.name || 'Unknown'}`);
        await this.notificationsService.notifyIncidentCreated(updatedIncident);
        await this.auditService.log({
            incidentId: incident.id,
            action: audit_service_1.AuditAction.INCIDENT_ESCALATED,
            actorEmail: 'system',
            fromValue: {
                level: currentLevel,
                assignedTo: incident.assignedTo,
            },
            toValue: {
                level: nextLevel,
                assignedTo: nextResponder.userId,
            },
            metadata: {
                reason: 'sla_breach_no_acknowledgment',
            },
        });
    }
    async cancelEscalation(incidentId) {
        console.log(`✅ Escalation cancelled for incident #${incidentId.substring(0, 8)}`);
    }
    async alertFullTeam(incident) {
        const engineers = await this.prisma.user.findMany({
            where: {
                orgId: incident.orgId,
                isActive: true,
                role: { in: ['engineer', 'admin'] },
            },
        });
        console.log(`🚨 Sending alerts to ${engineers.length} team members`);
        for (const engineer of engineers) {
            console.log(`  → Notifying ${engineer.name}`);
        }
        await this.auditService.log({
            incidentId: incident.id,
            action: audit_service_1.AuditAction.INCIDENT_ESCALATED,
            actorEmail: 'system',
            toValue: { escalationLevel: 'full_team_alert' },
            metadata: {
                reason: 'all_escalation_levels_exhausted',
                notifiedCount: engineers.length,
            },
        });
    }
};
exports.EscalationService = EscalationService;
exports.EscalationService = EscalationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        audit_service_1.AuditService])
], EscalationService);
//# sourceMappingURL=escalation.service.js.map