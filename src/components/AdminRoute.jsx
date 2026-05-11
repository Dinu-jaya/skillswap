import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminRoute — wraps admin-only pages.
 * Guard order:
 * 1. Loading   → spinner
 * 2. No session / banned → /login
 * 3. Not admin → /dashboard
 * 4. Is admin  → render
 */
const AdminRoute = ({ children }) => {
  const { currentUser, userProfile, loading, isBanned, banMessage } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  // No session OR banned — send to login
  if (!currentUser || isBanned || banMessage) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but not admin — send to dashboard
  if (!userProfile?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
