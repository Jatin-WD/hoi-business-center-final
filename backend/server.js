import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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
import { scheduleIiccEventSync, syncIiccEvents } from './services/iicc-event-sync.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { isFirebaseRuntime } from './config/firebase.js';
import './config/env.js';

const app = express();
const PORT = process.env.PORT || 3000;
const serveFrontend = !isFirebaseRuntime();
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  /^https:\/\/.*\.web\.app$/,
  /^https:\/\/.*\.firebaseapp\.com$/,
].filter(Boolean);
const allowedDevOrigin = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}):\d{4,5}$/;

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'data:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", 'https:'],
      frameAncestors: ["'self'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'same-origin' },
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }
    const isAllowed = allowedOrigins.some((allowedOrigin) => (
      typeof allowedOrigin === 'string'
        ? allowedOrigin === origin
        : allowedOrigin.test(origin)
    ));
    if (isAllowed || allowedDevOrigin.test(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (serveFrontend) {
  app.use('/uploads/admin-images', express.static(path.join(process.cwd(), 'uploads', 'admin-images')));
}

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
    database: 'firestore',
    runtime: isFirebaseRuntime() ? 'firebase' : 'node',
    timestamp: new Date().toISOString(),
  });
});

if (serveFrontend) {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      next();
      return;
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

let initializePromise;

export async function ensureDatabaseInitialized() {
  if (!initializePromise) {
    initializePromise = Promise.resolve().then(() => {
      void syncIiccEvents({ pruneMissing: true }).catch((error) => {
        console.error('Initial IICC event sync failed:', error);
      });
    });
  }
  return initializePromise;
}

export async function startServer() {
  await ensureDatabaseInitialized();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    scheduleIiccEventSync({ runImmediately: false });
  });
}

export { app };
