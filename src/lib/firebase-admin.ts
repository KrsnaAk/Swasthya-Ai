import * as admin from 'firebase-admin';

/**
 * @fileOverview Firebase Admin SDK Initialization.
 * Uses service account credentials from environment variables for privileged operations.
 */

if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          // Support both literal newlines and escaped \n sequences
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin initialized with service account.');
    } else {
      // Fallback to application default credentials (useful for App Hosting or local dev with ADC)
      admin.initializeApp();
      console.log('Firebase Admin initialized with default credentials.');
    }
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
