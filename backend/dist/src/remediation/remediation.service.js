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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemediationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_analyzer_service_1 = require("./services/ai-analyzer.service");
const playbook_matcher_service_1 = require("./services/playbook-matcher.service");
const execution_engine_service_1 = require("./services/execution-engine.service");
const audit_service_1 = require("../audit/audit.service");
let RemediationService = class RemediationService {
    prisma;
    aiAnalyzer;
    playbookMatcher;
    executionEngine;
    auditService;
    constructor(prisma, aiAnalyzer, playbookMatcher, executionEngine, auditService) {
        this.prisma = prisma;
        this.aiAnalyzer = aiAnalyzer;
        this.playbookMatcher = playbookMatcher;
        this.executionEngine = executionEngine;
        this.auditService = auditService;
    }
    async analyzeAndPropose(incidentId) {
        console.log(`\n🤖 Starting AI analysis for incident ${incidentId.substring(0, 8)}...`);
        const incident = await this.prisma.incident.findUnique({
            where: { id: incidentId },
            include: {
                organization: { select: { id: true, name: true } },
            },
        });
        if (!incident) {
            throw new Error('Incident not found');
        }
        const aiAnalysis = await this.aiAnalyzer.analyzeIncident(incident);
        const matches = await this.playbookMatcher.findMatchingPlaybooks(incident);
        if (matches.length === 0) {
            console.log('⚠️  No matching playbooks found');
            return {
                hasPlaybook: false,
                aiAnalysis,
                message: 'No automated remediation available',
            };
        }
        const bestMatch = matches[0];
        const playbook = bestMatch.playbook;
        const remediationPlan = await this.aiAnalyzer.generateRemediationPlan(incident, playbook);
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
    async executeRemediation(executionId, approvedBy) {
        console.log(`\n⚙️  Executing remediation ${executionId.substring(0, 8)}...`);
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
        const playbook = await this.prisma.remediationPlaybook.findUnique({
            where: { id: execution.playbookId },
        });
        if (!playbook) {
            throw new Error('Playbook not found');
        }
        await this.prisma.remediationExecution.update({
            where: { id: executionId },
            data: {
                status: 'executing',
                approvedBy: approvedBy || null,
                approvedAt: new Date(),
            },
        });
        const success = await this.executionEngine.executePlaybook(executionId, playbook);
        const finalStatus = success ? 'completed' : 'failed';
        await this.prisma.remediationExecution.update({
            where: { id: executionId },
            data: {
                status: finalStatus,
                completedAt: new Date(),
            },
        });
        if (success) {
            await this.prisma.remediationPlaybook.update({
                where: { id: playbook.id },
                data: { successCount: { increment: 1 } },
            });
        }
        else {
            await this.prisma.remediationPlaybook.update({
                where: { id: playbook.id },
                data: { failureCount: { increment: 1 } },
            });
        }
        await this.auditService.log({
            incidentId: execution.incidentId,
            action: 'remediation_executed',
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
    async rejectRemediation(executionId, rejectedBy, reason) {
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
        await this.prisma.playbookFeedback.create({
            data: {
                executionId,
                outcome: 'rollback',
                feedbackNote: reason,
                createdBy: rejectedBy,
            },
        });
        await this.auditService.log({
            incidentId: execution.incidentId,
            action: 'remediation_rejected',
            actorEmail: rejectedBy,
            toValue: { reason },
        });
        console.log('✅ Remediation rejected');
        return { message: 'Remediation rejected' };
    }
    async rollbackRemediation(executionId, rolledBackBy) {
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
        const success = await this.executionEngine.rollback(executionId);
        await this.prisma.remediationExecution.update({
            where: { id: executionId },
            data: {
                status: 'rolled_back',
                error: 'Manually rolled back',
            },
        });
        await this.prisma.playbookFeedback.create({
            data: {
                executionId,
                outcome: 'rollback',
                feedbackNote: 'Manual rollback',
                createdBy: rolledBackBy,
            },
        });
        await this.auditService.log({
            incidentId: execution.incidentId,
            action: 'remediation_rolled_back',
            actorEmail: rolledBackBy,
            toValue: { executionId },
        });
        console.log('✅ Rollback complete');
        return { success, message: 'Rollback complete' };
    }
    async getExecution(executionId) {
        const execution = await this.prisma.remediationExecution.findUnique({
            where: { id: executionId },
        });
        if (!execution) {
            throw new Error('Execution not found');
        }
        const steps = await this.prisma.remediationStepLog.findMany({
            where: { executionId },
            orderBy: { stepIndex: 'asc' },
        });
        const playbook = execution.playbookId
            ? await this.prisma.remediationPlaybook.findUnique({
                where: { id: execution.playbookId },
                select: { id: true, name: true, description: true },
            })
            : null;
        return {
            execution,
            playbook,
            steps,
        };
    }
    async learnFromResolution(incidentId, learnedBy, data) {
        console.log(`\n🧠 Learning from incident ${incidentId.substring(0, 8)}...`);
        const incident = await this.prisma.incident.findUnique({
            where: { id: incidentId },
        });
        if (!incident) {
            throw new Error('Incident not found');
        }
        const existingPlaybooks = await this.prisma.remediationPlaybook.findMany({
            where: {
                orgId: incident.orgId,
                name: data.playbookName,
            },
        });
        if (existingPlaybooks.length > 0) {
            console.log('⚠️  Similar playbook already exists, updating instead...');
            const updatedPlaybook = await this.prisma.remediationPlaybook.update({
                where: { id: existingPlaybooks[0].id },
                data: {
                    description: data.description,
                    steps: data.steps,
                    triggerConditions: data.triggerConditions,
                    updatedAt: new Date(),
                },
            });
            await this.auditService.log({
                incidentId,
                action: 'playbook_updated',
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
        const newPlaybook = await this.prisma.remediationPlaybook.create({
            data: {
                orgId: incident.orgId,
                name: data.playbookName,
                description: data.description,
                triggerConditions: data.triggerConditions,
                steps: data.steps,
                isActive: true,
                successCount: 1,
            },
        });
        await this.auditService.log({
            incidentId,
            action: 'playbook_created',
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
    async suggestPlaybookFromResolution(incidentId) {
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
                confidence: 75,
            };
        }
        catch (error) {
            console.error('❌ AI suggestion failed:', error.message);
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
    async getPlaybooks(orgId) {
        return this.prisma.remediationPlaybook.findMany({
            where: { orgId },
            orderBy: [
                { isActive: 'desc' },
                { successCount: 'desc' },
            ],
        });
    }
    async improvePlaybook(playbookId, feedback) {
        const playbook = await this.prisma.remediationPlaybook.findUnique({
            where: { id: playbookId },
        });
        if (!playbook) {
            throw new Error('Playbook not found');
        }
        const totalAttempts = playbook.successCount + playbook.failureCount;
        const failureRate = totalAttempts > 0 ? playbook.failureCount / totalAttempts : 0;
        if (failureRate > 0.5 && totalAttempts > 5) {
            console.log(`⚠️  Playbook ${playbook.name} has high failure rate, deactivating...`);
            await this.prisma.remediationPlaybook.update({
                where: { id: playbookId },
                data: { isActive: false },
            });
        }
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
};
exports.RemediationService = RemediationService;
exports.RemediationService = RemediationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_analyzer_service_1.AiAnalyzerService,
        playbook_matcher_service_1.PlaybookMatcherService,
        execution_engine_service_1.ExecutionEngineService,
        audit_service_1.AuditService])
], RemediationService);
//# sourceMappingURL=remediation.service.js.map