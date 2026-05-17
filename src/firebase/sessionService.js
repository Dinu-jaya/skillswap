import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { incrementCompletedSessions } from './contractService';
import { awardXP, XP_REWARDS } from '../services/xpService';

const SESSIONS_COL = 'exchangeSessions';

const log = (msg, data) => console.log(`[sessionService] ${msg}`, data ?? '');

// ─── Create a session ─────────────────────────────────────────────────────────

/**
 * Creates a new session document under a contract.
 *
 * @param {object} params
 * @param {string} params.contractId
 * @param {number} params.sessionNumber
 * @param {string} params.topic
 * @param {string} params.taughtBy       - uid of the person teaching this session
 * @param {string} params.taughtByName   - display name of teacher
 * @param {string} params.scheduledAt    - ISO datetime string from datetime-local input
 * @returns {string} new sessionId
 */
export const createSession = async ({
  contractId,
  sessionNumber,
  topic,
  taughtBy,
  taughtByName,
  scheduledAt,
}) => {
  log('Creating session', { contractId, sessionNumber, topic });

  const docRef = await addDoc(collection(db, SESSIONS_COL), {
    contractId,
    sessionNumber: Number(sessionNumber) || 1,
    topic: topic || 'Session',
    taughtBy: taughtBy || '',
    taughtByName: taughtByName || 'Unknown',
    scheduledAt: scheduledAt || null,
    completedAt: null,
    status: 'pending',
    notes: '',
    proofUrl: '',
    createdAt: serverTimestamp(),
  });

  log('Session created', { sessionId: docRef.id, sessionNumber, status: 'pending' });
  return docRef.id;
};

// ─── Mark a session as complete ───────────────────────────────────────────────

/**
 * Marks a session complete, saves notes + proofUrl, then increments
 * the parent contract's completedSessions (and auto-completes if done).
 *
 * @param {string} sessionId
 * @param {string} contractId
 * @param {string} notes
 * @param {string} proofUrl  - optional plain URL
 */
export const completeSession = async (sessionId, contractId, notes = '', proofUrl = '') => {
  log('Completing session', { sessionId, contractId });

  // Read taughtBy BEFORE updating (needed for XP award)
  const sessionSnap = await getDoc(doc(db, SESSIONS_COL, sessionId));
  const taughtBy = sessionSnap.exists() ? (sessionSnap.data().taughtBy || null) : null;

  await updateDoc(doc(db, SESSIONS_COL, sessionId), {
    status: 'completed',
    completedAt: serverTimestamp(),
    notes: notes.trim(),
    proofUrl: proofUrl.trim(),
  });

  log('Session completed', { sessionId });

  // Increment counter on the parent contract (may auto-complete it)
  await incrementCompletedSessions(contractId);

  // Award XP to the teacher — fire-and-forget, never blocks completion
  if (taughtBy) {
    const xpAmount = XP_REWARDS.SESSION_COMPLETED + (proofUrl.trim() ? XP_REWARDS.PROOF_SUBMITTED : 0);
    awardXP(taughtBy, xpAmount, 'session_completed').catch((err) =>
      console.warn('[sessionService] XP award failed (non-critical):', err.message)
    );
  }
};

// ─── Add / update notes on a session ─────────────────────────────────────────

export const updateSessionNotes = async (sessionId, notes, proofUrl = '') => {
  log('Updating session notes', { sessionId });
  await updateDoc(doc(db, SESSIONS_COL, sessionId), {
    notes: notes.trim(),
    proofUrl: proofUrl.trim(),
  });
};

// ─── Delete a session ─────────────────────────────────────────────────────────

export const deleteSession = async (sessionId) => {
  log('Deleting session', { sessionId });
  await deleteDoc(doc(db, SESSIONS_COL, sessionId));
};

// ─── Subscribe to sessions for a contract ────────────────────────────────────

/**
 * Real-time listener for all sessions belonging to a contract,
 * ordered by sessionNumber ascending.
 *
 * @param {string} contractId
 * @param {function} callback
 * @returns {function} Unsubscribe function
 */
export const subscribeToContractSessions = (contractId, callback) => {
  if (!contractId) return () => {};

  // orderBy requires a composite index — using client-sort as fallback
  const q = query(
    collection(db, SESSIONS_COL),
    where('contractId', '==', contractId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const sessions = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.sessionNumber ?? 0) - (b.sessionNumber ?? 0));

      log('Sessions snapshot', { contractId, count: sessions.length });
      callback(sessions);
    },
    (error) => {
      console.error('[sessionService] sessions snapshot error:', error);
      callback([]);
    }
  );
};
