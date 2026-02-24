"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
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
    await prisma.onCallSchedule.deleteMany({
        where: { orgId: org.id },
    });
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
    const escalationPolicy = await prisma.escalationPolicy.create({
        data: {
            orgId: org.id,
            teamName: 'Backend Team',
            levels: [
                { userId: maya.id, waitMinutes: 10 },
                { userId: raj.id, waitMinutes: 10 },
            ],
            isActive: true,
        },
    });
    console.log('✅ Created escalation policy: Maya → Raj');
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
//# sourceMappingURL=seed.js.map