import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AuthLoadingScreen from './components/AuthLoadingScreen';

/**
 * AppShell — sits inside AuthProvider so it can read the loading state.
 * Blocks ALL rendering (Navbar, routes, providers that depend on currentUser)
 * until Firebase onAuthStateChanged has resolved exactly once.
 *
 * This eliminates the "authenticated UI flash" for logged-out users because
 * nothing is painted until the auth state is definitively known.
 */
function AppShell() {
  const { loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  return (
    <NotificationProvider>
      <AppRoutes />
    </NotificationProvider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </Router>
  );
}

export default App;
