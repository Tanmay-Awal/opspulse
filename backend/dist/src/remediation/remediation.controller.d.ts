import { RemediationService } from './remediation.service';
export declare class RemediationController {
    private readonly remediationService;
    constructor(remediationService: RemediationService);
    analyzeIncident(incidentId: string): Promise<{
        hasPlaybook: boolean;
        aiAnalysis: import("./services/ai-analyzer.service").AnalysisResult;
        message: string;
        executionId?: undefined;
        playbook?: undefined;
        remediationPlan?: undefined;
        matchConfidence?: undefined;
        overallConfidence?: undefined;
    } | {
        hasPlaybook: boolean;
        executionId: string;
        playbook: {
            id: any;
            name: any;
            description: any;
        };
        aiAnalysis: import("./services/ai-analyzer.service").AnalysisResult;
        remediationPlan: import("./services/ai-analyzer.service").RemediationPlan;
        matchConfidence: number;
        overallConfidence: number | null;
        message?: undefined;
    }>;
    executeRemediation(executionId: string, body: {
        approvedBy?: string;
    }): Promise<{
        success: boolean;
        executionId: string;
        status: string;
    }>;
    rejectRemediation(executionId: string, body: {
        rejectedBy: string;
        reason?: string;
    }): Promise<{
        message: string;
    }>;
    rollbackRemediation(executionId: string, body: {
        rolledBackBy: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getExecution(executionId: string): Promise<{
        execution: {
            error: string | null;
            id: string;
            createdAt: Date;
            status: string;
            incidentId: string;
            playbookId: string | null;
            triggeredBy: string;
            aiAnalysis: string | null;
            aiPlan: string | null;
            executionLog: import("@prisma/client/runtime/library").JsonValue | null;
            confidenceScore: number | null;
            approvedBy: string | null;
            approvedAt: Date | null;
            rejectedBy: string | null;
            rejectedAt: Date | null;
            completedAt: Date | null;
        };
        playbook: {
            id: string;
            name: string;
            description: string | null;
        } | null;
        steps: {
            error: string | null;
            id: string;
            status: string;
            timestamp: Date;
            output: import("@prisma/client/runtime/library").JsonValue | null;
            durationMs: number | null;
            executionId: string;
            stepIndex: number;
            stepType: string;
            input: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    }>;
    learnFromResolution(incidentId: string, body: {
        learnedBy: string;
        playbookName: string;
        description: string;
        steps: any[];
        triggerConditions: any;
    }): Promise<{
        message: string;
        playbook: {
            id: string;
            name: string;
            createdAt: Date;
            orgId: string;
            isActive: boolean;
            updatedAt: Date;
            description: string | null;
            triggerConditions: import("@prisma/client/runtime/library").JsonValue;
            steps: import("@prisma/client/runtime/library").JsonValue;
            successCount: number;
            failureCount: number;
        };
    }>;
    suggestPlaybook(incidentId: string): Promise<{
        suggested: boolean;
        playbook: any;
        confidence: number;
    }>;
    getPlaybooks(orgId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        orgId: string;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        triggerConditions: import("@prisma/client/runtime/library").JsonValue;
        steps: import("@prisma/client/runtime/library").JsonValue;
        successCount: number;
        failureCount: number;
    }[]>;
    providePlaybookFeedback(playbookId: string, body: {
        outcome: 'success' | 'failure';
        notes: string;
        suggestedChanges?: any;
    }): Promise<{
        message: string;
    }>;
}
