import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// =====================================================
// STORED PROCEDURE ENDPOINTS
// =====================================================

// Get Championship Standings (direct query - bypass stored procedure for now)
router.get('/championship-standings/:seasonId/:type', authMiddleware, async (req, res) => {
  try {
    const { seasonId, type } = req.params;
    
    console.log('Fetching standings for:', { seasonId, type });
    
    if (!['driver', 'team'].includes(type)) {
      return res.status(400).json({ error: 'Type must be "driver" or "team"' });
    }

    const seasonIdInt = parseInt(seasonId);
    console.log('Season ID:', seasonIdInt, 'Type:', type);

    // Use direct query instead of stored procedure for now
    if (type === 'driver') {
      const standings = await prisma.$queryRaw`
        SELECT 
          d.id,
          d.name as driverName,
          d.number,
          t.name as teamName,
          t.color as teamColor,
          COALESCE(SUM(rr.points), 0) as totalPoints,
          COUNT(CASE WHEN rr.position = 1 THEN 1 END) as wins,
          COUNT(CASE WHEN rr.position <= 3 THEN 1 END) as podiums,
          COUNT(rr.id) as racesParticipated
        FROM Driver d
        LEFT JOIN Team t ON d.teamId = t.id
        LEFT JOIN RaceResult rr ON d.id = rr.driverId
        LEFT JOIN Race r ON rr.raceId = r.id
        WHERE r.seasonId = ${seasonIdInt} OR r.seasonId IS NULL
        GROUP BY d.id, d.name, d.number, t.name, t.color
        HAVING totalPoints > 0 OR racesParticipated > 0
        ORDER BY totalPoints DESC, wins DESC, podiums DESC
      `;

      // Convert BigInt to Number for JSON serialization
      const serialized = standings.map(row => ({
        ...row,
        totalPoints: Number(row.totalPoints),
        wins: Number(row.wins),
        podiums: Number(row.podiums),
        racesParticipated: Number(row.racesParticipated)
      }));

      console.log('Driver standings:', serialized);

      res.json({
        seasonId: seasonIdInt,
        type,
        standings: serialized
      });
    } else {
      // Team standings
      const standings = await prisma.$queryRaw`
        SELECT 
          t.id,
          t.name as teamName,
          t.fullName,
          t.color,
          COALESCE(SUM(rr.points), 0) as totalPoints,
          COUNT(CASE WHEN rr.position = 1 THEN 1 END) as wins,
          COUNT(CASE WHEN rr.position <= 3 THEN 1 END) as podiums,
          COUNT(DISTINCT rr.raceId) as racesParticipated
        FROM Team t
        LEFT JOIN RaceResult rr ON t.id = rr.teamId
        LEFT JOIN Race r ON rr.raceId = r.id
        WHERE r.seasonId = ${seasonIdInt} OR r.seasonId IS NULL
        GROUP BY t.id, t.name, t.fullName, t.color
        HAVING totalPoints > 0 OR racesParticipated > 0
        ORDER BY totalPoints DESC, wins DESC, podiums DESC
      `;

      // Convert BigInt to Number for JSON serialization
      const serialized = standings.map(row => ({
        ...row,
        totalPoints: Number(row.totalPoints),
        wins: Number(row.wins),
        podiums: Number(row.podiums),
        racesParticipated: Number(row.racesParticipated)
      }));

      console.log('Team standings:', serialized);

      res.json({
        seasonId: seasonIdInt,
        type,
        standings: serialized
      });
    }
  } catch (error) {
    console.error('Championship standings error:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Failed to fetch championship standings', details: error.message });
  }
});

