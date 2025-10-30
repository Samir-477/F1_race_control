import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import * as raceController from '../controllers/raceController.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all circuits
router.get('/circuits', async (req, res) => {
  try {
    const circuits = await prisma.circuit.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(circuits);
  } catch (error) {
    console.error('Get circuits error:', error);
    res.status(500).json({ error: 'Failed to fetch circuits' });
  }
});

// Get all seasons
router.get('/seasons', async (req, res) => {
  try {
    const seasons = await prisma.season.findMany({
      orderBy: { year: 'desc' }
    });
    res.json(seasons);
  } catch (error) {
    console.error('Get seasons error:', error);
    res.status(500).json({ error: 'Failed to fetch seasons' });
  }
});

// Get all races with filters
router.get('/races', async (req, res) => {
  try {
    const { circuitId, seasonId } = req.query;
    
    const where = {};
    if (circuitId) where.circuitId = parseInt(circuitId);
    if (seasonId) where.seasonId = parseInt(seasonId);

    const races = await prisma.race.findMany({
      where,
      include: {
        circuit: true,
        season: true,
        logs: true, // Include logs to check if they exist
        participations: {
          include: {
            team: {
              include: {
                drivers: true,
                car: true,
                sponsors: true
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(races);
  } catch (error) {
    console.error('Get races error:', error);
    res.status(500).json({ error: 'Failed to fetch races' });
  }
});

// Get completed races with results (for landing page)
router.get('/races/completed', async (req, res) => {
  try {
    const completedRaces = await prisma.race.findMany({
      where: { status: 'COMPLETED' },
      include: {
        circuit: true,
        season: true,
        participations: {
          include: {
            team: {
              include: {
                drivers: true
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' },
      take: 10 // Latest 10 completed races
    });

    // For each race, get the final standings from race logs
    const racesWithResults = await Promise.all(
      completedRaces.map(async (race) => {
        // Get race standings
        const standingsRes = await fetch(`http://localhost:3002/api/races/${race.id}/standings`, {
          headers: { 'Authorization': req.headers.authorization || '' }
        }).catch(() => null);

        let topThree = [];
        if (standingsRes && standingsRes.ok) {
          const standingsData = await standingsRes.json();
          topThree = standingsData.standings.slice(0, 3).map((s) => ({
            position: s.position,
            driver: s.driverName,
            team: s.teamName,
            time: s.totalTime,
            penalty: s.penalty
          }));
        }

        return {
          id: race.id,
          name: race.name,
          circuit: race.circuit.name,
          circuitLocation: race.circuit.location,
          circuitCountry: race.circuit.country,
          date: race.date,
          season: race.season.year,
          topThree
        };
      })
    );

    res.json(racesWithResults);
  } catch (error) {
    console.error('Get completed races error:', error);
    res.status(500).json({ error: 'Failed to fetch completed races' });
  }
});

// Get latest completed race with full standings (for landing page)
router.get('/races/latest-result', async (req, res) => {
  try {
    const latestRace = await prisma.race.findFirst({
      where: { 
        status: 'COMPLETED',
        isReviewed: true  // Only show reviewed races
      },
      include: {
        circuit: true,
        season: true,
        participations: {
          include: {
            team: {
              include: {
                drivers: true
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    if (!latestRace) {
      return res.json(null);
    }

    // Get all drivers from participating teams
    const drivers = latestRace.participations.flatMap(p => 
      p.team.drivers.map(d => ({
        ...d,
        team: p.team,
      }))
    );

    // Re-simulate to get standings
    const { simulateRace } = await import('../utils/raceSimulator.js');
    const raceResults = simulateRace(drivers, latestRace.circuit);

    // Get incidents and penalties for each driver
    const incidents = await prisma.raceIncident.findMany({
      where: { raceId: latestRace.id },
      include: {
        penalty: true,
        driver: true,
      },
    });

    // Apply penalties to standings
    const standingsWithPenalties = raceResults.standings.map(standing => {
      const driverIncidents = incidents.filter(inc => inc.driverId === standing.driverId);
      const totalPenalty = driverIncidents.reduce((sum, inc) => {
        if (inc.penalty && inc.penalty.type === 'TimePenalty') {
          const penaltySeconds = parseFloat(inc.penalty.value.replace(/[^0-9.]/g, ''));
          return sum + penaltySeconds;
        }
        return sum;
      }, 0);

      return {
        ...standing,
        penalty: totalPenalty > 0 ? `${totalPenalty}s` : '0s',
        penaltySeconds: totalPenalty,
      };
    });

    // Re-sort by total time + penalties
    standingsWithPenalties.sort((a, b) => {
      const aTime = parseFloat(a.totalTime.split(':')[0]) * 60 + parseFloat(a.totalTime.split(':')[1]) + a.penaltySeconds;
      const bTime = parseFloat(b.totalTime.split(':')[0]) * 60 + parseFloat(b.totalTime.split(':')[1]) + b.penaltySeconds;
      return aTime - bTime;
    });

    // Update positions and calculate points
    const finalStandings = standingsWithPenalties.map((standing, index) => {
      const position = index + 1;
      // F1 points system: 25, 18, 15, 12, 10, 8, 6, 4, 2, 1
      const pointsMap = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
      const points = position <= 10 ? pointsMap[position - 1] : 0;

      return {
        position,
        driver: standing.driverName,
        team: standing.teamName,
        time: position === 1 ? standing.totalTime : standing.gap,
        points,
        penalty: standing.penalty
      };
    });

    const result = {
      id: latestRace.id,
      name: latestRace.name,
      circuit: latestRace.circuit.name,
      circuitLocation: latestRace.circuit.location,
      circuitCountry: latestRace.circuit.country,
      date: latestRace.date,
      season: latestRace.season.year,
      standings: finalStandings
    };

    res.json(result);
  } catch (error) {
    console.error('Get latest race result error:', error);
    res.status(500).json({ error: 'Failed to fetch latest race result' });
  }
});

// Create a new race (Admin only)
router.post('/races', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can create races' });
  }

  try {
    const { name, date, circuitId, seasonId, teamIds } = req.body;

    if (!name || !date || !circuitId || !seasonId || !teamIds || !Array.isArray(teamIds)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify circuit and season exist
    const circuit = await prisma.circuit.findUnique({ where: { id: parseInt(circuitId) } });
    const season = await prisma.season.findUnique({ where: { id: parseInt(seasonId) } });

    if (!circuit) return res.status(400).json({ error: 'Circuit not found' });
    if (!season) return res.status(400).json({ error: 'Season not found' });

    // Verify all teams exist
    const teams = await prisma.team.findMany({
      where: { id: { in: teamIds.map(id => parseInt(id)) } }
    });

    if (teams.length !== teamIds.length) {
      return res.status(400).json({ error: 'One or more teams not found' });
    }

    // Create race with participations
    const race = await prisma.race.create({
      data: {
        name,
        date: new Date(date),
        circuitId: parseInt(circuitId),
        seasonId: parseInt(seasonId),
        participations: {
          create: teamIds.map(teamId => ({
            teamId: parseInt(teamId)
          }))
        }
      },
      include: {
        circuit: true,
        season: true,
        participations: {
          include: {
            team: {
              include: {
                drivers: true,
                car: true,
                sponsors: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(race);
  } catch (error) {
    console.error('Create race error:', error);
    res.status(500).json({ error: 'Failed to create race' });
  }
});

// Get race results for a specific race
router.get('/races/:id/results', authMiddleware, async (req, res) => {
  try {
    const raceId = parseInt(req.params.id);

    const results = await prisma.raceResult.findMany({
      where: { raceId },
      include: {
        driver: true,
        team: true
      },
      orderBy: { position: 'asc' }
    });

    res.json(results);
  } catch (error) {
    console.error('Get race results error:', error);
    res.status(500).json({ error: 'Failed to fetch race results' });
  }
});

// Get teams participating in a specific race
router.get('/races/:id/participants', async (req, res) => {
  try {
    const raceId = parseInt(req.params.id);

    const race = await prisma.race.findUnique({
      where: { id: raceId },
      include: {
        circuit: true,
        season: true,
        participations: {
          include: {
            team: {
              include: {
                drivers: true,
                car: true,
                sponsors: true
              }
            }
          }
        }
      }
    });

    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }

    res.json(race);
  } catch (error) {
    console.error('Get race participants error:', error);
    res.status(500).json({ error: 'Failed to fetch race participants' });
  }
});

// Update race participants (Admin only)
router.put('/races/:id/participants', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can update race participants' });
  }

  try {
    const raceId = parseInt(req.params.id);
    const { teamIds } = req.body;

    if (!Array.isArray(teamIds)) {
      return res.status(400).json({ error: 'teamIds must be an array' });
    }

    // Verify race exists
    const race = await prisma.race.findUnique({ where: { id: raceId } });
    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }

    // Verify all teams exist
    const teams = await prisma.team.findMany({
      where: { id: { in: teamIds.map(id => parseInt(id)) } }
    });

    if (teams.length !== teamIds.length) {
      return res.status(400).json({ error: 'One or more teams not found' });
    }

    // Update participations
    await prisma.raceParticipation.deleteMany({
      where: { raceId }
    });

    await prisma.raceParticipation.createMany({
      data: teamIds.map(teamId => ({
        raceId,
        teamId: parseInt(teamId)
      }))
    });

    // Return updated race
    const updatedRace = await prisma.race.findUnique({
      where: { id: raceId },
      include: {
        circuit: true,
        season: true,
        participations: {
          include: {
            team: {
              include: {
                drivers: true,
                car: true,
                sponsors: true
              }
            }
          }
        }
      }
    });

    res.json(updatedRace);
  } catch (error) {
    console.error('Update race participants error:', error);
    res.status(500).json({ error: 'Failed to update race participants' });
  }
});

// Delete a race (Admin only - only COMPLETED races)
router.delete('/races/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can delete races' });
  }

  try {
    const raceId = parseInt(req.params.id);

    // Check if race exists and is COMPLETED
    const race = await prisma.race.findUnique({
      where: { id: raceId }
    });

    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }

    if (race.status !== 'COMPLETED') {
      return res.status(400).json({ 
        error: 'Only completed races can be deleted. Current status: ' + race.status 
      });
    }

    // Delete related records first (in correct order to avoid foreign key constraints)
    // 1. Delete penalty assignments (references race incidents)
    await prisma.penaltyAssignment.deleteMany({
      where: {
        incident: {
          raceId: raceId
        }
      }
    });

    // 2. Delete race incidents
    await prisma.raceIncident.deleteMany({
      where: { raceId: raceId }
    });

    // 3. Delete race results
    await prisma.raceResult.deleteMany({
      where: { raceId: raceId }
    });

    // 4. Delete race logs
    await prisma.raceLog.deleteMany({
      where: { raceId: raceId }
    });

    // 5. Delete race participations
    await prisma.raceParticipation.deleteMany({
      where: { raceId: raceId }
    });

    // 6. Finally, delete the race itself
    await prisma.race.delete({
      where: { id: raceId }
    });

    res.json({ message: 'Race deleted successfully', race });
  } catch (error) {
    console.error('Delete race error:', error);
    res.status(500).json({ error: 'Failed to delete race' });
  }
});

// ===== RACE MONITORING ENDPOINTS =====

// Get active/latest race for stewards (monitoring section)
router.get('/races/active', authMiddleware, async (req, res) => {
  try {
    const race = await prisma.race.findFirst({
      where: {
        OR: [
          { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
          { 
            status: 'COMPLETED',
            isReviewed: false  // Include completed but not yet reviewed races
          }
        ]
      },
      include: {
        circuit: true,
        season: true,
        participations: {
          include: {
            team: {
              include: {
                drivers: true,
                car: true,
                sponsors: true
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    if (!race) {
      return res.status(404).json({ error: 'No active race found' });
    }

    res.json(race);
  } catch (error) {
    console.error('Get active race error:', error);
    res.status(500).json({ error: 'Failed to fetch active race' });
  }
});

// Get race logs for a specific race
router.get('/races/:id/logs', authMiddleware, async (req, res) => {
  try {
    const raceId = parseInt(req.params.id);

    const logs = await prisma.raceLog.findMany({
      where: { raceId },
      include: {
        driver: {
          include: { team: true }
        },
        team: true
      },
      orderBy: [
        { lap: 'asc' },
        { timestamp: 'asc' }
      ]
    });

    res.json(logs);
  } catch (error) {
    console.error('Get race logs error:', error);
    res.status(500).json({ error: 'Failed to fetch race logs' });
  }
});

// Create race log entry
router.post('/races/:id/logs', authMiddleware, async (req, res) => {
  try {
    const raceId = parseInt(req.params.id);
    const { lap, description, severity = 'INFO', driverId, teamId } = req.body;

    if (!lap || !description) {
      return res.status(400).json({ error: 'Lap and description are required' });
    }

    // Verify race exists
    const race = await prisma.race.findUnique({ where: { id: raceId } });
    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }

    const log = await prisma.raceLog.create({
      data: {
        raceId,
        lap: parseInt(lap),
        description,
        severity,
        driverId: driverId ? parseInt(driverId) : null,
        teamId: teamId ? parseInt(teamId) : null
      },
      include: {
        driver: {
          include: { team: true }
        },
        team: true
      }
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Create race log error:', error);
    res.status(500).json({ error: 'Failed to create race log' });
  }
});

// Generate random race logs for a race
router.post('/races/:id/generate-logs', authMiddleware, async (req, res) => {
  try {
    const raceId = parseInt(req.params.id);

    // Get race with participants
    const race = await prisma.race.findUnique({
      where: { id: raceId },
      include: {
        circuit: true,
        participations: {
          include: {
            team: {
              include: {
                drivers: true
              }
            }
          }
        }
      }
    });

    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }

    // Generate random race logs
    const logs = generateRaceLogs(race);
    
    // Create logs in database
    const createdLogs = await prisma.raceLog.createMany({
      data: logs.map(log => ({
        raceId,
        lap: log.lap,
        description: log.description,
        severity: log.severity,
        driverId: log.driverId,
        teamId: log.teamId
      }))
    });

    res.json({ message: `Generated ${logs.length} race logs`, count: logs.length });
  } catch (error) {
    console.error('Generate race logs error:', error);
    res.status(500).json({ error: 'Failed to generate race logs' });
  }
});

// Get incidents for a race
router.get('/races/:id/incidents', authMiddleware, async (req, res) => {
  try {
    const raceId = parseInt(req.params.id);

    const incidents = await prisma.raceIncident.findMany({
      where: { raceId },
      include: {
        driver: {
          include: { team: true }
        },
        penalty: true,
        penaltyAssignments: {
          include: {
            steward: true,
            approvedBy: true
          }
        }
      },
      orderBy: { lap: 'asc' }
    });

    res.json(incidents);
  } catch (error) {
    console.error('Get race incidents error:', error);
    res.status(500).json({ error: 'Failed to fetch race incidents' });
  }
});

// Create incident
router.post('/races/:id/incidents', authMiddleware, async (req, res) => {
  try {
    const raceId = parseInt(req.params.id);
    const { lap, description, driverId } = req.body;

    if (!lap || !description || !driverId) {
      return res.status(400).json({ error: 'Lap, description, and driverId are required' });
    }

    // Verify race exists
    const race = await prisma.race.findUnique({ where: { id: raceId } });
    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }

    const incident = await prisma.raceIncident.create({
      data: {
        raceId,
        lap: parseInt(lap),
        description,
        driverId: parseInt(driverId)
      },
      include: {
        driver: {
          include: { team: true }
        }
      }
    });

    res.status(201).json(incident);
  } catch (error) {
    console.error('Create incident error:', error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

// Assign penalty to incident
router.post('/incidents/:id/penalties', authMiddleware, async (req, res) => {
  try {
    const incidentId = parseInt(req.params.id);
    const { penaltyType, penaltyValue } = req.body;

    if (!penaltyType || !penaltyValue) {
      return res.status(400).json({ error: 'Penalty type and value are required' });
    }

    // Verify incident exists
    const incident = await prisma.raceIncident.findUnique({ where: { id: incidentId } });
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Create penalty
    const penalty = await prisma.penalty.create({
      data: {
        type: penaltyType,
        value: penaltyValue
      }
    });

    // Update incident with penalty
    const updatedIncident = await prisma.raceIncident.update({
      where: { id: incidentId },
      data: { penaltyId: penalty.id },
      include: {
        driver: {
          include: { team: true }
        },
        penalty: true
      }
    });

    // Create penalty assignment
    const assignment = await prisma.penaltyAssignment.create({
      data: {
        incidentId,
        stewardId: req.user.id,
        status: 'PENDING'
      },
      include: {
        steward: true
      }
    });

    res.status(201).json({ incident: updatedIncident, assignment });
  } catch (error) {
    console.error('Assign penalty error:', error);
    res.status(500).json({ error: 'Failed to assign penalty' });
  }
});

// Approve penalty assignment
router.put('/penalties/:id/approve', authMiddleware, async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);

    const assignment = await prisma.penaltyAssignment.update({
      where: { id: assignmentId },
      data: {
        status: 'APPROVED',
        approvedById: req.user.id
      },
      include: {
        incident: {
          include: {
            driver: {
              include: { team: true }
            },
            penalty: true
          }
        },
        steward: true,
        approvedBy: true
      }
    });

    res.json(assignment);
  } catch (error) {
    console.error('Approve penalty error:', error);
    res.status(500).json({ error: 'Failed to approve penalty' });
  }
});

// Get steward's race history
router.get('/steward/history', authMiddleware, async (req, res) => {
  try {
    const races = await prisma.race.findMany({
      where: {
        status: 'COMPLETED',
        incidents: {
          some: {
            penaltyAssignments: {
              some: {
                stewardId: req.user.id
              }
            }
          }
        }
      },
      include: {
        circuit: true,
        season: true,
        incidents: {
          include: {
            driver: {
              include: { team: true }
            },
            penalty: true,
            penaltyAssignments: {
              where: { stewardId: req.user.id },
              include: {
                steward: true,
                approvedBy: true
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json(races);
  } catch (error) {
    console.error('Get steward history error:', error);
    res.status(500).json({ error: 'Failed to fetch steward history' });
  }
});

// Race log generation function
function generateRaceLogs(race) {
  const logs = [];
  const teams = race.participations.map(p => p.team);
  const drivers = teams.flatMap(team => team.drivers);
  
  const scenarios = [
    // Start scenarios
    { lap: 1, severity: 'INFO', templates: [
      'Race start: {driver} gets a good launch from the grid',
      'Lights out! {driver} makes a strong start',
      'Race underway: {driver} maintains position at the start'
    ]},
    
    // Overtaking scenarios
    { lap: [5, 15], severity: 'INFO', templates: [
      '{driver} overtakes {driver2} into Turn {turn}',
      'Great move by {driver} to pass {driver2}',
      '{driver} makes a clean pass on {driver2}'
    ]},
    
    // Pit stop scenarios
    { lap: [10, 20, 30], severity: 'INFO', templates: [
      '{driver} pits for fresh tires',
      '{team} calls {driver} in for a pit stop',
      '{driver} makes a quick pit stop for strategy'
    ]},
    
    // Incident scenarios
    { lap: [8, 12, 18], severity: 'WARNING', templates: [
      '{driver} runs wide at Turn {turn}',
      '{driver} locks up and goes off track',
      '{driver} has a moment but continues'
    ]},
    
    // Critical incidents
    { lap: [6, 14, 22], severity: 'CRITICAL', templates: [
      '{driver} spins at Turn {turn}',
      '{driver} makes contact with {driver2}',
      '{driver} crashes out of the race'
    ]}
  ];

  const turns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  scenarios.forEach(scenario => {
    const lapRange = Array.isArray(scenario.lap) ? scenario.lap : [scenario.lap];
    
    lapRange.forEach(lap => {
      const numEvents = Math.floor(Math.random() * 3) + 1; // 1-3 events per lap
      
      for (let i = 0; i < numEvents; i++) {
        const template = scenario.templates[Math.floor(Math.random() * scenario.templates.length)];
        const driver1 = drivers[Math.floor(Math.random() * drivers.length)];
        const driver2 = drivers[Math.floor(Math.random() * drivers.length)];
        const turn = turns[Math.floor(Math.random() * turns.length)];
        
        let description = template
          .replace('{driver}', driver1.name)
          .replace('{driver2}', driver2.name)
          .replace('{team}', driver1.team.name)
          .replace('{turn}', turn);
        
        logs.push({
          lap,
          description,
          severity: scenario.severity,
          driverId: driver1.id,
          teamId: driver1.teamId
        });
      }
    });
  });

  return logs.sort((a, b) => a.lap - b.lap);
}

// ===== NEW RACE MONITORING ENDPOINTS (Using Controller) =====

// Generate race logs with realistic F1 simulation
router.post('/races/:raceId/generate-race-logs', authMiddleware, raceController.generateRaceLogs);

// Get race standings with penalties applied
router.get('/races/:raceId/standings', authMiddleware, raceController.getRaceStandings);

// Create incident with optional AI description
router.post('/races/:raceId/create-incident', authMiddleware, raceController.createIncident);

// Get all incidents for a race
router.get('/races/:raceId/race-incidents', authMiddleware, raceController.getRaceIncidents);

// Finalize & Publish race results (1-step process)
router.post('/races/:raceId/finalize', authMiddleware, raceController.finalizeRace);

// Review endpoint (for steward acceptance - just marks as reviewed)
router.post('/races/:raceId/review', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'STEWARD' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only stewards can review races' });
    }

    const raceId = parseInt(req.params.raceId);
    
    const race = await prisma.race.findUnique({
      where: { id: raceId },
      include: {
        circuit: true,
        season: true
      }
    });

    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }

    if (race.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Only completed races can be reviewed' });
    }

    if (race.isReviewed) {
      return res.status(400).json({ error: 'Race has already been reviewed' });
    }

    const updatedRace = await prisma.race.update({
      where: { id: raceId },
      data: {
        isReviewed: true,
        reviewedById: req.user.id,
        reviewedAt: new Date()
      },
      include: {
        circuit: true,
        season: true,
        reviewedBy: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.json({
      message: 'Race reviewed successfully',
      race: updatedRace
    });
  } catch (error) {
    console.error('Review race error:', error);
    res.status(500).json({ error: 'Failed to review race' });
  }
});

export default router;
