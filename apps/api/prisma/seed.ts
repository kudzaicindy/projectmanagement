import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('alamait123', 10);

  const users = [
    { email: 'pm@alamait.com', name: 'Property Manager', role: UserRole.PM },
    { email: 'qa@alamait.com', name: 'QA Surveyor', role: UserRole.QA },
    { email: 'finance@alamait.com', name: 'Finance Officer', role: UserRole.FINANCE },
    { email: 'ceo@alamait.com', name: 'CEO', role: UserRole.CEO },
    { email: 'admin@alamait.com', name: 'Admin', role: UserRole.ADMIN },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, passwordHash },
    });
  }

  console.log('Seed complete: login users only (default password alamait123 if unchanged).');
  console.log('Portfolio: npm run db:portfolio · Clear projects/properties: npm run db:clean');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
