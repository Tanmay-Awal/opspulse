import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create test organization
    const org = await prisma.organization.upsert({
        where: { domain: 'acme.com' },
        update: {},
        create: {
            name: 'Acme Corporation',
            domain: 'acme.com',
            webhookSecret: 'test-secret-change-in-production',
            plan: 'free',
        },
    });
    console.log('✅ Created organization:', org.name);

    // Create test users
    const maya = await prisma.user.upsert({
        where: { orgId_email: { orgId: org.id, email: 'maya@acme.com' } },
        update: {},
        create: {
            orgId: org.id,
            email: 'maya@acme.com',
            name: 'Maya Kumar',
            role: 'engineer',
            phoneNumber: '+1234567890',
        },
    });
    console.log('✅ Created user:', maya.email);

    const raj = await prisma.user.upsert({
        where: { orgId_email: { orgId: org.id, email: 'raj@acme.com' } },
        update: {},
        create: {
            orgId: org.id,
            email: 'raj@acme.com',
            name: 'Raj Patel',
            role: 'admin',
            phoneNumber: '+1234567891',
        },
    });
    console.log('✅ Created user:', raj.email);

    // Delete old on-call schedule if exists (for re-seeding)
    await prisma.onCallSchedule.deleteMany({
        where: { orgId: org.id },
    });

    // Create on-call schedule
    const onCallSchedule = await prisma.onCallSchedule.create({
        data: {
            orgId: org.id,
            teamName: 'Backend Team',
            currentOnCallId: maya.id,
            rotationType: 'weekly',
        },
    });
    console.log('✅ Created on-call schedule: Backend Team (Maya is on-call)');

    await prisma.escalationPolicy.deleteMany({
        where: { orgId: org.id },
    });

    // Create escalation policy
    const escalationPolicy = await prisma.escalationPolicy.create({
        data: {
            orgId: org.id,
            teamName: 'Backend Team',
            levels: [
                { userId: maya.id, waitMinutes: 10 },  // Level 0: Maya (primary)
                { userId: raj.id, waitMinutes: 10 },   // Level 1: Raj (backup)
            ],
            isActive: true,
        },
    });
    console.log('✅ Created escalation policy: Maya → Raj');

    // Delete old playbooks if exist
    await prisma.remediationPlaybook.deleteMany({
        where: { orgId: org.id },
    });

    // Create sample remediation playbooks
    const restartServicePlaybook = await prisma.remediationPlaybook.create({
        data: {
            orgId: org.id,
            name: 'Restart Failed Service',
            description: 'Automatically restart a crashed service or container',
            triggerConditions: {
                eventTypes: ['service_down', 'container_crashed'],
                sources: ['api-service-prod', 'auth-service-prod'],
            },
            steps: [
                {
                    type: 'http_request',
                    name: 'Restart Service',
                    config: {
                        method: 'POST',
                        url: 'https://api.example.com/services/{service_name}/restart',
                        headers: { 'Authorization': 'Bearer ${API_KEY}' },
                    },
                },
                {
                    type: 'wait',
                    name: 'Wait for startup',
                    config: { seconds: 30 },
                },
                {
                    type: 'http_request',
                    name: 'Check health',
                    config: {
                        method: 'GET',
                        url: 'https://api.example.com/services/{service_name}/health',
                    },
                },
            ],
            isActive: true,
        },
    });
    console.log('✅ Created playbook: Restart Failed Service');

    const clearCachePlaybook = await prisma.remediationPlaybook.create({
        data: {
            orgId: org.id,
            name: 'Clear Redis Cache',
            description: 'Flush Redis cache when corruption detected',
            triggerConditions: {
                eventTypes: ['cache_corruption', 'high_cache_errors'],
            },
            steps: [
                {
                    type: 'http_request',
                    name: 'Flush Redis',
                    config: {
                        method: 'POST',
                        url: 'https://api.example.com/cache/flush',
                        body: { force: true },
                    },
                },
                {
                    type: 'wait',
                    name: 'Wait for propagation',
                    config: { seconds: 10 },
                },
            ],
            isActive: true,
        },
    });
    console.log('✅ Created playbook: Clear Redis Cache');

    const scaleServicePlaybook = await prisma.remediationPlaybook.create({
        data: {
            orgId: org.id,
            name: 'Scale Up Service',
            description: 'Increase service replicas when high memory/CPU detected',
            triggerConditions: {
                eventTypes: ['high_memory', 'high_cpu'],
            },
            steps: [
                {
                    type: 'http_request',
                    name: 'Scale service',
                    config: {
                        method: 'PATCH',
                        url: 'https://api.example.com/services/{service_name}/scale',
                        body: { replicas: 3 },
                    },
                },
                {
                    type: 'wait',
                    name: 'Wait for scaling',
                    config: { seconds: 60 },
                },
                {
                    type: 'http_request',
                    name: 'Verify scaling',
                    config: {
                        method: 'GET',
                        url: 'https://api.example.com/services/{service_name}/status',
                    },
                },
            ],
            isActive: true,
        },
    });
    console.log('✅ Created playbook: Scale Up Service');

    console.log('🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });