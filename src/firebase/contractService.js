import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { createNotification } from './notificationService';
import { awardXP, XP_REWARDS } from '../services/xpService';

const CONTRACTS_COL = 'exchangeContracts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const log = (msg, data) => console.log(`[contractService] ${msg}`, data ?? '');

// ─── Create a contract (proposed by requester) ────────────────────────────────

/**
 * Creates a new exchange contract document with status="pending".
 * Sends a notification to the partner.
 *
 * @param {object} params
 * @param {string} params.requesterId
 * @param {string} params.requesterName
 * @param {string} params.requesterAvatar
 * @param {string} params.partnerId
 * @param {string} params.partnerName
 * @param {string} params.partnerAvatar
 * @param {string} params.requesterSkillOffered
 * @param {string} params.requesterSkillWanted
 * @param {string} params.partnerSkillOffered
 * @param {string} params.partnerSkillWanted
 * @param {number} params.durationWeeks
 * @param {number} params.totalSessions
 * @returns {string} new contractId
 */
export const createContract = async ({
  requesterId,
  requesterName,
  requesterAvatar,
  partnerId,
  partnerName,
  partnerAvatar,
  requesterSkillOffered,
  requesterSkillWanted,
  partnerSkillOffered,
  partnerSkillWanted,
  durationWeeks,
  totalSessions,
}) => {
  log('Creating contract', { requesterId, partnerId, totalSessions });

  const docRef = await addDoc(collection(db, CONTRACTS_COL), {
    requesterId,
    requesterName: requesterName || 'User',
    requesterAvatar: requesterAvatar || null,
    partnerId,
    partnerName: partnerName || 'User',
    partnerAvatar: partnerAvatar || null,
    requesterSkillOffered: requesterSkillOffered || '',
    requesterSkillWanted: requesterSkillWanted || '',
    partnerSkillOffered: partnerSkillOffered || '',
    partnerSkillWanted: partnerSkillWanted || '',
    durationWeeks: Number(durationWeeks) || 4,
    totalSessions: Number(totalSessions) || 8,
    completedSessions: 0,
    status: 'pending',
    createdAt: serverTimestamp(),
    startedAt: null,
    completedAt: null,
  });

  log('Contract created', { contractId: docRef.id, status: 'pending' });

  // Notify partner
  await createNotification(
    partnerId,
    'contract',
    `${requesterName || 'Someone'} proposed an exchange contract with you`,
    requesterName || 'User',
    requesterAvatar || null
  );

  return docRef.id;
};

// ─── Accept a contract ────────────────────────────────────────────────────────

/**
 * Partner accepts the contract → status becomes "active".
 */
export const acceptContract = async (contractId, requesterInfo) => {
  log('Accepting contract', { contractId });

  await updateDoc(doc(db, CONTRACTS_COL, contractId), {
    status: 'active',
    startedAt: serverTimestamp(),
  });

  log('Contract activated', { contractId });

  if (requesterInfo?.requesterId) {
    await createNotification(
      requesterInfo.requesterId,
      'contract',
      `${requesterInfo.partnerName || 'Your partner'} accepted your exchange contract`,
      requesterInfo.partnerName || 'Partner',
      requesterInfo.partnerAvatar || null
    );
  }
};

// ─── Reject a contract ────────────────────────────────────────────────────────

export const rejectContract = async (contractId) => {
  log('Rejecting contract', { contractId });
  await updateDoc(doc(db, CONTRACTS_COL, contractId), {
    status: 'cancelled',
  });
  log('Contract cancelled (rejected)', { contractId });
};

// ─── Cancel a contract ────────────────────────────────────────────────────────

export const cancelContract = async (contractId) => {
  log('Cancelling contract', { contractId });
  await updateDoc(doc(db, CONTRACTS_COL, contractId), {
    status: 'cancelled',
  });
  log('Contract cancelled', { contractId });
};

// ─── Get a single contract by ID ──────────────────────────────────────────────

