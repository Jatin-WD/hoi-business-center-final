import jwt from 'jsonwebtoken';
import { getDb } from '../config/database.js';

const DEV_JWT_SECRET = 'dev-only-hoi-jwt-secret';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production');
  }
  return DEV_JWT_SECRET;
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
