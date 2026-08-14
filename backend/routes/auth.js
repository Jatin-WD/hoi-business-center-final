import express from 'express';
import { getAuth } from 'firebase-admin/auth';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { getUserProfile, setUserCustomClaims, upsertUserProfile } from '../services/firestore.js';
import { buildRequirementHtml, REQUIREMENT_EMAIL, sendRequirementMail } from '../utils/mailer.js';

const router = express.Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9][0-9\s-]{7,}[0-9]$/;

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: 'Too many login attempts. Please try again later.',
});
const registerLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: 'Too many registration attempts. Please try again later.',
});

function publicUser(user) {
  if (!user) return null;
  const { createdAt, updatedAt, ...cleanUser } = user;
  return cleanUser;
}

async function verifyTokenFromRequest(req) {
  const token = req.body.idToken || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    const error = new Error('No token provided');
    error.statusCode = 401;
    throw error;
  }
  return getAuth().verifyIdToken(token);
}

async function notify(subject, fields) {
  try {
    await sendRequirementMail({
      subject,
      html: buildRequirementHtml(subject, { ...fields, 'Submitted To': REQUIREMENT_EMAIL }),
    });
  } catch (error) {
    console.error(`${subject} email failed:`, error);
  }
}

router.post('/register', registerLimiter, async (req, res) => {
  try {
    const decoded = await verifyTokenFromRequest(req);
    const { name, phone, company } = req.body;
    const cleanName = String(name || decoded.name || '').trim();
    const cleanPhone = String(phone || '').trim();
    const cleanCompany = String(company || '').trim();

    if (!cleanName || !emailRegex.test(String(decoded.email || '')) || !phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid name, email, and phone number',
      });
    }

    const user = await upsertUserProfile(decoded.uid, {
      name: cleanName,
      email: String(decoded.email || '').toLowerCase().trim(),
      phone: cleanPhone,
      company: cleanCompany,
      role: 'user',
      status: 'active',
    });

    await setUserCustomClaims(decoded.uid, { role: user.role || 'user' });
    await notify(`New HOI user signup: ${user.name}`, {
      Name: user.name,
      Email: user.email,
      Phone: user.phone,
      Company: user.company,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user: publicUser(user), token: req.body.idToken },
    });
  } catch (error) {
    console.error('Register error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: status === 401 ? 'No token provided' : 'Registration failed' });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const decoded = await verifyTokenFromRequest(req);
    const user = (await getUserProfile(decoded.uid)) || await upsertUserProfile(decoded.uid, {
      email: String(decoded.email || '').toLowerCase().trim(),
      name: String(decoded.name || '').trim(),
      role: 'user',
      status: 'active',
    });

    if (String(user.status || 'active').toLowerCase() === 'suspended') {
      return res.status(403).json({ success: false, message: 'This account is suspended. Please contact support.' });
    }

    await notify(`HOI login: ${user.name || user.email}`, {
      Name: user.name || decoded.name || '',
      Email: user.email || decoded.email || '',
      Phone: user.phone || '',
      Method: 'Firebase Auth',
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: publicUser(user), token: req.body.idToken || req.headers.authorization?.replace('Bearer ', '') || '' },
    });
  } catch (error) {
    console.error('Login error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: status === 401 ? 'No token provided' : 'Login failed' });
  }
});

async function profile(req, res) {
  try {
    const decoded = await verifyTokenFromRequest(req);
    const user = (await getUserProfile(decoded.uid)) || await upsertUserProfile(decoded.uid, {
      email: String(decoded.email || '').toLowerCase().trim(),
      name: String(decoded.name || '').trim(),
      role: 'user',
      status: 'active',
    });

    if (String(user.status || 'active').toLowerCase() === 'suspended') {
      return res.status(403).json({ success: false, message: 'This account is suspended. Please contact support.' });
    }

    res.json({ success: true, data: { user: publicUser(user) } });
  } catch (error) {
    console.error('Profile error:', error);
    const status = error.statusCode || 401;
    res.status(status).json({ success: false, message: status === 401 ? 'Invalid token' : 'Failed to load profile' });
  }
}

router.get('/me', profile);
router.get('/profile', profile);
router.post('/logout', (req, res) => res.json({ success: true, message: 'Logged out successfully' }));

export default router;
