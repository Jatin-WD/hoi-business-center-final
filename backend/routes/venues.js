import express from 'express';
import { getDb } from '../config/database.js';
import { fallbackVenues } from '../utils/catalogFallback.js';

const router = express.Router();

// Get all venues
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const venues = await db.prepare(`
      SELECT
        id,
        location_id,
        sub_venue_id,
        name,
        address,
        city,
        state,
        description,
        about,
        total_area,
        halls,
        capacity,
        established,
        website,
        specialities,
        image,
        created_at,
        updated_at
      FROM venues
      ORDER BY state, city, name
    `).all();

    // Parse JSON fields
    const parsedVenues = venues.map(venue => ({
      ...venue,
      specialities: JSON.parse(venue.specialities || '[]')
    }));

    res.json({
      success: true,
      data: { venues: parsedVenues }
    });
  } catch (error) {
    console.error('Get venues error:', error);
    res.json({ success: true, data: { venues: fallbackVenues() }, fallback: true });
  }
});

// Get venue by database ID
router.get('/:id', async (req, res, next) => {
  if (!/^\d+$/.test(req.params.id)) return next();
  try {
    const db = await getDb();
    const venue = await db.prepare(`
      SELECT id, location_id, sub_venue_id, name, address, city, state, description, about,
             total_area, halls, capacity, established, website, specialities, image, created_at, updated_at
      FROM venues
      WHERE id = ?
    `).get(req.params.id);

    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    res.json({
      success: true,
      data: { venue: { ...venue, specialities: JSON.parse(venue.specialities || '[]') } }
    });
  } catch (error) {
    console.error('Get venue by id error:', error);
    const venue = fallbackVenues().find((item) => String(item.id) === String(req.params.id));
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    res.json({ success: true, data: { venue }, fallback: true });
  }
});

// Get venue by location and sub-venue ID
router.get('/:locationId/:subVenueId', async (req, res) => {
  try {
    const { locationId, subVenueId } = req.params;
    const db = await getDb();

    const venue = await db.prepare(`
      SELECT
        id,
        location_id,
        sub_venue_id,
        name,
        address,
        city,
        state,
        description,
        about,
        total_area,
        halls,
        capacity,
        established,
        website,
        specialities,
        image,
        created_at,
        updated_at
      FROM venues
      WHERE location_id = ? AND sub_venue_id = ?
    `).get(locationId, subVenueId);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    // Parse JSON fields
    const parsedVenue = {
      ...venue,
      specialities: JSON.parse(venue.specialities || '[]')
    };

    res.json({
      success: true,
      data: { venue: parsedVenue }
    });
  } catch (error) {
    console.error('Get venue error:', error);
    const venue = fallbackVenues().find((item) => item.location_id === req.params.locationId && item.sub_venue_id === req.params.subVenueId);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    res.json({ success: true, data: { venue }, fallback: true });
  }
});

// Get venues by location
router.get('/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const db = await getDb();

    const venues = await db.prepare(`
      SELECT
        id,
        location_id,
        sub_venue_id,
        name,
        address,
        city,
        state,
        description,
        about,
        total_area,
        halls,
        capacity,
        established,
        website,
        specialities,
        image,
        created_at,
        updated_at
      FROM venues
      WHERE location_id = ?
      ORDER BY name
    `).all(locationId);

    // Parse JSON fields
    const parsedVenues = venues.map(venue => ({
      ...venue,
      specialities: JSON.parse(venue.specialities || '[]')
    }));

    res.json({
      success: true,
      data: { venues: parsedVenues }
    });
  } catch (error) {
    console.error('Get venues by location error:', error);
    res.json({ success: true, data: { venues: fallbackVenues().filter((item) => item.location_id === req.params.locationId) }, fallback: true });
  }
});

export default router;
