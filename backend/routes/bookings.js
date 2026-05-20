import express from 'express';
import { getDb } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { buildRequirementHtml, REQUIREMENT_EMAIL, sendRequirementMail } from '../utils/mailer.js';

const router = express.Router();

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
