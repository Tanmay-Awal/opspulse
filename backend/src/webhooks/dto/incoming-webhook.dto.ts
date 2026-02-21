import { IsString, IsNotEmpty, IsOptional, IsObject, IsEnum } from 'class-validator';

export enum WebhookEventType {
    DATABASE_ERROR = 'database_error',
    CRON_FAILURE = 'cron_failure',
    API_ERROR = 'api_error',
    WEBHOOK_FAILURE = 'webhook_failure',
    DEPLOYMENT_FAILED = 'deployment_failed',
    HIGH_MEMORY = 'high_memory',
    HIGH_CPU = 'high_cpu',
    DISK_FULL = 'disk_full',
}

export enum WebhookSeverity {
    CRITICAL = 'critical',
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
}

export class IncomingWebhookDto {
    @IsString()
    @IsNotEmpty()
    orgId: string;

    @IsString()
    @IsNotEmpty()
    source: string;

    @IsEnum(WebhookEventType)
    @IsNotEmpty()
    type: WebhookEventType;

    @IsEnum(WebhookSeverity)
    @IsOptional()
    severity?: WebhookSeverity;

    @IsString()
    @IsNotEmpty()
    message: string;

    @IsString()
    @IsOptional()
    timestamp?: string;

    @IsString()
    @IsOptional()
    idempotencyKey?: string;

    @IsString()
    @IsOptional()
    correlationKey?: string;

    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;
}