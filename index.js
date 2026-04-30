import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://aura-indol-nu.vercel.app',  // ← your exact Vercel URL
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error('❌ CORS blocked:', origin);
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight requests
app.options('*', cors());

app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

import paymentRoutes from './routes/payment.js';
import webhookRoutes from './routes/webhook.js';

app.use('/api/payment', paymentRoutes);
app.use('/webhook', webhookRoutes);

app.listen(process.env.PORT || 4000, () =>
    console.log(`Server running on port ${process.env.PORT || 4000}`)
);