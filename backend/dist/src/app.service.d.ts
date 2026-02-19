import { PrismaService } from './prisma/prisma.service';
export declare class AppService {
    private prisma;
    constructor(prisma: PrismaService);
    getHealth(): Promise<{
        status: string;
        timestamp: string;
        database: string;
        service: string;
        error?: undefined;
    } | {
        status: string;
        timestamp: string;
        database: string;
        error: any;
        service?: undefined;
    }>;
}
