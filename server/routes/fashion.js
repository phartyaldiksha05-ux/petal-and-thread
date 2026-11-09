import express from 'express';
import { getDb, saveDb } from '../database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET all fashion portfolio items
router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.fashionPortfolio || []);
});

// POST new fashion item (Admin only)
router.post('/', requireAdmin, (req, res) => {
  const {
    title,
    description,
    category,
    photos,
    sketches,
    fabrics,
    sizes,
    availableForCustom
  } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Design title is required.' });
  }

  const db = getDb();
  const newItem = {
    id: `fashion-${Date.now()}`,
    title: title.trim(),
    description: description ? description.trim() : '',
    category: category ? category.trim() : 'Dresses & Silhouettes',
    photos: Array.isArray(photos) && photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85'],
    sketches: Array.isArray(sketches) ? sketches : [],
    fabrics: fabrics ? fabrics.trim() : 'Natural Linen, Silk',
    sizes: sizes ? sizes.trim() : 'Made to Measure (XS to 3XL)',
    availableForCustom: availableForCustom !== undefined ? Boolean(availableForCustom) : true,
    createdAt: new Date().toISOString()
  };

  db.fashionPortfolio = [newItem, ...(db.fashionPortfolio || [])];
  saveDb(db);

  res.status(201).json({
    message: 'Fashion design added to portfolio.',
    item: newItem
  });
});

// PUT update fashion item (Admin only)
router.put('/:id', requireAdmin, (req, res) => {
  const db = getDb();
  const index = (db.fashionPortfolio || []).findIndex(f => f.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Fashion portfolio item not found.' });
  }

  const existing = db.fashionPortfolio[index];
  const body = req.body;

  const updated = {
    ...existing,
    title: body.title !== undefined ? body.title.trim() : existing.title,
    description: body.description !== undefined ? body.description.trim() : existing.description,
    category: body.category !== undefined ? body.category.trim() : existing.category,
    photos: Array.isArray(body.photos) ? body.photos : existing.photos,
    sketches: Array.isArray(body.sketches) ? body.sketches : existing.sketches,
    fabrics: body.fabrics !== undefined ? body.fabrics.trim() : existing.fabrics,
    sizes: body.sizes !== undefined ? body.sizes.trim() : existing.sizes,
    availableForCustom: body.availableForCustom !== undefined ? Boolean(body.availableForCustom) : existing.availableForCustom,
    updatedAt: new Date().toISOString()
  };

  db.fashionPortfolio[index] = updated;
  saveDb(db);

  res.json({
    message: 'Fashion design updated successfully.',
    item: updated
  });
});

// DELETE fashion item (Admin only)
router.delete('/:id', requireAdmin, (req, res) => {
  const db = getDb();
  const index = (db.fashionPortfolio || []).findIndex(f => f.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Fashion portfolio item not found.' });
  }

  const removed = db.fashionPortfolio.splice(index, 1)[0];
  saveDb(db);

  res.json({
    message: 'Fashion design removed from portfolio.',
    item: removed
  });
});

export default router;