// Generate Race Report (direct queries - stored procedure exists but bypassed for reliability)
router.get('/race-report/:raceId', authMiddleware, async (req, res) => {
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

// =====================================================
// FUNCTION ENDPOINTS
// =====================================================

// Calculate race time with penalties (calls function)
router.get('/race-time-with-penalties/:raceId/:driverId', authMiddleware, async (req, res) => {
  try {
    const { raceId, driverId } = req.params;

    const result = await prisma.$queryRawUnsafe(
      `SELECT CalculateRaceTimeWithPenalties(${parseInt(driverId)}, ${parseInt(raceId)}) AS totalTime`
    );

    res.json({
      raceId: parseInt(raceId),
      driverId: parseInt(driverId),
      totalTimeSeconds: result[0]?.totalTime || 0
    });
  } catch (error) {
    console.error('Calculate race time error:', error);
    res.status(500).json({ error: 'Failed to calculate race time' });
  }
});

// Get driver performance rating (calls function)
router.get('/driver-performance/:driverId/:seasonId', authMiddleware, async (req, res) => {
  try {
    const { driverId, seasonId } = req.params;

    const result = await prisma.$queryRawUnsafe(
      `SELECT GetDriverPerformanceRating(${parseInt(driverId)}, ${parseInt(seasonId)}) AS rating`
    );

    res.json({
      driverId: parseInt(driverId),
      seasonId: parseInt(seasonId),
      rating: result[0]?.rating || 0
    });
  } catch (error) {
    console.error('Driver performance error:', error);
    res.status(500).json({ error: 'Failed to calculate driver performance' });
  }
});

// =====================================================
// TRIGGER MANAGEMENT ENDPOINTS
// =====================================================

// Get trigger information
router.get('/triggers', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can view triggers' });
    }

    // Get list of triggers from database
    const triggers = await prisma.$queryRawUnsafe(`
      SELECT 
        TRIGGER_NAME as name,
        EVENT_MANIPULATION as event,
        EVENT_OBJECT_TABLE as tableName,
        ACTION_TIMING as timing,
        ACTION_STATEMENT as statement
      FROM information_schema.TRIGGERS
      WHERE TRIGGER_SCHEMA = DATABASE()
    `);

    res.json(triggers);
  } catch (error) {
    console.error('Get triggers error:', error);
    res.status(500).json({ error: 'Failed to fetch triggers' });
  }
});

// Get trigger execution logs (from RaceLog table)
router.get('/trigger-logs', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can view trigger logs' });
    }

    // Get logs created by triggers (penalty assignment logs)
    const logs = await prisma.raceLog.findMany({
      where: {
        description: {
          contains: 'Penalty assigned by steward'
        }
      },
      include: {
        race: {
          include: {
            circuit: true,
            season: true
          }
        },
        driver: {
          include: {
            team: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 50
    });

    res.json(logs);
  } catch (error) {
    console.error('Get trigger logs error:', error);
    res.status(500).json({ error: 'Failed to fetch trigger logs' });
  }
});

// Manually sync driver points (demonstrates trigger effect)
router.post('/sync-driver-points/:driverId', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can sync points' });
    }

    const { driverId } = req.params;

    // Get total points from race results
    const result = await prisma.raceResult.aggregate({
      where: { driverId: parseInt(driverId) },
      _sum: { points: true }
    });

    const totalPoints = result._sum.points || 0;

    // Update driver points
    const driver = await prisma.driver.update({
      where: { id: parseInt(driverId) },
      data: { points: totalPoints }
    });

    res.json({
      message: 'Driver points synced successfully',
      driver,
      totalPoints
    });
  } catch (error) {
    console.error('Sync driver points error:', error);
    res.status(500).json({ error: 'Failed to sync driver points' });
  }
});

// =====================================================
// COMPLEX QUERIES (Nested & Aggregate)
// =====================================================

