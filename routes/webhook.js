import express from 'express';
import axios from 'axios';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

const router = express.Router();

// Create a SumUp checkout
router.post('/create-checkout', verifyFirebaseToken, async (req, res) => {
    try {
        const { data } = await axios.post(
            'https://api.sumup.com/v0.1/checkouts',
            {
                checkout_reference: `aura_${req.user.uid}_${Date.now()}`,
                amount: 9.99,
                currency: 'USD',
                merchant_code: process.env.SUMUP_MERCHANT_CODE,
                description: 'Aura — Lifetime Access',
                redirect_url: `${process.env.CLIENT_URL}/onboarding`,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.SUMUP_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        res.json({ checkoutId: data.id, checkoutUrl: data.hosted_checkout_url });
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to create checkout' });
    }
});

// Verify payment status (polled from client after redirect)
router.get('/verify/:checkoutId', verifyFirebaseToken, async (req, res) => {
    try {
        const { data } = await axios.get(
            `https://api.sumup.com/v0.1/checkouts/${req.params.checkoutId}`,
            { headers: { Authorization: `Bearer ${process.env.SUMUP_API_KEY}` } }
        );
        if (data.status === 'PAID') {
            // Mark user as paid in Firestore
            const { db } = await import('../firebase-admin.js');
            await db.collection('users').doc(req.user.uid).set(
                { paid: true, paidAt: new Date().toISOString() },
                { merge: true }
            );
        }
        res.json({ status: data.status });
    } catch (err) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

export default router;