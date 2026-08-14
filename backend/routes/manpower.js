import express from 'express';
import multer from 'multer';
import { buildRequirementHtml, REQUIREMENT_EMAIL, sendRequirementMail } from '../utils/mailer.js';
import { FIRESTORE_COLLECTIONS, getFirestoreDb, serverTimestamp } from '../services/firestore.js';
import { saveUploadedFile } from '../services/storage.js';

const router = express.Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9][0-9\s-]{7,}[0-9]$/;

function parseList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  if (typeof value !== 'string') return [value].filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'string' && parsed !== value) return parseList(parsed);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [parsed].filter(Boolean);
  } catch {
    return [value].filter(Boolean);
  }
}

function stringifyList(value) {
  return JSON.stringify(parseList(value));
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = /image\/(jpeg|jpg|png)|application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document/;
    const allowedExtensions = /\.(jpeg|jpg|png|pdf|doc|docx)$/i;
    const extname = allowedExtensions.test(file.originalname.toLowerCase());
    const mimetype = allowedMimeTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  },
});

router.post('/', upload.array('documents', 5), async (req, res) => {
  try {
    const {
      role,
      name,
      email,
      phone,
      company,
      experience,
      languages,
      industries,
      tasks,
      availability,
    } = req.body;

    if (!role || !name || !emailRegex.test(email || '') || !phoneRegex.test(phone || '')) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid role, name, email, and phone number',
      });
    }

    const uploadedDocuments = [];
    for (const file of req.files || []) {
      const uploadResult = await saveUploadedFile({
        folder: 'manpower-documents',
        originalname: file.originalname,
        buffer: file.buffer,
        mimetype: file.mimetype,
        makePublic: false,
      });
      uploadedDocuments.push({
        filename: uploadResult.filename,
        originalName: file.originalname,
        storagePath: uploadResult.storagePath,
      });
    }

    const languageList = parseList(languages);
    const industryList = parseList(industries);
    const taskList = parseList(tasks);

    const db = getFirestoreDb();
    const docRef = db.collection(FIRESTORE_COLLECTIONS.manpowerRequests).doc();
    await docRef.set({
      id: docRef.id,
      role,
      name,
      email,
      phone,
      company: company || '',
      experience: experience || '',
      languages: stringifyList(languages),
      industries: stringifyList(industries),
      tasks: stringifyList(tasks),
      availability: availability || '',
      documents: JSON.stringify(uploadedDocuments),
      status: 'pending',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    const attachments = (req.files || []).map((file) => ({
      filename: file.originalname,
      content: file.buffer,
      contentType: file.mimetype,
    }));

    try {
      await sendRequirementMail({
        subject: `New Manpower Requirement from ${name}`,
        html: buildRequirementHtml('New Manpower Requirement', {
          Role: role,
          Name: name,
          Email: email,
          Phone: phone,
          Company: company,
          City: req.body.city,
          Experience: experience,
          Languages: languageList.join(', '),
          Industries: industryList.join(', '),
          Tasks: taskList.join('<br>'),
          Availability: availability,
          Documents: uploadedDocuments.map((doc) => doc.originalName || doc.filename).join(', '),
          'Submitted To': REQUIREMENT_EMAIL,
        }),
        attachments,
      });
    } catch (emailError) {
      console.error('Manpower email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: `Manpower request submitted successfully to ${REQUIREMENT_EMAIL}`,
      data: { requestId: docRef.id },
    });
  } catch (error) {
    console.error('Create manpower request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit manpower request',
    });
  }
});

export default router;
