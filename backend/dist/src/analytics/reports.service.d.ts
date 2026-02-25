import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from './analytics.service';
import { ConfigService } from '@nestjs/config';
export declare class ReportsService {
    private prisma;
    private analyticsService;
    private configService;
    private slackWebhookUrl;
    constructor(prisma: PrismaService, analyticsService: AnalyticsService, configService: ConfigService);
    sendDailyReport(): Promise<void>;
    private generateAndSendReport;
    private buildSlackMessage;
    private sendToSlack;
    sendTestReport(orgId: string): Promise<{
        message: string;
    }>;
}
