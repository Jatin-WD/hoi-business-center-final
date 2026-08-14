import express from 'express';
import multer from 'multer';
import { getAuth } from 'firebase-admin/auth';
import { requireAdmin } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import {
  FIRESTORE_COLLECTIONS,
  getFirestoreDb,
  serverTimestamp,
  getUserProfile,
  upsertUserProfile,
  setUserCustomClaims,
} from '../services/firestore.js';
import { serializeFirestoreDocs } from '../services/firestore-serialize.js';
import { loadCmsContent } from '../services/cms-store.js';
import { syncIiccEvents } from '../services/iicc-event-sync.js';
import { buildRequirementHtml, sendDirectMail } from '../utils/mailer.js';
import { saveUploadedFile } from '../services/storage.js';

const router = express.Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const adminLoginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: 'Too many admin login attempts. Please try again later.',
});

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPG, PNG, WEBP, and GIF images are allowed'));
  },
});

const RESOURCE_CONFIG = {
  services: {
    collection: FIRESTORE_COLLECTIONS.services,
    fields: ['service_id', 'label', 'packages'],
    required: ['service_id', 'label'],
    sort: (a, b) => String(a.service_id || '').localeCompare(String(b.service_id || '')),
  },
  packages: {
    collection: FIRESTORE_COLLECTIONS.packages,
    fields: ['category', 'subcategory', 'title', 'subtitle', 'price', 'price_note', 'description', 'includes', 'not_includes', 'duration'],
    required: ['category', 'subcategory', 'title', 'subtitle', 'price'],
    sort: (a, b) => `${a.category || ''}${a.subcategory || ''}`.localeCompare(`${b.category || ''}${b.subcategory || ''}`),
  },
  venues: {
    collection: FIRESTORE_COLLECTIONS.venues,
    fields: ['location_id', 'sub_venue_id', 'name', 'address', 'city', 'state', 'description', 'about', 'total_area', 'halls', 'capacity', 'established', 'website', 'specialities', 'image'],
    required: ['location_id', 'sub_venue_id', 'name', 'address', 'city', 'state'],
    sort: (a, b) => `${a.state || ''}${a.city || ''}${a.name || ''}`.localeCompare(`${b.state || ''}${b.city || ''}${b.name || ''}`),
  },
  events: {
    collection: FIRESTORE_COLLECTIONS.events,
    fields: ['name', 'date', 'venue', 'location_id', 'category', 'status'],
    required: ['name', 'date', 'venue', 'location_id'],
    sort: (a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')),
  },
};

const SUBMISSION_CONFIG = {
  inquiries: {
    collection: FIRESTORE_COLLECTIONS.inquiries,
    label: 'inquiry',
  },
  manpower: {
    collection: FIRESTORE_COLLECTIONS.manpowerRequests,
    label: 'manpower request',
  },
  bookings: {
    collection: FIRESTORE_COLLECTIONS.bookings,
    label: 'booking',
  },
};

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
      'Firestore schema and collection map',
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

function badRequest(res, message) {
  return res.status(400).json({ success: false, message });
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

function normalizeRole(role) {
  return ['admin', 'sub-admin', 'editor'].includes(String(role || '').toLowerCase()) ? String(role).toLowerCase() : 'editor';
}

function normalizeStoredValue(field, value) {
  if (value === undefined || value === null) return '';
  if (Array.isArray(value) || typeof value === 'object') {
    return JSON.stringify(value);
  }
  if (typeof value !== 'string') return String(value);
  if (['packages', 'includes', 'not_includes', 'specialities'].includes(field)) {
    const trimmed = value.trim();
    if (!trimmed) return '';
    try {
      const parsed = JSON.parse(trimmed);
      return JSON.stringify(parsed);
    } catch {
      return value;
    }
  }
  return value;
}

function normalizePayload(config, body) {
  const payload = {};
  for (const field of config.fields) {
    payload[field] = normalizeStoredValue(field, body[field]);
  }
  for (const field of config.required) {
    if (!normalizeText(payload[field])) {
      return { error: `${field.replace(/_/g, ' ')} is required` };
    }
  }
  return { payload };
}

function sortRows(rows, sortFn) {
  return [...rows].sort(sortFn);
}

async function loadCollectionRows(collectionName) {
  const snap = await getFirestoreDb().collection(collectionName).get();
  return serializeFirestoreDocs(snap);
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
      collections: Object.values(FIRESTORE_COLLECTIONS),
      counts,
    },
  };
}

