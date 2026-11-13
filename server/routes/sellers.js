import express from 'express';
import { getDb, saveDb } from '../database.js';
import { requireAuth, requireAdmin, requireSellerOrAdmin } from '../middleware/auth.js';
import { adminAuth, adminDb, isInitialized } from '../config/firebaseAdmin.js';

const router = express.Router();

/**
 * Helper to get all sellers from Firestore or local database.
 */
async function getSellersList() {
  if (isInitialized && adminDb) {
    try {
      const snapshot = await adminDb.collection('seller_profiles').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn('Failed to read sellers from Firestore, falling back to local DB:', err.message);
    }
  }

  const db = getDb();
  return db.sellers || [];
}

/**
 * POST /api/sellers/register
 * Allows an authenticated Firebase user to apply to become an Artisan Seller.
 * Initial status is strictly 'pending' and isVerified is false.
 */
router.post('/register', requireAuth, async (req, res) => {
  const { storeName, phone, bio, category, email } = req.body;
  const uid = req.user.uid;

  if (!storeName || storeName.trim() === '') {
    return res.status(400).json({ error: 'Store or Artisan name is required.' });
  }

  const sellerProfile = {
    id: uid,
    sellerId: uid,
    storeName: storeName.trim(),
    email: email || req.user.email || '',
    phone: phone ? String(phone).trim() : '',
    bio: bio ? bio.trim() : '',
    category: category || 'Crochet & Accessories',
    status: 'pending', // Strictly pending initially
    isVerified: false,
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 1. Save to Firestore if available
  if (isInitialized && adminDb) {
    try {
      await adminDb.collection('seller_profiles').doc(uid).set(sellerProfile, { merge: true });
    } catch (dbErr) {
      console.error('Failed to save seller profile to Firestore:', dbErr);
    }
  }

  // 2. Save to local store.json
  const db = getDb();
  db.sellers = db.sellers || [];
  const existingIdx = db.sellers.findIndex(s => s.id === uid || s.sellerId === uid);
  if (existingIdx >= 0) {
    db.sellers[existingIdx] = { ...db.sellers[existingIdx], ...sellerProfile };
  } else {
    db.sellers.push(sellerProfile);
  }
  saveDb(db);

  res.status(201).json({
    message: 'Your artisan application has been submitted and is currently pending boutique curation review.',
    seller: sellerProfile
  });
});

/**
 * GET /api/sellers/me
 * Returns the authenticated user's seller profile.
 */
router.get('/me', requireAuth, async (req, res) => {
  const uid = req.user.uid;

  if (isInitialized && adminDb) {
    try {
      const doc = await adminDb.collection('seller_profiles').doc(uid).get();
      if (doc.exists) {
        return res.json({ seller: { id: doc.id, ...doc.data() } });
      }
    } catch (err) {
      console.warn('Firestore fetch failed, checking local db:', err.message);
    }
  }

  const db = getDb();
  const seller = (db.sellers || []).find(s => s.id === uid || s.sellerId === uid);
  if (!seller) {
    return res.status(404).json({ error: 'Seller profile not found.' });
  }

  res.json({ seller });
});

/**
 * PUT /api/sellers/me
 * Allows a seller to update their own contact details and bio.
 * Cannot alter status or isVerified.
 */
router.put('/me', requireAuth, async (req, res) => {
  const uid = req.user.uid;
  const { storeName, phone, bio, category } = req.body;

  const db = getDb();
  db.sellers = db.sellers || [];
  const existingIdx = db.sellers.findIndex(s => s.id === uid || s.sellerId === uid);

  if (existingIdx === -1) {
    return res.status(404).json({ error: 'Seller profile not found.' });
  }

  const existing = db.sellers[existingIdx];
  const updated = {
    ...existing,
    storeName: storeName !== undefined ? storeName.trim() : existing.storeName,
    phone: phone !== undefined ? String(phone).trim() : existing.phone,
    bio: bio !== undefined ? bio.trim() : existing.bio,
    category: category !== undefined ? category : existing.category,
    updatedAt: new Date().toISOString()
  };

  db.sellers[existingIdx] = updated;
  saveDb(db);

  if (isInitialized && adminDb) {
    try {
      await adminDb.collection('seller_profiles').doc(uid).set(updated, { merge: true });
    } catch (err) {
      console.error('Failed to sync updated seller profile to Firestore:', err);
    }
  }

  res.json({ message: 'Profile updated successfully.', seller: updated });
});

/**
 * GET /api/sellers/my-products
 * Returns all products submitted by the currently authenticated seller.
 */
router.get('/my-products', requireSellerOrAdmin, (req, res) => {
  const uid = req.user.uid;
  const db = getDb();
  const products = (db.products || []).filter(p => p.sellerId === uid);
  res.json(products);
});

/**
 * GET /api/sellers
 * Administrator endpoint to view all sellers and filter by status.
 */
router.get('/', requireAdmin, async (req, res) => {
  const { status } = req.query;
  const sellers = await getSellersList();

  if (status && status !== 'all') {
    return res.json(sellers.filter(s => s.status === status));
  }

  res.json(sellers);
});

/**
 * Projects a seller_profiles record into a safe public storefront DTO.
 * Returns null unless the seller account is active, and omits private PII
 * (email, phone, adminNotes, timestamps, and non-public WhatsApp numbers).
 */
export function toPublicSellerProfile(seller) {
  if (!seller || seller.status !== 'active') {
    return null;
  }

  const whatsappNumber = seller.whatsappNumber ? String(seller.whatsappNumber).trim() : '';
  const allowWhatsapp = seller.showWhatsapp === true && Boolean(whatsappNumber);

  return {
    id: seller.id || seller.sellerId || '',
    sellerId: seller.sellerId || seller.id || '',
    storeName: seller.storeName || '',
    slug: seller.slug || '',
    bio: seller.bio || '',
    category: seller.category || '',
    profileImage: seller.profileImage || '',
    status: 'active',
    isVerified: Boolean(seller.isVerified),
    isFirstCreator: Boolean(seller.isFirstCreator),
    showWhatsapp: allowWhatsapp,
    ...(allowWhatsapp ? { whatsappNumber } : {})
  };
}

/**
 * GET /api/sellers/:id
 * Public storefront lookup: returns a sanitized public DTO for active sellers only.
 */
router.get('/:id', async (req, res) => {
  const targetId = req.params.id;
  let seller = null;

  if (isInitialized && adminDb) {
    try {
      const doc = await adminDb.collection('seller_profiles').doc(targetId).get();
      if (doc.exists) {
        seller = { id: doc.id, ...doc.data() };
      }
    } catch (err) {
      console.warn('Failed to fetch seller from Firestore, checking local DB:', err.message);
      const db = getDb();
      seller = (db.sellers || []).find(s => s.id === targetId || s.sellerId === targetId) || null;
    }
  } else {
    const db = getDb();
    seller = (db.sellers || []).find(s => s.id === targetId || s.sellerId === targetId) || null;
  }

  const publicProfile = toPublicSellerProfile(seller);
  if (!publicProfile) {
    return res.status(404).json({ error: 'Seller not found.' });
  }

  res.json(publicProfile);
});

/**
 * PUT /api/sellers/:id/status
 * Administrator endpoint to approve, reject, or suspend a seller.
 * If approved ('active'), grants custom claim `seller: true` in Firebase Auth.
 */
router.put('/:id/status', requireAdmin, async (req, res) => {
  const { status, notes } = req.body;
  const sellerId = req.params.id;

  const validStatuses = ['active', 'pending', 'rejected', 'suspended'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}.`
    });
  }

  const isVerified = status === 'active';
  const db = getDb();
  db.sellers = db.sellers || [];
  const idx = db.sellers.findIndex(s => s.id === sellerId || s.sellerId === sellerId);

  let updatedProfile;
  if (idx >= 0) {
    updatedProfile = {
      ...db.sellers[idx],
      status,
      isVerified,
      adminNotes: notes || db.sellers[idx].adminNotes || '',
      updatedAt: new Date().toISOString()
    };
    db.sellers[idx] = updatedProfile;
  } else {
    updatedProfile = {
      id: sellerId,
      sellerId,
      status,
      isVerified,
      adminNotes: notes || '',
      updatedAt: new Date().toISOString()
    };
    db.sellers.push(updatedProfile);
  }
  saveDb(db);

  // Sync to Firestore if initialized
  if (isInitialized && adminDb) {
    try {
      await adminDb.collection('seller_profiles').doc(sellerId).set(updatedProfile, { merge: true });
    } catch (err) {
      console.error('Failed to update seller in Firestore:', err);
    }
  }

  // If approved and Firebase Admin is available, grant seller custom claim
  if (isInitialized && adminAuth) {
    try {
      const userRecord = await adminAuth.getUser(sellerId);
      const existingClaims = userRecord.customClaims || {};
      await adminAuth.setCustomUserClaims(sellerId, {
        ...existingClaims,
        seller: status === 'active'
      });
      console.log(`Updated Firebase claims for seller ${sellerId}: seller=${status === 'active'}`);
    } catch (authErr) {
      console.warn(`Could not update Firebase claims for seller ${sellerId}:`, authErr.message);
    }
  }

  res.json({
    message: `Seller status updated to '${status}'.`,
    seller: updatedProfile
  });
});

export default router;
