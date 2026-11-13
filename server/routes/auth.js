import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../database.js';
import { requireAdmin, getJwtSecret } from '../middleware/auth.js';

const router = express.Router();

// Admin Login
router.post('/login', (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/Email and password are required.' });
  }

  let jwtSecret;
  try {
    jwtSecret = getJwtSecret();
  } catch (err) {
    console.error('Admin login blocked due to invalid JWT_SECRET configuration:', err.message);
    return res.status(503).json({
      error: 'Administrator login is unavailable: server JWT_SECRET is not configured securely.'
    });
  }

  const db = getDb();
  const cleanId = String(identifier).trim().toLowerCase();

  const admin = (db.admins || []).find(
    a =>
      (a.username && a.username.toLowerCase() === cleanId) ||
      (a.email && a.email.toLowerCase() === cleanId)
  );

  if (!admin) {
    return res.status(401).json({ error: 'Invalid administrator credentials.' });
  }

  const isMatch = bcrypt.compareSync(password, admin.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid administrator credentials.' });
  }

  // Generate signed JWT
  const token = jwt.sign(
    {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    },
    jwtSecret,
    { expiresIn: '7d' }
  );

  res.json({
    message: 'Welcome back, Atelier Administrator.',
    token,
    user: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      role: admin.role
    }
  });
});

// Verify token and get current admin info
router.get('/me', requireAdmin, (req, res) => {
  res.json({ user: req.admin });
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

export default router;
