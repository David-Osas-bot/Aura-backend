import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// ── CORS — manual headers, no package needed ──
app.use((req, res, next) => {
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://aura-indol-nu.vercel.app',
        process.env.CLIENT_URL,
    ].filter(Boolean);

    const origin = req.headers.origin;

    if (!origin || allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    next();
});

app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

import paymentRoutes from './routes/payment.js';
import webhookRoutes from './routes/webhook.js';

app.use('/api/payment', paymentRoutes);
app.use('/webhook', webhookRoutes);

// Health check
app.get('/', (req, res) => res.json({ status: 'Aura API running ✅' }));

app.listen(process.env.PORT || 4000, () =>
    console.log(`Server running on port ${process.env.PORT || 4000}`)
);