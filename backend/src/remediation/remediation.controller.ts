import { Controller, Post, Get, Patch, Param, Query, Body, BadRequestException } from '@nestjs/common';
import { RemediationService } from './remediation.service';

@Controller('remediation')
export class RemediationController {
    constructor(private readonly remediationService: RemediationService) { }

    /**
     * POST /remediation/analyze/:incidentId
     * Analyze incident and propose remediation
     */
    @Post('analyze/:incidentId')
    async analyzeIncident(@Param('incidentId') incidentId: string) {
        return this.remediationService.analyzeAndPropose(incidentId);
    }

    /**
     * POST /remediation/execute/:executionId
     * Execute approved remediation
     */
    @Post('execute/:executionId')
    async executeRemediation(
        @Param('executionId') executionId: string,
        @Body() body: { approvedBy?: string },
    ) {
        return this.remediationService.executeRemediation(
            executionId,
            body.approvedBy,
        );
    }

    /**
     * POST /remediation/reject/:executionId
     * Reject remediation proposal
     */
    @Post('reject/:executionId')
    async rejectRemediation(
        @Param('executionId') executionId: string,
        @Body() body: { rejectedBy: string; reason?: string },
    ) {
        if (!body.rejectedBy) {
            throw new BadRequestException('rejectedBy is required');
        }

        return this.remediationService.rejectRemediation(
            executionId,
            body.rejectedBy,
            body.reason,
        );
    }

    /**
     * POST /remediation/rollback/:executionId
     * Rollback completed remediation
     */
    @Post('rollback/:executionId')
    async rollbackRemediation(
        @Param('executionId') executionId: string,
        @Body() body: { rolledBackBy: string },
    ) {
        if (!body.rolledBackBy) {
            throw new BadRequestException('rolledBackBy is required');
        }

        return this.remediationService.rollbackRemediation(
            executionId,
            body.rolledBackBy,
        );
    }

    /**
     * GET /remediation/execution/:executionId
     * Get execution details
     */
    @Get('execution/:executionId')
    async getExecution(@Param('executionId') executionId: string) {
        return this.remediationService.getExecution(executionId);
    }

    /**
   * POST /remediation/learn/:incidentId
   * Learn from manual resolution and create playbook
   */
    @Post('learn/:incidentId')
    async learnFromResolution(
        @Param('incidentId') incidentId: string,
        @Body()
        body: {
            learnedBy: string;
            playbookName: string;
            description: string;
            steps: any[];
            triggerConditions: any;
        },
    ) {
        if (!body.learnedBy) {
            throw new BadRequestException('learnedBy is required');
        }

        return this.remediationService.learnFromResolution(incidentId, body.learnedBy, {
            playbookName: body.playbookName,
            description: body.description,
            steps: body.steps,
            triggerConditions: body.triggerConditions,
        });
    }

    /**
     * POST /remediation/suggest-playbook/:incidentId
     * AI suggests a playbook from resolution notes
     */
    @Post('suggest-playbook/:incidentId')
    async suggestPlaybook(@Param('incidentId') incidentId: string) {
        return this.remediationService.suggestPlaybookFromResolution(incidentId);
    }

    /**
     * GET /remediation/playbooks?orgId=xxx
     * Get all playbooks
     */
    @Get('playbooks')
    async getPlaybooks(@Query('orgId') orgId: string) {
        if (!orgId) {
            throw new BadRequestException('orgId is required');
        }

        return this.remediationService.getPlaybooks(orgId);
    }

    /**
     * PATCH /remediation/playbook/:playbookId/feedback
     * Provide feedback to improve playbook
     */
    @Patch('playbook/:playbookId/feedback')
    async providePlaybookFeedback(
        @Param('playbookId') playbookId: string,
        @Body()
        body: {
            outcome: 'success' | 'failure';
            notes: string;
            suggestedChanges?: any;
        },
    ) {
        return this.remediationService.improvePlaybook(playbookId, body);
    }

}