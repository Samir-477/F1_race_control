import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        drivers: true,
        car: true,
        sponsors: true
      }
    });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get a single team
router.get('/:id', async (req, res) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        drivers: true,
        car: true,
        sponsors: true
      }
    });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Create a new team (Admin only)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can create teams' });
  }

  try {
    const {
      name,
      fullName,
      description,
      base,
      teamChief,
      color,
      car,
      sponsors
    } = req.body;

    // Validate required fields
    if (!name || !fullName || !description || !base || !teamChief || !color) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const team = await prisma.team.create({
      data: {
        name,
        fullName,
        description,
        base,
        teamChief,
        color,
        car: car ? {
          create: car
        } : undefined,
        sponsors: sponsors ? {
          connect: sponsors.map(id => ({ id }))
        } : undefined
      },
      include: {
        drivers: true,
        car: true,
        sponsors: true
      }
    });

    res.status(201).json(team);
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: error.message || 'Failed to create team' });
  }
});

// Update a team (Admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can update teams' });
  }

  try {
    const teamId = parseInt(req.params.id);
    const updateData = {};

    // Handle team details update
    if (req.body.name) {
      Object.assign(updateData, {
        name: req.body.name,
        fullName: req.body.fullName,
        description: req.body.description,
        base: req.body.base,
        teamChief: req.body.teamChief,
        color: req.body.color
      });
    }

    // Handle car update
    if (req.body.car) {
      updateData.car = {
        upsert: {
          create: {
            model: req.body.car.model,
            engine: req.body.car.engine,
            chassis: req.body.car.chassis
          },
          update: {
            model: req.body.car.model,
            engine: req.body.car.engine,
            chassis: req.body.car.chassis
          }
        }
      };
    }

    // Handle sponsors update
    if (req.body.sponsors) {
      updateData.sponsors = {
        set: req.body.sponsors.map(id => ({ id: parseInt(id) }))
      };
    }

    // Handle new driver
    if (req.body.drivers) {
      // Check if team already has 2 drivers
      const currentDrivers = await prisma.driver.findMany({
        where: { teamId }
      });

      if (currentDrivers.length >= 2) {
        return res.status(400).json({ error: 'Team already has maximum number of drivers (2)' });
      }

      updateData.drivers = {
        create: {
          name: req.body.drivers.name,
          number: parseInt(req.body.drivers.number),
          nationality: req.body.drivers.nationality,
          imageUrl: req.body.drivers.imageUrl || ''
        }
      };
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data: updateData,
      include: {
        drivers: true,
        car: true,
        sponsors: true
      }
    });

    res.json(team);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: error.message || 'Failed to update team' });
  }
});

// Create a new driver for a team
router.post('/:teamId/drivers', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can create drivers' });
  }

  try {
    const teamId = parseInt(req.params.teamId);
    
    // Check if team exists
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if team already has 2 drivers
    const currentDrivers = await prisma.driver.findMany({ where: { teamId } });
    if (currentDrivers.length >= 2) {
      return res.status(400).json({ error: 'Team already has maximum number of drivers (2)' });
    }

    const { name, number, nationality, imageUrl, podiums, points, worldChampionships } = req.body;

    const driver = await prisma.driver.create({
      data: {
        name,
        number: parseInt(number),
        nationality,
        imageUrl: imageUrl || '', // Keep imageUrl for drivers
        podiums: podiums ? parseInt(podiums) : 0,
        points: points ? parseFloat(points) : 0,
        worldChampionships: worldChampionships ? parseInt(worldChampionships) : 0,
        teamId
      }
    });

    res.status(201).json(driver);
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({ error: error.message || 'Failed to create driver' });
  }
});

// Update a driver
router.put('/:teamId/drivers/:driverId', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can update drivers' });
  }

  try {
    const driverId = parseInt(req.params.driverId);
    const teamId = parseInt(req.params.teamId);

    // Verify driver belongs to team
    const existingDriver = await prisma.driver.findFirst({
      where: { id: driverId, teamId }
    });

    if (!existingDriver) {
      return res.status(404).json({ error: 'Driver not found in this team' });
    }

    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.number) updateData.number = parseInt(req.body.number);
    if (req.body.nationality) updateData.nationality = req.body.nationality;
    if (req.body.imageUrl !== undefined) updateData.imageUrl = req.body.imageUrl;
    if (req.body.podiums !== undefined) updateData.podiums = parseInt(req.body.podiums);
    if (req.body.points !== undefined) updateData.points = parseFloat(req.body.points);
    if (req.body.worldChampionships !== undefined) updateData.worldChampionships = parseInt(req.body.worldChampionships);

    const driver = await prisma.driver.update({
      where: { id: driverId },
      data: updateData
    });

    res.json(driver);
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ error: error.message || 'Failed to update driver' });
  }
});

// Delete a driver
router.delete('/:teamId/drivers/:driverId', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can delete drivers' });
  }

  try {
    const driver = await prisma.driver.delete({
      where: {
        id: parseInt(req.params.driverId),
        teamId: parseInt(req.params.teamId)
      }
    });
    res.json(driver);
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({ error: 'Failed to delete driver' });
  }
});

// Create or add sponsor to team
router.post('/:teamId/sponsors', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can add sponsors' });
  }

  try {
    const teamId = parseInt(req.params.teamId);
    const { name, logoUrl, sponsorId } = req.body;

    // Check if team exists
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    let sponsor;
    
    // If sponsorId provided, connect existing sponsor
    if (sponsorId) {
      const updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: {
          sponsors: {
            connect: { id: parseInt(sponsorId) }
          }
        },
        include: { sponsors: true }
      });
      return res.json(updatedTeam);
    }

    // Otherwise create new sponsor and connect to team
    sponsor = await prisma.sponsor.create({
      data: {
        name,
        teams: {
          connect: { id: teamId }
        }
      }
    });

    const updatedTeam = await prisma.team.findUnique({
      where: { id: teamId },
      include: { sponsors: true, drivers: true, car: true }
    });

    res.status(201).json(updatedTeam);
  } catch (error) {
    console.error('Add sponsor error:', error);
    res.status(500).json({ error: error.message || 'Failed to add sponsor' });
  }
});

// Remove sponsor from team
router.delete('/:teamId/sponsors/:sponsorId', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can remove sponsors' });
  }

  try {
    const team = await prisma.team.update({
      where: { id: parseInt(req.params.teamId) },
      data: {
        sponsors: {
          disconnect: { id: parseInt(req.params.sponsorId) }
        }
      },
      include: { sponsors: true, drivers: true, car: true }
    });
    res.json(team);
  } catch (error) {
    console.error('Remove sponsor error:', error);
    res.status(500).json({ error: 'Failed to remove sponsor' });
  }
});

// Delete a team (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can delete teams' });
  }

  try {
    // First delete related records
    await prisma.car.deleteMany({
      where: { teamId: parseInt(req.params.id) }
    });

    await prisma.driver.updateMany({
      where: { teamId: parseInt(req.params.id) },
      data: { teamId: null }
    });

    const team = await prisma.team.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

export default router;