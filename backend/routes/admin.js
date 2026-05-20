import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { getDb } from '../config/database.js';
import { databaseTables } from '../config/schema.js';
import { requireAdmin, signToken } from '../middleware/auth.js';

const router = express.Router();
const adminImageDir = path.join(process.cwd(), 'uploads', 'admin-images');
if (!fs.existsSync(adminImageDir)) {
  fs.mkdirSync(adminImageDir, { recursive: true });
}

const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, adminImageDir),
    filename: (req, file, cb) => {
      const safeBase = path.basename(file.originalname, path.extname(file.originalname)).replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
      cb(null, `${safeBase || 'image'}-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPG, PNG, WEBP, and GIF images are allowed'));
  },
});
const RESOURCE_CONFIG = {
  services: {
    table: 'services',
    id: 'id',
    list: 'SELECT id, service_id, label, packages, created_at, updated_at FROM services ORDER BY service_id',
    fields: ['service_id', 'label', 'packages'],
    required: ['service_id', 'label'],
  },
  packages: {
    table: 'packages',
    id: 'id',
    list: 'SELECT id, category, subcategory, title, subtitle, price, price_note, description, includes, not_includes, duration, created_at, updated_at FROM packages ORDER BY category, subcategory',
    fields: ['category', 'subcategory', 'title', 'subtitle', 'price', 'price_note', 'description', 'includes', 'not_includes', 'duration'],
    required: ['category', 'subcategory', 'title', 'subtitle', 'price'],
  },
  venues: {
    table: 'venues',
    id: 'id',
    list: 'SELECT id, location_id, sub_venue_id, name, address, city, state, description, about, total_area, halls, capacity, established, website, specialities, image, created_at, updated_at FROM venues ORDER BY state, city, name',
    fields: ['location_id', 'sub_venue_id', 'name', 'address', 'city', 'state', 'description', 'about', 'total_area', 'halls', 'capacity', 'established', 'website', 'specialities', 'image'],
    required: ['location_id', 'sub_venue_id', 'name', 'address', 'city', 'state'],
  },
  events: {
    table: 'events',
    id: 'id',
    list: 'SELECT id, name, date, venue, location_id, category, status, created_at, updated_at FROM events ORDER BY id DESC',
    fields: ['name', 'date', 'venue', 'location_id', 'category', 'status'],
    required: ['name', 'date', 'venue', 'location_id'],
  },
};

const SUBMISSION_CONFIG = {
  inquiries: 'inquiries',
  manpower: 'manpower_requests',
  bookings: 'bookings',
};
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STAGE_REPORT = {
  stage1: {
    title: 'Stage 1 - Cleanup and Structure',
    items: [
      'List of unused files that were deleted',
      'Total LOC after the clean-up',
      'List of shared components extracted',
      'Link to the Git repository',
    ],
  },
  stage2: {
    title: 'Stage 2 - Backend API',
    items: [
      'List of completed API endpoints',
      'Database schema (ERD or Prisma schema)',
      'API test results (Postman collection or screenshots)',
    ],
  },
  stage3: {
    title: 'Stage 3 - Front-end Integration',
    items: [
      'List of working features (with screenshots or screen recordings)',
      'End-to-end confirmation of the sign-up -> log-in -> inquiry submission flow',
    ],
  },
  stage4: {
    title: 'Stage 4 - Quality and Deployment',
    items: [
      'Test-coverage report',
      'Deployment URL',
      'Confirmation that the CI/CD pipeline runs successfully',
    ],
  },
};

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

router.post('/upload/image', requireAdmin, imageUpload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Image file is required' });
  }

  const publicPath = `/uploads/admin-images/${req.file.filename}`;
  res.status(201).json({
    success: true,
    message: 'Image uploaded',
    data: {
      path: publicPath,
      url: `${req.protocol}://${req.get('host')}${publicPath}`,
      filename: req.file.filename,
    },
  });
});

