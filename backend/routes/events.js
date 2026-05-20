import express from 'express';
import { getDb } from '../config/database.js';
import { fallbackEvents } from '../utils/catalogFallback.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const events = await db.prepare(`
      SELECT id, name, date, venue, location_id, category, status, created_at, updated_at
      FROM events
      ORDER BY id
    `).all();

    res.json({
      success: true,
      data: {
        events: events.map((event) => ({
          ...event,
          locationId: event.location_id,
        })),
      },
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.json({ success: true, data: { events: fallbackEvents() }, fallback: true });
  }
});

export default router;
