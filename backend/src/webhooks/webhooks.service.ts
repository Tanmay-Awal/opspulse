import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IncomingWebhookDto } from './dto';
import { DeduplicationService } from './services/deduplication.service';
import { SeverityClassifierService } from './services/severity-classifier.service';
import { OnCallService } from './services/oncall.service';

@Injectable()
export class WebhooksService {
    constructor(
        private prisma: PrismaService,
        private deduplicationService: DeduplicationService,
        private severityClassifier: SeverityClassifierService,
        private onCallService: OnCallService,
    ) { }

    async processIncomingWebhook(orgId: string, webhookDto: IncomingWebhookDto) {
        console.log(`\n🔔 Incoming webhook: ${webhookDto.source} - ${webhookDto.type}`);

        const { source, type, severity, message, correlationKey, idempotencyKey, metadata } =
            webhookDto;

        // Step 1: Check for duplicates
        const existingIncident = await this.deduplicationService.findDuplicate(
            orgId,
            source,
            type,
            correlationKey,
        );

        if (existingIncident) {
            // Log the event but don't create new incident
            await this.prisma.incidentEvent.create({
                data: {
                    incidentId: existingIncident.id,
                    source,
                    eventType: type,
                    message,
                    severity,
                    payload: metadata || {},
                },
            });

            return {
                action: 'deduplicated',
                incidentId: existingIncident.id,
                message: `Event added to existing incident #${existingIncident.id.substring(0, 8)}`,
            };
        }

        // Step 2: Classify severity
        const priority = this.severityClassifier.classify({
            type,
            severity,
            source,
            metadata,
        });

        // Step 3: Get current on-call engineer
        const onCallUserId = await this.onCallService.getCurrentOnCall(orgId);

        // Step 4: Create new incident
        const incident = await this.prisma.incident.create({
            data: {
                orgId,
                source,
                eventType: type,
                title: this.generateTitle(source, type, message),
                priority,
                status: 'open',
                assignedTo: onCallUserId,
                eventCount: 1,
                metadata: {
                    ...(metadata || {}),
                    correlationKey,
                    idempotencyKey,
                },
            },
            include: {
                organization: {
                    select: { id: true, name: true },
                },
            },
        });

        // Step 5: Log the raw event
        await this.prisma.incidentEvent.create({
            data: {
                incidentId: incident.id,
                source,
                eventType: type,
                message,
                severity,
                payload: metadata || {},
            },
        });

        console.log(`✅ Incident created: #${incident.id.substring(0, 8)} (${priority})`);

        // TODO Phase 3: Send notifications here
        // await this.notificationService.notifyIncidentCreated(incident);

        return {
            action: 'created',
            incidentId: incident.id,
            priority,
            assignedTo: onCallUserId,
            message: `New incident created: ${incident.title}`,
        };
    }

    private generateTitle(source: string, type: string, message: string): string {
        // Clean up the message for title (max 100 chars)
        const cleanMessage = message.substring(0, 80);
        return `[${source}] ${type.replace(/_/g, ' ')}: ${cleanMessage}`;
    }
}