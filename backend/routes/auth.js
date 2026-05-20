import express from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../config/database.js';
import { signToken, verifyToken } from '../middleware/auth.js';
import { buildRequirementHtml, REQUIREMENT_EMAIL, sendRequirementMail } from '../utils/mailer.js';

const router = express.Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9][0-9\s-]{7,}[0-9]$/;

function validPassword(password) {
  return typeof password === 'string' && password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

function publicUser(user) {
  const { password, ...cleanUser } = user;
  return cleanUser;
}

function issueToken(user) {
  return signToken({ id: user.id, email: user.email, role: user.role || 'user' }, { expiresIn: '7d' });
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

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, company } = req.body;
    const cleanEmail = String(email || '').toLowerCase().trim();
    const cleanPhone = String(phone || '').trim();

    if (!name || !emailRegex.test(cleanEmail) || !phoneRegex.test(cleanPhone) || !validPassword(password)) {
      return res.status(400).json({ success: false, message: 'Enter a valid name, email, phone, and password with 8 characters, one uppercase letter, and one number' });
    }

    const db = await getDb();
    const existing = await db.get('SELECT id FROM users WHERE lower(email) = ? OR phone = ?', [cleanEmail, cleanPhone]);
    if (existing) return res.status(409).json({ success: false, message: 'User already exists with this email or phone number' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run(
      'INSERT INTO users (name, email, password, phone, company) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), cleanEmail, hashedPassword, cleanPhone, company || null]
    );
    const user = await db.get('SELECT id, name, email, phone, company, role, status, created_at FROM users WHERE lower(email) = ?', [cleanEmail]);
    await notify(`New HOI user signup: ${user.name}`, { Name: user.name, Email: user.email, Phone: user.phone, Company: user.company });

    res.status(201).json({ success: true, message: 'User registered successfully', data: { user, token: issueToken(user) } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const cleanEmail = String(req.body.email || '').toLowerCase().trim();
    const password = String(req.body.password || '');
    if (!emailRegex.test(cleanEmail) || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Enter a valid email and password' });
    }

    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE lower(email) = ?', [cleanEmail]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (String(user.status || 'active').toLowerCase() === 'suspended') {
      return res.status(403).json({ success: false, message: 'This account is suspended. Please contact support.' });
    }

    await notify(`HOI login: ${user.name}`, { Name: user.name, Email: user.email, Phone: user.phone, Method: 'Email password' });
    res.json({ success: true, message: 'Login successful', data: { user: publicUser(user), token: issueToken(user) } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

async function profile(req, res) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = verifyToken(token);
    const db = await getDb();
    const user = await db.get('SELECT id, name, email, phone, company, role, status, created_at FROM users WHERE id = ?', [decoded.id]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (String(user.status || 'active').toLowerCase() === 'suspended') {
      return res.status(403).json({ success: false, message: 'This account is suspended. Please contact support.' });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

router.get('/me', profile);
router.get('/profile', profile);
router.post('/logout', (req, res) => res.json({ success: true, message: 'Logged out successfully' }));

export default router;
