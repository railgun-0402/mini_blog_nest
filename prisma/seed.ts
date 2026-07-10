import { PrismaClient } from '@prisma/client';
import { error } from 'console';

const prisma = new PrismaClient();

async function main() {
    await prisma.organizations.upsert({
        where: { id: 'temp-organization-id' },
        update: {},
        create: {
            id: 'temp-organization-id',
            name: 'テスト組織',
        },
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });