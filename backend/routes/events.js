import express from 'express';
import { IICC_EVENTS as FALLBACK_EVENTS } from '../data/iicc-events.js';
import { FIRESTORE_COLLECTIONS, getFirestoreDb } from '../services/firestore.js';
import { serializeFirestoreDocs } from '../services/firestore-serialize.js';
import { enrichEventMetadata } from '../services/iicc-event-sync.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = getFirestoreDb();
    const snap = await db.collection(FIRESTORE_COLLECTIONS.events).get();
    const events = serializeFirestoreDocs(snap)
      .sort((a, b) => {
        const aValue = a.id || a.date || '';
        const bValue = b.id || b.date || '';
        return String(aValue).localeCompare(String(bValue), undefined, { numeric: true });
      })
      .map((event) => ({
        ...event,
        locationId: event.location_id,
        sourceUrl: event.source_url || event.sourceUrl || '',
        description: event.description || '',
        imageUrl: event.image_url || event.imageUrl || '',
      }));

    const enrichedEvents = await Promise.all(events.map((event) => enrichEventMetadata(event)));

    if (enrichedEvents.length) {
      return res.json({
        success: true,
        data: { events: enrichedEvents },
      });
    }

    const fallbackEvents = await Promise.all(FALLBACK_EVENTS.map(async (event, index) => (
      enrichEventMetadata({
        id: index + 1,
        ...event,
        locationId: event.locationId || 'yashobhoomi',
        sourceUrl: event.sourceUrl || '',
        description: event.description || '',
        imageUrl: event.imageUrl || '',
      })
    )));

    return res.json({
      success: true,
      data: {
        events: fallbackEvents,
    },
  });

  } catch (error) {
    console.warn('Falling back to seed events:', error?.message || error);
    const fallbackEvents = await Promise.all(FALLBACK_EVENTS.map(async (event, index) => (
      enrichEventMetadata({
        id: index + 1,
        ...event,
        locationId: event.locationId || 'yashobhoomi',
        sourceUrl: event.sourceUrl || '',
        description: event.description || '',
        imageUrl: event.imageUrl || '',
      })
    )));
    res.json({
      success: true,
      data: {
        events: fallbackEvents,
    },
  });
}
});

export default router;
