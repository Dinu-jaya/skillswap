import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { normalizeSkill, inferCategory } from '../utils/skillUtils';

// inferSkillCategory re-exported for any legacy callers
export const inferSkillCategory = inferCategory;

// ─── Add Skill ───────────────────────────────────────────────────────────────

/**
 * Creates a new skill document in Firestore.
 * @param {string} userId - UID of the user creating the skill
 * @param {{ title, category, level, tags }} skillData
 * @returns {string} The new skill's document ID
 */
export const addSkill = async (userId, skillData) => {
  const docRef = await addDoc(collection(db, 'skills'), {
    title: skillData.title.trim(),
    category: skillData.category,
    level: skillData.level,
    tags: skillData.tags || [],
    createdBy: userId,
    requestsCount: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// ─── Subscribe to all skills (real-time) ─────────────────────────────────────

/**
 * Subscribes to all skills in Firestore.
 * Results are sorted client-side by requestsCount descending.
 * @param {function} callback - Called with array of skill objects on every update
 * @returns {function} Unsubscribe function
 */
export const subscribeToSkills = (callback) => {
  const q = query(collection(db, 'skills'), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const skills = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort by most requested first
      skills.sort((a, b) => (b.requestsCount || 0) - (a.requestsCount || 0));
      callback(skills);
    },
    (error) => {
      console.error('Error subscribing to skills:', error);
      callback([]);
    }
  );
};

// ─── Subscribe to public skills aggregated from user profiles (real-time) ────

/**
 * Subscribes to ALL users in real-time and flattens their skillsOffered
 * arrays into individual skill card objects for Browse Skills.
 *
 * Each emitted skill card has:
 *   id, title, category, level, ownerName, ownerAvatar, ownerUid, requestsCount
 *
 * Duplicate prevention: one card per (ownerUid + normalized skill name).
 * Realtime: any profile edit propagates here immediately.
 *
 * @param {function} callback  - Called with array of skill card objects
 * @returns {function} Unsubscribe function
 */
export const subscribeToPublicSkills = (callback) => {
  const q = query(collection(db, 'users'));

  return onSnapshot(
    q,
    (snapshot) => {
      const cards = [];
      const seen = new Set(); // dedup key: `${uid}::${normalizedSkillName}`

      snapshot.docs.forEach((userDoc) => {
        const user = userDoc.data();
        const uid = user.uid || userDoc.id;
        const rawOffered = Array.isArray(user.skillsOffered) ? user.skillsOffered : [];

        rawOffered.forEach((rawSkill) => {
          // normalizeSkill handles both legacy strings and structured objects
          const skill = normalizeSkill(rawSkill);
          if (!skill || !skill.name) return;

          const key = `${uid}::${skill.name.toLowerCase()}`;
          if (seen.has(key)) return; // dedup
          seen.add(key);

          cards.push({
            id: `${uid}_${skill.name.toLowerCase().replace(/\s+/g, '_')}`,
            title: skill.name,
            category: skill.category,   // real metadata from profile
            level: skill.level,          // real metadata from profile
            tags: [],
            ownerName:       user.displayName || user.name || 'Anonymous',
            ownerAvatar:     user.avatar     || null,
            ownerAvatarType: user.avatarType || 'preset',
            ownerAvatarUrl:  user.avatarType === 'custom' ? (user.avatarUrl || null) : null,
            ownerUid: uid,
            requestsCount: (user.skillRequestCounts?.[skill.name.toLowerCase()] || 0),
            createdAt: user.createdAt || null,
          });
        });
      });

      // Sort: most requested first, then alphabetical
      cards.sort((a, b) =>
        (b.requestsCount - a.requestsCount) || a.title.localeCompare(b.title)
      );

      callback(cards);
    },
    (error) => {
      console.error('[skillService] subscribeToPublicSkills error:', error);
      callback([]);
    }
  );
};

// ─── Subscribe to trending skills (top 4) ────────────────────────────────────

/**
 * Subscribes to the top 4 most-requested skills.
 * @param {function} callback
 * @returns {function} Unsubscribe function
 */
export const subscribeToTrendingSkills = (callback) => {
  return subscribeToPublicSkills((skills) => {
    callback(skills.slice(0, 4));
  });
};

// ─── Get skills created by a specific user ───────────────────────────────────

/**
 * One-time fetch of all skills created by a given user.
 * @param {string} userId
 * @returns {Array} Array of skill objects
 */
export const getUserSkills = async (userId) => {
  try {
    const q = query(collection(db, 'skills'), where('createdBy', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching user skills:', error);
    return [];
  }
};

// ─── Subscribe to skills offered by a user (real-time) ───────────────────────

/**
 * Subscribes to skills created by a specific user in real-time.
 * @param {string} userId
 * @param {function} callback
 * @returns {function} Unsubscribe function
 */
export const subscribeToUserSkills = (userId, callback) => {
  if (!userId) return () => {};
  const q = query(collection(db, 'skills'), where('createdBy', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (error) => {
      console.error('Error subscribing to user skills:', error);
      callback([]);
    }
  );
};

// ─── Increment request count ──────────────────────────────────────────────────

/**
 * Atomically increments the requestsCount for a skill.
 * Called when someone sends an exchange request for a skill.
 * @param {string} skillId
 */
export const incrementSkillRequestCount = async (skillId) => {
  if (!skillId) return;
  try {
    await updateDoc(doc(db, 'skills', skillId), {
      requestsCount: increment(1),
    });
  } catch (error) {
    console.error('Error incrementing skill request count:', error);
  }
};
