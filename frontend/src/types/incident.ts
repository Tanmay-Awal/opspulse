export type IncidentPriority = 'p1_critical' | 'p2_high' | 'p3_medium' | 'p4_low';
export type IncidentStatus = 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'closed';

export interface Incident {
    id: string;
    orgId: string;
    title: string;
    status: IncidentStatus;
    priority: IncidentPriority;
    source: string;
    eventType: string;
    assignedTo: string | null;
    escalationLevel: number;
    eventCount: number;
    acknowledgedAt: string | null;
    acknowledgedBy: string | null;
    resolvedAt: string | null;
    resolvedBy: string | null;
    rootCauseCategory: string | null;
    resolutionNotes: string | null;
    metadata: any;
    createdAt: string;
    organization: {
        id: string;
        name: string;
    };
}

export interface AuditLogEntry {
    id: string;
    incidentId: string;
    action: string;
    actorId: string | null;
    actorEmail: string;
    fromValue: any;
    toValue: any;
    metadata: any;
    ipAddress: string | null;
    userAgent: string | null;
    timestamp: string;
}