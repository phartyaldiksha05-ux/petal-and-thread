import express from 'express';
import { getDb, saveDb } from '../database.js';
import { requireAdmin } from '../middleware/auth.js';
import { adminDb, isInitialized } from '../config/firebaseAdmin.js';

const router = express.Router();

/**
 * GET /api/moderation/products
 * Returns all products submitted by artisan sellers pending curation review.
 */
router.get('/products', requireAdmin, (req, res) => {
  const db = getDb();
  const pendingProducts = (db.products || []).filter(
    p => p.approvalStatus === 'pending'
  );
  res.json(pendingProducts);
});

/**
 * PUT /api/moderation/products/:id
 * Approves or rejects a product.
 */
router.put('/products/:id', requireAdmin, async (req, res) => {
  const { approvalStatus, moderationNotes } = req.body;
  const productId = req.params.id;

  const validStatuses = ['approved', 'rejected', 'pending'];
  if (!approvalStatus || !validStatuses.includes(approvalStatus)) {
    return res.status(400).json({
      error: `Invalid approval status. Must be one of: ${validStatuses.join(', ')}.`
    });
  }

  const db = getDb();
  const index = (db.products || []).findIndex(p => p.id === productId);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const existing = db.products[index];
  const updated = {
    ...existing,
    approvalStatus,
    moderationNotes: moderationNotes !== undefined ? moderationNotes : (existing.moderationNotes || ''),
    moderatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.products[index] = updated;
  saveDb(db);

  // Sync to Firestore if initialized
  if (isInitialized && adminDb) {
    try {
      await adminDb.collection('products').doc(productId).set(updated, { merge: true });
    } catch (err) {
      console.warn('Failed to sync moderated product to Firestore:', err.message);
    }
  }

  res.json({
    message: `Product curation status updated to '${approvalStatus}'.`,
    product: updated
  });
});

export default router;
