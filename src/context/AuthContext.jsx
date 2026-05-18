/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, githubProvider } from '../firebase/firebase';
import { ensureUserProfile } from '../firebase/userService';
import { isUserBanned, checkBanStatus } from '../firebase/banUtils';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const BAN_MESSAGE = 'Your account has been banned by admin.';

// ─── Atomic state shape ───────────────────────────────────────────────────────
// Using a single reducer ensures every auth transition is ONE render.
// This eliminates the "loading=false but currentUser/userProfile not yet set"
// intermediate render that causes UI flicker.
const INITIAL_STATE = {
  currentUser: null,
  userProfile:  null,
  loading:      true,   // true until onAuthStateChanged resolves exactly once
  banMessage:   '',
};

function authReducer(state, action) {
  switch (action.type) {
    // Fired when onAuthStateChanged fires with null — user is logged out.
    // loading → false and currentUser → null in the SAME render.
    case 'SIGNED_OUT':
      return {
        currentUser: null,
        userProfile:  null,
        loading:      false,
        banMessage:   state.banMessage,   // preserve for UI display
      };

    // Fired once the user is confirmed non-banned.
    // loading stays true here — app is still gated by AppShell.
    case 'USER_CONFIRMED':
      return { ...state, currentUser: action.user };

    // Fired when the first Firestore profile snapshot arrives.
    // ATOMIC: userProfile + loading=false in one render — AppShell unblocks here.
    case 'PROFILE_LOADED':
      return { ...state, userProfile: action.profile, loading: false };

    // Fired when Firestore snapshot errors out — still unblock the app.
    case 'PROFILE_ERROR':
      return { ...state, userProfile: null, loading: false };

    // Fired when any ban is detected — wipes user state atomically.
    case 'BANNED':
      return {
        currentUser: null,
        userProfile:  null,
        loading:      false,
        banMessage:   BAN_MESSAGE,
      };

    case 'CLEAR_BAN':
      return { ...state, banMessage: '' };

    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, INITIAL_STATE);
  const { currentUser, userProfile, loading, banMessage } = state;

  // ── Set online status ─────────────────────────────────────────────────────
  const setOnlineStatus = useCallback(async (uid, online) => {
    if (!uid) return;
    try {
      await updateDoc(doc(db, 'users', uid), {
        online,
        lastSeen: serverTimestamp(),
      });
    } catch {
      // Profile doc may not exist yet — safe to ignore
    }
  }, []);

  // ── Shared sign-out ───────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    if (auth.currentUser) {
      await setOnlineStatus(auth.currentUser.uid, false);
    }
    dispatch({ type: 'CLEAR_BAN' });
    return signOut(auth);
  }, [setOnlineStatus]);

  // ── Internal forced sign-out for banned users ─────────────────────────────
  const forceBanSignOut = useCallback(async (uid) => {
    console.warn('[AuthContext] Banned user detected — forcing sign out. uid:', uid);
    dispatch({ type: 'BANNED' });                             // wipe UI immediately
    try { await setOnlineStatus(uid, false); } catch { /* ignore */ }
    await signOut(auth);
  }, [setOnlineStatus]);

  // ── Auth methods ──────────────────────────────────────────────────────────

  const login = useCallback(async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const banned = await checkBanStatus(result.user.uid);
    if (banned) {
      await signOut(auth);
      dispatch({ type: 'BANNED' });
      const err = new Error(BAN_MESSAGE);
      err.code = 'auth/user-banned';
      throw err;
    }
    return result;
  }, []);

  const signup = useCallback((email, password) =>
    createUserWithEmailAndPassword(auth, email, password), []);

  const signInWithSocial = useCallback(async (provider) => {
    const result = await signInWithPopup(auth, provider);
    if (result?.user) {
      await ensureUserProfile(result.user);
      const banned = await checkBanStatus(result.user.uid);
      if (banned) {
        await signOut(auth);
        dispatch({ type: 'BANNED' });
        const err = new Error(BAN_MESSAGE);
        err.code = 'auth/user-banned';
        throw err;
      }
    }
    return result;
  }, []);

  const signInWithGoogle = useCallback(() => signInWithSocial(googleProvider), [signInWithSocial]);
  const signInWithGithub = useCallback(() => signInWithSocial(githubProvider), [signInWithSocial]);

  // ── Auth state listener ───────────────────────────────────────────────────
  useEffect(() => {
    /**
     * `alive` flag — prevents stale async callbacks from updating state after
     * this effect has been cleaned up. Critical for React StrictMode, which
     * intentionally mounts → unmounts → remounts every component in development
     * to surface side-effect bugs. Without this flag, the first (cleaned-up)
     * subscription's async callback can still fire and corrupt state.
     */
    let alive = true;
    let unsubscribeProfile = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!alive) return;   // Discard stale callback from cleaned-up effect

      // ── Logged out ──────────────────────────────────────────────────────
      if (!user) {
        unsubscribeProfile();
        unsubscribeProfile = () => {};
        // ATOMIC: currentUser=null + loading=false in one render
        dispatch({ type: 'SIGNED_OUT' });
        return;
      }

      // ── Check ban BEFORE committing any state ───────────────────────────
      // Prevents any flash of authenticated UI for banned users on page restore.
      const banned = await checkBanStatus(user.uid);
      if (!alive) return;

      if (banned) {
        await forceBanSignOut(user.uid);
        return;
      }

      // Commit user — loading stays true, AppShell still shows loading screen
      dispatch({ type: 'USER_CONFIRMED', user });

      // Fire-and-forget: mark online
      setOnlineStatus(user.uid, true);

      // Backfill missing profile fields (awaited so snapshot starts after)
      try {
        await ensureUserProfile(user);
      } catch (err) {
        console.warn('[AuthContext] ensureUserProfile failed:', err);
      }

      if (!alive) return;

      // ── Real-time profile listener ──────────────────────────────────────
      // `loading` transitions to false ONLY inside this callback, ensuring
      // that when AppShell unblocks the app tree, userProfile is already set.
      // This is the ONLY place where the app becomes visible to the user.
      unsubscribeProfile = onSnapshot(
        doc(db, 'users', user.uid),
        async (snap) => {
          if (!alive) return;

          const profileData = snap.exists() ? snap.data() : null;

          // Real-time ban enforcement (admin banning an active session)
          if (isUserBanned(profileData)) {
            unsubscribeProfile();
            unsubscribeProfile = () => {};
            await forceBanSignOut(user.uid);
            return;
          }

          // ATOMIC: userProfile + loading=false in one reducer dispatch → one render
          dispatch({ type: 'PROFILE_LOADED', profile: profileData });
        },
        (error) => {
          if (!alive) return;
          console.error('[AuthContext] Profile snapshot error:', error);
          // Still unblock the app — just without profile data
          dispatch({ type: 'PROFILE_ERROR' });
        }
      );
    });

    return () => {
      alive = false;          // Poison all in-flight async callbacks
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, [forceBanSignOut, setOnlineStatus]);

  // ── Derived state ─────────────────────────────────────────────────────────
  const isAdmin  = userProfile?.isAdmin  === true;
  const isBanned = userProfile?.isBanned === true;

  const value = {
    currentUser,
    userProfile,
    loading,
    isAdmin,
    isBanned,
    banMessage,
    signup,
    login,
    signInWithGoogle,
    signInWithGithub,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
