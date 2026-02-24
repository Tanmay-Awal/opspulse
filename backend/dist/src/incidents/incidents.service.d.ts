import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto, UpdateIncidentDto, QueryIncidentsDto } from './dto/index';
import { AuditService } from '../audit/audit.service';
export declare class IncidentsService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    create(createIncidentDto: CreateIncidentDto): Promise<{
        organization: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        orgId: string;
        source: string;
        eventType: string;
        title: string;
        priority: string;
        assignedTo: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        status: string;
        rootCauseCategory: string | null;
        resolutionNotes: string | null;
        escalationLevel: number;
        eventCount: number;
        acknowledgedAt: Date | null;
        acknowledgedBy: string | null;
        resolvedAt: Date | null;
        resolvedBy: string | null;
    }>;
    findAll(orgId: string, query: QueryIncidentsDto): Promise<{
        data: ({
            organization: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            orgId: string;
            source: string;
            eventType: string;
            title: string;
            priority: string;
            assignedTo: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            status: string;
            rootCauseCategory: string | null;
            resolutionNotes: string | null;
            escalationLevel: number;
            eventCount: number;
            acknowledgedAt: Date | null;
            acknowledgedBy: string | null;
            resolvedAt: Date | null;
            resolvedBy: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, orgId: string): Promise<{
        organization: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        orgId: string;
        source: string;
        eventType: string;
        title: string;
        priority: string;
        assignedTo: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        status: string;
        rootCauseCategory: string | null;
        resolutionNotes: string | null;
        escalationLevel: number;
        eventCount: number;
        acknowledgedAt: Date | null;
        acknowledgedBy: string | null;
        resolvedAt: Date | null;
        resolvedBy: string | null;
    }>;
    update(id: string, orgId: string, updateIncidentDto: UpdateIncidentDto): Promise<{
        organization: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        orgId: string;
        source: string;
        eventType: string;
        title: string;
        priority: string;
        assignedTo: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        status: string;
        rootCauseCategory: string | null;
        resolutionNotes: string | null;
        escalationLevel: number;
        eventCount: number;
        acknowledgedAt: Date | null;
        acknowledgedBy: string | null;
        resolvedAt: Date | null;
        resolvedBy: string | null;
    }>;
    private validateStatusTransition;
    remove(id: string, orgId: string): Promise<{
        id: string;
        createdAt: Date;
        orgId: string;
        source: string;
        eventType: string;
        title: string;
        priority: string;
        assignedTo: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        status: string;
        rootCauseCategory: string | null;
        resolutionNotes: string | null;
        escalationLevel: number;
        eventCount: number;
        acknowledgedAt: Date | null;
        acknowledgedBy: string | null;
        resolvedAt: Date | null;
        resolvedBy: string | null;
    }>;
    acknowledge(id: string, orgId: string, acknowledgedBy?: string): Promise<{
        organization: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        orgId: string;
        source: string;
        eventType: string;
        title: string;
        priority: string;
        assignedTo: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        status: string;
        rootCauseCategory: string | null;
        resolutionNotes: string | null;
        escalationLevel: number;
        eventCount: number;
        acknowledgedAt: Date | null;
        acknowledgedBy: string | null;
        resolvedAt: Date | null;
        resolvedBy: string | null;
    }>;
    resolve(id: string, orgId: string, resolveData: {
        resolvedBy?: string;
        rootCauseCategory?: string;
        resolutionNotes?: string;
    }): Promise<{
        organization: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        orgId: string;
        source: string;
        eventType: string;
        title: string;
        priority: string;
        assignedTo: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        status: string;
        rootCauseCategory: string | null;
        resolutionNotes: string | null;
        escalationLevel: number;
        eventCount: number;
        acknowledgedAt: Date | null;
        acknowledgedBy: string | null;
        resolvedAt: Date | null;
        resolvedBy: string | null;
    }>;
}
