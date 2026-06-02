import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';

interface StepResult {
    success: boolean;
    output: any;
    error?: string;
    durationMs: number;
}

@Injectable()
export class ExecutionEngineService {
    constructor(private prisma: PrismaService) { }

    /**
     * Execute a remediation playbook
     */
    async executePlaybook(executionId: string, playbook: any): Promise<boolean> {
        console.log(`\n⚙️  Executing playbook: ${playbook.name}...`);

        const steps = playbook.steps as any[];
        let allSuccess = true;

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            console.log(`   Step ${i + 1}/${steps.length}: ${step.name}`);

            const startTime = Date.now();
            const result = await this.executeStep(step);
            const durationMs = Date.now() - startTime;

            // Log step execution
            await this.logStep(executionId, i, step, result, durationMs);

            if (!result.success) {
                console.error(`   ❌ Step ${i + 1} failed: ${result.error}`);
                allSuccess = false;
                break; // Stop on first failure
            }

            console.log(`   ✅ Step ${i + 1} completed (${durationMs}ms)`);
        }

        return allSuccess;
    }

    /**
     * Execute a single step
     */
    private async executeStep(step: any): Promise<StepResult> {
        const startTime = Date.now();

        try {
            switch (step.type) {
                case 'http_request':
                    return await this.executeHttpRequest(step);

                case 'wait':
                    return await this.executeWait(step);

                case 'condition':
                    return await this.evaluateCondition(step);

                case 'notify':
                    return await this.executeNotify(step);

                default:
                    return {
                        success: false,
                        output: null,
                        error: `Unknown step type: ${step.type}`,
                        durationMs: Date.now() - startTime,
                    };
            }
        } catch (error) {
            return {
                success: false,
                output: null,
                error: error.message,
                durationMs: Date.now() - startTime,
            };
        }
    }

    /**
     * Execute HTTP request step
     */
    private async executeHttpRequest(step: any): Promise<StepResult> {
        const startTime = Date.now();
        const config = step.config;

        try {
            // SAFETY: In production, only allow whitelisted domains
            // For demo, we'll just log what WOULD be called
            console.log(`      → Would call: ${config.method} ${config.url}`);

            // Simulate HTTP request (don't actually call external APIs in demo)
            const simulatedResponse = {
                status: 200,
                data: { success: true, message: 'Simulated response' },
            };

            // In production, you'd do:
            // const response = await axios({
            //   method: config.method,
            //   url: config.url,
            //   headers: config.headers,
            //   data: config.body,
            //   timeout: 10000,
            // });

            return {
                success: true,
                output: simulatedResponse,
                durationMs: Date.now() - startTime,
            };
        } catch (error) {
            return {
                success: false,
                output: null,
                error: error.message,
                durationMs: Date.now() - startTime,
            };
        }
    }

    /**
     * Execute wait step
     */
    private async executeWait(step: any): Promise<StepResult> {
        const startTime = Date.now();
        const seconds = step.config.seconds || 5;

        console.log(`      → Waiting ${seconds} seconds...`);

        await new Promise((resolve) => setTimeout(resolve, seconds * 1000));

        return {
            success: true,
            output: { waited: seconds },
            durationMs: Date.now() - startTime,
        };
    }

    /**
     * Evaluate condition step
     */
    private async evaluateCondition(step: any): Promise<StepResult> {
        const startTime = Date.now();

        // Simple condition evaluation
        // In production, this would check previous step results
        const conditionMet = true; // Simplified for demo

        return {
            success: conditionMet,
            output: { conditionMet },
            error: conditionMet ? undefined : 'Condition not met',
            durationMs: Date.now() - startTime,
        };
    }

    /**
     * Execute notify step
     */
    private async executeNotify(step: any): Promise<StepResult> {
        const startTime = Date.now();

        console.log(`      → Notification: ${step.config.message}`);

        return {
            success: true,
            output: { notified: true },
            durationMs: Date.now() - startTime,
        };
    }

    /**
     * Log step execution to database
     */
    private async logStep(
        executionId: string,
        stepIndex: number,
        step: any,
        result: StepResult,
        durationMs: number,
    ) {
        await this.prisma.remediationStepLog.create({
            data: {
                executionId,
                stepIndex,
                stepType: step.type,
                input: step.config || {},
                output: result.output,
                status: result.success ? 'success' : 'failed',
                durationMs,
                error: result.error,
            },
        });
    }

    /**
     * Rollback a playbook execution (if possible)
     */
    async rollback(executionId: string): Promise<boolean> {
        console.log(`\n🔄 Rolling back execution ${executionId.substring(0, 8)}...`);

        // Get all successful steps
        const steps = await this.prisma.remediationStepLog.findMany({
            where: {
                executionId,
                status: 'success',
            },
            orderBy: { stepIndex: 'desc' }, // Reverse order
        });

        // In production, each step type would have a rollback handler
        // For demo, we just log what would be rolled back
        for (const step of steps) {
            console.log(`   → Would rollback: ${step.stepType} (step ${step.stepIndex})`);
        }

        console.log('✅ Rollback complete');
        return true;
    }
}