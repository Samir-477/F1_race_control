import { Router } from 'express';
import teamRoutes from './teams.js';

const router = Router();

router.use('/teams', teamRoutes);

export default router;