import { WebhookEventType, WebhookSeverity } from '../dto';
type IncidentPriority = 'p1_critical' | 'p2_high' | 'p3_medium' | 'p4_low';
export declare class SeverityClassifierService {
    private rules;
    classify(event: {
        type: WebhookEventType;
        severity?: WebhookSeverity;
        source: string;
        metadata?: any;
    }): IncidentPriority;
    private mapSeverityToPriority;
}
export {};
