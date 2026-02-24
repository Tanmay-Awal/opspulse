import { PrismaService } from '../prisma/prisma.service';
import { IncomingWebhookDto } from './dto';
import { DeduplicationService } from './services/deduplication.service';
import { SeverityClassifierService } from './services/severity-classifier.service';
import { OnCallService } from './services/oncall.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
export declare class WebhooksService {
    private prisma;
    private deduplicationService;
    private severityClassifier;
    private onCallService;
    private notificationService;
    private auditService;
    constructor(prisma: PrismaService, deduplicationService: DeduplicationService, severityClassifier: SeverityClassifierService, onCallService: OnCallService, notificationService: NotificationsService, auditService: AuditService);
    processIncomingWebhook(orgId: string, webhookDto: IncomingWebhookDto): Promise<{
        action: string;
        incidentId: string;
        message: string;
        priority?: undefined;
        assignedTo?: undefined;
    } | {
        action: string;
        incidentId: string;
        priority: "p1_critical" | "p2_high" | "p3_medium" | "p4_low";
        assignedTo: string | null;
        message: string;
    }>;
    private generateTitle;
}
