import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
} from 'firebase/firestore';

// ─── Avatar helpers ───────────────────────────────────────────────────────────

/**
 * Returns the default avatar preset ID for a given gender.
 * Falls back to 'boy1' for unknown/undefined gender.
 */
export const getDefaultAvatar = (gender) => {
  if (gender === 'female') return 'girl1';
  return 'boy1';
};

// ─── Fetch a user profile ─────────────────────────────────────────────────────

/**
 * One-time fetch of a user's Firestore profile.
 * Returns null if the document doesn't exist.
 */
export const getUserProfile = async (uid) => {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// ─── Update / create a profile ───────────────────────────────────────────────

/**
 * Updates an existing profile or creates one if it doesn't exist.
 */
export const updateUserProfile = async (uid, data) => {
  try {
    console.log('[userService] updateUserProfile payload:', { uid, data });
    const ref = doc(db, 'users', uid);
    // setDoc with merge:true safely merges only the provided fields.
    // It never overwrites existing fields that are not in `data`.
    // This also works even if the document doesn't exist yet.
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    console.log('[userService] setDoc (merge) success for uid:', uid);
    return true;
  } catch (error) {
    console.error('[userService] Error updating user profile:', error);
    throw error;
  }
};

// ─── Ensure profile exists (used at signup / social login) ───────────────────

/**
 * Writes a Firestore user doc for a new user.
 * Safe to call multiple times — only creates if it doesn't already exist.
 */
export const ensureUserProfile = async (user, additionalData = {}) => {
  try {
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      // Brand new user — create full document with safe defaults
      const gender = additionalData.gender || 'male';
      const avatar = additionalData.avatar || getDefaultAvatar(gender);

      const newProfile = {
        uid: user.uid,
        name: user.displayName || additionalData.fullName || '',
        displayName: user.displayName || additionalData.fullName || '',
        email: user.email || '',
        bio: '',
        gender,
        avatar,
        avatarType: 'preset',
        // XP progression
        xp:        0,
        level:     1,
        rankTitle: 'Beginner',
        skillsOffered: [],
        skillsWanted: [],
        online: true,
        completedExchanges: 0,
        connectionsCount: 0,
        // Moderation fields
        isAdmin: false,
        isBanned: false,
        warningCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...additionalData,
      };
      // Remove undefined values to avoid Firestore errors
      Object.keys(newProfile).forEach(k => newProfile[k] === undefined && delete newProfile[k]);

      await setDoc(ref, newProfile);
      console.log('[userService] ensureUserProfile: created new profile for', user.uid);
    } else {
      // Existing user — only backfill MISSING fields, never overwrite existing data
      const existing = snap.data();
      const backfill = {};

      if (!existing.gender) backfill.gender = 'male';
      // Only backfill avatar if it's genuinely missing AND not a custom upload.
      // When avatarType === 'custom', avatar is intentionally empty — don't overwrite.
      if (existing.avatarType !== 'custom' && (!existing.avatar || existing.avatar === '')) {
        backfill.avatar = getDefaultAvatar(existing.gender || 'male');
        backfill.avatarType = 'preset';
      }
      // Ensure skill arrays exist (safe backfill for legacy docs)
      if (!Array.isArray(existing.skillsOffered)) backfill.skillsOffered = [];
      if (!Array.isArray(existing.skillsWanted)) backfill.skillsWanted = [];
      if (existing.bio === undefined) backfill.bio = '';
      // XP progression — backfill for pre-XP users
      if (existing.xp        === undefined) backfill.xp = 0;
      if (existing.level     === undefined) backfill.level = 1;
      if (existing.rankTitle === undefined) backfill.rankTitle = 'Beginner';
      // Moderation fields — only backfill if completely absent
      if (existing.isBanned === undefined) backfill.isBanned = false;
      if (existing.warningCount === undefined) backfill.warningCount = 0;
      // Note: isAdmin is intentionally NOT backfilled to avoid accidentally
      // granting admin rights. It must be set manually in Firebase console.

      if (Object.keys(backfill).length > 0) {
        await updateDoc(ref, { ...backfill, updatedAt: serverTimestamp() });
        console.log('[userService] ensureUserProfile: backfilled fields for', user.uid, backfill);
      }
    }
  } catch (error) {
    console.error('[userService] Error ensuring user profile:', error);
  }
};

// ─── Get all users EXCEPT the current user ───────────────────────────────────

/**
 * Returns all user documents from Firestore except the given uid.
 * Used for "Suggested People" on the Dashboard.
 * @param {string} excludeUid - UID of the current user to exclude
 * @returns {Array} Array of user profile objects
 */
export const getAllUsersExcept = async (excludeUid) => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((u) => u.uid !== excludeUid && u.uid !== undefined);
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};
