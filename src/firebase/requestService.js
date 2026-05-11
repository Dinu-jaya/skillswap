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
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { startConversationWithUser } from './chatService';
import { createNotification } from './notificationService';
import { incrementSkillRequestCount } from './skillService';

// ─── Check for an existing request between two users ─────────────────────────

/**
 * Checks whether a non-rejected request already exists between sender and receiver.
 * Queries for status in ['pending', 'accepted'] to block duplicates.
 *
 * @param {string} senderId
 * @param {string} receiverId
 * @returns {{ exists: boolean, status: string|null, requestId: string|null }}
 */
export const checkExistingRequest = async (senderId, receiverId) => {
  if (!senderId || !receiverId) return { exists: false, status: null, requestId: null };

  try {
    // Check requests sent by this user to that receiver
    const q = query(
      collection(db, 'exchangeRequests'),
      where('senderId', '==', senderId),
      where('receiverId', '==', receiverId),
      limit(5)
    );
    const snapshot = await getDocs(q);

    // Find the most important active request (accepted > pending > others)
    const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    const accepted = docs.find((d) => d.status === 'accepted');
    if (accepted) return { exists: true, status: 'accepted', requestId: accepted.id };

    const pending = docs.find((d) => d.status === 'pending');
    if (pending) return { exists: true, status: 'pending', requestId: pending.id };

    // Only rejected left — allow resend
    return { exists: false, status: 'rejected', requestId: null };
  } catch (err) {
    console.error('[requestService] checkExistingRequest error:', err);
    return { exists: false, status: null, requestId: null };
  }
};

// ─── Send a request (with duplicate guard) ────────────────────────────────────

/**
 * Safe version of sendExchangeRequest.
 * Returns existing state if a pending or accepted request already exists.
 *
 * @param {object} sender       - { uid, displayName, name, email, avatar }
 * @param {string} receiverId
 * @param {string|null} skillId
 * @param {string} skillTitle
 * @param {string} receiverName
 * @param {string} receiverAvatar
 * @returns {{ requestId: string, alreadyExists: boolean, status: string }}
 */
export const sendExchangeRequest = async (
  sender,
  receiverId,
  skillId,
  skillTitle,
  receiverName = 'User',
  receiverAvatar = ''
) => {
  if (!sender?.uid || !receiverId) throw new Error('Invalid sender or receiverId');

  // ── Duplicate guard ────────────────────────────────────────────────────────
  const existing = await checkExistingRequest(sender.uid, receiverId);
  if (existing.exists) {
    console.info(
      `[requestService] Duplicate blocked — status: ${existing.status}, id: ${existing.requestId}`
    );
    return {
      requestId: existing.requestId,
      alreadyExists: true,
      status: existing.status,
    };
  }

  // ── Create fresh request ───────────────────────────────────────────────────
  const senderName =
    sender.displayName || sender.name || sender.email?.split('@')[0] || 'User';
  const senderAvatar = sender.avatar || null;

  const docRef = await addDoc(collection(db, 'exchangeRequests'), {
    senderId: sender.uid,
    senderName,
    senderAvatar,
    receiverId,
    receiverName,
    receiverAvatar,
    skillId: skillId || null,
    skillTitle: skillTitle || 'Skill Exchange',
    status: 'pending',
    createdAt: serverTimestamp(),
  });

  // Notify the receiver
  await createNotification(
    receiverId,
    'request',
    `sent you an exchange request for "${skillTitle || 'a skill'}"`,
    senderName,
    senderAvatar
  );

  // Bump skill request count (old skills collection — optional)
  if (skillId) {
    await incrementSkillRequestCount(skillId);
  }

  return { requestId: docRef.id, alreadyExists: false, status: 'pending' };
};

// ─── Subscribe to INCOMING pending requests ───────────────────────────────────

/**
 * Real-time listener for requests received by a user (status === 'pending').
 * Deduplicates by sender: shows only the latest per sender to suppress UI clutter.
 */
export const subscribeToIncomingRequests = (userId, callback) => {
  if (!userId) return () => {};

  const q = query(
    collection(db, 'exchangeRequests'),
    where('receiverId', '==', userId),
    where('status', '==', 'pending')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

      // Deduplicate: keep only the latest request per sender
      const seen = new Set();
      const deduped = docs.filter((r) => {
        if (seen.has(r.senderId)) return false;
        seen.add(r.senderId);
        return true;
      });

      callback(deduped);
    },
    (error) => {
      console.error('Error subscribing to incoming requests:', error);
      callback([]);
    }
  );
};

