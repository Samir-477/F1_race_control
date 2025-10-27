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
      textColor,
      backgroundImageUrl,
      car,
      sponsors
    } = req.body;

    const team = await prisma.team.create({
      data: {
        name,
        fullName,
        description,
        base,
        teamChief,
        color,
        textColor,
        backgroundImageUrl,
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
    res.status(500).json({ error: 'Failed to create team' });
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
        color: req.body.color,
        textColor: req.body.textColor,
        backgroundImageUrl: req.body.backgroundImageUrl
      });
    }

    // Handle car update
    if (req.body.car) {
      updateData.car = {
        upsert: {
          create: {
            ...req.body.car,
            imageUrl: req.body.car.imageUrl || '' // Make imageUrl optional
          },
          update: {
            ...req.body.car,
            imageUrl: req.body.car.imageUrl || '' // Make imageUrl optional
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
    res.status(500).json({ error: 'Failed to delete driver' });
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
      }
    });
    res.json(team);
  } catch (error) {
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