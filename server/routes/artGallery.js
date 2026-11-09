import express from 'express';
import { getDb, saveDb } from '../database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET all artwork (Public & Admin)
router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.artGallery || []);
});

// POST new artwork (Admin only)
router.post('/', requireAdmin, (req, res) => {
  const { title, description, category, medium, year, dimensions, image, isFeatured } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Artwork title is required.' });
  }

  const db = getDb();
  const newArt = {
    id: `art-${Date.now()}`,
    title: title.trim(),
    description: description ? description.trim() : '',
    category: category ? category.trim() : 'Fashion Illustration',
    medium: medium ? medium.trim() : 'Watercolor & Gouache',
    year: year || String(new Date().getFullYear()),
    dimensions: dimensions ? dimensions.trim() : '12" × 16"',
    image: image || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=85',
    isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : true,
    createdAt: new Date().toISOString()
  };

  db.artGallery = [newArt, ...(db.artGallery || [])];
  saveDb(db);

  res.status(201).json({
    message: 'Artwork added to gallery.',
    artwork: newArt
  });
});

// PUT update artwork (Admin only)
router.put('/:id', requireAdmin, (req, res) => {
  const db = getDb();
  const index = (db.artGallery || []).findIndex(a => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Artwork not found.' });
  }

  const existing = db.artGallery[index];
  const body = req.body;

  const updated = {
    ...existing,
    title: body.title !== undefined ? body.title.trim() : existing.title,
    description: body.description !== undefined ? body.description.trim() : existing.description,
    category: body.category !== undefined ? body.category.trim() : existing.category,
    medium: body.medium !== undefined ? body.medium.trim() : existing.medium,
    year: body.year !== undefined ? body.year : existing.year,
    dimensions: body.dimensions !== undefined ? body.dimensions.trim() : existing.dimensions,
    image: body.image || existing.image,
    isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : existing.isFeatured,
    updatedAt: new Date().toISOString()
  };

  db.artGallery[index] = updated;
  saveDb(db);

  res.json({
    message: 'Artwork updated successfully.',
    artwork: updated
  });
});

// DELETE artwork (Admin only)
router.delete('/:id', requireAdmin, (req, res) => {
  const db = getDb();
  const index = (db.artGallery || []).findIndex(a => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Artwork not found.' });
  }

  const removed = db.artGallery.splice(index, 1)[0];
  saveDb(db);

  res.json({
    message: 'Artwork deleted from gallery.',
    artwork: removed
  });
});

export default router;