// ─── Subscribe to SENT requests ───────────────────────────────────────────────

/**
 * Real-time listener for requests sent by a user.
 * Deduplicates by receiver: shows only the latest per receiver.
 */
export const subscribeToSentRequests = (userId, callback) => {
  if (!userId) return () => {};

  const q = query(
    collection(db, 'exchangeRequests'),
    where('senderId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

      // Deduplicate: keep only the latest request per receiver
      const seen = new Set();
      const deduped = docs.filter((r) => {
        if (seen.has(r.receiverId)) return false;
        seen.add(r.receiverId);
        return true;
      });

      callback(deduped);
    },
    (error) => {
      console.error('Error subscribing to sent requests:', error);
      callback([]);
    }
  );
};

// ─── Subscribe to ACCEPTED requests ──────────────────────────────────────────

/**
 * Real-time listener for accepted requests where user is sender OR receiver.
 * Two queries merged client-side; deduplicated by id then by peer uid.
 */
export const subscribeToAcceptedRequests = (userId, callback) => {
  if (!userId) return () => {};

  let sentAccepted = [];
  let receivedAccepted = [];

  const merge = () => {
    const all = [...sentAccepted, ...receivedAccepted];

    // Deduplicate by document id first
    const seenId = new Set();
    const uniqueById = all.filter((r) => {
      if (seenId.has(r.id)) return false;
      seenId.add(r.id);
      return true;
    });

    // Then deduplicate by peer uid (keep only one accepted per connection)
    const seenPeer = new Set();
    const unique = uniqueById
      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
      .filter((r) => {
        const peer = r.senderId === userId ? r.receiverId : r.senderId;
        if (seenPeer.has(peer)) return false;
        seenPeer.add(peer);
        return true;
      });

    callback(unique);
  };

  const q1 = query(
    collection(db, 'exchangeRequests'),
    where('senderId', '==', userId),
    where('status', '==', 'accepted')
  );
  const q2 = query(
    collection(db, 'exchangeRequests'),
    where('receiverId', '==', userId),
    where('status', '==', 'accepted')
  );

  const unsub1 = onSnapshot(q1, (s) => {
    sentAccepted = s.docs.map((d) => ({ id: d.id, ...d.data() }));
    merge();
  });
  const unsub2 = onSnapshot(q2, (s) => {
    receivedAccepted = s.docs.map((d) => ({ id: d.id, ...d.data() }));
    merge();
  });

  return () => {
    unsub1();
    unsub2();
  };
};

// ─── Accept a request ─────────────────────────────────────────────────────────

/**
 * Accepts an exchange request: updates status, creates chat, notifies sender.
 */
export const acceptRequest = async (requestId, currentUser, requestData) => {
  if (!requestId || !currentUser) return;

  await updateDoc(doc(db, 'exchangeRequests', requestId), {
    status: 'accepted',
    acceptedAt: serverTimestamp(),
  });

  await startConversationWithUser(currentUser, requestData.senderId, {
    name: requestData.senderName,
    avatar: requestData.senderAvatar,
  });

  const receiverName =
    currentUser.displayName ||
    currentUser.email?.split('@')[0] ||
    'User';
  const receiverAvatar = currentUser.photoURL || null;

  await createNotification(
    requestData.senderId,
    'accept',
    `accepted your exchange request for "${requestData.skillTitle || 'a skill'}"`,
    receiverName,
    receiverAvatar
  );
};

// ─── Reject a request ─────────────────────────────────────────────────────────

export const rejectRequest = async (requestId) => {
  if (!requestId) return;
  await updateDoc(doc(db, 'exchangeRequests', requestId), {
    status: 'rejected',
    rejectedAt: serverTimestamp(),
  });
};

// ─── Get count of unique connections ──────────────────────────────────────────

export const getConnectionsCount = async (userId) => {
  if (!userId) return 0;
  try {
    const [sent, received] = await Promise.all([
      getDocs(query(
        collection(db, 'exchangeRequests'),
        where('senderId', '==', userId),
        where('status', '==', 'accepted')
      )),
      getDocs(query(
        collection(db, 'exchangeRequests'),
        where('receiverId', '==', userId),
        where('status', '==', 'accepted')
      )),
    ]);
    const peers = new Set();
    sent.docs.forEach((d) => peers.add(d.data().receiverId));
    received.docs.forEach((d) => peers.add(d.data().senderId));
    return peers.size;
  } catch {
    return 0;
  }
};
