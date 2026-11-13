import express from 'express';
import { getDb, saveDb } from '../database.js';
import { requireAdmin, requireSellerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

function isProductApproved(product) {
  return Boolean(product && (!product.approvalStatus || product.approvalStatus === 'approved'));
}

function runMiddleware(middleware, req, res) {
  return new Promise((resolve, reject) => {
    let nextCalled = false;
    Promise.resolve(
      middleware(req, res, (err) => {
        nextCalled = true;
        if (err) reject(err);
        else resolve(true);
      })
    ).then(
      () => {
        if (!nextCalled) {
          resolve(false);
        }
      },
      (err) => {
        if (!nextCalled) {
          reject(err);
        }
      }
    );
  });
}

// GET all products (Public sees approved only; includePending=true strictly requires verified Admin)
router.get('/', async (req, res) => {
  const { category, featured, status, sellerId, includePending } = req.query;

  if (includePending === 'true') {
    const authorized = await runMiddleware(requireAdmin, req, res);
    if (!authorized) return;
  }

  const db = getDb();
  let list = db.products || [];

  // Only verified admins explicitly requesting includePending=true receive unapproved products
  if (includePending !== 'true') {
    list = list.filter(isProductApproved);
  }

  if (category && category !== 'all') {
    list = list.filter(p => p.categorySlug === category || p.categoryName === category);
  }
  if (featured === 'true') {
    list = list.filter(p => p.isFeatured === true);
  }
  if (status) {
    list = list.filter(p => p.status === status);
  }
  if (sellerId) {
    list = list.filter(p => p.sellerId === sellerId);
  }

  res.json(list);
});

// GET single product (Public for approved; Admin or owning active Seller for unapproved)
router.get('/:id', async (req, res) => {
  const db = getDb();
  const product = (db.products || []).find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  if (isProductApproved(product)) {
    return res.json(product);
  }

  const authorized = await runMiddleware(requireSellerOrAdmin, req, res);
  if (!authorized) return;

  const isRoleAdmin = req.user?.role === 'admin';
  const isOwner =
    product.sellerId === req.user?.uid || product.sellerId === req.user?.sellerId;

  if (!isRoleAdmin && !isOwner) {
    return res.status(403).json({
      error: 'Access forbidden. You do not have permission to view this unapproved product.'
    });
  }

  res.json(product);
});

// POST new product (Admins or Active Sellers)
router.post('/', requireSellerOrAdmin, (req, res) => {
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

  const isRoleAdmin = req.user?.role === 'admin';
  const sellerId = isRoleAdmin ? 'admin' : (req.user.sellerId || req.user.uid);
  const sellerName = isRoleAdmin ? 'Petal & Thread Atelier' : (req.user.name || 'Artisan Seller');

  // Admin creations are instantly approved; seller creations require curation approval
  const approvalStatus = isRoleAdmin ? 'approved' : 'pending';

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
    approvalStatus,
    sellerId,
    sellerName,
    isFeatured: isRoleAdmin ? Boolean(isFeatured) : false,
    badge: badge ? badge.trim() : (isRoleAdmin ? '' : 'Artisan Handcrafted'),
    images: Array.isArray(images) && images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80'],
    materials: materials ? materials.trim() : '',
    dimensions: dimensions ? dimensions.trim() : '',
    variants: Array.isArray(variants) ? variants : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.products = [newProduct, ...(db.products || [])];
  saveDb(db);

  res.status(201).json({
    message: isRoleAdmin
      ? 'Product created successfully.'
      : 'Product submitted successfully. It is now awaiting boutique curation approval.',
    product: newProduct
  });
});

// PUT update product (Admin or Product Owner)
router.put('/:id', requireSellerOrAdmin, (req, res) => {
  const db = getDb();
  const index = (db.products || []).findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const existing = db.products[index];
  const isRoleAdmin = req.user?.role === 'admin';

  // Cross-seller protection: sellers can only edit their own products
  if (!isRoleAdmin && existing.sellerId !== req.user.uid && existing.sellerId !== req.user.sellerId) {
    return res.status(403).json({
      error: 'Access forbidden. You do not have permission to modify another artisan’s product.'
    });
  }

  const body = req.body;

  let resolvedCategoryName = body.categoryName || existing.categoryName;
  if (body.categorySlug && body.categorySlug !== existing.categorySlug && !body.categoryName) {
    const cat = db.categories.find(c => c.slug === body.categorySlug);
    if (cat) resolvedCategoryName = cat.name;
  }

  // If edited by a seller, approval reverts to pending for review
  const nextApprovalStatus = isRoleAdmin
    ? (body.approvalStatus || existing.approvalStatus || 'approved')
    : 'pending';

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
    approvalStatus: nextApprovalStatus,
    isFeatured: isRoleAdmin ? (body.isFeatured !== undefined ? Boolean(body.isFeatured) : existing.isFeatured) : existing.isFeatured,
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
    message: isRoleAdmin
      ? 'Product updated successfully.'
      : 'Product updated and re-submitted for curation review.',
    product: updatedProduct
  });
});

// DELETE product (Admin or Product Owner)
router.delete('/:id', requireSellerOrAdmin, (req, res) => {
  const db = getDb();
  const index = (db.products || []).findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const existing = db.products[index];
  const isRoleAdmin = req.user?.role === 'admin';

  // Cross-seller protection: sellers can only delete their own products
  if (!isRoleAdmin && existing.sellerId !== req.user.uid && existing.sellerId !== req.user.sellerId) {
    return res.status(403).json({
      error: 'Access forbidden. You do not have permission to delete another artisan’s product.'
    });
  }

  const removed = db.products.splice(index, 1)[0];
  saveDb(db);

  res.json({
    message: 'Product deleted successfully.',
    product: removed
  });
});

export default router;
