import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

// Étend le type Request pour ajouter user (TypeScript)
declare global {
    namespace Express {
        interface Request {
            user?: { userId: number; username: string };
        }
    }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'missing or invalid token' });
    }

    const token = authHeader.substring(7); // retire "Bearer "

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'invalid or expired token' });
    }
}