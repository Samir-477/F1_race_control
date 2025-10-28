import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin@f1control.com' },
    update: { password: adminPassword, role: 'ADMIN' },
    create: { username: 'admin@f1control.com', password: adminPassword, role: 'ADMIN' },
  });

  // Seed stewards
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

  // Seed Circuits
  const circuits = [
    { name: 'Monaco Grand Prix', location: 'Monte Carlo', country: 'Monaco', length: 3.337, laps: 78 },
    { name: 'Silverstone Circuit', location: 'Silverstone', country: 'United Kingdom', length: 5.891, laps: 52 },
    { name: 'Spa-Francorchamps', location: 'Spa', country: 'Belgium', length: 7.004, laps: 44 },
    { name: 'Monza Circuit', location: 'Monza', country: 'Italy', length: 5.793, laps: 53 },
    { name: 'Suzuka Circuit', location: 'Suzuka', country: 'Japan', length: 5.807, laps: 53 },
    { name: 'Interlagos Circuit', location: 'São Paulo', country: 'Brazil', length: 4.309, laps: 71 },
    { name: 'Circuit of the Americas', location: 'Austin', country: 'United States', length: 5.513, laps: 56 },
    { name: 'Red Bull Ring', location: 'Spielberg', country: 'Austria', length: 4.318, laps: 71 },
    { name: 'Hungaroring', location: 'Budapest', country: 'Hungary', length: 4.381, laps: 70 },
    { name: 'Bahrain International Circuit', location: 'Sakhir', country: 'Bahrain', length: 5.412, laps: 57 },
  ];

  for (const circuit of circuits) {
    await prisma.circuit.upsert({
      where: { name: circuit.name },
      update: circuit,
      create: circuit,
    });
  }

  // Seed Seasons
  const seasons = [
    { year: 2024, name: '2024 Formula 1 World Championship', isActive: true },
    { year: 2025, name: '2025 Formula 1 World Championship', isActive: false },
    { year: 2023, name: '2023 Formula 1 World Championship', isActive: false },
  ];

  for (const season of seasons) {
    await prisma.season.upsert({
      where: { year: season.year },
      update: season,
      create: season,
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