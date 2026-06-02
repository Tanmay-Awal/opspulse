import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

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

@Injectable()
export class AiAnalyzerService {
    private openai: OpenAI;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        this.openai = new OpenAI({ apiKey });
    }

    /**
     * Analyze an incident using AI
     */
    async analyzeIncident(incident: any): Promise<AnalysisResult> {
        console.log(`\n🤖 AI analyzing incident #${incident.id.substring(0, 8)}...`);

        const prompt = this.buildAnalysisPrompt(incident);

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert Site Reliability Engineer analyzing production incidents. 
Analyze the incident and provide a structured assessment including:
1. Root cause analysis
2. Severity assessment
3. Suggested remediation actions
4. Confidence score (0-100)
5. Whether this can be safely auto-remediated

Respond in JSON format only.`,
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.3,
                max_tokens: 800,
                response_format: { type: 'json_object' },
            });

            const content = response.choices[0].message.content || '{}';
            const parsed = JSON.parse(content);

            console.log(`✅ AI analysis complete (confidence: ${parsed.confidence}%)`);

            return {
                analysis: parsed.analysis || 'Unable to determine root cause',
                severity: parsed.severity || 'medium',
                suggestedActions: parsed.suggestedActions || [],
                confidence: parsed.confidence || 50,
                canAutoRemediate: parsed.canAutoRemediate || false,
                reasoning: parsed.reasoning || '',
            };
        } catch (error) {
            console.error('❌ AI analysis failed:', error.message);
            return {
                analysis: 'AI analysis unavailable',
                severity: 'medium',
                suggestedActions: ['Manual investigation required'],
                confidence: 0,
                canAutoRemediate: false,
                reasoning: 'AI service unavailable',
            };
        }
    }

    /**
     * Generate a remediation plan for a playbook
     */
    async generateRemediationPlan(
        incident: any,
        playbook: any,
    ): Promise<RemediationPlan> {
        console.log(`\n🤖 Generating remediation plan for playbook: ${playbook.name}...`);

        const prompt = `
Incident Details:
- Title: ${incident.title}
- Type: ${incident.eventType}
- Source: ${incident.source}
- Priority: ${incident.priority}
- Metadata: ${JSON.stringify(incident.metadata)}

Playbook: ${playbook.name}
Description: ${playbook.description}
Steps: ${JSON.stringify(playbook.steps, null, 2)}

Generate a human-readable remediation plan explaining:
1. What will be done
2. Expected outcome for each step
3. Risk level for each action
4. Estimated total time
5. Any warnings or precautions

Respond in JSON format.`;

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert SRE creating clear, actionable remediation plans. 
Generate a step-by-step plan that engineers can review and approve.
Respond in JSON format only.`,
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.3,
                max_tokens: 1000,
                response_format: { type: 'json_object' },
            });

            const content = response.choices[0].message.content || '{}';
            const parsed = JSON.parse(content);

            console.log('✅ Remediation plan generated');

            return {
                plan: parsed.plan || 'Execute playbook steps',
                steps: parsed.steps || [],
                estimatedTime: parsed.estimatedTime || 'Unknown',
                confidence: parsed.confidence || 70,
                warnings: parsed.warnings || [],
            };
        } catch (error) {
            console.error('❌ Plan generation failed:', error.message);
            return {
                plan: 'Execute pre-configured playbook steps',
                steps: playbook.steps.map((step: any, idx: number) => ({
                    stepNumber: idx + 1,
                    action: step.name || `Step ${idx + 1}`,
                    expectedOutcome: 'As configured',
                    risk: 'medium',
                })),
                estimatedTime: 'Variable',
                confidence: 50,
                warnings: ['AI plan generation unavailable'],
            };
        }
    }

    /**
     * Build analysis prompt from incident data
     */
    private buildAnalysisPrompt(incident: any): string {
        return `
Analyze this production incident:

Title: ${incident.title}
Event Type: ${incident.eventType}
Source: ${incident.source}
Priority: ${incident.priority}
Created: ${incident.createdAt}
Event Count: ${incident.eventCount} (${incident.eventCount > 1 ? 'recurring' : 'first occurrence'})

${incident.metadata ? `Additional Context:\n${JSON.stringify(incident.metadata, null, 2)}` : ''}

Provide analysis in this JSON format:
{
  "analysis": "Root cause explanation in 2-3 sentences",
  "severity": "low|medium|high|critical",
  "suggestedActions": ["action 1", "action 2", "action 3"],
  "confidence": 85,
  "canAutoRemediate": true|false,
  "reasoning": "Why this can/cannot be auto-remediated"
}`;
    }
}