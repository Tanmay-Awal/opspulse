import { Module } from '@nestjs/common';
import { RemediationService } from './remediation.service';
import { RemediationController } from './remediation.controller';
import { AiAnalyzerService } from './services/ai-analyzer.service';
import { PlaybookMatcherService } from './services/playbook-matcher.service';
import { ExecutionEngineService } from './services/execution-engine.service';

@Module({
  controllers: [RemediationController],
  providers: [
    RemediationService,
    AiAnalyzerService,
    PlaybookMatcherService,
    ExecutionEngineService,
  ],
  exports: [RemediationService],
})
export class RemediationModule { }