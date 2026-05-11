import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  onSnapshot,
} from 'firebase/firestore';

// ─── Users ────────────────────────────────────────────────────────────────────

/** Fetch all users (admin view) */
export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/** Ban a user */
export const banUser = async (uid) => {
  await updateDoc(doc(db, 'users', uid), { isBanned: true });
};

/** Unban a user */
export const unbanUser = async (uid) => {
  await updateDoc(doc(db, 'users', uid), { isBanned: false });
};

// ─── Warnings ─────────────────────────────────────────────────────────────────

/**
 * Send a warning to a user.
 * - Writes to `warnings` collection
 * - Increments `warningCount` on the user doc
 */
export const sendWarning = async (userId, message) => {
  console.log('[ADMIN WARNING SENT]', { userId, message });

  await addDoc(collection(db, 'warnings'), {
    userId,
    message,
    createdAt: serverTimestamp(),
  });
  
  await updateDoc(doc(db, 'users', userId), {
    warningCount: increment(1),
  });

  // Create real-time notification
  await addDoc(collection(db, 'notifications'), {
    userId,
    type: 'warning',
    title: 'Admin Warning',
    message,
    createdAt: serverTimestamp(),
    read: false,
    sentByAdmin: true,
  });
};

/** Get all warnings for a specific user */
export const getUserWarnings = async (userId) => {
  const q = query(
    collection(db, 'warnings'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ─── Reports ──────────────────────────────────────────────────────────────────

/**
 * Submit a report against another user.
 * @param {string} reporterId
 * @param {string} reportedUserId
 * @param {string} reason
 * @param {string} description
 */
export const submitReport = async (reporterId, reportedUserId, reason, description) => {
  await addDoc(collection(db, 'reports'), {
    reporterId,
    reportedUserId,
    reason,
    description,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
};

/** Fetch all reports (admin) */
export const getAllReports = async () => {
  const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/** Update report status */
export const updateReportStatus = async (reportId, status) => {
  await updateDoc(doc(db, 'reports', reportId), { status });
};

// ─── Issues ───────────────────────────────────────────────────────────────────

/**
 * User submits a help/issue request to admins.
 */
export const submitIssue = async (userId, subject, description) => {
  await addDoc(collection(db, 'issues'), {
    userId,
    subject,
    description,
    status: 'open',
    createdAt: serverTimestamp(),
  });
};

/** Fetch all issues (admin) */
export const getAllIssues = async () => {
  const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/** Update issue status */
export const updateIssueStatus = async (issueId, status) => {
  await updateDoc(doc(db, 'issues', issueId), { status });
};

// ─── Real-time subscriptions (admin) ──────────────────────────────────────────

/** Subscribe to all reports in real-time */
export const subscribeToReports = (callback) => {
  const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

/** Subscribe to all issues in real-time */
export const subscribeToIssues = (callback) => {
  const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

/** Subscribe to all users in real-time */
export const subscribeToUsers = (callback) => {
  return onSnapshot(collection(db, 'users'), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};
