import express from 'express';
import { getDb, saveDb } from '../database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET all products (Public & Admin)
router.get('/', (req, res) => {
  const db = getDb();
  let list = db.products || [];

  const { category, featured, status } = req.query;
  if (category && category !== 'all') {
    list = list.filter(p => p.categorySlug === category || p.categoryName === category);
  }
  if (featured === 'true') {
    list = list.filter(p => p.isFeatured === true);
  }
  if (status) {
    list = list.filter(p => p.status === status);
  }

  res.json(list);
});

// GET single product
router.get('/:id', (req, res) => {
  const db = getDb();
  const product = (db.products || []).find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  res.json(product);
});

// POST new product (Admin only)
router.post('/', requireAdmin, (req, res) => {
  const {
    name,
    description,
    price,
    originalPrice,
    categorySlug,
    categoryName,
    stock,
    status,
    isFeatured,
    badge,
    images,
    materials,
    dimensions,
    variants
  } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Product name is required.' });
  }
  if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ error: 'Valid selling price is required.' });
  }

  const db = getDb();

  // Find or map category
  let resolvedCategorySlug = categorySlug || 'crochet-treasures';
  let resolvedCategoryName = categoryName;
  if (!resolvedCategoryName) {
    const cat = db.categories.find(c => c.slug === resolvedCategorySlug);
    resolvedCategoryName = cat ? cat.name : 'Crochet Treasures';
  }

  const newProduct = {
    id: `prod-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    name: name.trim(),
    description: description ? description.trim() : '',
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : null,
    categorySlug: resolvedCategorySlug,
    categoryName: resolvedCategoryName,
    stock: stock !== undefined ? Math.max(0, parseInt(stock, 10)) : 10,
    status: status === 'sold_out' ? 'sold_out' : 'available',
    isFeatured: Boolean(isFeatured),
    badge: badge ? badge.trim() : '',
    images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80'],
    materials: materials ? materials.trim() : '',
    dimensions: dimensions ? dimensions.trim() : '',
    variants: Array.isArray(variants) ? variants : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.products = [newProduct, ...(db.products || [])];
  saveDb(db);

  res.status(201).json({
    message: 'Product created successfully.',
    product: newProduct
  });
});

// PUT update product (Admin only)
router.put('/:id', requireAdmin, (req, res) => {
  const db = getDb();
  const index = (db.products || []).findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const existing = db.products[index];
  const body = req.body;

  let resolvedCategoryName = body.categoryName || existing.categoryName;
  if (body.categorySlug && body.categorySlug !== existing.categorySlug && !body.categoryName) {
    const cat = db.categories.find(c => c.slug === body.categorySlug);
    if (cat) resolvedCategoryName = cat.name;
  }

  const updatedProduct = {
    ...existing,
    name: body.name !== undefined ? body.name.trim() : existing.name,
    description: body.description !== undefined ? body.description.trim() : existing.description,
    price: body.price !== undefined ? Number(body.price) : existing.price,
    originalPrice: body.originalPrice !== undefined ? (body.originalPrice ? Number(body.originalPrice) : null) : existing.originalPrice,
    categorySlug: body.categorySlug || existing.categorySlug,
    categoryName: resolvedCategoryName,
    stock: body.stock !== undefined ? Math.max(0, parseInt(body.stock, 10)) : existing.stock,
    status: body.status || existing.status,
    isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : existing.isFeatured,
    badge: body.badge !== undefined ? body.badge.trim() : existing.badge,
    images: Array.isArray(body.images) ? body.images : existing.images,
    materials: body.materials !== undefined ? body.materials.trim() : existing.materials,
    dimensions: body.dimensions !== undefined ? body.dimensions.trim() : existing.dimensions,
    variants: Array.isArray(body.variants) ? body.variants : existing.variants,
    updatedAt: new Date().toISOString()
  };

  db.products[index] = updatedProduct;
  saveDb(db);

  res.json({
    message: 'Product updated successfully.',
    product: updatedProduct
  });
});

// DELETE product (Admin only)
router.delete('/:id', requireAdmin, (req, res) => {
  const db = getDb();
  const index = (db.products || []).findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const removed = db.products.splice(index, 1)[0];
  saveDb(db);

  res.json({
    message: 'Product deleted successfully.',
    product: removed
  });
});

export default router;
