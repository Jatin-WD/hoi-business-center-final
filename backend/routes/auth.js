import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dns from 'dns/promises';
import { getDb } from '../config/database.js';
import { buildRequirementHtml, REQUIREMENT_EMAIL, sendDirectMail, sendRequirementMail } from '../utils/mailer.js';
import { sendOtpSms } from '../utils/sms.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9][0-9\s-]{7,}[0-9]$/;
const disposableEmailDomains = new Set([
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'yopmail.com',
]);

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

function getBearerToken(req) {
  return req.headers.authorization?.replace('Bearer ', '');
}

function issueToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '7d' });
}

function publicUser(user) {
  const { password, ...cleanUser } = user;
  return cleanUser;
}

function phoneKey(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function signupCodeHtml(code, user) {
  return `
    <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.6">
      <h2 style="color:#1a3a8f">Verify your HOI Business Center account</h2>
      <p>Hello ${user.name || 'there'},</p>
      <p>Use this verification code to complete your signup:</p>
      <div style="margin:20px 0;padding:16px;border:1px solid #dbeafe;border-radius:8px;background:#eff6ff;font-size:28px;font-weight:700;letter-spacing:6px;color:#1a3a8f;text-align:center">${code}</div>
      <p>This code expires in 10 minutes. If you did not request this signup, ignore this email.</p>
    </div>
  `;
}

async function assertEmailCanReceiveMail(email) {
  const domain = String(email).split('@')[1]?.toLowerCase();
  if (!domain || disposableEmailDomains.has(domain)) {
    return 'Use a valid business or personal email address';
  }

  if (process.env.REQUIRE_EMAIL_MX_CHECK !== 'true') {
    return '';
  }

  try {
    const records = await dns.resolveMx(domain);
    if (!records.length) return 'Email domain cannot receive mail';
  } catch {
    return 'Email domain cannot receive mail';
  }

  return '';
}

async function findUserByPhoneKey(db, phone) {
  const target = phoneKey(phone);
  const users = await db.all('SELECT id, phone FROM users WHERE phone IS NOT NULL');
  return users.find((user) => phoneKey(user.phone) === target) || null;
}

async function assertUniqueSignupIdentity(db, email, phone) {
  const existingEmail = await db.prepare('SELECT id FROM users WHERE lower(email) = ?').get(email);
  if (existingEmail) return 'User already exists with this email';
  const existingPhone = await findUserByPhoneKey(db, phone);
  if (existingPhone) return 'User already exists with this phone number';
  return '';
}

async function findUserByPhone(db, phone) {
  const target = phoneKey(phone);
  const users = await db.all('SELECT id, name, email, phone, company, role, status, created_at, password FROM users WHERE phone IS NOT NULL');
  return users.find((user) => phoneKey(user.phone) === target) || null;
}

async function notifyLogin(subject, fields) {
  try {
    await sendRequirementMail({
      subject,
      html: buildRequirementHtml(subject, { ...fields, 'Submitted To': REQUIREMENT_EMAIL }),
    });
  } catch (emailError) {
    console.error(`${subject} email failed:`, emailError);
  }
}

function buildWelcomeHtml(user) {
  return `
    <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.6">
      <h2 style="color:#1a3a8f">Welcome to KIL - HOI Business Center</h2>
      <p>Hello ${user.name || 'there'},</p>
      <p>Thank you for creating your account. You can now browse exhibition services, request quotes, apply for manpower opportunities, and track your requirements with our team.</p>
      <div style="margin:20px 0;padding:16px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb">
        <p style="margin:0"><strong>Email:</strong> ${user.email}</p>
        <p style="margin:6px 0 0"><strong>Phone:</strong> ${user.phone || 'Not provided'}</p>
      </div>
      <p>Our primary service location is Yashobhoomi, Dwarka, New Delhi, and our team will assist you with booth reservation, design, installation, logistics, marketing, interpretation, and manpower support.</p>
      <p style="margin-top:24px">Regards,<br><strong>KIL - HOI Business Center Team</strong></p>
    </div>
  `;
}

// Start verified registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, company } = req.body;
    const cleanEmail = String(email || '').toLowerCase().trim();
    const cleanPhone = String(phone || '').trim();
    if (!name || !emailRegex.test(cleanEmail) || !phoneRegex.test(cleanPhone) || !validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid name, email, phone, and password with 8 characters, one uppercase letter, and one number'
      });
    }

    const emailProblem = await assertEmailCanReceiveMail(cleanEmail);
    if (emailProblem) {
      return res.status(400).json({ success: false, message: emailProblem });
    }

    const db = await getDb();
    const duplicateMessage = await assertUniqueSignupIdentity(db, cleanEmail, cleanPhone);
    if (duplicateMessage) {
      return res.status(409).json({ success: false, message: duplicateMessage });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await db.run(
      `INSERT INTO signup_verifications
       (name, email, phone, company, password_hash, code_hash, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, cleanEmail, cleanPhone, company || null, hashedPassword, codeHash, expiresAt]
    );

    const emailResult = await sendDirectMail({
      to: cleanEmail,
      subject: 'Verify your HOI Business Center account',
      html: signupCodeHtml(code, { name }),
    }).catch((emailError) => {
      console.error('Signup verification email failed:', emailError);
      return { sent: false, reason: emailError.message };
    });

    res.json({
      success: true,
      message: emailResult.sent ? 'Verification code sent to your email.' : 'Email is not configured, so use the verification code shown below.',
      data: emailResult.sent ? {} : { devOtp: code }
    });
  } catch (error) {
    console.error('Register verification request error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration verification failed'
    });
  }
});

router.post('/register/verify', async (req, res) => {
  try {
    const cleanEmail = String(req.body.email || '').toLowerCase().trim();
    const code = String(req.body.code || '').trim();
    if (!emailRegex.test(cleanEmail) || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email and 6 digit verification code' });
    }

    const db = await getDb();
    const verification = await db.prepare(`
      SELECT * FROM signup_verifications
      WHERE lower(email) = ? AND used_at IS NULL
      ORDER BY created_at DESC
    `).get(cleanEmail);

    if (!verification || new Date(verification.expires_at).getTime() < Date.now() || !(await bcrypt.compare(code, verification.code_hash))) {
      return res.status(401).json({ success: false, message: 'Invalid or expired verification code' });
    }

    const duplicateMessage = await assertUniqueSignupIdentity(db, cleanEmail, verification.phone);
    if (duplicateMessage) {
      return res.status(409).json({ success: false, message: duplicateMessage });
    }

    await db.run(
      'INSERT INTO users (name, email, password, phone, company) VALUES (?, ?, ?, ?, ?)',
      [verification.name, cleanEmail, verification.password_hash, verification.phone, verification.company]
    );
    await db.run('UPDATE signup_verifications SET used_at = CURRENT_TIMESTAMP WHERE id = ?', [verification.id]);

    const createdUser = await db.prepare('SELECT id, name, email, phone, company, role, status, created_at FROM users WHERE email = ?').get(cleanEmail);
    const token = issueToken(createdUser);

    try {
      await notifyLogin(`New HOI user signup: ${createdUser.name}`, {
        Name: createdUser.name,
        Email: createdUser.email,
        Phone: createdUser.phone,
        Company: createdUser.company,
        Role: createdUser.role || 'user',
      });
      await sendDirectMail({
        to: createdUser.email,
        subject: 'Welcome to KIL - HOI Business Center',
        html: buildWelcomeHtml(createdUser),
      });
    } catch (emailError) {
      console.error('Signup notification/welcome email failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user: createdUser, token }
    });
  } catch (error) {
    console.error('Register verification error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!emailRegex.test(email || '') || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid email and password'
      });
    }

    const db = await getDb();

    // Find user
    const cleanEmail = String(email || '').toLowerCase().trim();
    const user = await db.prepare('SELECT * FROM users WHERE lower(email) = ?').get(cleanEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    if (String(user.status || 'active').toLowerCase() === 'suspended') {
      return res.status(403).json({ success: false, message: 'This account is suspended. Please contact support.' });
    }

    // Generate token
    const token = issueToken(user);
    await notifyLogin(`HOI login: ${user.name}`, { Name: user.name, Email: user.email, Phone: user.phone, Method: 'Email password' });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: publicUser(user),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

async function handleProfile(req, res) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await getDb();

    const user = await db.prepare('SELECT id, name, email, phone, company, role, status, created_at FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    if (String(user.status || 'active').toLowerCase() === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'This account is suspended. Please contact support.'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
}

router.get('/me', handleProfile);
router.get('/profile', handleProfile);

router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

router.post('/otp/request', async (req, res) => {
  try {
    const phone = String(req.body.phone || '').trim();
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Enter a valid phone number' });
    }
    const db = await getDb();
    const user = await findUserByPhone(db, phone);
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this phone number' });
    if (String(user.status || 'active').toLowerCase() === 'suspended') {
      return res.status(403).json({ success: false, message: 'This account is suspended' });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await db.run('INSERT INTO otp_codes (phone, code_hash, expires_at) VALUES (?, ?, ?)', [phoneKey(phone), codeHash, expiresAt]);
    const smsResult = await sendOtpSms(phone, code).catch((smsError) => {
      console.error('OTP SMS sending failed:', smsError);
      return { sent: false, provider: 'failed' };
    });
    await notifyLogin(`HOI phone OTP for ${user.name}`, { Name: user.name, Email: user.email, Phone: phone, OTP: code, SMS: smsResult.sent ? `Sent by ${smsResult.provider}` : 'SMS provider not configured', Expires: '10 minutes' });

    res.json({
      success: true,
      message: smsResult.sent ? 'OTP sent to your phone number.' : 'OTP generated. SMS is not configured, so use the development OTP shown below.',
      data: process.env.NODE_ENV === 'production' ? { smsSent: smsResult.sent } : { smsSent: smsResult.sent, devOtp: code }
    });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate OTP' });
  }
});

router.post('/otp/verify', async (req, res) => {
  try {
    const phone = String(req.body.phone || '').trim();
    const code = String(req.body.code || '').trim();
    if (!phoneRegex.test(phone) || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ success: false, message: 'Enter a valid phone number and 6 digit OTP' });
    }
    const db = await getDb();
    const otp = await db.prepare('SELECT * FROM otp_codes WHERE phone = ? AND used_at IS NULL ORDER BY created_at DESC').get(phoneKey(phone));
    if (!otp || new Date(otp.expires_at).getTime() < Date.now() || !(await bcrypt.compare(code, otp.code_hash))) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    }
    await db.run('UPDATE otp_codes SET used_at = CURRENT_TIMESTAMP WHERE id = ?', [otp.id]);
    const user = await findUserByPhone(db, phone);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (String(user.status || 'active').toLowerCase() === 'suspended') {
      return res.status(403).json({ success: false, message: 'This account is suspended. Please contact support.' });
    }
    await notifyLogin(`HOI OTP login: ${user.name}`, { Name: user.name, Email: user.email, Phone: user.phone, Method: 'Phone OTP' });
    res.json({ success: true, message: 'OTP login successful', data: { user, token: issueToken(user) } });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ success: false, message: 'OTP login failed' });
  }
});

export default router;