async function persistAuthClaims(uid, role) {
  await setUserCustomClaims(uid, {
    role,
    admin: ['admin', 'sub-admin', 'editor'].includes(role),
  });
}

async function saveAuthProfile(uid, { name, email, phone, company, role, status }) {
  const profile = await upsertUserProfile(uid, {
    name,
    email,
    phone,
    company,
    role,
    status,
  });
  await persistAuthClaims(uid, profile.role || role || 'user');
  return profile;
}

async function findUserByEmail(email) {
  try {
    return await getAuth().getUserByEmail(email);
  } catch {
    return null;
  }
}

async function resolveSubmissionEmail(source, id) {
  const config = SUBMISSION_CONFIG[source];
  if (!config) return '';
  const db = getFirestoreDb();
  const snap = await db.collection(config.collection).doc(String(id)).get();
  if (!snap.exists) return '';
  const data = snap.data() || {};
  if (data.email) return String(data.email).trim();
  if (data.user_id) {
    const userSnap = await db.collection(FIRESTORE_COLLECTIONS.users).doc(String(data.user_id)).get();
    return String(userSnap.data()?.email || '').trim();
  }
  return '';
}

router.post('/upload/image', requireAdmin, imageUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const upload = await saveUploadedFile({
      folder: 'admin-images',
      originalname: req.file.originalname,
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      makePublic: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Image uploaded',
      data: {
        path: upload.publicUrl,
        url: upload.publicUrl,
        filename: upload.filename,
      },
    });
  } catch (error) {
    console.error('Admin image upload error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
});

router.post('/login', adminLoginLimiter, async (req, res) => {
  try {
    const token = req.body.idToken || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Admin login required' });
    }

    const decoded = await getAuth().verifyIdToken(token);
    const profile = await getUserProfile(decoded.uid);
    const user = profile || await saveAuthProfile(decoded.uid, {
      email: String(decoded.email || '').toLowerCase().trim(),
      name: String(decoded.name || '').trim(),
      role: String(decoded.role || (decoded.admin ? 'admin' : 'editor')),
      status: 'active',
    });

    if (!['admin', 'sub-admin', 'editor'].includes(String(user.role || '').toLowerCase())) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    return res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        admin: {
          id: user.id || decoded.uid,
          uid: decoded.uid,
          name: user.name,
          email: user.email,
          phone: user.phone,
          company: user.company,
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }
});

router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const lang = String(req.query.lang || 'en').toLowerCase();
    const [
      inquiries,
      manpowerRows,
      bookings,
      users,
      services,
      packages,
      venues,
      events,
      replies,
      dismissedNotifications,
      content,
    ] = await Promise.all([
      loadCollectionRows(FIRESTORE_COLLECTIONS.inquiries),
      loadCollectionRows(FIRESTORE_COLLECTIONS.manpowerRequests),
      loadCollectionRows(FIRESTORE_COLLECTIONS.bookings),
      loadCollectionRows(FIRESTORE_COLLECTIONS.users),
      loadCollectionRows(FIRESTORE_COLLECTIONS.services),
      loadCollectionRows(FIRESTORE_COLLECTIONS.packages),
      loadCollectionRows(FIRESTORE_COLLECTIONS.venues),
      loadCollectionRows(FIRESTORE_COLLECTIONS.events),
      (async () => {
        const snap = await getFirestoreDb().collection(FIRESTORE_COLLECTIONS.adminReplies)
          .orderBy('created_at', 'desc')
          .limit(100)
          .get();
        return serializeFirestoreDocs(snap);
      })(),
      (async () => {
        const snap = await getFirestoreDb().collection(FIRESTORE_COLLECTIONS.notifications).get();
        return serializeFirestoreDocs(snap);
      })(),
      loadCmsContent(lang),
    ]);

    const adminUsers = users.filter((user) => ['admin', 'sub-admin', 'editor'].includes(String(user.role || '').toLowerCase()));
    const notifications = buildNotifications({
      users,
      inquiries,
      manpower: manpowerRows,
      bookings,
      dismissedIds: dismissedNotifications.map((item) => item.notification_id),
    });
    const unreadNotifications = notifications.filter((item) => ['new', 'pending'].includes(String(item.status || '').toLowerCase())).length;
    const counts = {
      users: users.length,
      adminUsers: adminUsers.length,
      inquiries: inquiries.length,
      manpower: manpowerRows.length,
      bookings: bookings.length,
      services: services.length,
      packages: packages.length,
      venues: venues.length,
      events: events.length,
    };

    return res.json({
      success: true,
      data: {
        admin: {
          email: req.admin.email,
          role: req.admin.role,
        },
        inquiries,
        manpower: manpowerRows.map((item) => ({
          ...item,
          documents: (() => {
            try {
              return JSON.parse(item.documents || '[]');
            } catch {
              return [];
            }
          })(),
        })),
        bookings,
        content,
        services: sortRows(services, RESOURCE_CONFIG.services.sort),
        packages: sortRows(packages, RESOURCE_CONFIG.packages.sort),
        venues: sortRows(venues, RESOURCE_CONFIG.venues.sort),
        events: sortRows(events, RESOURCE_CONFIG.events.sort),
        replies,
        users,
        adminUsers,
        notifications,
        unreadNotifications,
        report: buildStageReport(counts),
        pagination: {
          defaultPageSize: 12,
          note: 'Admin UI paginates large dashboard lists client-side; API includes full persisted records from Firestore.',
        },
        cms: {
          note: 'Manage every website area from this panel: page text, services, packages, manpower roles, event calendar, theme, and submissions.',
          editableAreas: ['Home page', 'Services page', 'Yashobhoomi page', 'About page', 'Contact page', 'Manpower form', 'Event calendar', 'Website theme'],
        },
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load admin dashboard' });
  }
});

