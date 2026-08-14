import express from 'express';
import { buildRequirementHtml, REQUIREMENT_EMAIL, sendRequirementMail } from '../utils/mailer.js';
import { FIRESTORE_COLLECTIONS, getFirestoreDb, serverTimestamp } from '../services/firestore.js';
import { serializeFirestoreDoc } from '../services/firestore-serialize.js';

const router = express.Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9][0-9\s-]{7,}[0-9]$/;

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, service, location, message, packageName, requirementType } = req.body;
    if (!name || !emailRegex.test(email || '') || !phoneRegex.test(phone || '') || !service || !message || message.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid name, email, phone, service, and message',
      });
    }

    const db = getFirestoreDb();
    const docRef = db.collection(FIRESTORE_COLLECTIONS.inquiries).doc();
    await docRef.set({
      id: docRef.id,
      name,
      email,
      phone,
      company: company || '',
      service,
      location: location || '',
      message,
      packageName: packageName || '',
      requirementType: requirementType || 'General inquiry',
      status: 'pending',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    const saved = serializeFirestoreDoc(await docRef.get());

    const html = buildRequirementHtml('New Website Requirement', {
      'Requirement Type': requirementType || 'General inquiry',
      Name: name,
      Email: email,
      Phone: phone,
      Company: company,
      Service: service,
      Package: packageName,
      Location: location,
      Message: message,
      'Submitted To': REQUIREMENT_EMAIL,
    });

    try {
      await sendRequirementMail({
        subject: `New ${service} Requirement from ${name}`,
        html,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: `Requirement submitted successfully to ${REQUIREMENT_EMAIL}`,
      data: { inquiryId: saved?.id || docRef.id },
    });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit inquiry',
    });
  }
});

export default router;
