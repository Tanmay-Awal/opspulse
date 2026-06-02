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
exports.PlaybookMatcherService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PlaybookMatcherService = class PlaybookMatcherService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMatchingPlaybooks(incident) {
        console.log(`\n🔍 Finding playbooks for incident #${incident.id.substring(0, 8)}...`);
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
        const matches = [];
        for (const playbook of playbooks) {
            const match = this.evaluateMatch(incident, playbook);
            if (match.confidence > 0) {
                matches.push(match);
            }
        }
        matches.sort((a, b) => b.confidence - a.confidence);
        console.log(`✅ Found ${matches.length} matching playbook(s)`);
        matches.forEach((m) => console.log(`   → ${m.playbook.name} (${m.confidence}% confidence)`));
        return matches;
    }
    evaluateMatch(incident, playbook) {
        const conditions = playbook.triggerConditions;
        let confidence = 0;
        const reasons = [];
        if (conditions.eventTypes && conditions.eventTypes.length > 0) {
            if (conditions.eventTypes.includes(incident.eventType)) {
                confidence += 40;
                reasons.push('Event type matches');
            }
            else {
                return {
                    playbook,
                    confidence: 0,
                    matchReason: 'Event type does not match',
                };
            }
        }
        if (conditions.sources && conditions.sources.length > 0) {
            if (conditions.sources.includes(incident.source)) {
                confidence += 30;
                reasons.push('Source matches');
            }
            else if (conditions.sources.some((s) => incident.source.includes(s))) {
                confidence += 15;
                reasons.push('Source partially matches');
            }
        }
        if (conditions.priorities && conditions.priorities.length > 0) {
            if (conditions.priorities.includes(incident.priority)) {
                confidence += 15;
                reasons.push('Priority matches');
            }
        }
        if (playbook.successCount > 0) {
            const successRate = playbook.successCount / (playbook.successCount + playbook.failureCount);
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
    async getBestMatch(incident) {
        const matches = await this.findMatchingPlaybooks(incident);
        return matches.length > 0 ? matches[0] : null;
    }
};
exports.PlaybookMatcherService = PlaybookMatcherService;
exports.PlaybookMatcherService = PlaybookMatcherService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlaybookMatcherService);
//# sourceMappingURL=playbook-matcher.service.js.map