import express from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/database.js';
import { buildRequirementHtml, REQUIREMENT_EMAIL, sendRequirementMail } from '../utils/mailer.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Please log in to continue',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await getDb();
    const user = await db.prepare('SELECT id, email, status FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session',
      });
    }
    if (String(user.status || 'active').toLowerCase() === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'This account is suspended. Please contact support.',
      });
    }
    req.user = { ...decoded, email: user.email };
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session',
    });
  }
}

router.post('/', authenticate, async (req, res) => {
  try {
    const { serviceId, packageId, eventId, notes } = req.body;
    if (!serviceId && !packageId && !eventId) {
      return res.status(400).json({
        success: false,
        message: 'Select a service, package, or event to create a booking',
      });
    }

    const db = await getDb();
    const result = await db.prepare(`
      INSERT INTO bookings (user_id, service_id, package_id, event_id, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.user.id, serviceId || null, packageId || null, eventId || null, notes || null);

    try {
      const user = await db.prepare('SELECT name, email, phone, company FROM users WHERE id = ?').get(req.user.id) || {};
      await sendRequirementMail({
        subject: `New Booking Request #${result.lastID}`,
        html: buildRequirementHtml('New Booking Request', {
          'Booking ID': result.lastID,
          Name: user.name,
          Email: user.email || req.user.email,
          Phone: user.phone,
          Company: user.company,
          Service: serviceId,
          Package: packageId,
          Event: eventId,
          Notes: notes,
          'Submitted To': REQUIREMENT_EMAIL,
        }),
      });
    } catch (emailError) {
      console.error('Booking email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { bookingId: result.lastID },
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
    });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const bookings = await db.prepare(`
      SELECT id, user_id, service_id, package_id, event_id, notes, status, created_at, updated_at
      FROM bookings
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);

    res.json({
      success: true,
      data: { bookings },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
    });
  }
});

export default router;
