import express from 'express';
import { getDb, saveDb } from '../database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET all enquiries (Admin only)
router.get('/', requireAdmin, (req, res) => {
  const db = getDb();
  res.json(db.customEnquiries || []);
});

// POST new enquiry (Public from website customer forms & Admin)
router.post('/', (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    creationType,
    colorPalette,
    deadline,
    details,
    referenceImages
  } = req.body;

  if (!customerName || customerName.trim() === '') {
    return res.status(400).json({ error: 'Customer name is required.' });
  }

  const db = getDb();
  const newEnquiry = {
    id: `enq-${Date.now()}`,
    customerName: customerName.trim(),
    customerEmail: customerEmail ? customerEmail.trim() : '',
    customerPhone: customerPhone ? customerPhone.trim() : '',
    creationType: creationType || 'Crochet Bouquet / Florals',
    colorPalette: colorPalette ? colorPalette.trim() : '',
    deadline: deadline ? deadline.trim() : '',
    details: details ? details.trim() : '',
    referenceImages: Array.isArray(referenceImages) ? referenceImages : [],
    status: 'New', // New | In Discussion | In Progress | Completed | Archived
    adminNotes: '',
    createdAt: new Date().toISOString()
  };

  db.customEnquiries = [newEnquiry, ...(db.customEnquiries || [])];
  saveDb(db);

  res.status(201).json({
    message: 'Your custom creation request has been received with love.',
    enquiry: newEnquiry
  });
});

// PUT update enquiry status and admin notes (Admin only)
router.put('/:id/status', requireAdmin, (req, res) => {
  const db = getDb();
  const index = (db.customEnquiries || []).findIndex(e => e.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Enquiry not found.' });
  }

  const existing = db.customEnquiries[index];
  const { status, adminNotes } = req.body;

  const updated = {
    ...existing,
    status: status || existing.status,
    adminNotes: adminNotes !== undefined ? adminNotes : existing.adminNotes,
    updatedAt: new Date().toISOString()
  };

  db.customEnquiries[index] = updated;
  saveDb(db);

  res.json({
    message: 'Enquiry status updated.',
    enquiry: updated
  });
});

// DELETE enquiry (Admin only)
router.delete('/:id', requireAdmin, (req, res) => {
  const db = getDb();
  const index = (db.customEnquiries || []).findIndex(e => e.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Enquiry not found.' });
  }

  const removed = db.customEnquiries.splice(index, 1)[0];
  saveDb(db);

  res.json({
    message: 'Enquiry deleted.',
    enquiry: removed
  });
});

export default router;
