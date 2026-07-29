import jwt from 'jsonwebtoken';
import { getDb } from '../config/database.js';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  throw new Error('JWT_SECRET is required');
}

export function signToken(payload, options) {
  return jwt.sign(payload, getJwtSecret(), options);
}

export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

export async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Please log in to continue' });
  }

  try {
    const decoded = verifyToken(token);
    const db = await getDb();
    const user = await db.prepare('SELECT id, email, status FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session' });
    }
    if (String(user.status || 'active').toLowerCase() === 'suspended') {
      return res.status(403).json({ success: false, message: 'This account is suspended. Please contact support.' });
    }
    req.user = { ...decoded, email: user.email };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
}

export async function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Admin login required' });
  }

  try {
    const decoded = verifyToken(token);
    const db = await getDb();
    const user = await db.prepare('SELECT id, email, role, status FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid admin session' });
    }
    if (String(user.status || 'active').toLowerCase() === 'suspended') {
      return res.status(403).json({ success: false, message: 'This account is suspended. Please contact support.' });
    }
    if (!['admin', 'sub-admin', 'editor'].includes(String(user.role || '').toLowerCase())) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    req.admin = { ...decoded, role: user.role, email: user.email };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid admin session' });
  }
}
