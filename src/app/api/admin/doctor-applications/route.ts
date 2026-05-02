import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

/**
 * @fileOverview Privileged API to list doctor applications.
 * Requires a valid Firebase ID Token with Admin privileges.
 */

export async function GET(request: Request) {
  try {
    // 1. Verify Authorization Header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // 2. Verify Firebase ID Token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (tokenError: any) {
      console.error('Token Verification Failed:', tokenError.message);
      
      // Explicitly check for project mismatch (aud claim error)
      if (tokenError.code === 'auth/argument-error' || tokenError.message.includes('aud')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Firebase Project Mismatch',
          details: 'Backend is using a different Firebase Project than the frontend. Update FIREBASE_PROJECT_ID in .env.local.'
        }, { status: 403 });
      }
      throw tokenError;
    }

    const uid = decodedToken.uid;

    // 3. Verify Admin Role in Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get();
    const userData = userDoc.data();

    // Check for hardcoded admin UID or role
    const isAdmin = userData?.role === 'admin' || uid === "Zn1wDP2cfzNglUFfGyVQAi64qSk2";

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Access denied: Admin role required' }, { status: 403 });
    }

    // 4. Fetch Applications
    const snapshot = await adminDb.collection('doctorApplications')
      .orderBy('submittedAt', 'desc')
      .get();

    const applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      applications
    });

  } catch (error: any) {
    console.error('API Error (doctor-applications):', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}
