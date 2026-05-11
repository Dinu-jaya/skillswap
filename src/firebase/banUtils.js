import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Reusable helper: returns true if the given Firestore user document
 * (plain object from snap.data()) indicates the user is banned.
 *
 * Handles all edge cases:
 *  - null / undefined doc  → not banned (new / missing doc)
 *  - missing isBanned field → not banned (legacy doc, default false)
 *  - isBanned: false        → not banned
 *  - isBanned: true         → BANNED
 */
export const isUserBanned = (userDoc) => {
  if (!userDoc) return false;
  return userDoc.isBanned === true;
};

/**
 * One-shot Firestore fetch to check if a uid is banned.
 * Use this during login BEFORE navigating, so we never let
 * a banned user into the app even for a single render.
 *
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<boolean>} true if the user is banned
 */
export const checkBanStatus = async (uid) => {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return isUserBanned(snap.exists() ? snap.data() : null);
  } catch (err) {
    console.error('[banUtils] checkBanStatus failed:', err);
    // Fail-safe: do NOT block the user on a Firestore error
    return false;
  }
};