function buildStageReport(counts) {
  return {
    generatedAt: new Date().toISOString(),
    pdfHint: 'Use the Print / Save as PDF action from the admin report tab.',
    stages: STAGE_REPORT,
    currentStatus: {
      completedApiEndpoints: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'POST /api/auth/logout',
        'GET /api/auth/me',
        'POST /api/inquiries',
        'POST /api/manpower',
        'GET /api/venues',
        'GET /api/venues/:locationId/:subVenueId',
        'GET /api/services',
        'GET /api/packages',
        'GET /api/events',
        'POST /api/bookings',
        'GET /api/bookings',
        'GET /api/admin/dashboard',
      ],
      databaseTables,
      counts,
    },
  };
}

function buildNotifications({ users, inquiries, manpower, bookings, dismissedIds = [] }) {
  const dismissed = new Set(dismissedIds);
  const items = [
    ...users.map((item) => ({
      id: `user-${item.id}`,
      type: 'user',
      title: 'New user signup',
      message: `${item.name || item.email} registered on the website`,
      created_at: item.created_at,
      status: 'new',
    })),
    ...inquiries.map((item) => ({
      id: `inquiry-${item.id}`,
      type: 'inquiry',
      title: 'New service enquiry',
      message: `${item.name || item.email} asked about ${item.service || 'a service'}`,
      created_at: item.created_at,
      status: item.status || 'pending',
    })),
    ...manpower.map((item) => ({
      id: `manpower-${item.id}`,
      type: 'manpower',
      title: 'New manpower application',
      message: `${item.name || item.email} applied for ${item.role || 'manpower'}`,
      created_at: item.created_at,
      status: item.status || 'pending',
    })),
    ...bookings.map((item) => ({
      id: `booking-${item.id}`,
      type: 'booking',
      title: 'New booking request',
      message: `Booking #${item.id} was created`,
      created_at: item.created_at,
      status: item.status || 'pending',
    })),
  ];

  return items
    .filter((item) => !dismissed.has(item.id))
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 25);
}

router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').toLowerCase();
  const password = String(req.body.password || '');

  try {
    const db = await getDb();
    const dbAdmin = await db.prepare(`
      SELECT id, name, email, password, phone, company, role
      FROM users
      WHERE lower(email) = ? AND role IN ('admin', 'sub-admin', 'editor')
    `).get(email);

    if (dbAdmin && await bcrypt.compare(password, dbAdmin.password)) {
      const token = signToken({ id: dbAdmin.id, email: dbAdmin.email, role: dbAdmin.role }, { expiresIn: '8h' });
      const { password: _, ...admin } = dbAdmin;
      return res.json({
        success: true,
        message: 'Admin login successful',
        data: { token, admin },
      });
    }
  } catch (error) {
    console.error('Admin DB login lookup error:', error);
  }

  const envEmail = String(process.env.ADMIN_EMAIL || 'LKMALLSHOP@GMAIL.COM').toLowerCase();
  const envPassword = String(process.env.ADMIN_PASSWORD || '');
  if (envPassword && email === envEmail && password === envPassword) {
    const token = signToken({ id: 0, email: envEmail, role: 'admin', envAdmin: true }, { expiresIn: '8h' });
    return res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        admin: { id: 0, email: envEmail, role: 'admin', envAdmin: true },
      },
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid admin credentials',
  });
});

