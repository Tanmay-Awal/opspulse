export declare enum WebhookEventType {
    DATABASE_ERROR = "database_error",
    CRON_FAILURE = "cron_failure",
    API_ERROR = "api_error",
    WEBHOOK_FAILURE = "webhook_failure",
    DEPLOYMENT_FAILED = "deployment_failed",
    HIGH_MEMORY = "high_memory",
    HIGH_CPU = "high_cpu",
    DISK_FULL = "disk_full"
}
export declare enum WebhookSeverity {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export declare class IncomingWebhookDto {
    orgId: string;
    source: string;
    type: WebhookEventType;
    severity?: WebhookSeverity;
    message: string;
    timestamp?: string;
    idempotencyKey?: string;
    correlationKey?: string;
    metadata?: Record<string, any>;
}
