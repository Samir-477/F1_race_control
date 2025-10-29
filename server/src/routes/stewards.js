import { Router } from 'express';
import { createRequire } from 'module';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');

const router = Router();
const prisma = new PrismaClient();

// Get all stewards (Admin only)
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can view stewards' });
  }

  try {
    const stewards = await prisma.user.findMany({
      where: {
        role: 'STEWARD'
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true
        // Don't return password
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(stewards);
  } catch (error) {
    console.error('Get stewards error:', error);
    res.status(500).json({ error: 'Failed to fetch stewards' });
  }
});

// Create a new steward (Admin only)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can create stewards' });
  }

  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the steward
    const steward = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'STEWARD'
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true
        // Don't return password
      }
    });

    res.status(201).json(steward);
  } catch (error) {
    console.error('Create steward error:', error);
    res.status(500).json({ error: error.message || 'Failed to create steward' });
  }
});

// Update a steward (Admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can update stewards' });
  }

  try {
    const { id } = req.params;
    const { username, password } = req.body;

    // Check if steward exists
    const steward = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!steward) {
      return res.status(404).json({ error: 'Steward not found' });
    }

    if (steward.role !== 'STEWARD') {
      return res.status(400).json({ error: 'User is not a steward' });
    }

    const updateData = {};

    // Update username if provided
    if (username && username !== steward.username) {
      // Check if new username already exists
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      updateData.username = username;
    }

    // Update password if provided
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update the steward
    const updatedSteward = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        username: true,
        role: true,
        updatedAt: true
      }
    });

    res.json(updatedSteward);
  } catch (error) {
    console.error('Update steward error:', error);
    res.status(500).json({ error: error.message || 'Failed to update steward' });
  }
});

// Delete a steward (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can delete stewards' });
  }

  try {
    const { id } = req.params;

    // Check if steward exists
    const steward = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!steward) {
      return res.status(404).json({ error: 'Steward not found' });
    }

    if (steward.role !== 'STEWARD') {
      return res.status(400).json({ error: 'User is not a steward' });
    }

    // Delete the steward
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Steward deleted successfully' });
  } catch (error) {
    console.error('Delete steward error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete steward' });
  }
});

export default router;
