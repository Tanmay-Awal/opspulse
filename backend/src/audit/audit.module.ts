import { Module, Global } from '@nestjs/common';
import { AuditService } from './audit.service';

@Global() // Make it available everywhere
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule { }