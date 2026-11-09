import express from 'express';
import { getDb, saveDb } from '../database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET all orders (Admin only)
router.get('/', requireAdmin, (req, res) => {
  const db = getDb();
  res.json(db.orders || []);
});

// GET single order
router.get('/:id', requireAdmin, (req, res) => {
  const db = getDb();
  const order = (db.orders || []).find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  res.json(order);
});

// POST create order (Public / Simulation or Admin)
router.post('/', (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    products,
    totalPrice,
    paymentStatus,
    orderStatus,
    notes,
    shippingAddress
  } = req.body;

  if (!customerName || !products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'Customer name and products are required.' });
  }

  const db = getDb();
  const orderNumber = `PT-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder = {
    id: `ord-${Date.now()}`,
    orderNumber,
    customerName: customerName.trim(),
    customerEmail: customerEmail ? customerEmail.trim() : '',
    customerPhone: customerPhone ? customerPhone.trim() : '',
    products,
    totalPrice: Number(totalPrice) || products.reduce((acc, p) => acc + (p.price * (p.quantity || 1)), 0),
    paymentStatus: paymentStatus || 'Paid',
    orderStatus: orderStatus || 'Pending',
    notes: notes ? notes.trim() : '',
    shippingAddress: shippingAddress ? shippingAddress.trim() : '',
    createdAt: new Date().toISOString()
  };

  db.orders = [newOrder, ...(db.orders || [])];
  saveDb(db);

  res.status(201).json({
    message: 'Order created successfully.',
    order: newOrder
  });
});

// PUT update order status & notes (Admin only)
router.put('/:id/status', requireAdmin, (req, res) => {
  const db = getDb();
  const index = (db.orders || []).findIndex(o => o.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const existing = db.orders[index];
  const { orderStatus, paymentStatus, notes } = req.body;

  const updated = {
    ...existing,
    orderStatus: orderStatus || existing.orderStatus,
    paymentStatus: paymentStatus || existing.paymentStatus,
    notes: notes !== undefined ? notes : existing.notes,
    updatedAt: new Date().toISOString()
  };

  db.orders[index] = updated;
  saveDb(db);

  res.json({
    message: 'Order status updated successfully.',
    order: updated
  });
});

export default router;
