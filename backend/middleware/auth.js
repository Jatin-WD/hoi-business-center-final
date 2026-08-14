import { getAuth } from 'firebase-admin/auth';
import { getUserFromToken } from '../services/firestore.js';

export async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Please log in to continue' });
  }

  try {
    const decoded = await getAuth().verifyIdToken(token);
    const user = await getUserFromToken(decoded);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session' });
    }
    if (String(user.status || 'active').toLowerCase() === 'suspended') {
      return res.status(403).json({ success: false, message: 'This account is suspended. Please contact support.' });
    }
    req.user = { ...decoded, ...user, uid: decoded.uid, id: user.id || decoded.uid };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
}

export async function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Admin login required' });
  }

  try {
    const decoded = await getAuth().verifyIdToken(token);
    const user = await getUserFromToken(decoded);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid admin session' });
    }
    if (String(user.status || 'active').toLowerCase() === 'suspended') {
      return res.status(403).json({ success: false, message: 'This account is suspended. Please contact support.' });
    }
    if (!['admin', 'sub-admin', 'editor'].includes(String(user.role || '').toLowerCase())) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    req.admin = { ...decoded, ...user, role: user.role, email: user.email, uid: decoded.uid, id: user.id || decoded.uid };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid admin session' });
  }
}
