import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface MatchResult {
    playbook: any;
    confidence: number;
    matchReason: string;
}

@Injectable()
export class PlaybookMatcherService {
    constructor(private prisma: PrismaService) { }

    /**
     * Find matching playbooks for an incident
     */
    async findMatchingPlaybooks(incident: any): Promise<MatchResult[]> {
        console.log(`\n🔍 Finding playbooks for incident #${incident.id.substring(0, 8)}...`);

        // Get all active playbooks for the organization
        const playbooks = await this.prisma.remediationPlaybook.findMany({
            where: {
                orgId: incident.orgId,
                isActive: true,
            },
        });

        if (playbooks.length === 0) {
            console.log('⚠️  No active playbooks found');
            return [];
        }

        const matches: MatchResult[] = [];

        for (const playbook of playbooks) {
            const match = this.evaluateMatch(incident, playbook);
            if (match.confidence > 0) {
                matches.push(match);
            }
        }

        // Sort by confidence (highest first)
        matches.sort((a, b) => b.confidence - a.confidence);

        console.log(`✅ Found ${matches.length} matching playbook(s)`);
        matches.forEach((m) =>
            console.log(`   → ${m.playbook.name} (${m.confidence}% confidence)`),
        );

        return matches;
    }

    /**
     * Evaluate if a playbook matches an incident
     */
    private evaluateMatch(incident: any, playbook: any): MatchResult {
        const conditions = playbook.triggerConditions as {
            eventTypes?: string[];
            sources?: string[];
            priorities?: string[];
        };

        let confidence = 0;
        const reasons: string[] = [];

        // Check event type match
        if (conditions.eventTypes && conditions.eventTypes.length > 0) {
            if (conditions.eventTypes.includes(incident.eventType)) {
                confidence += 40;
                reasons.push('Event type matches');
            } else {
                // No match on event type - this playbook doesn't apply
                return {
                    playbook,
                    confidence: 0,
                    matchReason: 'Event type does not match',
                };
            }
        }

        // Check source match
        if (conditions.sources && conditions.sources.length > 0) {
            if (conditions.sources.includes(incident.source)) {
                confidence += 30;
                reasons.push('Source matches');
            } else if (
                conditions.sources.some((s: string) => incident.source.includes(s))
            ) {
                confidence += 15;
                reasons.push('Source partially matches');
            }
        }

        // Check priority match
        if (conditions.priorities && conditions.priorities.length > 0) {
            if (conditions.priorities.includes(incident.priority)) {
                confidence += 15;
                reasons.push('Priority matches');
            }
        }

        // Boost confidence based on playbook success rate
        if (playbook.successCount > 0) {
            const successRate =
                playbook.successCount / (playbook.successCount + playbook.failureCount);
            confidence += successRate * 15;
            if (successRate > 0.8) {
                reasons.push('High historical success rate');
            }
        }

        return {
            playbook,
            confidence: Math.min(Math.round(confidence), 100),
            matchReason: reasons.join(', ') || 'Partial match',
        };
    }

    /**
     * Get best matching playbook (highest confidence)
     */
    async getBestMatch(incident: any): Promise<MatchResult | null> {
        const matches = await this.findMatchingPlaybooks(incident);
        return matches.length > 0 ? matches[0] : null;
    }
}