import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 10);

  // Upsert admin user with email as username
  await prisma.user.upsert({
    where: { username: 'admin@f1control.com' },
    update: { password: adminPassword, role: 'ADMIN' },
    create: { username: 'admin@f1control.com', password: adminPassword, role: 'ADMIN' },
  });

  // Create a couple of stewards
  const stewardPassword = await bcrypt.hash('steward123', 10);

  const stewards = [
    { username: 'steward1', password: stewardPassword, role: 'STEWARD' },
    { username: 'steward2', password: stewardPassword, role: 'STEWARD' },
  ];

  for (const s of stewards) {
    await prisma.user.upsert({
      where: { username: s.username },
      update: { password: s.password, role: s.role },
      create: s,
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
