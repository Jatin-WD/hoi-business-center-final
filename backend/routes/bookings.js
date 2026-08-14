import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { buildRequirementHtml, REQUIREMENT_EMAIL, sendRequirementMail } from '../utils/mailer.js';
import { FIRESTORE_COLLECTIONS, getFirestoreDb, serverTimestamp } from '../services/firestore.js';
import { serializeFirestoreDoc, serializeFirestoreDocs } from '../services/firestore-serialize.js';

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

    const db = getFirestoreDb();
    const docRef = db.collection(FIRESTORE_COLLECTIONS.bookings).doc();
    await docRef.set({
      id: docRef.id,
      user_id: req.user.uid || req.user.id,
      service_id: serviceId || null,
      package_id: packageId || null,
      event_id: eventId || null,
      notes: notes || null,
      status: 'pending',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    try {
      const user = (await db.collection(FIRESTORE_COLLECTIONS.users).doc(String(req.user.uid || req.user.id)).get()).data() || {};
      await sendRequirementMail({
        subject: `New Booking Request #${docRef.id}`,
        html: buildRequirementHtml('New Booking Request', {
          'Booking ID': docRef.id,
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
      data: { bookingId: docRef.id },
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
    const db = getFirestoreDb();
    const snap = await db
      .collection(FIRESTORE_COLLECTIONS.bookings)
      .where('user_id', '==', String(req.user.uid || req.user.id))
      .get();
    const bookings = serializeFirestoreDocs(snap)
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

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
