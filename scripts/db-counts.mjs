import { PrismaClient } from '@prisma/client';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

process.chdir(join(dirname(fileURLToPath(import.meta.url)), '..', 'apps', 'api'));

const prisma = new PrismaClient();
const [users, properties, projects, pm] = await Promise.all([
  prisma.user.count(),
  prisma.property.count(),
  prisma.project.count(),
  prisma.user.findUnique({ where: { email: 'pm@alamait.com' } }),
]);
console.log(JSON.stringify({ users, properties, projects, pmUser: pm?.id ?? null }, null, 2));
await prisma.$disconnect();
