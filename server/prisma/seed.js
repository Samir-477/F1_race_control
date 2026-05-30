import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Users ──────────────────────────────────────────────────────────────
  const adminPassword   = await bcrypt.hash('admin123', 10);
  const stewardPassword = await bcrypt.hash('steward123', 10);
  const demoPassword    = await bcrypt.hash('demo123', 10);

  const admin = await prisma.user.upsert({
    where:  { username: 'admin@f1control.com' },
    update: { password: adminPassword, role: 'ADMIN', isDemo: false },
    create: { username: 'admin@f1control.com', password: adminPassword, role: 'ADMIN', isDemo: false },
  });

  const steward1 = await prisma.user.upsert({
    where:  { username: 'steward1' },
    update: { password: stewardPassword, role: 'STEWARD', isDemo: false },
    create: { username: 'steward1', password: stewardPassword, role: 'STEWARD', isDemo: false },
  });

  await prisma.user.upsert({
    where:  { username: 'steward2' },
    update: { password: stewardPassword, role: 'STEWARD', isDemo: false },
    create: { username: 'steward2', password: stewardPassword, role: 'STEWARD', isDemo: false },
  });

  await prisma.user.upsert({
    where:  { username: 'demo_admin' },
    update: { password: demoPassword, role: 'ADMIN', isDemo: true },
    create: { username: 'demo_admin', password: demoPassword, role: 'ADMIN', isDemo: true },
  });

  await prisma.user.upsert({
    where:  { username: 'demo_steward' },
    update: { password: demoPassword, role: 'STEWARD', isDemo: true },
    create: { username: 'demo_steward', password: demoPassword, role: 'STEWARD', isDemo: true },
  });

  // ── Circuits ───────────────────────────────────────────────────────────
  const circuitData = [
    { name: 'Monaco Grand Prix',              location: 'Monte Carlo', country: 'Monaco',         length: 3.337, laps: 78 },
    { name: 'Silverstone Circuit',            location: 'Silverstone', country: 'United Kingdom', length: 5.891, laps: 52 },
    { name: 'Spa-Francorchamps',              location: 'Spa',         country: 'Belgium',         length: 7.004, laps: 44 },
    { name: 'Monza Circuit',                  location: 'Monza',       country: 'Italy',           length: 5.793, laps: 53 },
    { name: 'Suzuka Circuit',                 location: 'Suzuka',      country: 'Japan',           length: 5.807, laps: 53 },
    { name: 'Interlagos Circuit',             location: 'São Paulo',   country: 'Brazil',          length: 4.309, laps: 71 },
    { name: 'Circuit of the Americas',        location: 'Austin',      country: 'United States',   length: 5.513, laps: 56 },
    { name: 'Red Bull Ring',                  location: 'Spielberg',   country: 'Austria',         length: 4.318, laps: 71 },
    { name: 'Hungaroring',                    location: 'Budapest',    country: 'Hungary',         length: 4.381, laps: 70 },
    { name: 'Bahrain International Circuit',  location: 'Sakhir',      country: 'Bahrain',         length: 5.412, laps: 57 },
  ];

  const circuits = {};
  for (const c of circuitData) {
    circuits[c.name] = await prisma.circuit.upsert({
      where:  { name: c.name },
      update: c,
      create: c,
    });
  }

  // ── Seasons ────────────────────────────────────────────────────────────
  const seasonData = [
    { year: 2023, name: '2023 Formula 1 World Championship', isActive: false },
    { year: 2024, name: '2024 Formula 1 World Championship', isActive: false },
    { year: 2025, name: '2025 Formula 1 World Championship', isActive: true  },
  ];

  const seasons = {};
  for (const s of seasonData) {
    seasons[s.year] = await prisma.season.upsert({
      where:  { year: s.year },
      update: s,
      create: s,
    });
  }

  // ── Sponsors (global pool) ─────────────────────────────────────────────
  const sponsorNames = ['Oracle', 'Ford Motor Company', 'Visa', 'Google', 'Mastercard', 'OKX', 'HP', 'IBM', 'PUMA', 'Shell', 'Petronas', 'INEOS', 'AMD', 'Qualcomm'];
  const sponsors = {};
  for (const name of sponsorNames) {
    sponsors[name] = await prisma.sponsor.upsert({
      where:  { name },
      update: {},
      create: { name },
    });
  }

  // ── Teams ──────────────────────────────────────────────────────────────
  const redBull = await prisma.team.upsert({
    where:  { name: 'Red Bull' },
    update: { fullName: 'Oracale Red Bull Racing', description: 'Dominant', base: 'Milton Keynes, UK', teamChief: 'Christain Horner', color: '#FF0000' },
    create: { name: 'Red Bull', fullName: 'Oracale Red Bull Racing', description: 'Dominant', base: 'Milton Keynes, UK', teamChief: 'Christain Horner', color: '#FF0000',
      car: { create: { model: 'RB21', engine: '1.6 L V6 Hybrid Turbo', chassis: 'Carbon-fibre composite monocoque' } },
      sponsors: { connect: [sponsors['Oracle'], sponsors['Ford Motor Company'], sponsors['Visa']].map(s => ({ id: s.id })) },
    },
  });

  const mclaren = await prisma.team.upsert({
    where:  { name: 'McLaren' },
    update: { fullName: 'Google McLaren', description: 'Historic', base: 'Woking, Surrey, UK', teamChief: 'Andrea Stella', color: '#ff9500' },
    create: { name: 'McLaren', fullName: 'Google McLaren', description: 'Historic', base: 'Woking, Surrey, UK', teamChief: 'Andrea Stella', color: '#ff9500',
      car: { create: { model: 'MCL40', engine: 'Mercedes-AMG F1 E Performance', chassis: 'Carbon-fibre composite monocoque' } },
      sponsors: { connect: [sponsors['Google'], sponsors['Mastercard'], sponsors['OKX']].map(s => ({ id: s.id })) },
    },
  });

  const ferrari = await prisma.team.upsert({
    where:  { name: 'Ferrari' },
    update: { fullName: 'HP Ferrari', description: 'Legendary', base: 'Maranello, Italy', teamChief: 'Frederic Vasseur', color: '#7a0505' },
    create: { name: 'Ferrari', fullName: 'HP Ferrari', description: 'Legendary', base: 'Maranello, Italy', teamChief: 'Frederic Vasseur', color: '#7a0505',
      car: { create: { model: 'SF-26', engine: 'Ferrari 066/15 1.6L V6 Turbo Hybrid', chassis: 'Carbon-fibre composite monocoque' } },
      sponsors: { connect: [sponsors['HP'], sponsors['IBM'], sponsors['PUMA'], sponsors['Shell']].map(s => ({ id: s.id })) },
    },
  });

  const mercedes = await prisma.team.upsert({
    where:  { name: 'Mercedes' },
    update: { fullName: 'Mercedes-AMG Petronas', description: 'Elite', base: 'Brackley, United Kingdom', teamChief: 'Toto Wolff', color: '#00D2BE' },
    create: { name: 'Mercedes', fullName: 'Mercedes-AMG Petronas', description: 'Elite', base: 'Brackley, United Kingdom', teamChief: 'Toto Wolff', color: '#00D2BE',
      car: { create: { model: 'W17', engine: 'Mercedes-AMG 1.6L V6 Turbo Hybrid', chassis: 'Carbon-fibre Composite Monocoque' } },
      sponsors: { connect: [sponsors['Petronas'], sponsors['INEOS'], sponsors['AMD'], sponsors['Qualcomm']].map(s => ({ id: s.id })) },
    },
  });

  // ── Drivers (upsert by unique [teamId, number]) ────────────────────────
  const upsertDriver = async (teamId, data) => {
    const existing = await prisma.driver.findFirst({ where: { teamId, number: data.number } });
    if (existing) return prisma.driver.update({ where: { id: existing.id }, data });
    return prisma.driver.create({ data: { ...data, teamId } });
  };

  const maxV    = await upsertDriver(redBull.id,  { name: 'Max Verstappen',       number: 3,  nationality: 'Dutch',        podiums: 0, points: 10, worldChampionships: 0, imageUrl: '' });
  const isack   = await upsertDriver(redBull.id,  { name: 'Isack Hadjar',         number: 2,  nationality: 'French',       podiums: 0, points: 10, worldChampionships: 0, imageUrl: '' });
  const lando   = await upsertDriver(mclaren.id,  { name: 'Lando Norris',         number: 1,  nationality: 'British',      podiums: 0, points: 24, worldChampionships: 0, imageUrl: '' });
  const oscar   = await upsertDriver(mclaren.id,  { name: 'Oscar Piastri',        number: 81, nationality: 'Australian',   podiums: 0, points: 30, worldChampionships: 0, imageUrl: '' });
  const lewis   = await upsertDriver(ferrari.id,  { name: 'Lewis Hamilton',       number: 44, nationality: 'British',      podiums: 0, points: 18, worldChampionships: 0, imageUrl: '' });
  const charles = await upsertDriver(ferrari.id,  { name: 'Charles Leclerc',      number: 16, nationality: 'Monegasque',   podiums: 0, points: 18, worldChampionships: 0, imageUrl: '' });
  const george  = await upsertDriver(mercedes.id, { name: 'George Russell',       number: 63, nationality: 'British',      podiums: 0, points: 43, worldChampionships: 0, imageUrl: '' });
  const kimi    = await upsertDriver(mercedes.id, { name: 'Andrea Kimi Antonelli',number: 12, nationality: 'Italian',      podiums: 0, points: 43, worldChampionships: 0, imageUrl: '' });

  // ── Helper: create race + full data only if it doesn't exist ──────────
  const raceExists = async (name) => prisma.race.findFirst({ where: { name } });

  // ── Race 1: Monaco Grand Prix ──────────────────────────────────────────
  if (!await raceExists('Monaco Grand Prix')) {
    const monacoCircuit = circuits['Monaco Grand Prix'];
    const season2025    = seasons[2025];

    const penalty1 = await prisma.penalty.create({ data: { type: 'TimePenalty', value: '5' } });

    const monaco = await prisma.race.create({
      data: {
        name: 'Monaco Grand Prix',
        date: new Date('2025-08-29'),
        status: 'COMPLETED',
        isReviewed: true,
        reviewedById: steward1.id,
        reviewedAt: new Date('2025-08-29T13:40:05.502Z'),
        circuitId: monacoCircuit.id,
        seasonId: season2025.id,
        participations: {
          create: [
            { teamId: redBull.id },
            { teamId: ferrari.id },
            { teamId: mercedes.id },
            { teamId: mclaren.id },
          ],
        },
      },
    });

    await prisma.raceResult.createMany({
      data: [
        { raceId: monaco.id, driverId: george.id,  teamId: mercedes.id, position: 1, time: '108:43.926', points: 25, penalty: '0s',  fastestLap: '' },
        { raceId: monaco.id, driverId: kimi.id,    teamId: mercedes.id, position: 2, time: '108:53.259', points: 18, penalty: '0s',  fastestLap: '' },
        { raceId: monaco.id, driverId: oscar.id,   teamId: mclaren.id,  position: 3, time: '115:21.324', points: 15, penalty: '0s',  fastestLap: '' },
        { raceId: monaco.id, driverId: lando.id,   teamId: mclaren.id,  position: 4, time: '115:45.970', points: 12, penalty: '0s',  fastestLap: '' },
        { raceId: monaco.id, driverId: charles.id, teamId: ferrari.id,  position: 5, time: '116:18.373', points: 10, penalty: '0s',  fastestLap: '' },
        { raceId: monaco.id, driverId: lewis.id,   teamId: ferrari.id,  position: 6, time: '116:22.107', points: 8,  penalty: '0s',  fastestLap: '' },
        { raceId: monaco.id, driverId: maxV.id,    teamId: redBull.id,  position: 7, time: '117:36.273', points: 6,  penalty: '5s',  fastestLap: '' },
        { raceId: monaco.id, driverId: isack.id,   teamId: redBull.id,  position: 8, time: '118:11.571', points: 4,  penalty: '0s',  fastestLap: '' },
      ],
    });

    await prisma.raceIncident.create({
      data: { raceId: monaco.id, driverId: maxV.id, lap: 1, description: 'Crashed', penaltyId: penalty1.id },
    });

    console.log('Created: Monaco Grand Prix');
  }

  // ── Race 2: Japanese Grand Prix ────────────────────────────────────────
  if (!await raceExists('Japanese Grand Prix')) {
    const suzukaCircuit = circuits['Suzuka Circuit'];
    const season2025    = seasons[2025];

    const penalty2 = await prisma.penalty.create({ data: { type: 'TimePenalty', value: '2' } });

    const japan = await prisma.race.create({
      data: {
        name: 'Japanese Grand Prix',
        date: new Date('2025-12-07'),
        status: 'COMPLETED',
        isReviewed: true,
        reviewedById: steward1.id,
        reviewedAt: new Date('2025-12-07T13:43:29.675Z'),
        circuitId: suzukaCircuit.id,
        seasonId: season2025.id,
        participations: {
          create: [
            { teamId: redBull.id },
            { teamId: mercedes.id },
            { teamId: mclaren.id },
            { teamId: ferrari.id },
          ],
        },
      },
    });

    await prisma.raceResult.createMany({
      data: [
        { raceId: japan.id, driverId: kimi.id,    teamId: mercedes.id, position: 1, time: '73:19.495', points: 25, penalty: '2s', fastestLap: '' },
        { raceId: japan.id, driverId: george.id,  teamId: mercedes.id, position: 2, time: '73:43.183', points: 18, penalty: '0s', fastestLap: '' },
        { raceId: japan.id, driverId: oscar.id,   teamId: mclaren.id,  position: 3, time: '78:53.637', points: 15, penalty: '0s', fastestLap: '' },
        { raceId: japan.id, driverId: lando.id,   teamId: mclaren.id,  position: 4, time: '78:55.138', points: 12, penalty: '0s', fastestLap: '' },
        { raceId: japan.id, driverId: lewis.id,   teamId: ferrari.id,  position: 5, time: '78:58.276', points: 10, penalty: '0s', fastestLap: '' },
        { raceId: japan.id, driverId: charles.id, teamId: ferrari.id,  position: 6, time: '79:27.904', points: 8,  penalty: '0s', fastestLap: '' },
        { raceId: japan.id, driverId: isack.id,   teamId: redBull.id,  position: 7, time: '79:41.232', points: 6,  penalty: '0s', fastestLap: '' },
        { raceId: japan.id, driverId: maxV.id,    teamId: redBull.id,  position: 8, time: '80:30.249', points: 4,  penalty: '0s', fastestLap: '' },
      ],
    });

    await prisma.raceIncident.create({
      data: { raceId: japan.id, driverId: kimi.id, lap: 4, description: 'Reckless Driving', penaltyId: penalty2.id },
    });

    console.log('Created: Japanese Grand Prix');
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
