import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Create a notification ────────────────────────────────────────────────────

/**
 * Writes a notification document into Firestore for a target user.
 * @param {string} userId   - The user who will receive the notification
 * @param {string} type     - 'request' | 'accept' | 'message' | 'connect'
 * @param {string} message  - Short readable message text
 * @param {string} name     - Display name of the actor
 * @param {string} avatar   - Avatar URL of the actor
 */
export const createNotification = async (userId, type, message, name, avatar) => {
  if (!userId) return;
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      message,
      name,
      avatar: avatar || null,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// ─── Subscribe to notifications (real-time) ───────────────────────────────────

/**
 * Subscribes to all notifications for a user, newest first.
 * @param {string} userId
 * @param {function} callback - Called with notification array on every change
 * @returns {function} Unsubscribe function
 */
export const subscribeToNotifications = (userId, callback) => {
  if (!userId) return () => {};

  // No orderBy — avoids composite index requirement (userId + createdAt).
  // We sort client-side instead.
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      callback(notifications);
    },
    (error) => {
      console.error('Error subscribing to notifications:', error);
      callback([]);
    }
  );
};

// ─── Mark a single notification as read ──────────────────────────────────────

/**
 * Marks one notification as read.
 * @param {string} notifId
 */
export const markNotificationRead = async (notifId) => {
  if (!notifId) return;
  try {
    await updateDoc(doc(db, 'notifications', notifId), { read: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// ─── Mark ALL notifications as read ──────────────────────────────────────────

/**
 * Batch-updates all unread notifications for a user to read: true.
 * @param {string} userId
 */
export const markAllNotificationsRead = async (userId) => {
  if (!userId) return;
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      batch.update(d.ref, { read: true });
    });
    await batch.commit();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

// ─── Clear all notifications ──────────────────────────────────────────────────

/**
 * Batch-deletes ALL notifications for a user.
 * @param {string} userId
 */
export const clearAllNotifications = async (userId) => {
  if (!userId) return;
  try {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
};
