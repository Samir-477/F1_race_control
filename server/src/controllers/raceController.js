/**
 * Race Controller
 * Handles race management, log generation, and monitoring
 */

import { PrismaClient } from '@prisma/client';
import { simulateRace } from '../utils/raceSimulator.js';
import { generateIncidentDescription } from '../utils/geminiAI.js';

const prisma = new PrismaClient();

/**
 * Get all races with their status
 */
export async function getAllRaces(req, res) {
  try {
    const races = await prisma.race.findMany({
      include: {
        circuit: true,
        season: true,
        participations: {
          include: {
            team: {
              include: {
                drivers: true,
              },
            },
          },
        },
        logs: true,
        incidents: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Add hasLogs flag to each race
    const racesWithStatus = races.map(race => ({
      ...race,
      hasLogs: race.logs.length > 0,
      incidentCount: race.incidents.length,
    }));

    res.json(racesWithStatus);
  } catch (error) {
    console.error('Error fetching races:', error);
    res.status(500).json({ error: 'Failed to fetch races' });
  }
}

/**
 * Get a single race with full details
 */
export async function getRaceById(req, res) {
  try {
    const { raceId } = req.params;

    const race = await prisma.race.findUnique({
      where: { id: parseInt(raceId) },
      include: {
        circuit: true,
        season: true,
        participations: {
          include: {
            team: {
              include: {
                drivers: true,
              },
            },
          },
        },
        logs: {
          include: {
            driver: {
              include: {
                team: true,
              },
            },
          },
          orderBy: {
            lap: 'desc',
          },
        },
        incidents: {
          include: {
            driver: {
              include: {
                team: true,
              },
            },
            penalty: true,
          },
          orderBy: {
            lap: 'asc',
          },
        },
      },
    });

    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }

    res.json(race);
  } catch (error) {
    console.error('Error fetching race:', error);
    res.status(500).json({ error: 'Failed to fetch race details' });
  }
}

/**
 * Generate race logs for a race
 */
export async function generateRaceLogs(req, res) {
  try {
    const { raceId } = req.params;

    // Get race with participations
    const race = await prisma.race.findUnique({
      where: { id: parseInt(raceId) },
      include: {
        circuit: true,
        participations: {
          include: {
            team: {
              include: {
                drivers: true,
              },
            },
          },
        },
        logs: true,
      },
    });

    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }

    // Check if logs already exist
    if (race.logs.length > 0) {
      return res.status(400).json({ error: 'Race logs already exist for this race' });
    }

    // Get all drivers from participating teams
    const drivers = race.participations.flatMap(p => 
      p.team.drivers.map(d => ({
        ...d,
        team: p.team,
      }))
    );

    if (drivers.length === 0) {
      return res.status(400).json({ error: 'No drivers found for this race' });
    }

    // Simulate the race
    const raceResults = simulateRace(drivers, race.circuit);

    // Store race logs in database
    const logPromises = raceResults.standings.map((result, index) => {
      return prisma.raceLog.create({
        data: {
          raceId: race.id,
          driverId: result.driverId,
          teamId: result.teamId,
          lap: raceResults.totalLaps,
          timestamp: new Date(),
          description: `Final position: P${result.position}. Total time: ${result.totalTime}. Fastest lap: ${result.fastestLap} (Lap ${result.fastestLapNumber})`,
          severity: 'INFO',
        },
      });
    });

    await Promise.all(logPromises);

    // Update race status to IN_PROGRESS
    await prisma.race.update({
      where: { id: race.id },
      data: { status: 'IN_PROGRESS' },
    });

    res.json({
      message: 'Race logs generated successfully',
      standings: raceResults.standings,
      fastestLap: raceResults.fastestLap,
      totalLaps: raceResults.totalLaps,
    });
  } catch (error) {
    console.error('Error generating race logs:', error);
    res.status(500).json({ error: 'Failed to generate race logs' });
  }
}

/**
 * Get race standings (current positions)
 */
export async function getRaceStandings(req, res) {
  try {
    const { raceId } = req.params;

    const race = await prisma.race.findUnique({
      where: { id: parseInt(raceId) },
      include: {
        circuit: true,
        participations: {
          include: {
            team: {
              include: {
                drivers: true,
              },
            },
          },
        },
        logs: {
          include: {
            driver: {
              include: {
                team: true,
              },
            },
          },
        },
      },
    });

    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }

    if (race.logs.length === 0) {
      return res.status(400).json({ error: 'No race logs found. Generate logs first.' });
    }

    // Get all drivers from participating teams
    const drivers = race.participations.flatMap(p => 
      p.team.drivers.map(d => ({
        ...d,
        team: p.team,
      }))
    );

    // Re-simulate to get standings (or retrieve from logs)
    const raceResults = simulateRace(drivers, race.circuit);

    // Get incidents and penalties for each driver
    const incidents = await prisma.raceIncident.findMany({
      where: { raceId: race.id },
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
        penalty: totalPenalty > 0 ? `+${totalPenalty}s` : '0s',
        penaltySeconds: totalPenalty,
        incidents: driverIncidents.length,
      };
    });

    // Re-sort by total time + penalties
    standingsWithPenalties.sort((a, b) => {
      const aTime = parseFloat(a.totalTime.split(':')[0]) * 60 + parseFloat(a.totalTime.split(':')[1]) + a.penaltySeconds;
      const bTime = parseFloat(b.totalTime.split(':')[0]) * 60 + parseFloat(b.totalTime.split(':')[1]) + b.penaltySeconds;
      return aTime - bTime;
    });

    // Update positions
    standingsWithPenalties.forEach((standing, index) => {
      standing.position = index + 1;
    });

    res.json({
      standings: standingsWithPenalties,
      totalLaps: raceResults.totalLaps,
      fastestLap: raceResults.fastestLap,
    });
  } catch (error) {
    console.error('Error fetching race standings:', error);
    res.status(500).json({ error: 'Failed to fetch race standings' });
  }
}

