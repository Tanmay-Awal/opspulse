import { WebhooksService } from './webhooks.service';
import { IncomingWebhookDto } from './dto';
export declare class WebhooksController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    receiveIncident(webhookDto: IncomingWebhookDto): Promise<{
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
}
