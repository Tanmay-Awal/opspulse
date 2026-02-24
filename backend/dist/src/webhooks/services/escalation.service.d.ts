import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { AuditService } from '../../audit/audit.service';
export declare class EscalationService {
    private prisma;
    private notificationsService;
    private auditService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, auditService: AuditService);
    escalate(incident: any): Promise<void>;
    cancelEscalation(incidentId: string): Promise<void>;
    private alertFullTeam;
}