// Nested Query: Drivers with incidents in completed races
router.get('/drivers-with-incidents', authMiddleware, async (req, res) => {
  try {
    const { seasonId } = req.query;

    // Nested query: Find drivers who have incidents in races that are completed
    const driversWithIncidents = await prisma.$queryRawUnsafe(`
      SELECT 
        d.id,
        d.name AS driverName,
        d.number,
        t.name AS teamName,
        t.color AS teamColor,
        COUNT(DISTINCT ri.id) AS totalIncidents,
        COUNT(DISTINCT ri.raceId) AS racesWithIncidents,
        COUNT(DISTINCT CASE WHEN p.type = 'TimePenalty' THEN ri.id END) AS timePenalties,
        COUNT(DISTINCT CASE WHEN p.type = 'GridPenalty' THEN ri.id END) AS gridPenalties,
        COUNT(DISTINCT CASE WHEN p.type = 'Warning' THEN ri.id END) AS warnings
      FROM Driver d
      INNER JOIN Team t ON d.teamId = t.id
      INNER JOIN RaceIncident ri ON d.id = ri.driverId
      LEFT JOIN Penalty p ON ri.penaltyId = p.id
      WHERE ri.raceId IN (
        SELECT r.id 
        FROM Race r 
        WHERE r.status = 'COMPLETED' 
        ${seasonId ? `AND r.seasonId = ${parseInt(seasonId)}` : ''}
      )
      GROUP BY d.id, d.name, d.number, t.name, t.color
      ORDER BY totalIncidents DESC
    `);

    // Convert BigInt to Number for JSON serialization
    const serialized = driversWithIncidents.map(row => ({
      ...row,
      totalIncidents: Number(row.totalIncidents),
      racesWithIncidents: Number(row.racesWithIncidents),
      timePenalties: Number(row.timePenalties),
      gridPenalties: Number(row.gridPenalties),
      warnings: Number(row.warnings)
    }));

    res.json(serialized);
  } catch (error) {
    console.error('Drivers with incidents error:', error);
    res.status(500).json({ error: 'Failed to fetch drivers with incidents' });
  }
});

// Aggregate Query: Penalty statistics by driver
router.get('/penalty-statistics/by-driver', authMiddleware, async (req, res) => {
  try {
    const { seasonId } = req.query;

    const stats = await prisma.$queryRawUnsafe(`
      SELECT 
        d.id AS driverId,
        d.name AS driverName,
        d.number,
        t.name AS teamName,
        t.color AS teamColor,
        COUNT(DISTINCT ri.id) AS totalIncidents,
        COUNT(DISTINCT p.id) AS totalPenalties,
        SUM(CASE WHEN p.type = 'TimePenalty' THEN 1 ELSE 0 END) AS timePenalties,
        SUM(CASE WHEN p.type = 'GridPenalty' THEN 1 ELSE 0 END) AS gridPenalties,
        SUM(CASE WHEN p.type = 'Warning' THEN 1 ELSE 0 END) AS warnings,
        SUM(CASE WHEN p.type = 'NoFurtherAction' THEN 1 ELSE 0 END) AS noFurtherActions,
        AVG(CASE 
          WHEN p.type = 'TimePenalty' THEN 
            CAST(REGEXP_REPLACE(p.value, '[^0-9.]', '') AS DECIMAL)
          ELSE 0 
        END) AS avgTimePenaltySeconds
      FROM Driver d
      INNER JOIN Team t ON d.teamId = t.id
      LEFT JOIN RaceIncident ri ON d.id = ri.driverId
      LEFT JOIN Penalty p ON ri.penaltyId = p.id
      LEFT JOIN Race r ON ri.raceId = r.id
      WHERE 1=1
      ${seasonId ? `AND r.seasonId = ${parseInt(seasonId)}` : ''}
      GROUP BY d.id, d.name, d.number, t.name, t.color
      HAVING totalPenalties > 0
      ORDER BY totalPenalties DESC, totalIncidents DESC
    `);

    // Convert BigInt to Number
    const serialized = stats.map(row => ({
      ...row,
      totalIncidents: Number(row.totalIncidents),
      totalPenalties: Number(row.totalPenalties),
      timePenalties: Number(row.timePenalties),
      gridPenalties: Number(row.gridPenalties),
      warnings: Number(row.warnings),
      noFurtherActions: Number(row.noFurtherActions),
      avgTimePenaltySeconds: row.avgTimePenaltySeconds ? Number(row.avgTimePenaltySeconds) : 0
    }));

    res.json(serialized);
  } catch (error) {
    console.error('Penalty statistics by driver error:', error);
    res.status(500).json({ error: 'Failed to fetch penalty statistics' });
  }
});

