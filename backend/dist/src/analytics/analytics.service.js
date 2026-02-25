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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSLAMetrics(orgId, startDate, endDate) {
        const incidents = await this.prisma.incident.findMany({
            where: {
                orgId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
        const totalIncidents = incidents.length;
        const p1Count = incidents.filter((i) => i.priority === 'p1_critical').length;
        const p2Count = incidents.filter((i) => i.priority === 'p2_high').length;
        const p3Count = incidents.filter((i) => i.priority === 'p3_medium').length;
        const p4Count = incidents.filter((i) => i.priority === 'p4_low').length;
        const slaPolicies = {
            p1_critical: { ack: 10, resolve: 60 },
            p2_high: { ack: 30, resolve: 240 },
            p3_medium: { ack: 240, resolve: 1440 },
            p4_low: { ack: 1440, resolve: 4320 },
        };
        let acknowledgedOnTime = 0;
        let acknowledgedLate = 0;
        let resolvedOnTime = 0;
        let resolvedLate = 0;
        let totalAckTime = 0;
        let totalResolveTime = 0;
        let ackCount = 0;
        let resolveCount = 0;
        for (const incident of incidents) {
            const policy = slaPolicies[incident.priority];
            if (incident.acknowledgedAt) {
                const ackTime = (new Date(incident.acknowledgedAt).getTime() - new Date(incident.createdAt).getTime()) /
                    60000;
                totalAckTime += ackTime;
                ackCount++;
                if (ackTime <= policy.ack) {
                    acknowledgedOnTime++;
                }
                else {
                    acknowledgedLate++;
                }
            }
            if (incident.resolvedAt) {
                const resolveTime = (new Date(incident.resolvedAt).getTime() - new Date(incident.createdAt).getTime()) /
                    60000;
                totalResolveTime += resolveTime;
                resolveCount++;
                if (resolveTime <= policy.resolve) {
                    resolvedOnTime++;
                }
                else {
                    resolvedLate++;
                }
            }
        }
        const avgAcknowledgmentTimeMinutes = ackCount > 0 ? totalAckTime / ackCount : 0;
        const avgResolutionTimeMinutes = resolveCount > 0 ? totalResolveTime / resolveCount : 0;
        const slaComplianceRate = ackCount > 0 ? (acknowledgedOnTime / ackCount) * 100 : 0;
        return {
            totalIncidents,
            p1Count,
            p2Count,
            p3Count,
            p4Count,
            acknowledgedOnTime,
            acknowledgedLate,
            resolvedOnTime,
            resolvedLate,
            avgAcknowledgmentTimeMinutes: Math.round(avgAcknowledgmentTimeMinutes),
            avgResolutionTimeMinutes: Math.round(avgResolutionTimeMinutes),
            slaComplianceRate: Math.round(slaComplianceRate * 10) / 10,
        };
    }
    async getRootCauseStats(orgId, startDate, endDate) {
        const incidents = await this.prisma.incident.findMany({
            where: {
                orgId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                rootCauseCategory: {
                    not: null,
                },
            },
            select: {
                rootCauseCategory: true,
            },
        });
        const categoryCounts = {};
        const total = incidents.length;
        incidents.forEach((incident) => {
            const category = incident.rootCauseCategory;
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        return Object.entries(categoryCounts)
            .map(([category, count]) => ({
            category,
            count,
            percentage: Math.round((count / total) * 1000) / 10,
        }))
            .sort((a, b) => b.count - a.count);
    }
    async getTeamPerformance(orgId, startDate, endDate) {
        const users = await this.prisma.user.findMany({
            where: { orgId, isActive: true },
            select: { id: true, name: true },
        });
        const performance = [];
        for (const user of users) {
            const incidents = await this.prisma.incident.findMany({
                where: {
                    orgId,
                    acknowledgedBy: user.id,
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            });
            if (incidents.length === 0)
                continue;
            let totalAckTime = 0;
            let totalResolveTime = 0;
            let ackOnTime = 0;
            let ackCount = 0;
            let resolveCount = 0;
            const slaPolicies = {
                p1_critical: { ack: 10 },
                p2_high: { ack: 30 },
                p3_medium: { ack: 240 },
                p4_low: { ack: 1440 },
            };
            for (const incident of incidents) {
                if (incident.acknowledgedAt) {
                    const ackTime = (new Date(incident.acknowledgedAt).getTime() -
                        new Date(incident.createdAt).getTime()) /
                        60000;
                    totalAckTime += ackTime;
                    ackCount++;
                    const policy = slaPolicies[incident.priority];
                    if (ackTime <= policy.ack) {
                        ackOnTime++;
                    }
                }
                if (incident.resolvedAt) {
                    const resolveTime = (new Date(incident.resolvedAt).getTime() -
                        new Date(incident.createdAt).getTime()) /
                        60000;
                    totalResolveTime += resolveTime;
                    resolveCount++;
                }
            }
            performance.push({
                userId: user.id,
                userName: user.name,
                incidentsHandled: incidents.length,
                avgAcknowledgmentMinutes: ackCount > 0 ? Math.round(totalAckTime / ackCount) : 0,
                avgResolutionMinutes: resolveCount > 0 ? Math.round(totalResolveTime / resolveCount) : 0,
                slaComplianceRate: ackCount > 0 ? Math.round((ackOnTime / ackCount) * 1000) / 10 : 0,
            });
        }
        return performance.sort((a, b) => b.incidentsHandled - a.incidentsHandled);
    }
    async getIncidentTrend(orgId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const incidents = await this.prisma.incident.findMany({
            where: {
                orgId,
                createdAt: {
                    gte: startDate,
                },
            },
            select: {
                createdAt: true,
                priority: true,
            },
        });
        const trendData = {};
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            trendData[dateStr] = { date: dateStr, p1: 0, p2: 0, p3: 0, p4: 0 };
        }
        incidents.forEach((incident) => {
            const dateStr = new Date(incident.createdAt).toISOString().split('T')[0];
            if (trendData[dateStr]) {
                if (incident.priority === 'p1_critical')
                    trendData[dateStr].p1++;
                if (incident.priority === 'p2_high')
                    trendData[dateStr].p2++;
                if (incident.priority === 'p3_medium')
                    trendData[dateStr].p3++;
                if (incident.priority === 'p4_low')
                    trendData[dateStr].p4++;
            }
        });
        return Object.values(trendData).reverse();
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map