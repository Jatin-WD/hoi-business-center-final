import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { getDb } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';
import { buildRequirementHtml, REQUIREMENT_EMAIL, sendRequirementMail } from '../utils/mailer.js';

const router = express.Router();
const uploadDir = path.join(process.cwd(), 'uploads');
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

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Create manpower request
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
      availability
    } = req.body;

    if (!role || !name || !emailRegex.test(email || '') || !phoneRegex.test(phone || '')) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid role, name, email, and phone number'
      });
    }

    // Handle file uploads
    const documents = req.files ? req.files.map(file => file.filename) : [];

    const db = await getDb();

    const languageList = parseList(languages);
    const industryList = parseList(industries);
    const taskList = parseList(tasks);

    // Insert manpower request
    const result = await db.run(
      `INSERT INTO manpower_requests
       (role, name, email, phone, company, experience, languages, industries, tasks, availability, documents)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        role,
        name,
        email,
        phone,
        company,
        experience,
        stringifyList(languages),
        stringifyList(industries),
        stringifyList(tasks),
        availability,
        JSON.stringify(documents)
      ]
    );

    const attachments = (req.files || []).map((file) => ({
      filename: file.originalname,
      path: file.path,
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
          Documents: documents.join(', '),
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
      data: { requestId: result.lastID }
    });
  } catch (error) {
    console.error('Create manpower request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit manpower request'
    });
  }
});

// Get all manpower requests (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const requests = await db.all(`
      SELECT
        id,
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
        documents,
        status,
        created_at,
        updated_at
      FROM manpower_requests
      ORDER BY created_at DESC
    `);

    // Parse JSON fields
    const parsedRequests = requests.map(request => ({
      ...request,
      languages: parseList(request.languages),
      industries: parseList(request.industries),
      tasks: parseList(request.tasks),
      documents: parseList(request.documents)
    }));

    res.json({
      success: true,
      data: { requests: parsedRequests }
    });
  } catch (error) {
    console.error('Get manpower requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch manpower requests'
    });
  }
});

// Update manpower request status
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = await getDb();

    await db.run(
      'UPDATE manpower_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: 'Manpower request status updated successfully'
    });
  } catch (error) {
    console.error('Update manpower request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update manpower request status'
    });
  }
});

export default router;
