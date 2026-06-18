import { Router } from 'express';
import { createScore, getLeaderboard } from '../controllers/score.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// GET /scores — public (leaderboard)
router.get('/', getLeaderboard);

// POST /scores — protégé (auth requise)
router.post('/', authenticate, createScore);

export default router;