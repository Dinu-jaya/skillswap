/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

// ─── BAN_MESSAGE — single source of truth ────────────────────────────────────
export const BAN_MESSAGE = 'Your account has been banned by admin.';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser]   = useState(null);
  const [userProfile, setUserProfile]   = useState(null);
  // loading: true until the very first auth+profile resolution is complete
  const [loading, setLoading]           = useState(true);
  // banMessage: non-empty string when the active session is banned
  const [banMessage, setBanMessage]     = useState('');

  // ── Set online status in Firestore ────────────────────────────────────────
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

  // ── Shared sign-out (also clears ban message) ─────────────────────────────
  const logout = useCallback(async () => {
    if (auth.currentUser) {
      await setOnlineStatus(auth.currentUser.uid, false);
    }
    setBanMessage('');
    return signOut(auth);
  }, [setOnlineStatus]);

  // ── Internal forced sign-out for banned users ─────────────────────────────
  const forceBanSignOut = useCallback(async (uid) => {
    console.warn('[AuthContext] Banned user detected — forcing sign out. uid:', uid);
    // Clear local state FIRST so UI does not flash protected content
    setCurrentUser(null);
    setUserProfile(null);
    setBanMessage(BAN_MESSAGE);
    setLoading(false);
    // Then sign out from Firebase
    try { await setOnlineStatus(uid, false); } catch { /* ignore */ }
    await signOut(auth);
  }, [setOnlineStatus]);

  // ── Auth methods ──────────────────────────────────────────────────────────

  /**
   * Email/password login with pre-navigation ban check.
   * Throws a special { code: 'auth/user-banned' } error if banned,
   * which Login.jsx catches and displays without navigating.
   */
  const login = useCallback(async (email, password) => {
    // 1. Authenticate with Firebase
    const result = await signInWithEmailAndPassword(auth, email, password);

    // 2. Immediately check Firestore ban status (before ANY navigation)
    const banned = await checkBanStatus(result.user.uid);
    if (banned) {
      // Sign out silently — do not navigate
      await signOut(auth);
      setBanMessage(BAN_MESSAGE);
      const err = new Error(BAN_MESSAGE);
      err.code = 'auth/user-banned';
      throw err;
    }

    return result;
  }, []);

  const signup = useCallback((email, password) =>
    createUserWithEmailAndPassword(auth, email, password), []);

  /**
   * Social login with post-auth ban check.
   */
  const signInWithSocial = useCallback(async (provider) => {
    const result = await signInWithPopup(auth, provider);
    if (result?.user) {
      await ensureUserProfile(result.user);

      // Check ban immediately after social login
      const banned = await checkBanStatus(result.user.uid);
      if (banned) {
        await signOut(auth);
        setBanMessage(BAN_MESSAGE);
        const err = new Error(BAN_MESSAGE);
        err.code = 'auth/user-banned';
        throw err;
      }
    }
    return result;
  }, []);

  const signInWithGoogle = useCallback(() => signInWithSocial(googleProvider), [signInWithSocial]);
  const signInWithGithub = useCallback(() => signInWithSocial(githubProvider), [signInWithSocial]);

  // ── Auth state listener (handles reload / session restore) ────────────────
  useEffect(() => {
    let unsubscribeProfile = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Signed out — clean up everything
        unsubscribeProfile();
        setCurrentUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      // ── Session restore: check ban BEFORE setting currentUser ─────────────
      // This prevents the 1-render flash where currentUser is set but
      // userProfile is still null, which used to let banned users past ProtectedRoute.
      const banned = await checkBanStatus(user.uid);
      if (banned) {
        // Don't even set currentUser — just force sign out
        await forceBanSignOut(user.uid);
        return;
      }

      // Safe to set currentUser now
      setCurrentUser(user);

      // Mark user as online
      setOnlineStatus(user.uid, true);

      // Backfill any missing profile fields
      try {
        await ensureUserProfile(user);
      } catch (err) {
        console.warn('[AuthContext] ensureUserProfile failed:', err);
      }

      // ── Real-time Firestore listener ──────────────────────────────────────
      // This catches the case where admin bans the user while they are active.
      unsubscribeProfile = onSnapshot(
        doc(db, 'users', user.uid),
        async (snap) => {
          const profileData = snap.exists() ? snap.data() : null;

          // Real-time ban enforcement
          if (isUserBanned(profileData)) {
            unsubscribeProfile(); // stop listening before sign-out
            await forceBanSignOut(user.uid);
            return;
          }

          setUserProfile(profileData);
          setLoading(false);
        },
        (error) => {
          console.error('[AuthContext] Profile snapshot error:', error);
          setUserProfile(null);
          setLoading(false);
        }
      );
    });

    return () => {
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
