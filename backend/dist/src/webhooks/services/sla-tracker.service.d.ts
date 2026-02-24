import { PrismaService } from '../../prisma/prisma.service';
import { EscalationService } from './escalation.service';
export declare class SlaTrackerService {
    private prisma;
    private escalationService;
    private slaPolicies;
    constructor(prisma: PrismaService, escalationService: EscalationService);
    checkSLABreaches(): Promise<void>;
    private checkAcknowledgmentSLA;
    private checkResolutionSLA;
}
