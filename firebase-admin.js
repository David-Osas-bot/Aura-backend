// import admin from 'firebase-admin';
// import dotenv from 'dotenv';
// dotenv.config();

// if (!admin.apps.length) {
//   let credential;

//   if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
//     // Production — read from env variable
//     const serviceAccount = JSON.parse(
//       process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
//     );
//     credential = admin.credential.cert(serviceAccount);
//   } else {
//     // Local dev — read from file
//     const { readFileSync } = await import('fs');
//     const { fileURLToPath } = await import('url');
//     const { dirname, join } = await import('path');
//     const __dirname = dirname(fileURLToPath(import.meta.url));
//     const serviceAccount = JSON.parse(
//       readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8')
//     );
//     credential = admin.credential.cert(serviceAccount);
//   }

//   admin.initializeApp({ credential });
//   console.log('✅ Firebase Admin initialized');
// }

// export const db = admin.firestore();
// export default admin;


import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

if (!admin.apps.length) {
  let credential;

  // 1. Check if we are on Railway (Production)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
      const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      credential = admin.credential.cert(serviceAccount);
      console.log('🚀 Firebase Admin initialized via Environment Variable');
    } catch (error) {
      console.error('❌ Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON:', error.message);
    }
  }
  // 2. Fallback to Local Development (File)
  else {
    try {
      const __dirname = dirname(fileURLToPath(import.meta.url));
      const serviceAccount = JSON.parse(
        readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8')
      );
      credential = admin.credential.cert(serviceAccount);
      console.log('🏠 Firebase Admin initialized via local JSON file');
    } catch (error) {
      console.error('❌ Local serviceAccountKey.json not found or invalid:', error.message);
    }
  }

  if (credential) {
    admin.initializeApp({ credential });
  } else {
    console.error('CRITICAL: Firebase could not be initialized. No credentials found.');
  }
}

export const db = admin.firestore();
export default admin;