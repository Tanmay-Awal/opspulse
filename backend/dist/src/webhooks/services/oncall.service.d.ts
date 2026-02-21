import { PrismaService } from '../../prisma/prisma.service';
export declare class OnCallService {
    private prisma;
    constructor(prisma: PrismaService);
    getCurrentOnCall(orgId: string): Promise<string | null>;
}
