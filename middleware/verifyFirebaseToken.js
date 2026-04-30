import admin from '../firebase-admin.js';

export async function verifyFirebaseToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({ error: 'Invalid token format' });
    }

    try {
        const decoded = await admin.auth().verifyIdToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('❌ Token verification failed:', err.code, err.message);

        if (err.code === 'auth/id-token-expired') {
            return res.status(401).json({ error: 'Session expired — please log in again' });
        }
        if (err.message?.includes('ECONNRESET') || err.message?.includes('socket')) {
            // Network issue verifying token — try once more
            try {
                const decoded = await admin.auth().verifyIdToken(token);
                req.user = decoded;
                return next();
            } catch {
                return res.status(503).json({ error: 'Network error — please try again' });
            }
        }

        return res.status(401).json({ error: 'Invalid token' });
    }
}