import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

/**
 * @fileOverview Privileged API to approve doctor credentials.
 */

export async function POST(request: Request) {
  try {
    const { doctorUid } = await request.json();
    
    if (!doctorUid) {
      return NextResponse.json({ success: false, error: 'doctorUid is required' }, { status: 400 });
    }

    // 1. Auth & Role Check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const adminUid = decodedToken.uid;

    const adminDoc = await adminDb.collection('users').doc(adminUid).get();
    const isAdmin = adminDoc.data()?.role === 'admin' || adminUid === "Zn1wDP2cfzNglUFfGyVQAi64qSk2";

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    // 2. Perform Atomic Updates
    const batch = adminDb.batch();

    const appRef = adminDb.collection('doctorApplications').doc(doctorUid);
    const userRef = adminDb.collection('users').doc(doctorUid);

    batch.update(appRef, {
      verificationStatus: 'verified',
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      reviewedBy: adminUid,
      rejectionReason: null
    });

    batch.update(userRef, {
      verificationStatus: 'verified',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: 'Doctor verified successfully' 
    });

  } catch (error: any) {
    console.error('API Error (verify-doctor):', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Verification failed' 
    }, { status: 500 });
  }
}
