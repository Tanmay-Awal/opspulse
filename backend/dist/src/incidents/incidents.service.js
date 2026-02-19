"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const index_1 = require("./dto/index");
let IncidentsService = class IncidentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createIncidentDto) {
        const { orgId, source, eventType, title, priority, assignedTo, metadata } = createIncidentDto;
        const org = await this.prisma.organization.findUnique({
            where: { id: orgId },
        });
        if (!org) {
            throw new common_1.BadRequestException('Organization not found');
        }
        if (assignedTo) {
            const user = await this.prisma.user.findUnique({
                where: { id: assignedTo },
            });
            if (!user || user.orgId !== orgId) {
                throw new common_1.BadRequestException('Assigned user not found or not in organization');
            }
        }
        const incident = await this.prisma.incident.create({
            data: {
                orgId,
                source,
                eventType,
                title,
                priority,
                status: index_1.IncidentStatus.OPEN,
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
    async findAll(orgId, query) {
        const { status, priority, assignedTo, page = 1, limit = 20 } = query;
        const where = { orgId };
        if (status)
            where.status = status;
        if (priority)
            where.priority = priority;
        if (assignedTo)
            where.assignedTo = assignedTo;
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
    async findOne(id, orgId) {
        const incident = await this.prisma.incident.findFirst({
            where: {
                id,
                orgId,
            },
            include: {
                organization: {
                    select: { id: true, name: true },
                },
            },
        });
        if (!incident) {
            throw new common_1.NotFoundException('Incident not found');
        }
        return incident;
    }
    async update(id, orgId, updateIncidentDto) {
        const existingIncident = await this.findOne(id, orgId);
        const { status, assignedTo, rootCauseCategory, resolutionNotes } = updateIncidentDto;
        const updateData = {};
        if (status) {
            this.validateStatusTransition(existingIncident.status, status);
            updateData.status = status;
            if (status === index_1.IncidentStatus.ACKNOWLEDGED && !existingIncident.acknowledgedAt) {
                updateData.acknowledgedAt = new Date();
            }
            if (status === index_1.IncidentStatus.RESOLVED && !existingIncident.resolvedAt) {
                updateData.resolvedAt = new Date();
            }
        }
        if (assignedTo !== undefined)
            updateData.assignedTo = assignedTo;
        if (rootCauseCategory)
            updateData.rootCauseCategory = rootCauseCategory;
        if (resolutionNotes)
            updateData.resolutionNotes = resolutionNotes;
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
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            [index_1.IncidentStatus.OPEN]: [index_1.IncidentStatus.ACKNOWLEDGED, index_1.IncidentStatus.RESOLVED],
            [index_1.IncidentStatus.ACKNOWLEDGED]: [index_1.IncidentStatus.INVESTIGATING, index_1.IncidentStatus.RESOLVED],
            [index_1.IncidentStatus.INVESTIGATING]: [index_1.IncidentStatus.RESOLVED],
            [index_1.IncidentStatus.RESOLVED]: [index_1.IncidentStatus.CLOSED, index_1.IncidentStatus.OPEN],
            [index_1.IncidentStatus.CLOSED]: [index_1.IncidentStatus.OPEN],
        };
        const allowed = validTransitions[currentStatus] || [];
        if (!allowed.includes(newStatus)) {
            throw new common_1.BadRequestException(`Invalid status transition: ${currentStatus} → ${newStatus}. Allowed: ${allowed.join(', ')}`);
        }
    }
    async remove(id, orgId) {
        await this.findOne(id, orgId);
        const deleted = await this.prisma.incident.update({
            where: { id },
            data: { status: index_1.IncidentStatus.CLOSED },
        });
        console.log(`✅ Incident closed: #${id.substring(0, 8)}`);
        return deleted;
    }
};
exports.IncidentsService = IncidentsService;
exports.IncidentsService = IncidentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IncidentsService);
//# sourceMappingURL=incidents.service.js.map