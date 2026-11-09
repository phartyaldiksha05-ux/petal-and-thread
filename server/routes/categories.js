import express from 'express';
import { getDb, saveDb } from '../database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET all categories
router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.categories || []);
});

// POST new category (Admin only)
router.post('/', requireAdmin, (req, res) => {
  const { name, tag, shortDescription, image, itemCount } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Category name is required.' });
  }

  const db = getDb();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newCat = {
    id: `cat-${Date.now()}`,
    slug,
    name: name.trim(),
    tag: tag ? tag.trim() : 'Artisan Collection',
    shortDescription: shortDescription ? shortDescription.trim() : '',
    image: image || 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=800&q=80',
    itemCount: itemCount || '0 items',
    displayOrder: (db.categories || []).length + 1
  };

  db.categories = [...(db.categories || []), newCat];
  saveDb(db);

  res.status(201).json({
    message: 'Category created successfully.',
    category: newCat
  });
});

// PUT update category (Admin only)
router.put('/:id', requireAdmin, (req, res) => {
  const db = getDb();
  const index = (db.categories || []).findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Category not found.' });
  }

  const existing = db.categories[index];
  const { name, tag, shortDescription, image, itemCount } = req.body;

  const updated = {
    ...existing,
    name: name !== undefined ? name.trim() : existing.name,
    tag: tag !== undefined ? tag.trim() : existing.tag,
    shortDescription: shortDescription !== undefined ? shortDescription.trim() : existing.shortDescription,
    image: image || existing.image,
    itemCount: itemCount !== undefined ? itemCount : existing.itemCount
  };

  db.categories[index] = updated;
  saveDb(db);

  res.json({
    message: 'Category updated successfully.',
    category: updated
  });
});

// DELETE category (Admin only)
router.delete('/:id', requireAdmin, (req, res) => {
  const db = getDb();
  const index = (db.categories || []).findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Category not found.' });
  }

  const removed = db.categories.splice(index, 1)[0];
  saveDb(db);

  res.json({
    message: 'Category deleted successfully.',
    category: removed
  });
});

export default router;
