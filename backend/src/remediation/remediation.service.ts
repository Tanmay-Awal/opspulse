import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiAnalyzerService } from './services/ai-analyzer.service';
import { PlaybookMatcherService } from './services/playbook-matcher.service';
import { ExecutionEngineService } from './services/execution-engine.service';
import { AuditService, AuditAction } from '../audit/audit.service';

@Injectable()
export class RemediationService {
    constructor(
        private prisma: PrismaService,
        private aiAnalyzer: AiAnalyzerService,
        private playbookMatcher: PlaybookMatcherService,
        private executionEngine: ExecutionEngineService,
        private auditService: AuditService,
    ) { }

    /**
     * Analyze incident and propose remediation
     */
    async analyzeAndPropose(incidentId: string) {
        console.log(`\n🤖 Starting AI analysis for incident ${incidentId.substring(0, 8)}...`);

        // Get incident
        const incident = await this.prisma.incident.findUnique({
            where: { id: incidentId },
            include: {
                organization: { select: { id: true, name: true } },
            },
        });

        if (!incident) {
            throw new Error('Incident not found');
        }

        // Step 1: AI Analysis
        const aiAnalysis = await this.aiAnalyzer.analyzeIncident(incident);

        // Step 2: Find matching playbooks
        const matches = await this.playbookMatcher.findMatchingPlaybooks(incident);

        if (matches.length === 0) {
            console.log('⚠️  No matching playbooks found');
            return {
                hasPlaybook: false,
                aiAnalysis,
                message: 'No automated remediation available',
            };
        }

        // Step 3: Get best match
        const bestMatch = matches[0];
        const playbook = bestMatch.playbook;

        // Step 4: Generate remediation plan
        const remediationPlan = await this.aiAnalyzer.generateRemediationPlan(
            incident,
            playbook,
        );

        // Step 5: Create execution record (pending approval)
        const execution = await this.prisma.remediationExecution.create({
            data: {
                incidentId,
                playbookId: playbook.id,
                triggeredBy: 'auto',
                status: 'pending',
                aiAnalysis: aiAnalysis.analysis,
                aiPlan: remediationPlan.plan,
                confidenceScore: (bestMatch.confidence + aiAnalysis.confidence) / 2,
            },
        });

        console.log('✅ Remediation proposal created');

        return {
            hasPlaybook: true,
            executionId: execution.id,
            playbook: {
                id: playbook.id,
                name: playbook.name,
                description: playbook.description,
            },
            aiAnalysis,
            remediationPlan,
            matchConfidence: bestMatch.confidence,
            overallConfidence: execution.confidenceScore,
        };
    }

    /**
     * Execute remediation (after approval)
     */
    async executeRemediation(executionId: string, approvedBy?: string) {
        console.log(`\n⚙️  Executing remediation ${executionId.substring(0, 8)}...`);

        // Get execution
        const execution = await this.prisma.remediationExecution.findUnique({
            where: { id: executionId },
        });

        if (!execution) {
            throw new Error('Execution not found');
        }

        if (execution.status !== 'pending') {
            throw new Error(`Cannot execute: status is ${execution.status}`);
        }

        if (!execution.playbookId) {
            throw new Error('Execution has no playbook associated');
        }

        // Get playbook
        const playbook = await this.prisma.remediationPlaybook.findUnique({
            where: { id: execution.playbookId },
        });

        if (!playbook) {
            throw new Error('Playbook not found');
        }

        // Update status to executing
        await this.prisma.remediationExecution.update({
            where: { id: executionId },
            data: {
                status: 'executing',
                approvedBy: approvedBy || null,
                approvedAt: new Date(),
            },
        });

        // Execute playbook
        const success = await this.executionEngine.executePlaybook(
            executionId,
            playbook,
        );

        // Update final status
        const finalStatus = success ? 'completed' : 'failed';
        await this.prisma.remediationExecution.update({
            where: { id: executionId },
            data: {
                status: finalStatus,
                completedAt: new Date(),
            },
        });

        // Update playbook stats
        if (success) {
            await this.prisma.remediationPlaybook.update({
                where: { id: playbook.id },
                data: { successCount: { increment: 1 } },
            });
        } else {
            await this.prisma.remediationPlaybook.update({
                where: { id: playbook.id },
                data: { failureCount: { increment: 1 } },
            });
        }

        // Audit log
        await this.auditService.log({
            incidentId: execution.incidentId,
            action: 'remediation_executed' as any,
            actorEmail: approvedBy || 'system',
            toValue: {
                executionId,
                playbookName: playbook.name,
                status: finalStatus,
            },
        });

        console.log(`✅ Remediation ${finalStatus}`);

        return {
            success,
            executionId,
            status: finalStatus,
        };
    }