router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const inquiries = await db.prepare(`
      SELECT id, name, email, phone, company, service, location, message, status, created_at
      FROM inquiries
      ORDER BY created_at DESC
    `).all();
    const manpower = await db.prepare(`
      SELECT id, role, name, email, phone, company, experience, availability, documents, status, created_at
      FROM manpower_requests
      ORDER BY created_at DESC
    `).all();
    const bookings = await db.prepare(`
      SELECT id, user_id, service_id, package_id, event_id, notes, status, created_at
      FROM bookings
      ORDER BY created_at DESC
    `).all();
    const content = await db.prepare(`
      SELECT id, content_key, label, value, type, updated_at
      FROM cms_content
      ORDER BY content_key
    `).all();
    const services = await db.prepare(RESOURCE_CONFIG.services.list).all();
    const packages = await db.prepare(RESOURCE_CONFIG.packages.list).all();
    const venues = await db.prepare(RESOURCE_CONFIG.venues.list).all();
    const events = await db.prepare(RESOURCE_CONFIG.events.list).all();
    const replies = await db.prepare('SELECT id, source, record_id, subject, message, created_at FROM admin_replies ORDER BY created_at DESC LIMIT 100').all();
    const dismissedNotifications = await db.prepare('SELECT notification_id FROM notification_dismissals').all();
    const adminUsers = await db.prepare(`
      SELECT id, name, email, phone, company, role, status, created_at, updated_at
      FROM users
      WHERE role IN ('admin', 'sub-admin', 'editor')
      ORDER BY role, name
    `).all();
    const users = await db.prepare(`
      SELECT id, name, email, phone, company, role, status, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `).all();
    const counts = {
      users: users.length,
      adminUsers: adminUsers.length,
      inquiries: inquiries.length,
      manpower: manpower.length,
      bookings: bookings.length,
      services: services.length,
      packages: packages.length,
      venues: venues.length,
      events: events.length,
    };
    const notifications = buildNotifications({ users, inquiries, manpower, bookings, dismissedIds: dismissedNotifications.map((item) => item.notification_id) });
    const unreadNotifications = notifications.filter((item) => ['new', 'pending'].includes(String(item.status).toLowerCase())).length;

    res.json({
      success: true,
      data: {
        admin: {
          email: req.admin.email,
          role: req.admin.role,
          envAdmin: Boolean(req.admin.envAdmin),
        },
        inquiries,
        manpower: manpower.map((item) => ({
          ...item,
          documents: JSON.parse(item.documents || '[]'),
        })),
        bookings,
        content,
        services,
        packages,
        venues,
        events,
        replies,
        users,
        adminUsers,
        notifications,
        unreadNotifications,
        report: buildStageReport(counts),
        pagination: {
          defaultPageSize: 12,
          note: 'Admin UI paginates large dashboard lists client-side; API includes full persisted records from the configured database.',
        },
        cms: {
          note: 'Manage every website area from this panel: page text, services, packages, manpower roles, event calendar, theme, and submissions.',
          editableAreas: ['Home page', 'Services page', 'Yashobhoomi page', 'About page', 'Contact page', 'Manpower form', 'Event calendar', 'Website theme'],
        },
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to load admin dashboard' });
  }
});

router.delete('/notifications', requireAdmin, async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map((id) => String(id)).filter(Boolean) : [];
    if (!ids.length) return res.json({ success: true, message: 'No notifications to clear' });
    const db = await getDb();
    for (const id of ids) {
      try {
        await db.prepare('INSERT INTO notification_dismissals (notification_id) VALUES (?)').run(id);
      } catch {
        // Already dismissed.
      }
    }
    res.json({ success: true, message: 'Notifications cleared successfully' });
  } catch (error) {
    console.error('Clear notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear notifications' });
  }
});

