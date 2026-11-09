/**
 * Petal & Thread - Trusted Server-Side Admin Role Assignment
 * 
 * Usage:
 *   node server/scripts/setAdminRole.js <email>
 * 
 * Example:
 *   node server/scripts/setAdminRole.js admin@petalandthread.com
 */

import { adminAuth, adminDb, isInitialized } from '../config/firebaseAdmin.js';

async function setAdminRole() {
  const targetEmail = process.argv[2];

  if (!targetEmail) {
    console.error('❌ Error: Please provide the target user email address as an argument.');
    console.log('Usage: node server/scripts/setAdminRole.js <email>');
    process.exit(1);
  }

  if (!isInitialized || !adminAuth) {
    console.error('❌ Error: Firebase Admin SDK is not initialized. Please ensure server/config/serviceAccountKey.json is present.');
    process.exit(1);
  }

  try {
    console.log(`🔍 Looking up user account for email: ${targetEmail}...`);
    const userRecord = await adminAuth.getUserByEmail(targetEmail);

    console.log(`✔ Found user UID: ${userRecord.uid}`);
    console.log('🔒 Setting server-side custom claim { admin: true }...');

    // Preserve existing custom claims to prevent accidental loss of other roles (e.g. seller)
    const existingClaims = userRecord.customClaims || {};
    const updatedClaims = {
      ...existingClaims,
      admin: true
    };

    await adminAuth.setCustomUserClaims(userRecord.uid, updatedClaims);

    console.log('✔ Custom claim { admin: true } assigned while preserving existing claims.');

    if (adminDb) {
      console.log('📝 Updating user role in Firestore "users" collection...');
      await adminDb.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || 'Marketplace Administrator',
        role: 'admin',
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log('✔ Firestore user record updated with role: "admin".');
    }

    console.log('\n🎉 SUCCESS: Admin privileges granted.');
    console.log(`User ${targetEmail} is now verified as a marketplace administrator.`);
    console.log('Note: If the user is currently logged in, they must refresh their token or re-login for new claims to take effect.\n');
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ Error: No user account found with email "${targetEmail}".`);
      console.log('Please register this account first in the app or Firebase Console, then re-run this script.');
    } else {
      console.error('❌ Failed to assign admin role:', error.message);
    }
    process.exit(1);
  }
}

setAdminRole();
