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
exports.AuditService = exports.AuditAction = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
var AuditAction;
(function (AuditAction) {
    AuditAction["INCIDENT_CREATED"] = "incident_created";
    AuditAction["INCIDENT_ACKNOWLEDGED"] = "incident_acknowledged";
    AuditAction["INCIDENT_STATUS_CHANGED"] = "incident_status_changed";
    AuditAction["INCIDENT_ASSIGNED"] = "incident_assigned";
    AuditAction["INCIDENT_ESCALATED"] = "incident_escalated";
    AuditAction["INCIDENT_RESOLVED"] = "incident_resolved";
    AuditAction["NOTE_ADDED"] = "note_added";
    AuditAction["PRIORITY_CHANGED"] = "priority_changed";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
let AuditService = class AuditService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(params) {
        const entry = await this.prisma.auditLog.create({
            data: {
                incidentId: params.incidentId,
                action: params.action,
                actorId: params.actorId || null,
                actorEmail: params.actorEmail || 'system',
                fromValue: params.fromValue || null,
                toValue: params.toValue || null,
                metadata: params.metadata || null,
                ipAddress: params.ipAddress || null,
                userAgent: params.userAgent || null,
            },
        });
        console.log(`📝 Audit log: ${params.action} on incident #${params.incidentId.substring(0, 8)}`);
        return entry;
    }
    async getIncidentAuditTrail(incidentId) {
        return this.prisma.auditLog.findMany({
            where: { incidentId },
            orderBy: { timestamp: 'asc' },
        });
    }
    async getRecentLogs(limit = 50) {
        return this.prisma.auditLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map