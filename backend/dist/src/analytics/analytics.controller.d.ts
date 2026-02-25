import { AnalyticsService } from './analytics.service';
import { ReportsService } from './reports.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    private readonly reportsService;
    constructor(analyticsService: AnalyticsService, reportsService: ReportsService);
    getSLAMetrics(orgId: string, startDate?: string, endDate?: string): Promise<import("./analytics.service").SLAMetrics>;
    getRootCauseStats(orgId: string, startDate?: string, endDate?: string): Promise<import("./analytics.service").RootCauseStats[]>;
    getTeamPerformance(orgId: string, startDate?: string, endDate?: string): Promise<import("./analytics.service").TeamPerformance[]>;
    getIncidentTrend(orgId: string, days?: string): Promise<{
        date: string;
        p1: number;
        p2: number;
        p3: number;
        p4: number;
    }[]>;
    sendTestReport(orgId: string): Promise<{
        message: string;
    }>;
    exportData(orgId: string, type: 'sla' | 'root-causes' | 'team-performance', startDate?: string, endDate?: string, res?: any): Promise<string | undefined>;
}
