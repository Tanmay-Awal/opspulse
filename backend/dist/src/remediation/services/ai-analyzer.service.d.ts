import { ConfigService } from '@nestjs/config';
export interface AnalysisResult {
    analysis: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    suggestedActions: string[];
    confidence: number;
    canAutoRemediate: boolean;
    reasoning: string;
}
export interface RemediationPlan {
    plan: string;
    steps: Array<{
        stepNumber: number;
        action: string;
        expectedOutcome: string;
        risk: 'low' | 'medium' | 'high';
    }>;
    estimatedTime: string;
    confidence: number;
    warnings: string[];
}
export declare class AiAnalyzerService {
    private configService;
    private openai;
    constructor(configService: ConfigService);
    analyzeIncident(incident: any): Promise<AnalysisResult>;
    generateRemediationPlan(incident: any, playbook: any): Promise<RemediationPlan>;
    private buildAnalysisPrompt;
}
