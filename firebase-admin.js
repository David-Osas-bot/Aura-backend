import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

if (!admin.apps.length) {
  let credential;

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    // Production — read from env variable
    const serviceAccount = JSON.parse(
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    );
    credential = admin.credential.cert(serviceAccount);
  } else {
    // Local dev — read from file
    const { readFileSync } = await import('fs');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const serviceAccount = JSON.parse(
      readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8')
    );
    credential = admin.credential.cert(serviceAccount);
  }

  admin.initializeApp({ credential });
  console.log('✅ Firebase Admin initialized');
}

export const db = admin.firestore();
export default admin;