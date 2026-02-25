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
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSLAMetrics(orgId: string, startDate: Date, endDate: Date): Promise<SLAMetrics>;
    getRootCauseStats(orgId: string, startDate: Date, endDate: Date): Promise<RootCauseStats[]>;
    getTeamPerformance(orgId: string, startDate: Date, endDate: Date): Promise<TeamPerformance[]>;
    getIncidentTrend(orgId: string, days?: number): Promise<{
        date: string;
        p1: number;
        p2: number;
        p3: number;
        p4: number;
    }[]>;
}
