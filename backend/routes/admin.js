import express from 'express';
import { getDb } from '../config/database.js';
import { signToken, verifyToken } from '../middleware/auth.js';

const router = express.Router();
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

function requireAdmin(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Admin login required' });
    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access only' });
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid admin session' });
  }
}

router.post('/login', (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const password = String(req.body.password || '');

  if (!ADMIN_PASSWORD) {
    return res.status(503).json({ success: false, message: 'ADMIN_PASSWORD is not configured' });
  }
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }

  const token = signToken({ email, role: 'admin' }, { expiresIn: '8h' });
  res.json({ success: true, message: 'Admin login successful', data: { token, admin: { email, role: 'admin' } } });
});

router.get('/requirements', requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const [inquiries, manpower, bookings] = await Promise.all([
      db.all('SELECT id, name, email, phone, company, service, location, message, status, created_at FROM inquiries ORDER BY created_at DESC'),
      db.all('SELECT id, role, name, email, phone, company, experience, languages, industries, tasks, availability, documents, status, created_at FROM manpower_requests ORDER BY created_at DESC'),
      db.all('SELECT id, user_id, service_id, package_id, event_id, notes, status, created_at FROM bookings ORDER BY created_at DESC'),
    ]);

    res.json({
      success: true,
      data: {
        counts: { inquiries: inquiries.length, manpower: manpower.length, bookings: bookings.length },
        inquiries,
        manpower: manpower.map((row) => ({
          ...row,
          languages: parseJson(row.languages),
          industries: parseJson(row.industries),
          tasks: parseJson(row.tasks),
          documents: parseJson(row.documents),
        })),
        bookings,
      },
    });
  } catch (error) {
    console.error('Admin requirements error:', error);
    res.status(500).json({ success: false, message: 'Failed to load requirements' });
  }
});

function parseJson(value) {
  try {
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export default router;
