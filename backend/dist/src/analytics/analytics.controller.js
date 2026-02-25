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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const reports_service_1 = require("./reports.service");
const json2csv_1 = require("json2csv");
let AnalyticsController = class AnalyticsController {
    analyticsService;
    reportsService;
    constructor(analyticsService, reportsService) {
        this.analyticsService = analyticsService;
        this.reportsService = reportsService;
    }
    async getSLAMetrics(orgId, startDate, endDate) {
        if (!orgId) {
            throw new common_1.BadRequestException('orgId is required');
        }
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return this.analyticsService.getSLAMetrics(orgId, start, end);
    }
    async getRootCauseStats(orgId, startDate, endDate) {
        if (!orgId) {
            throw new common_1.BadRequestException('orgId is required');
        }
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return this.analyticsService.getRootCauseStats(orgId, start, end);
    }
    async getTeamPerformance(orgId, startDate, endDate) {
        if (!orgId) {
            throw new common_1.BadRequestException('orgId is required');
        }
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return this.analyticsService.getTeamPerformance(orgId, start, end);
    }
    async getIncidentTrend(orgId, days) {
        if (!orgId) {
            throw new common_1.BadRequestException('orgId is required');
        }
        const daysNum = days ? parseInt(days, 10) : 30;
        return this.analyticsService.getIncidentTrend(orgId, daysNum);
    }
    async sendTestReport(orgId) {
        if (!orgId) {
            throw new common_1.BadRequestException('orgId is required');
        }
        return this.reportsService.sendTestReport(orgId);
    }
    async exportData(orgId, type, startDate, endDate, res) {
        if (!orgId) {
            throw new common_1.BadRequestException('orgId is required');
        }
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        let data;
        let filename;
        switch (type) {
            case 'sla':
                data = await this.analyticsService.getSLAMetrics(orgId, start, end);
                filename = `sla-metrics-${start.toISOString().split('T')[0]}.csv`;
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
                throw new common_1.BadRequestException('Invalid export type');
        }
        if (!data || data.length === 0) {
            throw new common_1.BadRequestException('No data available for export');
        }
        const csv = (0, json2csv_1.parse)(data);
        if (res) {
            res.header('Content-Type', 'text/csv');
            res.header('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(csv);
        }
        else {
            return csv;
        }
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('sla'),
    __param(0, (0, common_1.Query)('orgId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSLAMetrics", null);
__decorate([
    (0, common_1.Get)('root-causes'),
    __param(0, (0, common_1.Query)('orgId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getRootCauseStats", null);
__decorate([
    (0, common_1.Get)('team-performance'),
    __param(0, (0, common_1.Query)('orgId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTeamPerformance", null);
__decorate([
    (0, common_1.Get)('trend'),
    __param(0, (0, common_1.Query)('orgId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getIncidentTrend", null);
__decorate([
    (0, common_1.Post)('send-test-report'),
    __param(0, (0, common_1.Query)('orgId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "sendTestReport", null);
__decorate([
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Query)('orgId')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "exportData", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService,
        reports_service_1.ReportsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map