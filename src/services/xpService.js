/**
 * xpService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized XP + Level progression engine for SkillSwap.
 *
 * ALL XP formulas and rank logic live here. Do NOT duplicate in components.
 *
 * Level formula (quadratic — meaningful progression):
 *   XP required to go from level N → N+1  =  N × 100
 *
 *   Level 1 → 2 : 100 XP
 *   Level 2 → 3 : 200 XP
 *   Level 3 → 4 : 300 XP   (etc.)
 *
 * Rank titles:
 *   1–2   Beginner
 *   3–5   Learner
 *   6–9   Collaborator
 *   10–14 Mentor
 *   15+   Skill Master
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const log = (msg, data) => console.log(`[xpService] ${msg}`, data ?? '');

// ─── Pure calculation helpers (no Firestore) ──────────────────────────────────

/**
 * Derives the level from a total XP value.
 * Uses the quadratic formula: cumulative XP to reach level L = 50 × L × (L-1)
 *
 * @param {number} xp - Total accumulated XP
 * @returns {number} Current level (minimum 1)
 */
export const calculateLevel = (xp) => {
  if (!xp || xp <= 0) return 1;
  let level = 1;
  let threshold = 0; // cumulative XP needed to reach next level
  while (true) {
    const xpForNext = level * 100; // XP required for level → level+1
    if (xp < threshold + xpForNext) break;
    threshold += xpForNext;
    level++;
  }
  return level;
};

/**
 * Returns the rank title string for a given level.
 *
 * @param {number} level
 * @returns {string}
 */
export const getRankTitle = (level) => {
  if (level >= 15) return 'Skill Master';
  if (level >= 10) return 'Mentor';
  if (level >= 6)  return 'Collaborator';
  if (level >= 3)  return 'Learner';
  return 'Beginner';
};

/**
 * Returns XP progress within the current level.
 *
 * @param {number} xp    - Total XP
 * @param {number} level - Current level (from calculateLevel)
 * @returns {{ current: number, required: number, remaining: number, percentage: number }}
 */
export const getXPProgress = (xp = 0, level = 1) => {
  // Cumulative XP consumed by reaching current level
  let consumed = 0;
  for (let l = 1; l < level; l++) consumed += l * 100;

  const xpIntoLevel = Math.max(0, xp - consumed);
  const xpForNext   = level * 100; // XP needed for this level → next
  const remaining   = Math.max(0, xpForNext - xpIntoLevel);
  const percentage  = Math.min(100, Math.round((xpIntoLevel / xpForNext) * 100));

  return { current: xpIntoLevel, required: xpForNext, remaining, percentage };
};

// ─── XP Award constants ───────────────────────────────────────────────────────

export const XP_REWARDS = {
  SESSION_COMPLETED:  50,
  PROOF_SUBMITTED:    25,  // bonus on top of session XP when proofUrl provided
  CONTRACT_COMPLETED: 150,
};

// ─── Firestore XP write ───────────────────────────────────────────────────────

/**
 * Atomically awards XP to a user and recalculates their level + rank title.
 *
 * Uses a Firestore transaction so concurrent awards don't race.
 *
 * @param {string} userId - Target user's UID
 * @param {number} amount - XP to award (positive integer)
 * @param {string} reason - Human-readable label for logging (not stored)
 * @returns {Promise<{ newXp: number, newLevel: number, leveledUp: boolean }>}
 */
export const awardXP = async (userId, amount, reason = '') => {
  if (!userId || !amount || amount <= 0) return;

  const userRef = doc(db, 'users', userId);

  try {
    const result = await runTransaction(db, async (txn) => {
      const snap = await txn.get(userRef);
      if (!snap.exists()) {
        log(`User ${userId} not found — skipping XP award`);
        return null;
      }

      const data    = snap.data();
      const oldXp   = data.xp    || 0;
      const oldLevel = data.level || 1;

      const newXp    = oldXp + amount;
      const newLevel = calculateLevel(newXp);
      const newRank  = getRankTitle(newLevel);

      txn.update(userRef, {
        xp:        newXp,
        level:     newLevel,
        rankTitle: newRank,
        updatedAt: serverTimestamp(),
      });

      log(`+${amount} XP to ${userId} [${reason}]: ${oldXp} → ${newXp} (Lv.${oldLevel} → Lv.${newLevel})`);

      return { newXp, newLevel, leveledUp: newLevel > oldLevel };
    });

    return result;
  } catch (err) {
    // XP award failure must never break the primary action
    console.error(`[xpService] Failed to award XP to ${userId}:`, err.message);
    return null;
  }
};
