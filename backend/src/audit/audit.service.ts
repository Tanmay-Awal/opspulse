import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum AuditAction {
    INCIDENT_CREATED = 'incident_created',
    INCIDENT_ACKNOWLEDGED = 'incident_acknowledged',
    INCIDENT_STATUS_CHANGED = 'incident_status_changed',
    INCIDENT_ASSIGNED = 'incident_assigned',
    INCIDENT_ESCALATED = 'incident_escalated',
    INCIDENT_RESOLVED = 'incident_resolved',
    NOTE_ADDED = 'note_added',
    PRIORITY_CHANGED = 'priority_changed',
}

interface LogParams {
    incidentId: string;
    action: AuditAction;
    actorId?: string;
    actorEmail?: string;
    fromValue?: any;
    toValue?: any;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
}

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    /**
     * Create an immutable audit log entry
     */
    async log(params: LogParams) {
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

    /**
     * Get audit trail for an incident
     */
    async getIncidentAuditTrail(incidentId: string) {
        return this.prisma.auditLog.findMany({
            where: { incidentId },
            orderBy: { timestamp: 'asc' },
        });
    }

    /**
     * Get recent audit logs (for admin dashboard)
     */
    async getRecentLogs(limit: number = 50) {
        return this.prisma.auditLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
    }
}