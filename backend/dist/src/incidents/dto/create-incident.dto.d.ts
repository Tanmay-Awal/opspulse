export declare enum IncidentPriority {
    P1_CRITICAL = "p1_critical",
    P2_HIGH = "p2_high",
    P3_MEDIUM = "p3_medium",
    P4_LOW = "p4_low"
}
export declare enum IncidentStatus {
    OPEN = "open",
    ACKNOWLEDGED = "acknowledged",
    INVESTIGATING = "investigating",
    RESOLVED = "resolved",
    CLOSED = "closed"
}
export declare class CreateIncidentDto {
    orgId: string;
    source: string;
    eventType: string;
    title: string;
    priority: IncidentPriority;
    assignedTo?: string;
    metadata?: Record<string, any>;
}
