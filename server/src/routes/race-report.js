import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Simple race report endpoint - no stored procedure
router.get('/:raceId', authMiddleware, async (req, res) => {
  try {
    const { raceId } = req.params;
    const raceIdInt = parseInt(raceId);

    console.log('Generating race report for race ID:', raceIdInt);
    
    // Get race basic info
    const raceInfo = await prisma.$queryRaw`
      SELECT 
        r.id,
        r.name AS raceName,
        r.date,
        r.status,
        c.name AS circuitName,
        c.location,
        c.country,
        c.length AS circuitLength,
        c.laps,
        s.year AS season,
        COUNT(DISTINCT rr.id) AS totalFinishers,
        COUNT(DISTINCT ri.id) AS totalIncidents,
        COUNT(DISTINCT p.id) AS totalPenalties
      FROM Race r
      INNER JOIN Circuit c ON r.circuitId = c.id
      INNER JOIN Season s ON r.seasonId = s.id
      LEFT JOIN RaceResult rr ON r.id = rr.raceId
      LEFT JOIN RaceIncident ri ON r.id = ri.raceId
      LEFT JOIN Penalty p ON ri.penaltyId = p.id
      WHERE r.id = ${raceIdInt}
      GROUP BY r.id, r.name, r.date, r.status, c.name, c.location, c.country, c.length, c.laps, s.year
    `;

    // Get race results
    const results = await prisma.$queryRaw`
      SELECT 
        rr.position,
        d.name AS driverName,
        d.number,
        t.name AS teamName,
        rr.time,
        rr.points,
        rr.penalty,
        rr.fastestLap
      FROM RaceResult rr
      INNER JOIN Driver d ON rr.driverId = d.id
      INNER JOIN Team t ON rr.teamId = t.id
      WHERE rr.raceId = ${raceIdInt}
      ORDER BY rr.position
    `;

    // Get incidents
    const incidents = await prisma.$queryRaw`
      SELECT 
        ri.lap,
        d.name AS driverName,
        t.name AS teamName,
        ri.description,
        p.type AS penaltyType,
        p.value AS penaltyValue
      FROM RaceIncident ri
      INNER JOIN Driver d ON ri.driverId = d.id
      INNER JOIN Team t ON d.teamId = t.id
      LEFT JOIN Penalty p ON ri.penaltyId = p.id
      WHERE ri.raceId = ${raceIdInt}
      ORDER BY ri.lap
    `;

    // Convert BigInt to Number for JSON serialization
    const serializedRaceInfo = raceInfo[0] ? {
      ...raceInfo[0],
      totalFinishers: Number(raceInfo[0].totalFinishers),
      totalIncidents: Number(raceInfo[0].totalIncidents),
      totalPenalties: Number(raceInfo[0].totalPenalties),
      circuitLength: Number(raceInfo[0].circuitLength),
      laps: Number(raceInfo[0].laps),
      season: Number(raceInfo[0].season)
    } : {};

    const serializedResults = results.map(row => ({
      ...row,
      position: Number(row.position),
      number: Number(row.number),
      points: Number(row.points)
    }));

    const serializedIncidents = incidents.map(row => ({
      ...row,
      lap: Number(row.lap)
    }));

    console.log('Race report generated successfully');

    res.json({
      raceId: raceIdInt,
      raceInfo: serializedRaceInfo,
      results: serializedResults,
      incidents: serializedIncidents
    });
    
  } catch (error) {
    console.error('Race report error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Failed to generate race report', details: error.message });
  }
});

export default router;
