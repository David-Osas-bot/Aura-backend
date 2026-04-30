import express from 'express';
import axios from 'axios';
import { db } from '../firebase-admin.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

const router = express.Router();

router.post('/create-checkout', verifyFirebaseToken, async (req, res) => {
    try {
        console.log('📦 Creating SumUp checkout for user:', req.user.uid);
        console.log('🔑 API Key exists:', !!process.env.SUMUP_API_KEY);
        console.log('🏪 Merchant Code:', process.env.SUMUP_MERCHANT_CODE);

        const payload = {
            checkout_reference: `aura_${req.user.uid}_${Date.now()}`,
            amount: 500,
            currency: 'GBP',
            merchant_code: process.env.SUMUP_MERCHANT_CODE,
            description: 'Aura — Lifetime Access',
            redirect_url: `${process.env.CLIENT_URL}/onboarding`,
            hosted_checkout: {
                enabled: true,       // ← THIS is what generates the hosted_checkout_url
            }
        };

        console.log('📤 Sending to SumUp:', JSON.stringify(payload, null, 2));

        const response = await axios.post(
            'https://api.sumup.com/v0.1/checkouts',
            payload,
            {
                headers: {
                    Authorization: `Bearer ${process.env.SUMUP_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const checkoutData = response.data;
        console.log('✅ SumUp response:', JSON.stringify(checkoutData, null, 2));

        // Correct SumUp hosted checkout URL format
        const checkoutUrl = checkoutData.hosted_checkout_url;

        if (!checkoutUrl) {
            throw new Error('SumUp did not return a hosted_checkout_url');
        }

        console.log('🔗 Checkout URL:', checkoutUrl);

        res.json({
            checkoutId: checkoutData.id,
            checkoutUrl,
        });

    } catch (err) {
        console.error('❌ SumUp Error Status:', err.response?.status);
        console.error('❌ SumUp Error Data:', JSON.stringify(err.response?.data, null, 2));
        console.error('❌ Full error:', err.message);
        res.status(500).json({
            error: 'Failed to create checkout',
            details: err.response?.data || err.message,
        });
    }
});

router.get('/verify/:checkoutId', verifyFirebaseToken, async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.sumup.com/v0.1/checkouts/${req.params.checkoutId}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.SUMUP_API_KEY}`,
                },
            }
        );

        const checkoutData = response.data;
        console.log('✅ Verify response:', JSON.stringify(checkoutData, null, 2));

        if (checkoutData.status === 'PAID') {
            await db.collection('users').doc(req.user.uid).set(
                { paid: true, paidAt: new Date().toISOString() },
                { merge: true }
            );
            console.log('✅ User marked as paid:', req.user.uid);
        }

        res.json({ status: checkoutData.status });

    } catch (err) {
        console.error('❌ Verify error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Verification failed' });
    }
});

export default router;