router.post('/profile', requireAdmin, async (req, res) => {
  try {
    const { name, phone, company } = req.body;
    if (req.admin.envAdmin) {
      return res.json({ success: true, message: 'Environment admin profile is managed from server configuration' });
    }
    const db = await getDb();
    await db.prepare('UPDATE users SET name = ?, phone = ?, company = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(String(name || '').trim(), String(phone || '').trim(), String(company || '').trim(), req.admin.id);
    res.json({ success: true, message: 'Admin profile updated successfully' });
  } catch (error) {
    console.error('Admin profile update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

router.post('/password', requireAdmin, async (req, res) => {
  try {
    if (req.admin.envAdmin) {
      return res.status(400).json({ success: false, message: 'Default environment admin password must be changed in server environment variables' });
    }
    const { currentPassword, newPassword } = req.body;
    if (!validatePassword(newPassword)) {
      return badRequest(res, 'New password must have 8 characters, one uppercase letter, and one number');
    }
    const db = await getDb();
    const admin = await db.prepare('SELECT id, password FROM users WHERE id = ?').get(req.admin.id);
    if (!admin || !(await bcrypt.compare(String(currentPassword || ''), admin.password))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hashedPassword, req.admin.id);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Admin password change error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

router.post('/users', requireAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can manage access' });
    }
    const { name, email, password, phone, company, role } = req.body;
    const cleanEmail = String(email || '').toLowerCase().trim();
    const cleanRole = ['admin', 'sub-admin', 'editor'].includes(role) ? role : 'editor';
    if (!name || !emailRegex.test(cleanEmail) || !validatePassword(password)) {
      return badRequest(res, 'Enter name, valid email, and password with 8 characters, one uppercase letter, and one number');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const db = await getDb();
    const existing = await db.prepare('SELECT id FROM users WHERE lower(email) = ? AND id != ?').get(cleanEmail, req.body.id || 0);
    if (existing) return res.status(409).json({ success: false, message: 'A user already exists with this email' });
    await db.prepare(`
      INSERT INTO users (name, email, password, phone, company, role, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(name, cleanEmail, hashedPassword, phone || '', company || '', cleanRole);
    res.json({ success: true, message: 'Admin access created successfully' });
  } catch (error) {
    console.error('Admin user create error:', error);
    res.status(500).json({ success: false, message: 'Failed to create admin user' });
  }
});

router.put('/users/:id', requireAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can manage access' });
    }
    const { name, email, phone, company, role, password } = req.body;
    const cleanEmail = String(email || '').toLowerCase().trim();
    const cleanRole = ['admin', 'sub-admin', 'editor'].includes(role) ? role : 'editor';
    if (!name || !emailRegex.test(cleanEmail)) {
      return badRequest(res, 'Name and valid email are required');
    }
    const db = await getDb();
    const existing = await db.prepare('SELECT id FROM users WHERE lower(email) = ? AND id != ?').get(cleanEmail, req.params.id);
    if (existing) return res.status(409).json({ success: false, message: 'A user already exists with this email' });
    if (password) {
      if (!validatePassword(password)) return badRequest(res, 'Password must have 8 characters, one uppercase letter, and one number');
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.prepare('UPDATE users SET name = ?, email = ?, phone = ?, company = ?, role = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(name, cleanEmail, phone || '', company || '', cleanRole, hashedPassword, req.params.id);
    } else {
      await db.prepare('UPDATE users SET name = ?, email = ?, phone = ?, company = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(name, cleanEmail, phone || '', company || '', cleanRole, req.params.id);
    }
    res.json({ success: true, message: 'Admin access updated successfully' });
  } catch (error) {
    console.error('Admin user update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update admin user' });
  }
});

router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can manage access' });
    }
    if (String(req.admin.id || '') === String(req.params.id)) {
      return badRequest(res, 'You cannot delete your own admin access');
    }
    const db = await getDb();
    await db.prepare("UPDATE users SET role = 'user', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: 'Admin access removed successfully' });
  } catch (error) {
    console.error('Admin user delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove admin access' });
  }
});

router.patch('/website-users/:id/status', requireAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can manage users' });
    }
    const status = ['active', 'suspended'].includes(req.body.status) ? req.body.status : '';
    if (!status) return badRequest(res, 'Valid status is required');
    const db = await getDb();
    const result = await db.prepare('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role NOT IN (?, ?, ?)')
      .run(status, req.params.id, 'admin', 'sub-admin', 'editor');
    if (!result.rowCount) {
      return res.status(404).json({ success: false, message: 'Website user not found or cannot be suspended' });
    }
    res.json({ success: true, message: `User ${status === 'suspended' ? 'suspended' : 'activated'} successfully` });
  } catch (error) {
    console.error('Website user status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
});

router.delete('/website-users/:id', requireAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can delete users' });
    }
    const db = await getDb();
    await db.prepare('DELETE FROM users WHERE id = ? AND role NOT IN (?, ?, ?)').run(req.params.id, 'admin', 'sub-admin', 'editor');
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Website user delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

function badRequest(res, message) {
  return res.status(400).json({ success: false, message });
}

function normalizePayload(config, body) {
  const payload = {};
  for (const field of config.fields) {
    payload[field] = body[field] ?? '';
  }
  for (const field of config.required) {
    if (!String(payload[field] || '').trim()) {
      return { error: `${field.replace(/_/g, ' ')} is required` };
    }
  }
  return { payload };
}

router.get('/resource/:resource', requireAdmin, async (req, res) => {
  try {
    const config = RESOURCE_CONFIG[req.params.resource];
    if (!config) return badRequest(res, 'Unknown admin resource');
    const db = await getDb();
    res.json({ success: true, data: { rows: await db.prepare(config.list).all() } });
  } catch (error) {
    console.error('Admin resource list error:', error);
    res.status(500).json({ success: false, message: 'Failed to load resource' });
  }
});

router.post('/resource/:resource', requireAdmin, async (req, res) => {
  try {
    const config = RESOURCE_CONFIG[req.params.resource];
    if (!config) return badRequest(res, 'Unknown admin resource');
    const { payload, error } = normalizePayload(config, req.body);
    if (error) return badRequest(res, error);

    const db = await getDb();
    const columns = config.fields.join(', ');
    const placeholders = config.fields.map(() => '?').join(', ');
    await db.prepare(`INSERT INTO ${config.table} (${columns}, updated_at) VALUES (${placeholders}, CURRENT_TIMESTAMP)`)
      .run(config.fields.map((field) => payload[field]));
    res.json({ success: true, message: 'Record added successfully' });
  } catch (error) {
    console.error('Admin resource create error:', error);
    res.status(500).json({ success: false, message: 'Failed to add record' });
  }
});

router.put('/resource/:resource/:id', requireAdmin, async (req, res) => {
  try {
    const config = RESOURCE_CONFIG[req.params.resource];
    if (!config) return badRequest(res, 'Unknown admin resource');
    const { payload, error } = normalizePayload(config, req.body);
    if (error) return badRequest(res, error);

    const db = await getDb();
    const setClause = config.fields.map((field) => `${field} = ?`).join(', ');
    await db.prepare(`UPDATE ${config.table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE ${config.id} = ?`)
      .run([...config.fields.map((field) => payload[field]), req.params.id]);
    res.json({ success: true, message: 'Record updated successfully' });
  } catch (error) {
    console.error('Admin resource update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update record' });
  }
});

router.delete('/resource/:resource/:id', requireAdmin, async (req, res) => {
  try {
    const config = RESOURCE_CONFIG[req.params.resource];
    if (!config) return badRequest(res, 'Unknown admin resource');
    const db = await getDb();
    await db.prepare(`DELETE FROM ${config.table} WHERE ${config.id} = ?`).run(req.params.id);
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Admin resource delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete record' });
  }
});

router.patch('/submission/:source/:id/status', requireAdmin, async (req, res) => {
  try {
    const table = SUBMISSION_CONFIG[req.params.source];
    if (!table) return badRequest(res, 'Unknown submission type');
    const status = String(req.body.status || '').trim();
    if (!status) return badRequest(res, 'Status is required');
    const db = await getDb();
    await db.prepare(`UPDATE ${table} SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(status, req.params.id);
    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Admin submission status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

router.delete('/submission/:source/:id', requireAdmin, async (req, res) => {
  try {
    const table = SUBMISSION_CONFIG[req.params.source];
    if (!table) return badRequest(res, 'Unknown submission type');
    const db = await getDb();
    await db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
    res.json({ success: true, message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Admin submission delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete submission' });
  }
});

router.post('/submission/:source/:id/reply', requireAdmin, async (req, res) => {
  try {
    const table = SUBMISSION_CONFIG[req.params.source];
    if (!table) return badRequest(res, 'Unknown submission type');
    const subject = String(req.body.subject || 'Reply from HOI Business Center').trim();
    const message = String(req.body.message || '').trim();
    if (!message) return badRequest(res, 'Reply message is required');
    const db = await getDb();
    await db.prepare('INSERT INTO admin_replies (source, record_id, subject, message) VALUES (?, ?, ?, ?)')
      .run(req.params.source, req.params.id, subject, message);
    await db.prepare(`UPDATE ${table} SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run('replied', req.params.id);
    res.json({ success: true, message: 'Reply saved and request marked as replied' });
  } catch (error) {
    console.error('Admin reply error:', error);
    res.status(500).json({ success: false, message: 'Failed to save reply' });
  }
});

export default router;
