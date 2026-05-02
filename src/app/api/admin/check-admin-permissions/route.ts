import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

/**
 * @fileOverview Safe Diagnostic API for Firebase Admin permissions.
 * Verifies if the configured service account has required IAM roles.
 */

export async function GET() {
  const diagnostics = {
    authAccess: false,
    firestoreAccess: false,
    errors: [] as string[],
    serviceAccount: process.env.FIREBASE_CLIENT_EMAIL || 'Not Set',
    projectId: process.env.FIREBASE_PROJECT_ID || 'Not Set'
  };

  try {
    // 1. Test Auth Access (Read-only check)
    const testEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || 'test@example.com';
    try {
      await adminAuth.getUserByEmail(testEmail).catch(e => {
        if (e.code === 'auth/user-not-found') return; // This is a success for permission test
        throw e;
      });
      diagnostics.authAccess = true;
    } catch (authError: any) {
      diagnostics.errors.push(`Auth Error: ${authError.message}`);
    }

    // 2. Test Firestore Access (Read-only check)
    try {
      await adminDb.collection('users').limit(1).get();
      diagnostics.firestoreAccess = true;
    } catch (fsError: any) {
      diagnostics.errors.push(`Firestore Error: ${fsError.message}`);
    }

    const success = diagnostics.authAccess && diagnostics.firestoreAccess;

    return NextResponse.json({
      success,
      diagnostics,
      recommendation: !success ? 'Go to Google Cloud Console > IAM & Admin. Find the service account and add roles: "Firebase Admin", "Cloud Datastore User", and "Firebase Authentication Admin".' : 'Permissions verified.'
    });

  } catch (globalError: any) {
    return NextResponse.json({
      success: false,
      error: globalError.message,
      diagnostics
    }, { status: 500 });
  }
}
