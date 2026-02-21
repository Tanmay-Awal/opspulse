import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OnCallService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get current on-call engineer for an organization
     */
    async getCurrentOnCall(orgId: string): Promise<string | null> {
        const schedule = await this.prisma.onCallSchedule.findFirst({
            where: { orgId },
            orderBy: { createdAt: 'desc' },
        });

        if (!schedule) {
            console.log('⚠️  No on-call schedule found for org');
            return null;
        }

        console.log(`👤 Current on-call: ${schedule.currentOnCallId}`);
        return schedule.currentOnCallId;
    }
}