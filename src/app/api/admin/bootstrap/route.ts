import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

/**
 * @fileOverview Secure Admin Bootstrap API.
 * Creates the first admin user using environment variables.
 */

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();
    
    // 1. Security Check
    if (!secret || secret !== process.env.ADMIN_BOOTSTRAP_SECRET) {
      return NextResponse.json({ error: 'Unauthorized: Invalid bootstrap secret' }, { status: 403 });
    }

    const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
    const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
    const name = process.env.ADMIN_BOOTSTRAP_NAME;

    if (!email || !password || !name) {
       return NextResponse.json({ error: 'Missing admin bootstrap environment variables in server config' }, { status: 500 });
    }

    // 2. Manage Auth User
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
      console.log('Admin user already exists in Auth, updating role...');
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        userRecord = await adminAuth.createUser({
          email,
          password,
          displayName: name,
          emailVerified: true,
        });
        console.log('New Admin user created in Auth');
      } else if (e.code === 'auth/insufficient-permission') {
         return NextResponse.json({ 
           error: 'Insufficient Permission: Service account lacks Auth access.',
           instructions: 'Ensure service account has "Firebase Authentication Admin" and "Firebase Admin" roles.'
         }, { status: 500 });
      } else {
        throw e;
      }
    }

    const uid = userRecord.uid;

    // 3. Set Role in Firestore
    try {
      const userDocRef = adminDb.collection('users').doc(uid);
      const userSnapshot = await userDocRef.get();

      await userDocRef.set({
        uid,
        email,
        name,
        role: 'admin',
        updatedAt: new Date(),
        createdAt: userSnapshot.exists ? (userSnapshot.data()?.createdAt || new Date()) : new Date(),
        adminCreatedBy: 'bootstrap'
      }, { merge: true });
    } catch (fsError: any) {
      if (fsError.code === 7 || fsError.message.includes('permission')) {
        return NextResponse.json({ 
          error: 'Insufficient Permission: Service account lacks Firestore access.',
          details: fsError.message,
          instructions: 'Ensure service account has "Cloud Datastore User" or "Firebase Admin" roles in Google Cloud Console.'
        }, { status: 500 });
      }
      throw fsError;
    }

    return NextResponse.json({
      success: true,
      message: 'Admin bootstrap completed successfully',
      adminEmail: email,
      adminUid: uid,
      firestorePath: `users/${uid}`
    });

  } catch (error: any) {
    console.error('Bootstrap logic failure:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      details: 'Check if Firebase Admin is correctly configured with a Service Account if running locally.'
    }, { status: 500 });
  }
}
