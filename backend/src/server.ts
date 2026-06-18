import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import scoreRoutes from './routes/score.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Route de test
app.get('/', (req, res) => {
    res.json({ message: 'API Operational, commander ! 🗼' });
});

// Routes d'auth
app.use('/auth', authRoutes);

// Routes de scores
app.use('/scores', scoreRoutes);

app.listen(PORT, () => {
    console.log(`✅ Listening on http://localhost:${PORT}`);
});