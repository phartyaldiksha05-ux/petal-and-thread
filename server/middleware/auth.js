import jwt from 'jsonwebtoken';
import { getDb } from '../database.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'petal_and_thread_secure_jwt_atelier_secret_2026';

export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. Administrator token required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDb();
    const admin = db.admins.find(a => a.id === decoded.id && a.role === 'admin');

    if (!admin) {
      return res.status(403).json({ error: 'Access forbidden. Authorized administrator credentials required.' });
    }

    req.admin = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      role: admin.role
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    return res.status(401).json({ error: 'Invalid or forged authentication token.' });
  }
}
