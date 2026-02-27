import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import registerRouter from './routes/register';
import gamesRouter from './routes/games';
import resultsRouter from './routes/results';
import voiceRouter from './routes/voice';
import quizzesRouter from './routes/quizzes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;
const allowedOriginsStr = process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:3001,http://localhost:5173';
const allowedOrigins = allowedOriginsStr.split(',');

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // originがundefined（Postman等からの直接アクセス）の場合は許可
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/register', registerRouter);
app.use('/api/games', gamesRouter);
app.use('/api/results', resultsRouter);
app.use('/api/voice', voiceRouter);
app.use('/api/quizzes', quizzesRouter);

// Health check
app.get('/health', async (req, res) => {
    try {
        const { supabase } = await import('./db/client');
        const { error } = await supabase.from('users').select('*', { count: 'exact', head: true });

        if (error) throw error;

        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: 'connected',
            uptime: Math.round(process.uptime()),
        });
    } catch (err) {
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            uptime: Math.round(process.uptime()),
        });
    }
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});