// Aggregate Query: Penalty statistics by team
router.get('/penalty-statistics/by-team', authMiddleware, async (req, res) => {
  try {
    const { seasonId } = req.query;

    const stats = await prisma.$queryRawUnsafe(`
      SELECT 
        t.id AS teamId,
        t.name AS teamName,
        t.color AS teamColor,
        COUNT(DISTINCT ri.id) AS totalIncidents,
        COUNT(DISTINCT p.id) AS totalPenalties,
        SUM(CASE WHEN p.type = 'TimePenalty' THEN 1 ELSE 0 END) AS timePenalties,
        SUM(CASE WHEN p.type = 'GridPenalty' THEN 1 ELSE 0 END) AS gridPenalties,
        SUM(CASE WHEN p.type = 'Warning' THEN 1 ELSE 0 END) AS warnings,
        SUM(CASE WHEN p.type = 'NoFurtherAction' THEN 1 ELSE 0 END) AS noFurtherActions,
        COUNT(DISTINCT d.id) AS driversInvolved
      FROM Team t
      INNER JOIN Driver d ON t.id = d.teamId
      LEFT JOIN RaceIncident ri ON d.id = ri.driverId
      LEFT JOIN Penalty p ON ri.penaltyId = p.id
      LEFT JOIN Race r ON ri.raceId = r.id
      WHERE 1=1
      ${seasonId ? `AND r.seasonId = ${parseInt(seasonId)}` : ''}
      GROUP BY t.id, t.name, t.color
      HAVING totalPenalties > 0
      ORDER BY totalPenalties DESC, totalIncidents DESC
    `);

    // Convert BigInt to Number
    const serialized = stats.map(row => ({
      ...row,
      totalIncidents: Number(row.totalIncidents),
      totalPenalties: Number(row.totalPenalties),
      timePenalties: Number(row.timePenalties),
      gridPenalties: Number(row.gridPenalties),
      warnings: Number(row.warnings),
      noFurtherActions: Number(row.noFurtherActions),
      driversInvolved: Number(row.driversInvolved)
    }));

    res.json(serialized);
  } catch (error) {
    console.error('Penalty statistics by team error:', error);
    res.status(500).json({ error: 'Failed to fetch penalty statistics' });
  }
});

// Aggregate Query: Penalty statistics by type
router.get('/penalty-statistics/by-type', authMiddleware, async (req, res) => {
  try {
    const { seasonId } = req.query;

    const stats = await prisma.$queryRawUnsafe(`
      SELECT 
        p.type AS penaltyType,
        COUNT(*) AS count,
        COUNT(DISTINCT ri.driverId) AS driversAffected,
        COUNT(DISTINCT ri.raceId) AS racesAffected,
        AVG(CASE 
          WHEN p.type = 'TimePenalty' THEN 
            CAST(REGEXP_REPLACE(p.value, '[^0-9.]', '') AS DECIMAL)
          ELSE NULL 
        END) AS avgPenaltyValue
      FROM Penalty p
      INNER JOIN RaceIncident ri ON p.id = ri.penaltyId
      LEFT JOIN Race r ON ri.raceId = r.id
      WHERE 1=1
      ${seasonId ? `AND r.seasonId = ${parseInt(seasonId)}` : ''}
      GROUP BY p.type
      ORDER BY count DESC
    `);

    // Convert BigInt to Number
    const serialized = stats.map(row => ({
      ...row,
      count: Number(row.count),
      driversAffected: Number(row.driversAffected),
      racesAffected: Number(row.racesAffected),
      avgPenaltyValue: row.avgPenaltyValue ? Number(row.avgPenaltyValue) : null
    }));

    res.json(serialized);
  } catch (error) {
    console.error('Penalty statistics by type error:', error);
    res.status(500).json({ error: 'Failed to fetch penalty statistics' });
  }
});

export default router;
