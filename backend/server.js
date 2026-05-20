import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth.js';
import venuesRoutes from './routes/venues.js';
import packagesRoutes from './routes/packages.js';
import servicesRoutes from './routes/services.js';
import inquiriesRoutes from './routes/inquiries.js';
import manpowerRoutes from './routes/manpower.js';
import eventsRoutes from './routes/events.js';
import bookingsRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import cmsRoutes from './routes/cms.js';
import { seedDatabaseIfEmpty } from './scripts/init-db.js';
import { getDatabaseConfigStatus } from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const databaseStatus = {
  ready: false,
  attempts: 0,
  lastError: '',
};
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);
const allowedDevOrigin = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}):\d{4,5}$/;
const allowedHostingerOrigin = /^https:\/\/[a-z0-9-]+\.hostingersite\.com$/;

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || allowedDevOrigin.test(origin) || allowedHostingerOrigin.test(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/venues', venuesRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/manpower', manpowerRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cms', cmsRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: databaseStatus.ready ? 'ready' : 'starting',
    databaseConfig: getDatabaseConfigStatus(),
    databaseAttempts: databaseStatus.attempts,
    databaseError: databaseStatus.ready ? '' : databaseStatus.lastError,
    timestamp: new Date().toISOString(),
  });
});

const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
    next();
    return;
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

async function initializeDatabase(attempt = 1) {
  databaseStatus.attempts = attempt;
  try {
    await seedDatabaseIfEmpty();
    databaseStatus.ready = true;
    databaseStatus.lastError = '';
    console.log('Database initialized');
  } catch (error) {
    databaseStatus.ready = false;
    databaseStatus.lastError = error.message;
    const delay = Math.min(30000, 5000 * attempt);
    console.error(`Database initialization failed, retrying in ${delay / 1000}s:`, error);
    setTimeout(() => initializeDatabase(attempt + 1), delay);
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  initializeDatabase();
});
