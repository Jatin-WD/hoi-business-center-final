import { getApps, initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

export function isFirebaseRuntime() {
  return Boolean(process.env.FIREBASE_CONFIG || process.env.K_SERVICE || process.env.FUNCTION_TARGET);
}

function clearBlackholeProxyEnv() {
  const proxyVars = ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'http_proxy', 'https_proxy', 'all_proxy'];
  for (const key of proxyVars) {
    const value = process.env[key];
    if (value && /127\.0\.0\.1:9\/?$/.test(value)) {
      delete process.env[key];
    }
  }
}

export function ensureFirebaseAdminApp() {
  if (getApps().length) {
    return getApps()[0];
  }

  if (!isFirebaseRuntime()) {
    clearBlackholeProxyEnv();
  }

  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || undefined;
  const options = storageBucket ? { storageBucket } : undefined;
  return initializeApp(options);
}

export function getFirebaseBucket() {
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET || process.env.GCLOUD_STORAGE_BUCKET;
  if (!bucketName && !isFirebaseRuntime()) {
    return null;
  }

  ensureFirebaseAdminApp();
  return bucketName ? getStorage().bucket(bucketName) : getStorage().bucket();
}
