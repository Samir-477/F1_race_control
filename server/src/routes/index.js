import { Router } from 'express';
import teamRoutes from './teams.js';
import sponsorRoutes from './sponsors.js';
import stewardsRoutes from './stewards.js';
import raceRoutes from './races.js';

const router = Router();

router.use('/teams', teamRoutes);
router.use('/sponsors', sponsorRoutes);
router.use('/stewards', stewardsRoutes);
router.use('/', raceRoutes); // Race routes are at root level (/api/circuits, /api/seasons, etc.)

export default router;