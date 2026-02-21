import { Injectable } from '@nestjs/common';
import { WebhookEventType, WebhookSeverity } from '../dto';

type IncidentPriority = 'p1_critical' | 'p2_high' | 'p3_medium' | 'p4_low';

interface ClassificationRule {
    condition: (event: {
        type: WebhookEventType;
        severity?: WebhookSeverity;
        source: string;
        metadata?: any;
    }) => boolean;
    priority: IncidentPriority;
}

@Injectable()
export class SeverityClassifierService {
    private rules: ClassificationRule[] = [
        // Rule 1: Database errors are always critical
        {
            condition: (e) => e.type === WebhookEventType.DATABASE_ERROR,
            priority: 'p1_critical',
        },

        // Rule 2: Production deployment failures are critical
        {
            condition: (e) =>
                e.type === WebhookEventType.DEPLOYMENT_FAILED &&
                e.source.includes('prod'),
            priority: 'p1_critical',
        },

        // Rule 3: Disk full is critical
        {
            condition: (e) => e.type === WebhookEventType.DISK_FULL,
            priority: 'p1_critical',
        },

        // Rule 4: High memory/CPU on production is high priority
        {
            condition: (e) =>
                (e.type === WebhookEventType.HIGH_MEMORY || e.type === WebhookEventType.HIGH_CPU) &&
                e.source.includes('prod'),
            priority: 'p2_high',
        },

        // Rule 5: Cron failures are medium priority
        {
            condition: (e) => e.type === WebhookEventType.CRON_FAILURE,
            priority: 'p2_high',
        },

        // Rule 6: Webhook failures are medium
        {
            condition: (e) => e.type === WebhookEventType.WEBHOOK_FAILURE,
            priority: 'p3_medium',
        },

        // Rule 7: API errors depend on severity
        {
            condition: (e) =>
                e.type === WebhookEventType.API_ERROR && e.severity === WebhookSeverity.CRITICAL,
            priority: 'p1_critical',
        },
        {
            condition: (e) =>
                e.type === WebhookEventType.API_ERROR && e.severity === WebhookSeverity.HIGH,
            priority: 'p2_high',
        },
    ];

    /**
     * Classify incoming event and return priority
     */
    classify(event: {
        type: WebhookEventType;
        severity?: WebhookSeverity;
        source: string;
        metadata?: any;
    }): IncidentPriority {
        // Check rules in order
        for (const rule of this.rules) {
            if (rule.condition(event)) {
                console.log(`📊 Severity classified: ${rule.priority} (matched rule)`);
                return rule.priority;
            }
        }

        // Fallback: use provided severity or default to medium
        const fallback = this.mapSeverityToPriority(event.severity);
        console.log(`📊 Severity classified: ${fallback} (fallback)`);
        return fallback;
    }

    private mapSeverityToPriority(severity?: WebhookSeverity): IncidentPriority {
        switch (severity) {
            case WebhookSeverity.CRITICAL:
                return 'p1_critical';
            case WebhookSeverity.HIGH:
                return 'p2_high';
            case WebhookSeverity.MEDIUM:
                return 'p3_medium';
            case WebhookSeverity.LOW:
                return 'p4_low';
            default:
                return 'p3_medium'; // Safe default
        }
    }
}