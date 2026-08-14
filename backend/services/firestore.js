import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { ensureFirebaseAdminApp } from '../config/firebase.js';

export const FIRESTORE_COLLECTIONS = {
  users: 'users',
  inquiries: 'inquiries',
  manpowerRequests: 'manpowerRequests',
  bookings: 'bookings',
  services: 'services',
  packages: 'packages',
  venues: 'venues',
  events: 'events',
  cmsContent: 'cmsContent',
  translations: 'translations',
  adminReplies: 'adminReplies',
  notifications: 'notifications',
};

export function getFirestoreDb() {
  ensureFirebaseAdminApp();
  return getFirestore();
}

export function serverTimestamp() {
  return FieldValue.serverTimestamp();
}

export async function getUserProfile(uid) {
  const snap = await getFirestoreDb().collection(FIRESTORE_COLLECTIONS.users).doc(uid).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

export async function upsertUserProfile(uid, profile) {
  const db = getFirestoreDb();
  const ref = db.collection(FIRESTORE_COLLECTIONS.users).doc(uid);
  const existing = await ref.get();
  const now = serverTimestamp();
  const existingCreatedAt = existing.data()?.createdAt || existing.data()?.created_at || now;
  const next = {
    id: uid,
    uid,
    email: profile.email || existing.data()?.email || '',
    name: profile.name ?? existing.data()?.name ?? '',
    phone: profile.phone ?? existing.data()?.phone ?? '',
    company: profile.company ?? existing.data()?.company ?? '',
    role: profile.role ?? existing.data()?.role ?? 'user',
    status: profile.status ?? existing.data()?.status ?? 'active',
    createdAt: existingCreatedAt,
    created_at: existingCreatedAt,
    updatedAt: now,
    updated_at: now,
  };
  await ref.set(next, { merge: true });
  return next;
}

export async function setUserCustomClaims(uid, claims = {}) {
  await getAuth().setCustomUserClaims(uid, claims);
}

export async function getUserFromToken(decodedToken) {
  const profile = await getUserProfile(decodedToken.uid);
  return profile || {
    id: decodedToken.uid,
    uid: decodedToken.uid,
    email: decodedToken.email || '',
    name: decodedToken.name || '',
    phone: '',
    company: '',
    role: decodedToken.role || (decodedToken.admin ? 'admin' : 'user'),
    status: 'active',
  };
}
