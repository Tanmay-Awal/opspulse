import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { AuditService, AuditAction } from '../../audit/audit.service';

interface EscalationLevel {
    userId: string;
    waitMinutes: number;
}

@Injectable()
export class EscalationService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
        private auditService: AuditService,
    ) { }

    /**
     * Escalate an incident to the next level
     */
    async escalate(incident: any) {
        console.log(`\n⬆️  Escalating incident #${incident.id.substring(0, 8)}`);

        // Get escalation policy for the org
        const policy = await this.prisma.escalationPolicy.findFirst({
            where: {
                orgId: incident.orgId,
                isActive: true,
            },
        });

        if (!policy) {
            console.error('❌ No escalation policy found for organization');
            return;
        }

        const levels = policy.levels as unknown as EscalationLevel[];
        const currentLevel = incident.escalationLevel || 0;
        const nextLevel = currentLevel + 1;

        // Check if we have a next level
        if (nextLevel >= levels.length) {
            console.log('⚠️  No more escalation levels - alerting entire team');
            await this.alertFullTeam(incident);
            return;
        }

        const nextResponder = levels[nextLevel];

        // Update incident
        const updatedIncident = await this.prisma.incident.update({
            where: { id: incident.id },
            data: {
                escalationLevel: nextLevel,
                assignedTo: nextResponder.userId,
            },
            include: {
                organization: { select: { id: true, name: true } },
            },
        });

        // Get user details
        const user = await this.prisma.user.findUnique({
            where: { id: nextResponder.userId },
            select: { name: true, email: true },
        });

        console.log(`✅ Escalated to Level ${nextLevel}: ${user?.name || 'Unknown'}`);

        // Send notifications to new responder
        await this.notificationsService.notifyIncidentCreated(updatedIncident);

        // Audit log
        await this.auditService.log({
            incidentId: incident.id,
            action: AuditAction.INCIDENT_ESCALATED,
            actorEmail: 'system',
            fromValue: {
                level: currentLevel,
                assignedTo: incident.assignedTo,
            },
            toValue: {
                level: nextLevel,
                assignedTo: nextResponder.userId,
            },
            metadata: {
                reason: 'sla_breach_no_acknowledgment',
            },
        });
    }

    /**
     * Cancel ongoing escalation (called when incident is acknowledged)
     */
    async cancelEscalation(incidentId: string) {
        // In a more complex system, you'd clear any scheduled escalation jobs here
        // For now, the cron job simply checks if incident is still open/unacknowledged
        console.log(`✅ Escalation cancelled for incident #${incidentId.substring(0, 8)}`);
    }

    /**
     * Alert entire team when all escalation levels exhausted
     */
    private async alertFullTeam(incident: any) {
        // Get all active engineers in the org
        const engineers = await this.prisma.user.findMany({
            where: {
                orgId: incident.orgId,
                isActive: true,
                role: { in: ['engineer', 'admin'] },
            },
        });

        console.log(`🚨 Sending alerts to ${engineers.length} team members`);

        // Send to each engineer
        for (const engineer of engineers) {
            // We'll just log for now - in production you'd send actual notifications
            console.log(`  → Notifying ${engineer.name}`);
        }

        // Audit log
        await this.auditService.log({
            incidentId: incident.id,
            action: AuditAction.INCIDENT_ESCALATED,
            actorEmail: 'system',
            toValue: { escalationLevel: 'full_team_alert' },
            metadata: {
                reason: 'all_escalation_levels_exhausted',
                notifiedCount: engineers.length,
            },
        });
    }
}