export const getContractById = async (contractId) => {
  const snap = await getDoc(doc(db, CONTRACTS_COL, contractId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

// ─── Subscribe to all contracts for a user ───────────────────────────────────

/**
 * Real-time listener for contracts where userId is requester OR partner.
 * Two queries merged client-side, deduplicated by contractId.
 *
 * @param {string} userId
 * @param {function} callback - Called with array of contract objects
 * @returns {function} Unsubscribe function
 */
export const subscribeToUserContracts = (userId, callback) => {
  if (!userId) return () => {};

  let asRequester = [];
  let asPartner = [];

  const merge = () => {
    const all = [...asRequester, ...asPartner];
    const seen = new Set();
    const unique = all.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
    // Sort: pending first, then active, then completed/cancelled; newest first within group
    const ORDER = { pending: 0, active: 1, completed: 2, cancelled: 3 };
    unique.sort((a, b) => {
      const orderDiff = (ORDER[a.status] ?? 4) - (ORDER[b.status] ?? 4);
      if (orderDiff !== 0) return orderDiff;
      return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0);
    });
    callback(unique);
  };

  const q1 = query(collection(db, CONTRACTS_COL), where('requesterId', '==', userId));
  const q2 = query(collection(db, CONTRACTS_COL), where('partnerId', '==', userId));

  const unsub1 = onSnapshot(
    q1,
    (s) => { asRequester = s.docs.map((d) => ({ id: d.id, ...d.data() })); merge(); },
    (err) => { console.error('[contractService] requester snapshot error:', err); }
  );

  const unsub2 = onSnapshot(
    q2,
    (s) => { asPartner = s.docs.map((d) => ({ id: d.id, ...d.data() })); merge(); },
    (err) => { console.error('[contractService] partner snapshot error:', err); }
  );

  return () => { unsub1(); unsub2(); };
};

// ─── Subscribe to contracts filtered by status ────────────────────────────────

export const subscribeToActiveContracts = (userId, callback) => {
  if (!userId) return () => {};

  let asRequester = [];
  let asPartner = [];

  const merge = () => {
    const all = [...asRequester, ...asPartner];
    const seen = new Set();
    const unique = all.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
    callback(unique);
  };

  const q1 = query(
    collection(db, CONTRACTS_COL),
    where('requesterId', '==', userId),
    where('status', '==', 'active')
  );
  const q2 = query(
    collection(db, CONTRACTS_COL),
    where('partnerId', '==', userId),
    where('status', '==', 'active')
  );

  const unsub1 = onSnapshot(q1, (s) => {
    asRequester = s.docs.map((d) => ({ id: d.id, ...d.data() }));
    merge();
  });
  const unsub2 = onSnapshot(q2, (s) => {
    asPartner = s.docs.map((d) => ({ id: d.id, ...d.data() }));
    merge();
  });

  return () => { unsub1(); unsub2(); };
};

// ─── Internal: increment completedSessions + auto-complete ───────────────────

/**
 * Called by sessionService when a session is marked complete.
 * Increments completedSessions. If >= totalSessions, marks contract completed.
 */
export const incrementCompletedSessions = async (contractId) => {
  const contractRef = doc(db, CONTRACTS_COL, contractId);
  const snap = await getDoc(contractRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const newCompleted = (data.completedSessions || 0) + 1;

  if (newCompleted >= data.totalSessions) {
    // Auto-complete the contract
    await updateDoc(contractRef, {
      completedSessions: newCompleted,
      status: 'completed',
      completedAt: serverTimestamp(),
    });
    log('Contract AUTO-COMPLETED', { contractId, completedSessions: newCompleted });

    // Notify both parties
    await createNotification(
      data.requesterId,
      'contract',
      `Your exchange contract with ${data.partnerName} is now complete! 🎉`,
      data.partnerName || 'Partner',
      data.partnerAvatar || null
    );
    await createNotification(
      data.partnerId,
      'contract',
      `Your exchange contract with ${data.requesterName} is now complete! 🎉`,
      data.requesterName || 'User',
      data.requesterAvatar || null
    );

    // Award XP to both parties for completing the full contract
    awardXP(data.requesterId, XP_REWARDS.CONTRACT_COMPLETED, 'contract_completed').catch(
      (err) => console.warn('[contractService] XP award (requester) failed (non-critical):', err.message)
    );
    awardXP(data.partnerId, XP_REWARDS.CONTRACT_COMPLETED, 'contract_completed').catch(
      (err) => console.warn('[contractService] XP award (partner) failed (non-critical):', err.message)
    );
  } else {
    await updateDoc(contractRef, {
      completedSessions: increment(1),
    });
    log('Session incremented', { contractId, newCompleted });
  }
};
