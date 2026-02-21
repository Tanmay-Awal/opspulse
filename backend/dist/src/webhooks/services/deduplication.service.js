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
exports.DeduplicationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DeduplicationService = class DeduplicationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findDuplicate(orgId, source, eventType, correlationKey) {
        const windowMinutes = 10;
        const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
        const where = {
            orgId,
            source,
            eventType,
            status: {
                in: ['open', 'acknowledged', 'investigating'],
            },
            createdAt: {
                gte: windowStart,
            },
        };
        if (correlationKey) {
            where.metadata = {
                path: ['correlationKey'],
                equals: correlationKey,
            };
        }
        const existingIncident = await this.prisma.incident.findFirst({
            where,
            orderBy: { createdAt: 'desc' },
        });
        if (existingIncident) {
            console.log(`🔁 Deduplication: Found existing incident #${existingIncident.id.substring(0, 8)}`);
            await this.prisma.incident.update({
                where: { id: existingIncident.id },
                data: {
                    eventCount: { increment: 1 },
                },
            });
            return existingIncident;
        }
        console.log('✨ Deduplication: No duplicate found, will create new incident');
        return null;
    }
};
exports.DeduplicationService = DeduplicationService;
exports.DeduplicationService = DeduplicationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeduplicationService);
//# sourceMappingURL=deduplication.service.js.map