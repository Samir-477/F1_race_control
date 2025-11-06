import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function exportData() {
  try {
    console.log('🔍 Exporting data from database...\n');

    // Fetch all data
    const seasons = await prisma.season.findMany({ orderBy: { id: 'asc' } });
    const teams = await prisma.team.findMany({ orderBy: { id: 'asc' } });
    const drivers = await prisma.driver.findMany({ 
      orderBy: { id: 'asc' },
      include: { team: true }
    });
    const circuits = await prisma.circuit.findMany({ orderBy: { id: 'asc' } });
    const races = await prisma.race.findMany({ 
      orderBy: { id: 'asc' },
      include: {
        circuit: true,
        season: true
      }
    });
    const raceResults = await prisma.raceResult.findMany({ 
      orderBy: { id: 'asc' },
      include: {
        race: true,
        driver: true,
        team: true
      }
    });
    const raceIncidents = await prisma.raceIncident.findMany({ 
      orderBy: { id: 'asc' },
      include: {
        race: true,
        driver: true,
        penalty: true
      }
    });
    const penalties = await prisma.penalty.findMany({ orderBy: { id: 'asc' } });
    const users = await prisma.user.findMany({ 
      orderBy: { id: 'asc' },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true
        // Exclude password for security
      }
    });

    console.log('📊 Data Summary:');
    console.log(`  - Seasons: ${seasons.length}`);
    console.log(`  - Teams: ${teams.length}`);
    console.log(`  - Drivers: ${drivers.length}`);
    console.log(`  - Circuits: ${circuits.length}`);
    console.log(`  - Races: ${races.length}`);
    console.log(`  - Race Results: ${raceResults.length}`);
    console.log(`  - Race Incidents: ${raceIncidents.length}`);
    console.log(`  - Penalties: ${penalties.length}`);
    console.log(`  - Users: ${users.length}\n`);

    // Create seed data object
    const seedData = {
      exportDate: new Date().toISOString(),
      seasons,
      teams,
      drivers: drivers.map(d => ({
        id: d.id,
        name: d.name,
        number: d.number,
        nationality: d.nationality,
        dateOfBirth: d.dateOfBirth,
        teamId: d.teamId,
        points: d.points,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt
      })),
      circuits,
      races: races.map(r => ({
        id: r.id,
        name: r.name,
        date: r.date,
        circuitId: r.circuitId,
        seasonId: r.seasonId,
        status: r.status,
        isReviewed: r.isReviewed,
        reviewedById: r.reviewedById,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      })),
      raceResults: raceResults.map(rr => ({
        id: rr.id,
        raceId: rr.raceId,
        driverId: rr.driverId,
        teamId: rr.teamId,
        position: rr.position,
        points: rr.points,
        time: rr.time,
        fastestLap: rr.fastestLap,
        penalty: rr.penalty,
        createdAt: rr.createdAt,
        updatedAt: rr.updatedAt
      })),
      penalties,
      raceIncidents: raceIncidents.map(ri => ({
        id: ri.id,
        raceId: ri.raceId,
        driverId: ri.driverId,
        lap: ri.lap,
        description: ri.description,
        penaltyId: ri.penaltyId,
        createdAt: ri.createdAt,
        updatedAt: ri.updatedAt
      })),
      users: users.map(u => ({
        ...u,
        // Note: Passwords are excluded. You'll need to set them manually or use default
        passwordNote: 'Passwords excluded for security. Default: password123'
      }))
    };

    // Save to JSON file
    const outputPath = path.join(__dirname, '..', 'seed-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2));
    console.log(`✅ Data exported to: ${outputPath}\n`);

    // Generate SQL seed file
    await generateSQLSeed(seedData);

    console.log('✅ Export complete!');
  } catch (error) {
    console.error('❌ Error exporting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function generateSQLSeed(data) {
  let sql = `-- =====================================================
-- SEED DATA - Generated on ${data.exportDate}
-- =====================================================
-- This file contains all the data from your database
-- Run this in MySQL Workbench to restore your data

USE race_control;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE RaceResult;
-- TRUNCATE TABLE RaceIncident;
-- TRUNCATE TABLE Penalty;
-- TRUNCATE TABLE Race;
-- TRUNCATE TABLE Driver;
-- TRUNCATE TABLE Circuit;
-- TRUNCATE TABLE Team;
-- TRUNCATE TABLE Season;
-- TRUNCATE TABLE User;

-- =====================================================
-- SEASONS
-- =====================================================
`;

  if (data.seasons.length > 0) {
    sql += `INSERT INTO Season (id, year, name, isActive, createdAt, updatedAt) VALUES\n`;
    sql += data.seasons.map(s => 
      `(${s.id}, ${s.year}, ${escapeSQL(s.name)}, ${s.isActive ? 1 : 0}, ${escapeSQL(s.createdAt)}, ${escapeSQL(s.updatedAt)})`
    ).join(',\n');
    sql += ';\n\n';
  }

  // Teams
  if (data.teams.length > 0) {
    sql += `-- =====================================================
-- TEAMS
-- =====================================================
INSERT INTO Team (id, name, fullName, color, createdAt, updatedAt) VALUES\n`;
    sql += data.teams.map(t => 
      `(${t.id}, ${escapeSQL(t.name)}, ${escapeSQL(t.fullName)}, ${escapeSQL(t.color)}, ${escapeSQL(t.createdAt)}, ${escapeSQL(t.updatedAt)})`
    ).join(',\n');
    sql += ';\n\n';
  }

  // Drivers
  if (data.drivers.length > 0) {
    sql += `-- =====================================================
-- DRIVERS
-- =====================================================
INSERT INTO Driver (id, name, number, nationality, dateOfBirth, teamId, points, createdAt, updatedAt) VALUES\n`;
    sql += data.drivers.map(d => 
      `(${d.id}, ${escapeSQL(d.name)}, ${d.number}, ${escapeSQL(d.nationality)}, ${escapeSQL(d.dateOfBirth)}, ${d.teamId}, ${d.points}, ${escapeSQL(d.createdAt)}, ${escapeSQL(d.updatedAt)})`
    ).join(',\n');
    sql += ';\n\n';
  }

  // Circuits
  if (data.circuits.length > 0) {
    sql += `-- =====================================================
-- CIRCUITS
-- =====================================================
INSERT INTO Circuit (id, name, location, country, length, laps, createdAt, updatedAt) VALUES\n`;
    sql += data.circuits.map(c => 
      `(${c.id}, ${escapeSQL(c.name)}, ${escapeSQL(c.location)}, ${escapeSQL(c.country)}, ${c.length}, ${c.laps}, ${escapeSQL(c.createdAt)}, ${escapeSQL(c.updatedAt)})`
    ).join(',\n');
    sql += ';\n\n';
  }

  // Races
  if (data.races.length > 0) {
    sql += `-- =====================================================
-- RACES
-- =====================================================
INSERT INTO Race (id, name, date, circuitId, seasonId, status, isReviewed, reviewedById, createdAt, updatedAt) VALUES\n`;
    sql += data.races.map(r => 
      `(${r.id}, ${escapeSQL(r.name)}, ${escapeSQL(r.date)}, ${r.circuitId}, ${r.seasonId}, ${escapeSQL(r.status)}, ${r.isReviewed ? 1 : 0}, ${r.reviewedById || 'NULL'}, ${escapeSQL(r.createdAt)}, ${escapeSQL(r.updatedAt)})`
    ).join(',\n');
    sql += ';\n\n';
  }

  // Penalties
  if (data.penalties.length > 0) {
    sql += `-- =====================================================
-- PENALTIES
-- =====================================================
INSERT INTO Penalty (id, type, value, createdAt, updatedAt) VALUES\n`;
    sql += data.penalties.map(p => 
      `(${p.id}, ${escapeSQL(p.type)}, ${escapeSQL(p.value)}, ${escapeSQL(p.createdAt)}, ${escapeSQL(p.updatedAt)})`
    ).join(',\n');
    sql += ';\n\n';
  }

  // Race Results
  if (data.raceResults.length > 0) {
    sql += `-- =====================================================
-- RACE RESULTS
-- =====================================================
INSERT INTO RaceResult (id, raceId, driverId, teamId, position, points, time, fastestLap, penalty, createdAt, updatedAt) VALUES\n`;
    sql += data.raceResults.map(rr => 
      `(${rr.id}, ${rr.raceId}, ${rr.driverId}, ${rr.teamId}, ${rr.position}, ${rr.points}, ${escapeSQL(rr.time)}, ${escapeSQL(rr.fastestLap)}, ${rr.penalty ? escapeSQL(rr.penalty) : 'NULL'}, ${escapeSQL(rr.createdAt)}, ${escapeSQL(rr.updatedAt)})`
    ).join(',\n');
    sql += ';\n\n';
  }

  // Race Incidents
  if (data.raceIncidents.length > 0) {
    sql += `-- =====================================================
-- RACE INCIDENTS
-- =====================================================
INSERT INTO RaceIncident (id, raceId, driverId, lap, description, penaltyId, createdAt, updatedAt) VALUES\n`;
    sql += data.raceIncidents.map(ri => 
      `(${ri.id}, ${ri.raceId}, ${ri.driverId}, ${ri.lap}, ${escapeSQL(ri.description)}, ${ri.penaltyId || 'NULL'}, ${escapeSQL(ri.createdAt)}, ${escapeSQL(ri.updatedAt)})`
    ).join(',\n');
    sql += ';\n\n';
  }

  // Users (without passwords)
  if (data.users.length > 0) {
    sql += `-- =====================================================
-- USERS (Passwords need to be set manually)
-- =====================================================
-- Default password for all users: password123
-- You'll need to hash and insert passwords separately

`;
    data.users.forEach(u => {
      sql += `-- User: ${u.username} (${u.role})\n`;
      sql += `-- INSERT INTO User (id, username, password, role, createdAt, updatedAt) VALUES\n`;
      sql += `-- (${u.id}, ${escapeSQL(u.username)}, '[HASHED_PASSWORD]', ${escapeSQL(u.role)}, ${escapeSQL(u.createdAt)}, ${escapeSQL(u.updatedAt)});\n\n`;
    });
  }

  sql += `-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Reset auto-increment values
ALTER TABLE Season AUTO_INCREMENT = ${Math.max(...data.seasons.map(s => s.id), 0) + 1};
ALTER TABLE Team AUTO_INCREMENT = ${Math.max(...data.teams.map(t => t.id), 0) + 1};
ALTER TABLE Driver AUTO_INCREMENT = ${Math.max(...data.drivers.map(d => d.id), 0) + 1};
ALTER TABLE Circuit AUTO_INCREMENT = ${Math.max(...data.circuits.map(c => c.id), 0) + 1};
ALTER TABLE Race AUTO_INCREMENT = ${Math.max(...data.races.map(r => r.id), 0) + 1};
ALTER TABLE Penalty AUTO_INCREMENT = ${Math.max(...data.penalties.map(p => p.id), 0) + 1};
ALTER TABLE RaceResult AUTO_INCREMENT = ${Math.max(...data.raceResults.map(rr => rr.id), 0) + 1};
ALTER TABLE RaceIncident AUTO_INCREMENT = ${Math.max(...data.raceIncidents.map(ri => ri.id), 0) + 1};

SELECT 'Seed data imported successfully!' AS Status;
`;

  const sqlPath = path.join(__dirname, '..', 'SEED_DATA.sql');
  fs.writeFileSync(sqlPath, sql);
  console.log(`✅ SQL seed file generated: ${sqlPath}`);
}

function escapeSQL(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
  }
  return value;
}

exportData();
