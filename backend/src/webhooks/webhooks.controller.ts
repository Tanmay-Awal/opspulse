import {
    Controller,
    Post,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { IncomingWebhookDto } from './dto';
import { WebhookSignatureGuard } from './guards/webhook-signature.guard';

@Controller('webhooks')
export class WebhooksController {
    constructor(private readonly webhooksService: WebhooksService) { }

    /**
     * POST /webhooks/incidents
     * Receive incident events from external systems
     * 
     * Headers required:
     * - X-OpsPulse-Signature: sha256=<hmac>
     * - Content-Type: application/json
     */
    @Post('incidents')
    @HttpCode(HttpStatus.OK)
    @UseGuards(WebhookSignatureGuard)
    async receiveIncident(@Body() webhookDto: IncomingWebhookDto) {
        // orgId is extracted from body and validated by guard
        const orgId = (webhookDto as any).orgId;

        return this.webhooksService.processIncomingWebhook(orgId, webhookDto);
    }
}