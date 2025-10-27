import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all sponsors
router.get('/', async (req, res) => {
  try {
    const sponsors = await prisma.sponsor.findMany({
      include: {
        teams: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    res.json(sponsors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
});

export default router;