    /**
     * Reject remediation
     */
    async rejectRemediation(executionId: string, rejectedBy: string, reason?: string) {
        console.log(`\n❌ Rejecting remediation ${executionId.substring(0, 8)}...`);

        const execution = await this.prisma.remediationExecution.findUnique({
            where: { id: executionId },
        });

        if (!execution) {
            throw new Error('Execution not found');
        }

        await this.prisma.remediationExecution.update({
            where: { id: executionId },
            data: {
                status: 'rejected',
                rejectedBy,
                rejectedAt: new Date(),
                error: reason,
            },
        });

        // Store feedback
        await this.prisma.playbookFeedback.create({
            data: {
                executionId,
                outcome: 'rollback',
                feedbackNote: reason,
                createdBy: rejectedBy,
            },
        });

        // Audit log
        await this.auditService.log({
            incidentId: execution.incidentId,
            action: 'remediation_rejected' as any,
            actorEmail: rejectedBy,
            toValue: { reason },
        });

        console.log('✅ Remediation rejected');

        return { message: 'Remediation rejected' };
    }

    /**
     * Rollback remediation
     */
    async rollbackRemediation(executionId: string, rolledBackBy: string) {
        console.log(`\n🔄 Rolling back remediation ${executionId.substring(0, 8)}...`);

        const execution = await this.prisma.remediationExecution.findUnique({
            where: { id: executionId },
        });

        if (!execution) {
            throw new Error('Execution not found');
        }

        if (execution.status !== 'completed') {
            throw new Error('Can only rollback completed executions');
        }

        // Execute rollback
        const success = await this.executionEngine.rollback(executionId);

        // Update status
        await this.prisma.remediationExecution.update({
            where: { id: executionId },
            data: {
                status: 'rolled_back',
                error: 'Manually rolled back',
            },
        });

        // Store feedback
        await this.prisma.playbookFeedback.create({
            data: {
                executionId,
                outcome: 'rollback',
                feedbackNote: 'Manual rollback',
                createdBy: rolledBackBy,
            },
        });

        // Audit log
        await this.auditService.log({
            incidentId: execution.incidentId,
            action: 'remediation_rolled_back' as any,
            actorEmail: rolledBackBy,
            toValue: { executionId },
        });

        console.log('✅ Rollback complete');

        return { success, message: 'Rollback complete' };
    }

    /**
     * Get execution details
     */
    async getExecution(executionId: string) {
        const execution = await this.prisma.remediationExecution.findUnique({
            where: { id: executionId },
        });

        if (!execution) {
            throw new Error('Execution not found');
        }

        // Get step logs
        const steps = await this.prisma.remediationStepLog.findMany({
            where: { executionId },
            orderBy: { stepIndex: 'asc' },
        });

        // Get playbook
        const playbook = execution.playbookId
            ? await this.prisma.remediationPlaybook.findUnique({
                where: { id: execution.playbookId as string },
                select: { id: true, name: true, description: true },
            })
            : null;

        return {
            execution,
            playbook,
            steps,
        };
    }

    /**
     * Learn from manual resolution - create a new playbook
     */
    async learnFromResolution(
        incidentId: string,
        learnedBy: string,
        data: {
            playbookName: string;
            description: string;
            steps: any[];
            triggerConditions: any;
        },
    ) {
        console.log(`\n🧠 Learning from incident ${incidentId.substring(0, 8)}...`);

        // Get incident
        const incident = await this.prisma.incident.findUnique({
            where: { id: incidentId },
        });

        if (!incident) {
            throw new Error('Incident not found');
        }

        // Check if similar playbook already exists
        const existingPlaybooks = await this.prisma.remediationPlaybook.findMany({
            where: {
                orgId: incident.orgId,
                name: data.playbookName,
            },
        });

        if (existingPlaybooks.length > 0) {
            console.log('⚠️  Similar playbook already exists, updating instead...');

            // Update existing playbook with new steps
            const updatedPlaybook = await this.prisma.remediationPlaybook.update({
                where: { id: existingPlaybooks[0].id },
                data: {
                    description: data.description,
                    steps: data.steps,
                    triggerConditions: data.triggerConditions,
                    updatedAt: new Date(),
                },
            });

            // Audit log
            await this.auditService.log({
                incidentId,
                action: 'playbook_updated' as any,
                actorEmail: learnedBy,
                toValue: {
                    playbookId: updatedPlaybook.id,
                    playbookName: updatedPlaybook.name,
                },
                metadata: {
                    reason: 'learned_from_resolution',
                },
            });

            console.log('✅ Playbook updated with new knowledge');
            return { message: 'Playbook updated', playbook: updatedPlaybook };
        }

        // Create new playbook
        const newPlaybook = await this.prisma.remediationPlaybook.create({
            data: {
                orgId: incident.orgId,
                name: data.playbookName,
                description: data.description,
                triggerConditions: data.triggerConditions,
                steps: data.steps,
                isActive: true,
                successCount: 1, // Start with 1 since it worked for this incident
            },
        });

        // Audit log
        await this.auditService.log({
            incidentId,
            action: 'playbook_created' as any,
            actorEmail: learnedBy,
            toValue: {
                playbookId: newPlaybook.id,
                playbookName: newPlaybook.name,
                learnedFrom: incidentId,
            },
            metadata: {
                triggerConditions: data.triggerConditions,
            },
        });

        console.log('✅ New playbook created from incident resolution');

        return {
            message: 'New playbook created',
            playbook: newPlaybook,
        };
    }

