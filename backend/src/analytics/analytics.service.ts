import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SLAMetrics {
    totalIncidents: number;
    p1Count: number;
    p2Count: number;
    p3Count: number;
    p4Count: number;
    acknowledgedOnTime: number;
    acknowledgedLate: number;
    resolvedOnTime: number;
    resolvedLate: number;
    avgAcknowledgmentTimeMinutes: number;
    avgResolutionTimeMinutes: number;
    slaComplianceRate: number;
}

export interface RootCauseStats {
    category: string;
    count: number;
    percentage: number;
}

export interface TeamPerformance {
    userId: string;
    userName: string;
    incidentsHandled: number;
    avgAcknowledgmentMinutes: number;
    avgResolutionMinutes: number;
    slaComplianceRate: number;
}

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get SLA metrics for a date range
     */
    async getSLAMetrics(orgId: string, startDate: Date, endDate: Date): Promise<SLAMetrics> {
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

        // Count by priority
        const p1Count = incidents.filter((i) => i.priority === 'p1_critical').length;
        const p2Count = incidents.filter((i) => i.priority === 'p2_high').length;
        const p3Count = incidents.filter((i) => i.priority === 'p3_medium').length;
        const p4Count = incidents.filter((i) => i.priority === 'p4_low').length;

        // SLA policies (in minutes)
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
            const policy = slaPolicies[incident.priority as keyof typeof slaPolicies];

            // Acknowledgment SLA
            if (incident.acknowledgedAt) {
                const ackTime =
                    (new Date(incident.acknowledgedAt).getTime() - new Date(incident.createdAt).getTime()) /
                    60000;
                totalAckTime += ackTime;
                ackCount++;

                if (ackTime <= policy.ack) {
                    acknowledgedOnTime++;
                } else {
                    acknowledgedLate++;
                }
            }

            // Resolution SLA
            if (incident.resolvedAt) {
                const resolveTime =
                    (new Date(incident.resolvedAt).getTime() - new Date(incident.createdAt).getTime()) /
                    60000;
                totalResolveTime += resolveTime;
                resolveCount++;

                if (resolveTime <= policy.resolve) {
                    resolvedOnTime++;
                } else {
                    resolvedLate++;
                }
            }
        }

        const avgAcknowledgmentTimeMinutes = ackCount > 0 ? totalAckTime / ackCount : 0;
        const avgResolutionTimeMinutes = resolveCount > 0 ? totalResolveTime / resolveCount : 0;
        const slaComplianceRate =
            ackCount > 0 ? (acknowledgedOnTime / ackCount) * 100 : 0;

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

    /**
     * Get root cause distribution
     */
    async getRootCauseStats(
        orgId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<RootCauseStats[]> {
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

        const categoryCounts: Record<string, number> = {};
        const total = incidents.length;

        incidents.forEach((incident) => {
            const category = incident.rootCauseCategory!;
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

    /**
     * Get team performance metrics
     */
    async getTeamPerformance(
        orgId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<TeamPerformance[]> {
        const users = await this.prisma.user.findMany({
            where: { orgId, isActive: true },
            select: { id: true, name: true },
        });

        const performance: TeamPerformance[] = [];

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

            if (incidents.length === 0) continue;

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
                    const ackTime =
                        (new Date(incident.acknowledgedAt).getTime() -
                            new Date(incident.createdAt).getTime()) /
                        60000;
                    totalAckTime += ackTime;
                    ackCount++;

                    const policy = slaPolicies[incident.priority as keyof typeof slaPolicies];
                    if (ackTime <= policy.ack) {
                        ackOnTime++;
                    }
                }

                if (incident.resolvedAt) {
                    const resolveTime =
                        (new Date(incident.resolvedAt).getTime() -
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

    /**
     * Get incident trend data (for charts)
     */
    async getIncidentTrend(orgId: string, days: number = 30) {
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

        // Group by day
        const trendData: Record<string, { date: string; p1: number; p2: number; p3: number; p4: number }> = {};

        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            trendData[dateStr] = { date: dateStr, p1: 0, p2: 0, p3: 0, p4: 0 };
        }

        incidents.forEach((incident) => {
            const dateStr = new Date(incident.createdAt).toISOString().split('T')[0];
            if (trendData[dateStr]) {
                if (incident.priority === 'p1_critical') trendData[dateStr].p1++;
                if (incident.priority === 'p2_high') trendData[dateStr].p2++;
                if (incident.priority === 'p3_medium') trendData[dateStr].p3++;
                if (incident.priority === 'p4_low') trendData[dateStr].p4++;
            }
        });

        return Object.values(trendData).reverse();
    }
}