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
exports.ExecutionEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ExecutionEngineService = class ExecutionEngineService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async executePlaybook(executionId, playbook) {
        console.log(`\n⚙️  Executing playbook: ${playbook.name}...`);
        const steps = playbook.steps;
        let allSuccess = true;
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            console.log(`   Step ${i + 1}/${steps.length}: ${step.name}`);
            const startTime = Date.now();
            const result = await this.executeStep(step);
            const durationMs = Date.now() - startTime;
            await this.logStep(executionId, i, step, result, durationMs);
            if (!result.success) {
                console.error(`   ❌ Step ${i + 1} failed: ${result.error}`);
                allSuccess = false;
                break;
            }
            console.log(`   ✅ Step ${i + 1} completed (${durationMs}ms)`);
        }
        return allSuccess;
    }
    async executeStep(step) {
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
        }
        catch (error) {
            return {
                success: false,
                output: null,
                error: error.message,
                durationMs: Date.now() - startTime,
            };
        }
    }
    async executeHttpRequest(step) {
        const startTime = Date.now();
        const config = step.config;
        try {
            console.log(`      → Would call: ${config.method} ${config.url}`);
            const simulatedResponse = {
                status: 200,
                data: { success: true, message: 'Simulated response' },
            };
            return {
                success: true,
                output: simulatedResponse,
                durationMs: Date.now() - startTime,
            };
        }
        catch (error) {
            return {
                success: false,
                output: null,
                error: error.message,
                durationMs: Date.now() - startTime,
            };
        }
    }
    async executeWait(step) {
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
    async evaluateCondition(step) {
        const startTime = Date.now();
        const conditionMet = true;
        return {
            success: conditionMet,
            output: { conditionMet },
            error: conditionMet ? undefined : 'Condition not met',
            durationMs: Date.now() - startTime,
        };
    }
    async executeNotify(step) {
        const startTime = Date.now();
        console.log(`      → Notification: ${step.config.message}`);
        return {
            success: true,
            output: { notified: true },
            durationMs: Date.now() - startTime,
        };
    }
    async logStep(executionId, stepIndex, step, result, durationMs) {
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
    async rollback(executionId) {
        console.log(`\n🔄 Rolling back execution ${executionId.substring(0, 8)}...`);
        const steps = await this.prisma.remediationStepLog.findMany({
            where: {
                executionId,
                status: 'success',
            },
            orderBy: { stepIndex: 'desc' },
        });
        for (const step of steps) {
            console.log(`   → Would rollback: ${step.stepType} (step ${step.stepIndex})`);
        }
        console.log('✅ Rollback complete');
        return true;
    }
};
exports.ExecutionEngineService = ExecutionEngineService;
exports.ExecutionEngineService = ExecutionEngineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExecutionEngineService);
//# sourceMappingURL=execution-engine.service.js.map