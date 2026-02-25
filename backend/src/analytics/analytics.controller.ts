import { Controller, Get, Query, BadRequestException, Post, Res } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ReportsService } from './reports.service';
import type { Response } from 'express';
import { parse } from 'json2csv';


@Controller('analytics')
export class AnalyticsController {
    constructor(
        private readonly analyticsService: AnalyticsService,
        private readonly reportsService: ReportsService,
    ) { }

    /**
     * GET /analytics/sla?orgId=xxx&startDate=2026-01-01&endDate=2026-02-01
     * Get SLA compliance metrics
     */
    @Get('sla')
    async getSLAMetrics(
        @Query('orgId') orgId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        if (!orgId) {
            throw new BadRequestException('orgId is required');
        }

        // Default to last 30 days
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        return this.analyticsService.getSLAMetrics(orgId, start, end);
    }

    /**
     * GET /analytics/root-causes?orgId=xxx&startDate=2026-01-01&endDate=2026-02-01
     * Get root cause distribution
     */
    @Get('root-causes')
    async getRootCauseStats(
        @Query('orgId') orgId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        if (!orgId) {
            throw new BadRequestException('orgId is required');
        }

        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        return this.analyticsService.getRootCauseStats(orgId, start, end);
    }

    /**
     * GET /analytics/team-performance?orgId=xxx&startDate=2026-01-01&endDate=2026-02-01
     * Get team performance metrics
     */
    @Get('team-performance')
    async getTeamPerformance(
        @Query('orgId') orgId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        if (!orgId) {
            throw new BadRequestException('orgId is required');
        }

        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        return this.analyticsService.getTeamPerformance(orgId, start, end);
    }

    /**
     * GET /analytics/trend?orgId=xxx&days=30
     * Get incident trend data for charts
     */
    @Get('trend')
    async getIncidentTrend(
        @Query('orgId') orgId: string,
        @Query('days') days?: string,
    ) {
        if (!orgId) {
            throw new BadRequestException('orgId is required');
        }

        const daysNum = days ? parseInt(days, 10) : 30;

        return this.analyticsService.getIncidentTrend(orgId, daysNum);
    }
    /**
       * POST /analytics/send-test-report?orgId=xxx
       * Manually trigger a test report
       */
    @Post('send-test-report')
    async sendTestReport(@Query('orgId') orgId: string) {
        if (!orgId) {
            throw new BadRequestException('orgId is required');
        }

        return this.reportsService.sendTestReport(orgId);
    }


    /**
   * GET /analytics/export?orgId=xxx&type=sla&startDate=xxx&endDate=xxx
   * Export analytics data as CSV
   */
    @Get('export')
    async exportData(
        @Query('orgId') orgId: string,
        @Query('type') type: 'sla' | 'root-causes' | 'team-performance',
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Res() res?: any,
    ) {
        if (!orgId) {
            throw new BadRequestException('orgId is required');
        }

        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        let data: any;
        let filename: string;

        switch (type) {
            case 'sla':
                data = await this.analyticsService.getSLAMetrics(orgId, start, end);
                filename = `sla-metrics-${start.toISOString().split('T')[0]}.csv`;
                // Convert single object to array for CSV
                data = [data];
                break;

            case 'root-causes':
                data = await this.analyticsService.getRootCauseStats(orgId, start, end);
                filename = `root-causes-${start.toISOString().split('T')[0]}.csv`;
                break;

            case 'team-performance':
                data = await this.analyticsService.getTeamPerformance(orgId, start, end);
                filename = `team-performance-${start.toISOString().split('T')[0]}.csv`;
                break;

            default:
                throw new BadRequestException('Invalid export type');
        }

        if (!data || data.length === 0) {
            throw new BadRequestException('No data available for export');
        }

        const csv = parse(data);

        if (res) {
            res.header('Content-Type', 'text/csv');
            res.header('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(csv);
        } else {
            return csv; // fallback if somehow res is not injected
        }
    }
}