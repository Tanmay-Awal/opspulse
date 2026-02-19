import { IsString, IsEnum, IsOptional, IsObject, IsNotEmpty } from 'class-validator';

export enum IncidentPriority {
    P1_CRITICAL = 'p1_critical',
    P2_HIGH = 'p2_high',
    P3_MEDIUM = 'p3_medium',
    P4_LOW = 'p4_low',
}

export enum IncidentStatus {
    OPEN = 'open',
    ACKNOWLEDGED = 'acknowledged',
    INVESTIGATING = 'investigating',
    RESOLVED = 'resolved',
    CLOSED = 'closed',
}

export class CreateIncidentDto {
    @IsString()
    @IsNotEmpty()
    orgId: string;

    @IsString()
    @IsNotEmpty()
    source: string;

    @IsString()
    @IsNotEmpty()
    eventType: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsEnum(IncidentPriority)
    priority: IncidentPriority;

    @IsString()
    @IsOptional()
    assignedTo?: string;

    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;
}