import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const organization = await prisma.organizations.upsert({
    where: { id: 'temp-organization-id' },
    update: {},
    create: {
      id: 'temp-organization-id',
      name: 'テスト組織',
    },
  });

  await prisma.users.upsert({
    where: { id: 'temp-user-id' },
    update: {},
    create: {
      id: 'temp-user-id',
      email: 'test@example.com',
      passwordHash: 'dummy',
      organizationId: organization.id,
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
