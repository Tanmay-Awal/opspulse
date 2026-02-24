import { PrismaService } from '../prisma/prisma.service';
export declare enum AuditAction {
    INCIDENT_CREATED = "incident_created",
    INCIDENT_ACKNOWLEDGED = "incident_acknowledged",
    INCIDENT_STATUS_CHANGED = "incident_status_changed",
    INCIDENT_ASSIGNED = "incident_assigned",
    INCIDENT_ESCALATED = "incident_escalated",
    INCIDENT_RESOLVED = "incident_resolved",
    NOTE_ADDED = "note_added",
    PRIORITY_CHANGED = "priority_changed"
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
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(params: LogParams): Promise<{
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        incidentId: string;
        action: string;
        actorId: string | null;
        actorEmail: string | null;
        fromValue: import("@prisma/client/runtime/library").JsonValue | null;
        toValue: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        timestamp: Date;
    }>;
    getIncidentAuditTrail(incidentId: string): Promise<{
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        incidentId: string;
        action: string;
        actorId: string | null;
        actorEmail: string | null;
        fromValue: import("@prisma/client/runtime/library").JsonValue | null;
        toValue: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        timestamp: Date;
    }[]>;
    getRecentLogs(limit?: number): Promise<{
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        incidentId: string;
        action: string;
        actorId: string | null;
        actorEmail: string | null;
        fromValue: import("@prisma/client/runtime/library").JsonValue | null;
        toValue: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        timestamp: Date;
    }[]>;
}
export {};
