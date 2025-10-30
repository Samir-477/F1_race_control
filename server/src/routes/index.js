import { Router } from 'express';
import teamRoutes from './teams.js';
import sponsorRoutes from './sponsors.js';
import stewardsRoutes from './stewards.js';
import raceRoutes from './races.js';
import analyticsRoutes from './analytics.js';
import raceReportRoutes from './race-report.js';

const router = Router();

router.use('/teams', teamRoutes);
router.use('/sponsors', sponsorRoutes);
router.use('/stewards', stewardsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/race-report', raceReportRoutes); // New dedicated race report route
router.use('/', raceRoutes); // Race routes are at root level (/api/circuits, /api/seasons, etc.)

export default router;