import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import Navbar from '../components/Navbar';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import BrowseSkills from '../pages/BrowseSkills';
import Requests from '../pages/Requests';
import Chat from '../pages/Chat';
import Profile from '../pages/Profile';
import Explore from '../pages/Explore';
import HowItWorks from '../pages/HowItWorks';
import Community from '../pages/Community';
import About from '../pages/About';
import AdminDashboard from '../pages/AdminDashboard';
import Contracts from '../pages/Contracts';
import SessionsPage from '../pages/SessionsPage';

const AppRoutes = () => {
  return (
    <>
      <Routes>
        {/* Public Routes with Navbar */}
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/login" element={<><Navbar /><Login /></>} />
        <Route path="/signup" element={<><Navbar /><Signup /></>} />
        <Route path="/explore" element={<><Navbar /><Explore /></>} />
        <Route path="/how-it-works" element={<><Navbar /><HowItWorks /></>} />
        <Route path="/community" element={<><Navbar /><Community /></>} />
        <Route path="/about" element={<><Navbar /><About /></>} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/browse" element={<BrowseSkills />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/contracts/:contractId/sessions" element={<SessionsPage />} />
          {/* Admin-only route — AdminRoute guards isAdmin check */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