/**
 * Create a new race incident
 */
export async function createIncident(req, res) {
  try {
    const { raceId } = req.params;
    const { driverId, lap, description, penaltyType, penaltyValue, useAI } = req.body;

    // Validate required fields
    if (!driverId || !lap) {
      return res.status(400).json({ error: 'Driver ID and lap are required' });
    }

    let finalDescription = description;

    // Use AI to generate description if requested
    if (useAI && !description) {
      const driver = await prisma.driver.findUnique({
        where: { id: parseInt(driverId) },
        include: { team: true },
      });

      if (driver) {
        finalDescription = await generateIncidentDescription({
          driverName: driver.name,
          lap: parseInt(lap),
          incidentType: penaltyType || 'General Incident',
          teamName: driver.team.name,
        });
      }
    }

    // Create penalty if specified
    let penalty = null;
    if (penaltyType && penaltyValue) {
      penalty = await prisma.penalty.create({
        data: {
          type: penaltyType,
          value: penaltyValue,
        },
      });
    }

    // Create incident
    const incident = await prisma.raceIncident.create({
      data: {
        raceId: parseInt(raceId),
        driverId: parseInt(driverId),
        lap: parseInt(lap),
        description: finalDescription || 'Incident under investigation',
        penaltyId: penalty?.id,
      },
      include: {
        driver: {
          include: {
            team: true,
          },
        },
        penalty: true,
      },
    });

    res.status(201).json(incident);
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
}

/**
 * Get all incidents for a race
 */
export async function getRaceIncidents(req, res) {
  try {
    const { raceId } = req.params;

    const incidents = await prisma.raceIncident.findMany({
      where: { raceId: parseInt(raceId) },
      include: {
        driver: {
          include: {
            team: true,
          },
        },
        penalty: true,
      },
      orderBy: {
        lap: 'asc',
      },
    });

    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
}

/**
 * Finalize race and publish results
 */
export async function finalizeRace(req, res) {
  try {
    const { raceId } = req.params;

    // Get final standings
    const standingsResponse = await getRaceStandings({ params: { raceId } }, { json: (data) => data });
    
    // Update race status to COMPLETED
    const race = await prisma.race.update({
      where: { id: parseInt(raceId) },
      data: { status: 'COMPLETED' },
      include: {
        circuit: true,
        season: true,
      },
    });

    res.json({
      message: 'Race finalized successfully',
      race,
    });
  } catch (error) {
    console.error('Error finalizing race:', error);
    res.status(500).json({ error: 'Failed to finalize race' });
  }
}