router.post('/events/sync', requireAdmin, async (req, res) => {
  try {
    const result = await syncIiccEvents({ pruneMissing: true });
    return res.json({
      success: true,
      message: `Synced ${result.count} IICC events`,
      data: {
        count: result.count,
      },
    });
  } catch (error) {
    console.error('IICC event sync error:', error);
    return res.status(500).json({ success: false, message: 'Failed to sync IICC events' });
  }
});

router.delete('/notifications', requireAdmin, async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map((id) => String(id)).filter(Boolean) : [];
    if (!ids.length) {
      return res.json({ success: true, message: 'No notifications to clear' });
    }

    const db = getFirestoreDb();
    await Promise.all(ids.map((id) => db.collection(FIRESTORE_COLLECTIONS.notifications).doc(id).set({
      id,
      notification_id: id,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    }, { merge: true })));

    return res.json({ success: true, message: 'Notifications cleared successfully' });
  } catch (error) {
    console.error('Clear notifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to clear notifications' });
  }
});

router.post('/profile', requireAdmin, async (req, res) => {
  try {
    const { name, phone, company } = req.body;
    const profile = await saveAuthProfile(req.admin.uid, {
      name: normalizeText(name),
      phone: normalizeText(phone),
      company: normalizeText(company),
      email: req.admin.email,
      role: req.admin.role,
      status: req.admin.status || 'active',
    });
    return res.json({ success: true, message: 'Admin profile updated successfully', data: { profile } });
  } catch (error) {
    console.error('Admin profile update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

router.post('/password', requireAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!validatePassword(newPassword)) {
      return badRequest(res, 'New password must have 8 characters, one uppercase letter, and one number');
    }

    await getAuth().updateUser(req.admin.uid, { password: newPassword });
    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Admin password change error:', error);
    return res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

router.post('/users', requireAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can manage access' });
    }

    const { name, email, password, phone, company, role } = req.body;
    const cleanEmail = String(email || '').toLowerCase().trim();
    const cleanRole = normalizeRole(role);
    if (!name || !emailRegex.test(cleanEmail) || !validatePassword(password)) {
      return badRequest(res, 'Enter name, valid email, and password with 8 characters, one uppercase letter, and one number');
    }

    const existingAuthUser = await findUserByEmail(cleanEmail);
    if (existingAuthUser) {
      return res.status(409).json({ success: false, message: 'A user already exists with this email' });
    }

    const authUser = await getAuth().createUser({
      email: cleanEmail,
      password,
      displayName: String(name || '').trim(),
    });

    const profile = await saveAuthProfile(authUser.uid, {
      name: String(name || '').trim(),
      email: cleanEmail,
      phone: normalizeText(phone),
      company: normalizeText(company),
      role: cleanRole,
      status: 'active',
    });

    return res.json({
      success: true,
      message: 'Admin access created successfully',
      data: { id: authUser.uid, profile },
    });
  } catch (error) {
    console.error('Admin user create error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create admin user' });
  }
});

