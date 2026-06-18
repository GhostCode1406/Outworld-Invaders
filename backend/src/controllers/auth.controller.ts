import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET as string;
const SALT_ROUNDS = 10;

export async function register(req: Request, res: Response) {
    try {
        const { username, password } = req.body;

        // Validation basique
        if (!username || !password) {
            return res.status(400).json({ error: 'username and password are required' });
        }
        if (username.length < 3 || password.length < 6) {
            return res.status(400).json({ error: 'username must be ≥3 chars, password ≥6 chars' });
        }

        // Hash du mot de passe
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Création en BDD
        const user = await prisma.user.create({
            data: { username, password: passwordHash }
        });

        return res.status(201).json({
            id: user.id,
            username: user.username,
            createdAt: user.createdAt
        });
    } catch (err: any) {
        // username déjà pris (contrainte unique violée)
        if (err.code === 'P2002') {
            return res.status(409).json({ error: 'username already taken' });
        }
        console.error(err);
        return res.status(500).json({ error: 'internal server error' });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'username and password are required' });
        }

        // Récupération du user
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(401).json({ error: 'invalid credentials' });
        }

        // Comparaison du mot de passe
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'invalid credentials' });
        }

        // Génération du JWT
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            token,
            user: { id: user.id, username: user.username }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'internal server error' });
    }
}