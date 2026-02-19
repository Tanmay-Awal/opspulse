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