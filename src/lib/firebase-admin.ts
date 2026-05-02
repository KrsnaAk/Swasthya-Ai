import * as admin from 'firebase-admin';

/**
 * @fileOverview Firebase Admin SDK Initialization.
 * Uses service account credentials from environment variables for privileged operations.
 */

const EXPECTED_PROJECT_ID = 'studio-6339447748-55b75';

if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      // Safety check to prevent project mismatch errors during development
      if (projectId !== EXPECTED_PROJECT_ID) {
        console.error(`FIREBASE_PROJECT_ID mismatch detected! \nExpected: ${EXPECTED_PROJECT_ID}\nGot: ${projectId}\nPlease update your .env.local with credentials from the studio-6339447748-55b75 project.`);
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          // Support both literal newlines and escaped \n sequences
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      console.log(`Firebase Admin initialized for project: ${projectId}`);
    } else {
      // Fallback for environments where ADC or App Hosting provides the context
      admin.initializeApp();
      console.log('Firebase Admin initialized with application default credentials.');
    }
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
