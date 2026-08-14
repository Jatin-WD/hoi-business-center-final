import { onRequest } from 'firebase-functions/v2/https';
import { app, ensureDatabaseInitialized } from './server.js';

export const api = onRequest({ region: process.env.FUNCTION_REGION || 'us-central1' }, async (req, res) => {
  await ensureDatabaseInitialized();
  return app(req, res);
});