router.put('/users/:id', requireAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can manage access' });
    }

    const { name, email, phone, company, role, password } = req.body;
    const cleanEmail = String(email || '').toLowerCase().trim();
    const cleanRole = normalizeRole(role);
    if (!name || !emailRegex.test(cleanEmail)) {
      return badRequest(res, 'Name and valid email are required');
    }

    const uid = String(req.params.id);
    const auth = getAuth();
    const existing = await auth.getUser(uid).catch(() => null);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }

    const emailOwner = await findUserByEmail(cleanEmail);
    if (emailOwner && emailOwner.uid !== uid) {
      return res.status(409).json({ success: false, message: 'A user already exists with this email' });
    }

    await auth.updateUser(uid, {
      email: cleanEmail,
      displayName: String(name || '').trim(),
      ...(password ? { password } : {}),
    });

    const profile = await saveAuthProfile(uid, {
      name: String(name || '').trim(),
      email: cleanEmail,
      phone: normalizeText(phone),
      company: normalizeText(company),
      role: cleanRole,
      status: 'active',
    });

    return res.json({
      success: true,
      message: 'Admin access updated successfully',
      data: { id: uid, profile },
    });
  } catch (error) {
    console.error('Admin user update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update admin user' });
  }
});

router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can manage access' });
    }
    if (String(req.admin.uid || '') === String(req.params.id)) {
      return badRequest(res, 'You cannot delete your own admin access');
    }

    const uid = String(req.params.id);
    await getAuth().deleteUser(uid).catch(() => null);
    await getFirestoreDb().collection(FIRESTORE_COLLECTIONS.users).doc(uid).delete();
    return res.json({ success: true, message: 'Admin access removed successfully' });
  } catch (error) {
    console.error('Admin user delete error:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove admin access' });
  }
});

router.patch('/website-users/:id/status', requireAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can manage users' });
    }

    const status = ['active', 'suspended'].includes(String(req.body.status || '').toLowerCase()) ? String(req.body.status).toLowerCase() : '';
    if (!status) return badRequest(res, 'Valid status is required');

    const uid = String(req.params.id);
    const db = getFirestoreDb();
    const userRef = db.collection(FIRESTORE_COLLECTIONS.users).doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return res.status(404).json({ success: false, message: 'Website user not found or cannot be suspended' });
    }
    const user = userSnap.data() || {};
    if (['admin', 'sub-admin', 'editor'].includes(String(user.role || '').toLowerCase())) {
      return res.status(404).json({ success: false, message: 'Website user not found or cannot be suspended' });
    }

    await userRef.set({
      status,
      updatedAt: serverTimestamp(),
      updated_at: serverTimestamp(),
    }, { merge: true });

    if (status === 'suspended') {
      await setUserCustomClaims(uid, { role: user.role || 'user', suspended: true });
    } else {
      await setUserCustomClaims(uid, { role: user.role || 'user', suspended: false });
    }

    return res.json({ success: true, message: `User ${status === 'suspended' ? 'suspended' : 'activated'} successfully` });
  } catch (error) {
    console.error('Website user status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
});

router.delete('/website-users/:id', requireAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can delete users' });
    }

    const uid = String(req.params.id);
    const db = getFirestoreDb();
    const userSnap = await db.collection(FIRESTORE_COLLECTIONS.users).doc(uid).get();
    if (!userSnap.exists) {
      return res.json({ success: true, message: 'User deleted successfully' });
    }
    const user = userSnap.data() || {};
    if (['admin', 'sub-admin', 'editor'].includes(String(user.role || '').toLowerCase())) {
      return res.status(403).json({ success: false, message: 'Only website users can be deleted here' });
    }

    await getAuth().deleteUser(uid).catch(() => null);
    await db.collection(FIRESTORE_COLLECTIONS.users).doc(uid).delete();
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Website user delete error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

router.get('/resource/:resource', requireAdmin, async (req, res) => {
  try {
    const config = RESOURCE_CONFIG[req.params.resource];
    if (!config) return badRequest(res, 'Unknown admin resource');
    const rows = await loadCollectionRows(config.collection);
    return res.json({ success: true, data: { rows: sortRows(rows, config.sort) } });
  } catch (error) {
    console.error('Admin resource list error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load resource' });
  }
});

