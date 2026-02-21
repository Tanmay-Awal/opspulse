import { PrismaService } from '../../prisma/prisma.service';
export declare class DeduplicationService {
    private prisma;
    constructor(prisma: PrismaService);
    findDuplicate(orgId: string, source: string, eventType: string, correlationKey?: string): Promise<{
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
    } | null>;
}
