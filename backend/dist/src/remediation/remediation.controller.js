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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemediationController = void 0;
const common_1 = require("@nestjs/common");
const remediation_service_1 = require("./remediation.service");
let RemediationController = class RemediationController {
    remediationService;
    constructor(remediationService) {
        this.remediationService = remediationService;
    }
    async analyzeIncident(incidentId) {
        return this.remediationService.analyzeAndPropose(incidentId);
    }
    async executeRemediation(executionId, body) {
        return this.remediationService.executeRemediation(executionId, body.approvedBy);
    }
    async rejectRemediation(executionId, body) {
        if (!body.rejectedBy) {
            throw new common_1.BadRequestException('rejectedBy is required');
        }
        return this.remediationService.rejectRemediation(executionId, body.rejectedBy, body.reason);
    }
    async rollbackRemediation(executionId, body) {
        if (!body.rolledBackBy) {
            throw new common_1.BadRequestException('rolledBackBy is required');
        }
        return this.remediationService.rollbackRemediation(executionId, body.rolledBackBy);
    }
    async getExecution(executionId) {
        return this.remediationService.getExecution(executionId);
    }
    async learnFromResolution(incidentId, body) {
        if (!body.learnedBy) {
            throw new common_1.BadRequestException('learnedBy is required');
        }
        return this.remediationService.learnFromResolution(incidentId, body.learnedBy, {
            playbookName: body.playbookName,
            description: body.description,
            steps: body.steps,
            triggerConditions: body.triggerConditions,
        });
    }
    async suggestPlaybook(incidentId) {
        return this.remediationService.suggestPlaybookFromResolution(incidentId);
    }
    async getPlaybooks(orgId) {
        if (!orgId) {
            throw new common_1.BadRequestException('orgId is required');
        }
        return this.remediationService.getPlaybooks(orgId);
    }
    async providePlaybookFeedback(playbookId, body) {
        return this.remediationService.improvePlaybook(playbookId, body);
    }
};
exports.RemediationController = RemediationController;
__decorate([
    (0, common_1.Post)('analyze/:incidentId'),
    __param(0, (0, common_1.Param)('incidentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RemediationController.prototype, "analyzeIncident", null);
__decorate([
    (0, common_1.Post)('execute/:executionId'),
    __param(0, (0, common_1.Param)('executionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RemediationController.prototype, "executeRemediation", null);
__decorate([
    (0, common_1.Post)('reject/:executionId'),
    __param(0, (0, common_1.Param)('executionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RemediationController.prototype, "rejectRemediation", null);
__decorate([
    (0, common_1.Post)('rollback/:executionId'),
    __param(0, (0, common_1.Param)('executionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RemediationController.prototype, "rollbackRemediation", null);
__decorate([
    (0, common_1.Get)('execution/:executionId'),
    __param(0, (0, common_1.Param)('executionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RemediationController.prototype, "getExecution", null);
__decorate([
    (0, common_1.Post)('learn/:incidentId'),
    __param(0, (0, common_1.Param)('incidentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RemediationController.prototype, "learnFromResolution", null);
__decorate([
    (0, common_1.Post)('suggest-playbook/:incidentId'),
    __param(0, (0, common_1.Param)('incidentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RemediationController.prototype, "suggestPlaybook", null);
__decorate([
    (0, common_1.Get)('playbooks'),
    __param(0, (0, common_1.Query)('orgId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RemediationController.prototype, "getPlaybooks", null);
__decorate([
    (0, common_1.Patch)('playbook/:playbookId/feedback'),
    __param(0, (0, common_1.Param)('playbookId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RemediationController.prototype, "providePlaybookFeedback", null);
exports.RemediationController = RemediationController = __decorate([
    (0, common_1.Controller)('remediation'),
    __metadata("design:paramtypes", [remediation_service_1.RemediationService])
], RemediationController);
//# sourceMappingURL=remediation.controller.js.map