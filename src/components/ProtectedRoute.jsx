import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — 4-layer guard:
 * 1. While loading (auth + profile not yet resolved) → show spinner
 *    NOTE: AppShell in App.jsx already blocks ALL rendering while loading,
 *    so this branch is a defense-in-depth fallback (e.g., mid-session
 *    re-authentication or token refresh edge cases).
 * 2. No Firebase auth session → redirect to /login
 * 3. User is banned (isBanned in userProfile OR banMessage set) → redirect to /login
 * 4. Authenticated and not banned → render children / Outlet
 *
 * loading stays true until BOTH the auth state AND the first Firestore
 * profile snapshot have resolved. This prevents the 1-frame flash where
 * currentUser is set but userProfile is still null.
 */
const ProtectedRoute = ({ children }) => {
  const { currentUser, userProfile, loading, isBanned, banMessage } = useAuth();
  const location = useLocation();

  // ── 1. Wait for complete auth + profile resolution ────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── 2. No active session ───────────────────────────────────────────────────
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── 3. Banned user — block even if Firebase auth token exists ─────────────
  // Two conditions cover both the realtime snap case (isBanned on userProfile)
  // and the race-condition case (banMessage set, currentUser about to be null)
  if (isBanned || banMessage) {
    return <Navigate to="/login" replace />;
  }

  // ── 4. Authorised ─────────────────────────────────────────────────────────
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
