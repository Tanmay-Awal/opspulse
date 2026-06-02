"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemediationModule = void 0;
const common_1 = require("@nestjs/common");
const remediation_service_1 = require("./remediation.service");
const remediation_controller_1 = require("./remediation.controller");
const ai_analyzer_service_1 = require("./services/ai-analyzer.service");
const playbook_matcher_service_1 = require("./services/playbook-matcher.service");
const execution_engine_service_1 = require("./services/execution-engine.service");
let RemediationModule = class RemediationModule {
};
exports.RemediationModule = RemediationModule;
exports.RemediationModule = RemediationModule = __decorate([
    (0, common_1.Module)({
        controllers: [remediation_controller_1.RemediationController],
        providers: [
            remediation_service_1.RemediationService,
            ai_analyzer_service_1.AiAnalyzerService,
            playbook_matcher_service_1.PlaybookMatcherService,
            execution_engine_service_1.ExecutionEngineService,
        ],
        exports: [remediation_service_1.RemediationService],
    })
], RemediationModule);
//# sourceMappingURL=remediation.module.js.map