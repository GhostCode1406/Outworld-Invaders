import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// POST /scores — soumet un nouveau score (route protégée)
export async function createScore(req: Request, res: Response) {
  try {
    // req.user est ajouté par le middleware authenticate
    if (!req.user) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const { wave, points } = req.body;

    // Validation
    if (typeof wave !== 'number' || typeof points !== 'number') {
      return res.status(400).json({ error: 'wave and points must be numbers' });
    }
    if (wave < 0 || points < 0) {
      return res.status(400).json({ error: 'wave and points must be positive' });
    }

    const score = await prisma.score.create({
      data: {
        userId: req.user.userId,
        wave,
        points
      }
    });

    return res.status(201).json(score);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

// GET /scores — leaderboard (top 10)
export async function getLeaderboard(req: Request, res: Response) {
  try {
    const topScores = await prisma.score.findMany({
      take: 10,
      orderBy: { points: 'desc' },
      include: {
        user: {
          select: { username: true } // on ne renvoie QUE le username, pas le hash !
        }
      }
    });

    // On reformate la réponse pour ne pas exposer l'userId
    const leaderboard = topScores.map(s => ({
      id: s.id,
      username: s.user.username,
      wave: s.wave,
      points: s.points,
      createdAt: s.createdAt
    }));

    return res.json(leaderboard);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}