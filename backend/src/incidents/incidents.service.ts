import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto, UpdateIncidentDto, QueryIncidentsDto, IncidentStatus, IncidentPriority } from './dto/index';
@Injectable()
export class IncidentsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Create a new incident
     */
    async create(createIncidentDto: CreateIncidentDto) {
        const { orgId, source, eventType, title, priority, assignedTo, metadata } = createIncidentDto;

        // Validate organization exists
        const org = await this.prisma.organization.findUnique({
            where: { id: orgId },
        });

        if (!org) {
            throw new BadRequestException('Organization not found');
        }

        // If assignedTo is provided, validate user exists
        if (assignedTo) {
            const user = await this.prisma.user.findUnique({
                where: { id: assignedTo },
            });

            if (!user || user.orgId !== orgId) {
                throw new BadRequestException('Assigned user not found or not in organization');
            }
        }

        // Create incident
        const incident = await this.prisma.incident.create({
            data: {
                orgId,
                source,
                eventType,
                title,
                priority,
                status: IncidentStatus.OPEN,
                assignedTo: assignedTo || null,
                metadata: metadata || {},
                eventCount: 1,
            },
            include: {
                organization: {
                    select: { id: true, name: true },
                },
            },
        });

        console.log(`✅ Incident created: #${incident.id.substring(0, 8)}`);

        return incident;
    }

    /**
     * Find all incidents with filtering and pagination
     */
    async findAll(orgId: string, query: QueryIncidentsDto) {
        const { status, priority, assignedTo, page = 1, limit = 20 } = query;

        const where: any = { orgId };

        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (assignedTo) where.assignedTo = assignedTo;

        const [incidents, total] = await Promise.all([
            this.prisma.incident.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    organization: {
                        select: { id: true, name: true },
                    },
                },
            }),
            this.prisma.incident.count({ where }),
        ]);

        return {
            data: incidents,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Find one incident by ID
     */
    async findOne(id: string, orgId: string) {
        const incident = await this.prisma.incident.findFirst({
            where: {
                id,
                orgId, // CRITICAL: Always filter by org for multi-tenancy
            },
            include: {
                organization: {
                    select: { id: true, name: true },
                },
            },
        });

        if (!incident) {
            throw new NotFoundException('Incident not found');
        }

        return incident;
    }

    /**
     * Update incident
     */
    async update(id: string, orgId: string, updateIncidentDto: UpdateIncidentDto) {
        // First check if incident exists and belongs to org
        const existingIncident = await this.findOne(id, orgId);

        const { status, assignedTo, rootCauseCategory, resolutionNotes } = updateIncidentDto;

        // Build update data
        const updateData: any = {};

        if (status) {
            // Validate state transition (we'll add full state machine later)
            this.validateStatusTransition(existingIncident.status, status);
            updateData.status = status;

            // If transitioning to acknowledged
            if (status === IncidentStatus.ACKNOWLEDGED && !existingIncident.acknowledgedAt) {
                updateData.acknowledgedAt = new Date();
                // We'll add acknowledgedBy once we have auth
            }

            // If transitioning to resolved
            if (status === IncidentStatus.RESOLVED && !existingIncident.resolvedAt) {
                updateData.resolvedAt = new Date();
                // We'll add resolvedBy once we have auth
            }
        }

        if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
        if (rootCauseCategory) updateData.rootCauseCategory = rootCauseCategory;
        if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;

        // Update incident
        const updatedIncident = await this.prisma.incident.update({
            where: { id },
            data: updateData,
            include: {
                organization: {
                    select: { id: true, name: true },
                },
            },
        });

        console.log(`✅ Incident updated: #${id.substring(0, 8)} → ${status || 'metadata updated'}`);

        return updatedIncident;
    }

    /**
     * Basic state transition validation
     */
    private validateStatusTransition(currentStatus: string, newStatus: string) {
        const validTransitions: Record<string, string[]> = {
            [IncidentStatus.OPEN]: [IncidentStatus.ACKNOWLEDGED, IncidentStatus.RESOLVED],
            [IncidentStatus.ACKNOWLEDGED]: [IncidentStatus.INVESTIGATING, IncidentStatus.RESOLVED],
            [IncidentStatus.INVESTIGATING]: [IncidentStatus.RESOLVED],
            [IncidentStatus.RESOLVED]: [IncidentStatus.CLOSED, IncidentStatus.OPEN], // Can reopen
            [IncidentStatus.CLOSED]: [IncidentStatus.OPEN], // Can reopen from archive
        };

        const allowed = validTransitions[currentStatus] || [];

        if (!allowed.includes(newStatus)) {
            throw new BadRequestException(
                `Invalid status transition: ${currentStatus} → ${newStatus}. Allowed: ${allowed.join(', ')}`,
            );
        }
    }

    /**
     * Delete incident (soft delete by setting status to closed)
     */
    async remove(id: string, orgId: string) {
        await this.findOne(id, orgId); // Verify exists and belongs to org

        const deleted = await this.prisma.incident.update({
            where: { id },
            data: { status: IncidentStatus.CLOSED },
        });

        console.log(`✅ Incident closed: #${id.substring(0, 8)}`);

        return deleted;
    }
}