import express from 'express';
import { VENUE_DETAILS } from '../data/seed-data.js';
import { getFirestoreDb, FIRESTORE_COLLECTIONS } from '../services/firestore.js';
import { serializeFirestoreDoc, serializeFirestoreDocs } from '../services/firestore-serialize.js';

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

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const YASHOBHOOMI_SUBVENUE_ALIASES = new Set([
  'iicc-dwarka',
  'india-international-convention-and-expo-centre',
  'yashobhoomi-convention-centre',
]);

function matchesVenueFallback(row, locationId, subVenueId) {
  const requestedLocation = slugify(locationId);
  const requestedSubVenue = slugify(subVenueId);
  const rowLocationCandidates = [row.location_id, row.city, row.state, row.name];
  const rowSubVenueCandidates = [row.sub_venue_id, row.name, row.address, row.city, row.state];
  const rowLocation = rowLocationCandidates.map(slugify).find(Boolean) || '';
  const rowSubVenue = rowSubVenueCandidates.map(slugify).find(Boolean) || '';
  const rowName = slugify(row.name);
  const isYashobhoomi = slugify(row.location_id) === 'yashobhoomi' || rowLocation === 'yashobhoomi';
  const aliasMatch = isYashobhoomi && YASHOBHOOMI_SUBVENUE_ALIASES.has(requestedSubVenue);

  return (
    (rowLocation === requestedLocation && rowSubVenue === requestedSubVenue)
    || (rowLocation === requestedLocation && (rowSubVenue.includes(requestedSubVenue) || requestedSubVenue.includes(rowSubVenue) || rowName.includes(requestedSubVenue)))
    || (rowName === requestedSubVenue && (slugify(row.location_id) === requestedLocation || slugify(row.city) === requestedLocation || slugify(row.state) === requestedLocation))
    || aliasMatch
  );
}

async function listVenues() {
  try {
    const db = getFirestoreDb();
    const snap = await db.collection(FIRESTORE_COLLECTIONS.venues).get();
    const venues = serializeFirestoreDocs(snap).map((venue) => ({
      ...venue,
      specialities: parseJsonArray(venue.specialities),
    }));

    if (venues.length) {
      return venues;
    }
  } catch (error) {
    console.warn('Falling back to seed venues:', error?.message || error);
  }

  return VENUE_DETAILS.map((venue, index) => ({
    id: index + 1,
    ...venue,
    specialities: parseJsonArray(venue.specialities),
  }));
}

router.get('/', async (req, res) => {
  try {
    const venues = (await listVenues()).sort((a, b) => `${a.state || ''}${a.city || ''}${a.name || ''}`.localeCompare(`${b.state || ''}${b.city || ''}${b.name || ''}`));
    res.json({ success: true, data: { venues } });
  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch venues from database' });
  }
});

router.get('/:id', async (req, res, next) => {
  if (!/^\d+$/.test(req.params.id)) return next();
  try {
    const db = getFirestoreDb();
    const snap = await db.collection(FIRESTORE_COLLECTIONS.venues).where('id', '==', req.params.id).limit(1).get();
    const venue = serializeFirestoreDocs(snap)[0];
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    res.json({ success: true, data: { venue: { ...venue, specialities: parseJsonArray(venue.specialities) } } });
  } catch (error) {
    console.error('Get venue by id error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch venue from database' });
  }
});

router.get('/:locationId/:subVenueId', async (req, res) => {
  try {
    const { locationId, subVenueId } = req.params;
    const venues = await listVenues();
    const venue = venues.find((row) => row.location_id === locationId && row.sub_venue_id === subVenueId)
      || venues.find((row) => matchesVenueFallback(row, locationId, subVenueId));

    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    return res.json({ success: true, data: { venue } });
  } catch (error) {
    console.error('Get venue error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch venue from database' });
  }
});

router.get('/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const venues = (await listVenues()).filter((venue) => venue.location_id === locationId)
      .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));

    res.json({ success: true, data: { venues } });
  } catch (error) {
    console.error('Get venues by location error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch venues from database' });
  }
});

export default router;