    /**
     * AI suggests a playbook based on resolution notes
     */
    async suggestPlaybookFromResolution(incidentId: string) {
        console.log(`\n🤖 AI generating playbook suggestion from incident...`);

        const incident = await this.prisma.incident.findUnique({
            where: { id: incidentId },
        });

        if (!incident) {
            throw new Error('Incident not found');
        }

        if (!incident.resolutionNotes) {
            throw new Error('Incident must be resolved with notes to generate playbook');
        }

        // Use AI to convert resolution notes into a structured playbook
        const prompt = `
Based on this incident resolution, generate a reusable remediation playbook:

Incident:
- Title: ${incident.title}
- Type: ${incident.eventType}
- Source: ${incident.source}
- Priority: ${incident.priority}
- Root Cause: ${incident.rootCauseCategory || 'Not specified'}
- Resolution Notes: ${incident.resolutionNotes}

Generate a playbook in JSON format with:
1. name: Short descriptive name (e.g., "Restart Database Connection Pool")
2. description: What this playbook does
3. triggerConditions: { eventTypes: [...], sources: [...] }
4. steps: Array of remediation steps with type, name, and config

Step types available:
- http_request: { method, url, headers, body }
- wait: { seconds }
- condition: { check }
- notify: { message }

Respond with ONLY valid JSON.
`;

        try {
            const response = await this.aiAnalyzer['openai'].chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert SRE creating reusable remediation playbooks. Generate actionable, safe automation steps. Respond in JSON format only.',
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
            const suggestion = JSON.parse(content);

            console.log('✅ AI generated playbook suggestion');

            return {
                suggested: true,
                playbook: suggestion,
                confidence: 75, // AI-generated suggestions start with medium confidence
            };
        } catch (error) {
            console.error('❌ AI suggestion failed:', error.message);

            // Fallback: Create basic template from incident data
            return {
                suggested: false,
                playbook: {
                    name: `Fix ${incident.eventType.replace(/_/g, ' ')}`,
                    description: incident.resolutionNotes?.substring(0, 200) || 'Auto-generated from resolution',
                    triggerConditions: {
                        eventTypes: [incident.eventType],
                        sources: [incident.source],
                    },
                    steps: [
                        {
                            type: 'notify',
                            name: 'Manual steps required',
                            config: {
                                message: incident.resolutionNotes,
                            },
                        },
                    ],
                },
                confidence: 50,
            };
        }
    }

    /**
     * Get all playbooks for an organization
     */
    async getPlaybooks(orgId: string) {
        return this.prisma.remediationPlaybook.findMany({
            where: { orgId },
            orderBy: [
                { isActive: 'desc' },
                { successCount: 'desc' },
            ],
        });
    }

    /**
     * Update playbook based on feedback
     */
    async improvePlaybook(
        playbookId: string,
        feedback: {
            outcome: 'success' | 'failure';
            notes: string;
            suggestedChanges?: any;
        },
    ) {
        const playbook = await this.prisma.remediationPlaybook.findUnique({
            where: { id: playbookId },
        });

        if (!playbook) {
            throw new Error('Playbook not found');
        }

        // If consistently failing, mark as inactive for review
        const totalAttempts = playbook.successCount + playbook.failureCount;
        const failureRate = totalAttempts > 0 ? playbook.failureCount / totalAttempts : 0;

        if (failureRate > 0.5 && totalAttempts > 5) {
            console.log(`⚠️  Playbook ${playbook.name} has high failure rate, deactivating...`);

            await this.prisma.remediationPlaybook.update({
                where: { id: playbookId },
                data: { isActive: false },
            });
        }

        // Apply suggested changes if provided
        if (feedback.suggestedChanges) {
            await this.prisma.remediationPlaybook.update({
                where: { id: playbookId },
                data: {
                    steps: feedback.suggestedChanges.steps || playbook.steps,
                    triggerConditions: feedback.suggestedChanges.triggerConditions || playbook.triggerConditions,
                },
            });

            console.log('✅ Playbook improved based on feedback');
        }

        return { message: 'Playbook updated' };
    }
}