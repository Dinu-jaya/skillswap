/**
 * useUserAvatar.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Real-time avatar resolver for a single user.
 *
 * Subscribes to users/{uid} via onSnapshot so avatar data is always live.
 * Renders with correct data even after the user changes their photo/preset —
 * no page reload or manual refresh needed.
 *
 * Usage:
 *   const { avatarId, avatarUrl } = useUserAvatar(uid);
 *   <Avatar avatarId={avatarId} avatarUrl={avatarUrl} size={36} />
 *
 * Performance notes:
 *   • Each hook instance opens one Firestore listener.
 *   • Use this in per-item sub-components (e.g. ConversationItem, RequestRow)
 *     so React's unmount lifecycle cleans up the listener automatically.
 *   • For the current user, prefer userProfile from AuthContext (already live).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * @typedef {Object} UserAvatarResult
 * @property {string|null} avatarId   - Preset avatar ID (e.g. 'boy1') or null
 * @property {string|null} avatarUrl  - Firebase Storage download URL or null
 * @property {string}      avatarType - 'preset' | 'custom'
 * @property {boolean}     loading    - true until first snapshot arrives
 */

/**
 * Subscribes to users/{uid} and returns live avatar fields.
 *
 * @param {string|null|undefined} uid
 * @returns {UserAvatarResult}
 */
export function useUserAvatar(uid) {
  const [state, setState] = useState({
    avatarId:   null,
    avatarUrl:  null,
    avatarType: 'preset',
    level:      1,
    loading:    true,
  });

  useEffect(() => {
    if (!uid) {
      setState({ avatarId: null, avatarUrl: null, avatarType: 'preset', level: 1, loading: false });
      return;
    }

    const unsub = onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        if (!snap.exists()) {
          setState({ avatarId: null, avatarUrl: null, avatarType: 'preset', loading: false });
          return;
        }
        const data = snap.data();
        setState({
          avatarId:   data.avatar     || null,
          avatarUrl:  data.avatarType === 'custom' ? (data.avatarUrl || null) : null,
          avatarType: data.avatarType || 'preset',
          level:      data.level      || 1,
          loading:    false,
        });
      },
      (err) => {
        console.warn('[useUserAvatar] Snapshot error for uid:', uid, err.message);
        setState({ avatarId: null, avatarUrl: null, avatarType: 'preset', level: 1, loading: false });
      }
    );

    return () => unsub();
  }, [uid]);

  return state;
}
