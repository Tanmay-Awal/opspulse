import { PrismaService } from '../../prisma/prisma.service';
export declare class ExecutionEngineService {
    private prisma;
    constructor(prisma: PrismaService);
    executePlaybook(executionId: string, playbook: any): Promise<boolean>;
    private executeStep;
    private executeHttpRequest;
    private executeWait;
    private evaluateCondition;
    private executeNotify;
    private logStep;
    rollback(executionId: string): Promise<boolean>;
}
