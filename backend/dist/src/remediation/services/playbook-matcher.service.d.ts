import { PrismaService } from '../../prisma/prisma.service';
interface MatchResult {
    playbook: any;
    confidence: number;
    matchReason: string;
}
export declare class PlaybookMatcherService {
    private prisma;
    constructor(prisma: PrismaService);
    findMatchingPlaybooks(incident: any): Promise<MatchResult[]>;
    private evaluateMatch;
    getBestMatch(incident: any): Promise<MatchResult | null>;
}
export {};
