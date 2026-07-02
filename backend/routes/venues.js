import express from 'express';
import { getDb } from '../config/database.js';

const router = express.Router();

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

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
    const parsedVenues = venues.map((venue) => ({
      ...venue,
      specialities: parseJsonArray(venue.specialities),
    }));

    res.json({
      success: true,
      data: { venues: parsedVenues }
    });
  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch venues from database' });
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
      data: { venue: { ...venue, specialities: parseJsonArray(venue.specialities) } }
    });
  } catch (error) {
    console.error('Get venue by id error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch venue from database' });
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
      specialities: parseJsonArray(venue.specialities),
    };

    res.json({
      success: true,
      data: { venue: parsedVenue }
    });
  } catch (error) {
    console.error('Get venue error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch venue from database' });
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
    const parsedVenues = venues.map((venue) => ({
      ...venue,
      specialities: parseJsonArray(venue.specialities),
    }));

    res.json({
      success: true,
      data: { venues: parsedVenues }
    });
  } catch (error) {
    console.error('Get venues by location error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch venues from database' });
  }
});

export default router;