router.post('/resource/:resource', requireAdmin, async (req, res) => {
  try {
    const config = RESOURCE_CONFIG[req.params.resource];
    if (!config) return badRequest(res, 'Unknown admin resource');
    const { payload, error } = normalizePayload(config, req.body);
    if (error) return badRequest(res, error);

    const db = getFirestoreDb();
    const requestedId = String(req.body.id || '').trim();
    const docRef = requestedId ? db.collection(config.collection).doc(requestedId) : db.collection(config.collection).doc();
    const docId = docRef.id;
    const existing = await docRef.get();
    await docRef.set({
      id: docId,
      ...payload,
      created_at: existing.exists ? existing.data()?.created_at || serverTimestamp() : serverTimestamp(),
      updated_at: serverTimestamp(),
    }, { merge: true });

    return res.json({ success: true, message: 'Record added successfully', data: { id: docId } });
  } catch (error) {
    console.error('Admin resource create error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add record' });
  }
});

router.put('/resource/:resource/:id', requireAdmin, async (req, res) => {
  try {
    const config = RESOURCE_CONFIG[req.params.resource];
    if (!config) return badRequest(res, 'Unknown admin resource');
    const { payload, error } = normalizePayload(config, req.body);
    if (error) return badRequest(res, error);

    const db = getFirestoreDb();
    const docRef = db.collection(config.collection).doc(String(req.params.id));
    const existing = await docRef.get();
    await docRef.set({
      id: String(req.params.id),
      ...payload,
      created_at: existing.exists ? existing.data()?.created_at || serverTimestamp() : serverTimestamp(),
      updated_at: serverTimestamp(),
    }, { merge: true });

    return res.json({ success: true, message: 'Record updated successfully' });
  } catch (error) {
    console.error('Admin resource update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update record' });
  }
});

router.delete('/resource/:resource/:id', requireAdmin, async (req, res) => {
  try {
    const config = RESOURCE_CONFIG[req.params.resource];
    if (!config) return badRequest(res, 'Unknown admin resource');
    await getFirestoreDb().collection(config.collection).doc(String(req.params.id)).delete();
    return res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Admin resource delete error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete record' });
  }
});

router.patch('/submission/:source/:id/status', requireAdmin, async (req, res) => {
  try {
    const config = SUBMISSION_CONFIG[req.params.source];
    if (!config) return badRequest(res, 'Unknown submission type');
    const status = normalizeText(req.body.status);
    if (!status) return badRequest(res, 'Status is required');

    await getFirestoreDb().collection(config.collection).doc(String(req.params.id)).set({
      status,
      updated_at: serverTimestamp(),
    }, { merge: true });

    return res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Admin submission status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

router.delete('/submission/:source/:id', requireAdmin, async (req, res) => {
  try {
    const config = SUBMISSION_CONFIG[req.params.source];
    if (!config) return badRequest(res, 'Unknown submission type');
    await getFirestoreDb().collection(config.collection).doc(String(req.params.id)).delete();
    return res.json({ success: true, message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Admin submission delete error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete submission' });
  }
});

router.post('/submission/:source/:id/reply', requireAdmin, async (req, res) => {
  try {
    const config = SUBMISSION_CONFIG[req.params.source];
    if (!config) return badRequest(res, 'Unknown submission type');

    const subject = normalizeText(req.body.subject || 'Reply from HOI Business Center');
    const message = normalizeText(req.body.message);
    if (!message) return badRequest(res, 'Reply message is required');

    const db = getFirestoreDb();
    const docRef = db.collection(FIRESTORE_COLLECTIONS.adminReplies).doc();
    await docRef.set({
      id: docRef.id,
      source: req.params.source,
      record_id: String(req.params.id),
      subject,
      message,
      created_at: serverTimestamp(),
    });

    await db.collection(config.collection).doc(String(req.params.id)).set({
      status: 'replied',
      updated_at: serverTimestamp(),
    }, { merge: true });

    const recipientEmail = await resolveSubmissionEmail(req.params.source, req.params.id);
    if (recipientEmail) {
      const html = buildRequirementHtml(subject, {
        Source: req.params.source,
        'Record ID': req.params.id,
        Message: message,
      });
      await sendDirectMail({
        to: recipientEmail,
        subject,
        html,
      }).catch((mailError) => {
        console.warn('Admin reply email skipped:', mailError.message || mailError);
      });
    }

    return res.json({ success: true, message: 'Reply saved and request marked as replied' });
  } catch (error) {
    console.error('Admin reply error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save reply' });
  }
});

export default router;
