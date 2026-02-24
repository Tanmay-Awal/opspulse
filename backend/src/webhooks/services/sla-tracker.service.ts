import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { EscalationService } from './escalation.service';

interface SLAPolicy {
    priority: string;
    acknowledgeWithinMinutes: number;
    resolveWithinMinutes: number;
}

@Injectable()
export class SlaTrackerService {
    private slaPolicies: SLAPolicy[] = [
        { priority: 'p1_critical', acknowledgeWithinMinutes: 10, resolveWithinMinutes: 60 },
        { priority: 'p2_high', acknowledgeWithinMinutes: 30, resolveWithinMinutes: 240 },
        { priority: 'p3_medium', acknowledgeWithinMinutes: 240, resolveWithinMinutes: 1440 },
        { priority: 'p4_low', acknowledgeWithinMinutes: 1440, resolveWithinMinutes: 4320 },
    ];

    constructor(
        private prisma: PrismaService,
        private escalationService: EscalationService,
    ) { }

    /**
     * Check for SLA breaches every 30 seconds
     */
    @Cron(CronExpression.EVERY_30_SECONDS)
    async checkSLABreaches() {
        // Check acknowledgment SLA
        await this.checkAcknowledgmentSLA();

        // Check resolution SLA
        await this.checkResolutionSLA();
    }

    /**
     * Check for unacknowledged incidents past their SLA
     */
    private async checkAcknowledgmentSLA() {
        for (const policy of this.slaPolicies) {
            const deadline = new Date(Date.now() - policy.acknowledgeWithinMinutes * 60 * 1000);

            const breachedIncidents = await this.prisma.incident.findMany({
                where: {
                    status: 'open',
                    priority: policy.priority,
                    acknowledgedAt: null,
                    createdAt: {
                        lte: deadline,
                    },
                },
                include: {
                    organization: {
                        select: { id: true, name: true },
                    },
                },
            });

            for (const incident of breachedIncidents) {
                console.log(
                    `⚠️  SLA breach: Incident #${incident.id.substring(0, 8)} not acknowledged within ${policy.acknowledgeWithinMinutes} min`,
                );

                // Trigger escalation
                await this.escalationService.escalate(incident);
            }
        }
    }

    /**
     * Check for unresolved incidents past their resolution SLA
     */
    private async checkResolutionSLA() {
        for (const policy of this.slaPolicies) {
            const deadline = new Date(Date.now() - policy.resolveWithinMinutes * 60 * 1000);

            const breachedIncidents = await this.prisma.incident.findMany({
                where: {
                    status: {
                        in: ['acknowledged', 'investigating'],
                    },
                    priority: policy.priority,
                    resolvedAt: null,
                    createdAt: {
                        lte: deadline,
                    },
                },
            });

            for (const incident of breachedIncidents) {
                console.log(
                    `⚠️  Resolution SLA breach: Incident #${incident.id.substring(0, 8)} not resolved within ${policy.resolveWithinMinutes} min`,
                );

                // In production, you'd alert the team lead or manager here
                // For now, just log it
            }
        }
    }
}