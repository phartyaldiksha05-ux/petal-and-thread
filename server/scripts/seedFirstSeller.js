/**
 * Petal & Thread - Bootstrap Flagship Artisan (First Seller)
 * 
 * Usage:
 *   node server/scripts/seedFirstSeller.js --email=sister@petalandthread.com --name="Petal & Thread Studio" --whatsapp="+919876543210" [--password="..."]
 * 
 * If --password is not provided, a secure password setup link is generated automatically.
 */

import { adminAuth, adminDb, isInitialized } from '../config/firebaseAdmin.js';

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const parts = arg.slice(2).split('=');
      const key = parts[0];
      const value = parts.slice(1).join('=');
      args[key] = value || true;
    }
  });
  return args;
}

async function seedFirstSeller() {
  const args = parseArgs();
  const email = args.email || process.env.FIRST_SELLER_EMAIL;
  const storeName = args.name || args.storeName || 'Petal & Thread Studio';
  const bio = args.bio || 'Founder and handcrafted artisan specializing in bespoke crochet flowers, delicate hair accessories, and tailored contemporary silhouettes.';
  const whatsappNumber = args.whatsapp || args.phone || '';
  const password = args.password || null;
  const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  if (!email) {
    console.error('❌ Error: Target seller email is required.');
    console.log('Usage: node server/scripts/seedFirstSeller.js --email=<email> [--name="..."] [--whatsapp="..."] [--password="..."]');
    process.exit(1);
  }

  if (!isInitialized || !adminAuth || !adminDb) {
    console.error('❌ Error: Firebase Admin SDK is not initialized. Please ensure server/config/serviceAccountKey.json is present.');
    process.exit(1);
  }

  try {
    console.log(`🌸 Setting up Flagship Creator profile for: ${email}...`);
    
    let userRecord;
    let isNewUser = false;

    try {
      userRecord = await adminAuth.getUserByEmail(email);
      console.log(`✔ Found existing Auth user with UID: ${userRecord.uid}`);
      
      // Update password if explicitly provided
      if (password) {
        await adminAuth.updateUser(userRecord.uid, { password });
        console.log('✔ Updated seller account password.');
      }
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        isNewUser = true;
        console.log(`ℹ Creating new Firebase Auth user for ${email}...`);
        
        const createPayload = {
          email: email,
          displayName: storeName,
          emailVerified: true
        };
        if (password) {
          createPayload.password = password;
        }

        userRecord = await adminAuth.createUser(createPayload);
        console.log(`✔ Created Auth user with UID: ${userRecord.uid}`);
      } else {
        throw err;
      }
    }

    // Preserve existing custom claims to prevent accidental privilege loss
    const existingClaims = userRecord.customClaims || {};
    const updatedClaims = {
      ...existingClaims,
      seller: true
    };

    await adminAuth.setCustomUserClaims(userRecord.uid, updatedClaims);
    console.log('✔ Assigned custom claim { seller: true } while preserving existing claims.');

    // Save user record in Firestore
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: storeName,
      role: 'seller',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('✔ User record saved in "users" collection with role: "seller".');

    // Create / update seller profile without stock photo placeholders
    const sellerProfileData = {
      sellerId: userRecord.uid,
      storeName: storeName,
      slug: slug,
      bio: bio,
      profileImage: '', // Strictly empty default; creator uploads their authentic image
      whatsappNumber: whatsappNumber,
      showWhatsapp: Boolean(whatsappNumber),
      isVerified: true, // Flagship artisan is verified by owner
      isFirstCreator: true,
      status: 'active',
      createdAt: userRecord.metadata?.creationTime || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await adminDb.collection('seller_profiles').doc(userRecord.uid).set(sellerProfileData, { merge: true });
    console.log('✔ Seller profile saved in "seller_profiles" collection.');

    // If password was not specified, generate a secure password setup link
    let passwordSetupNotice = '';
    if (!password) {
      try {
        const resetLink = await adminAuth.generatePasswordResetLink(email);
        passwordSetupNotice = `\n🔑 SECURE PASSWORD SETUP LINK:\n${resetLink}\n(Share this link with the seller to establish their private password securely)`;
      } catch (linkErr) {
        passwordSetupNotice = '\nℹ Note: Use Firebase Console or Admin to dispatch a password reset link to this email.';
      }
    }

    console.log('\n====================================================');
    console.log('🎉 SUCCESS: Flagship Creator Profile Provisioned!');
    console.log(`- Seller UID: ${userRecord.uid}`);
    console.log(`- Store Name: ${storeName}`);
    console.log(`- Storefront Path: /store/${slug}`);
    console.log(`- WhatsApp Number: ${whatsappNumber || '(Not configured)'}`);
    console.log(`- Verification Badge: ACTIVE`);
    if (passwordSetupNotice) {
      console.log(passwordSetupNotice);
    }
    console.log('\n👉 Next Step: Use this seller UID to migrate legacy products:');
    console.log(`   node server/scripts/migrateLegacyData.js --seller-id=${userRecord.uid}`);
    console.log('====================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to provision flagship creator profile:', error.message);
    process.exit(1);
  }
}

seedFirstSeller();
