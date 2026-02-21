import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DeduplicationService {
    constructor(private prisma: PrismaService) { }

    /**
     * Check if this event is a duplicate of an existing open incident
     * Returns the existing incident if duplicate found, null otherwise
     */
    async findDuplicate(
        orgId: string,
        source: string,
        eventType: string,
        correlationKey?: string,
    ) {
        // Time window for deduplication (10 minutes)
        const windowMinutes = 10;
        const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

        // Build query conditions
        const where: any = {
            orgId,
            source,
            eventType,
            status: {
                in: ['open', 'acknowledged', 'investigating'], // Don't dedupe against resolved incidents
            },
            createdAt: {
                gte: windowStart,
            },
        };

        // If correlation key provided, use exact match
        if (correlationKey) {
            where.metadata = {
                path: ['correlationKey'],
                equals: correlationKey,
            };
        }

        // Find existing incident
        const existingIncident = await this.prisma.incident.findFirst({
            where,
            orderBy: { createdAt: 'desc' },
        });

        if (existingIncident) {
            console.log(
                `🔁 Deduplication: Found existing incident #${existingIncident.id.substring(0, 8)}`,
            );

            // Increment event count
            await this.prisma.incident.update({
                where: { id: existingIncident.id },
                data: {
                    eventCount: { increment: 1 },
                },
            });

            return existingIncident;
        }

        console.log('✨ Deduplication: No duplicate found, will create new incident');
        return null;
    }
}