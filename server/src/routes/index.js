import { Router } from 'express';
import teamRoutes from './teams.js';
import sponsorRoutes from './sponsors.js';
import stewardsRoutes from './stewards.js';

const router = Router();

router.use('/teams', teamRoutes);
router.use('/sponsors', sponsorRoutes);
router.use('/stewards', stewardsRoutes);

export default router;