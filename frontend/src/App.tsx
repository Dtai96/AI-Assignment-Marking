import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import LandingPage from './components/LandingPage.tsx';
import AdminDashboard from './components/AdminDashboard';
import AdminRoute from './components/AdminRoute';

function AuthenticatedApp() {
  const { isAuthenticated, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  // Admin Dashboard with route protection
  if (isAuthenticated && showAdminDashboard) {
    return (
      <AdminRoute onUnauthorized={() => setShowAdminDashboard(false)}>
        <AdminDashboard onBack={() => setShowAdminDashboard(false)} />
      </AdminRoute>
    );
  }

  if (isAuthenticated) {
    return <Dashboard onLogout={logout} onNavigateToAdmin={() => setShowAdminDashboard(true)} />;
  }
  
  if (!hasStarted) {
    return <LandingPage onStart={() => setHasStarted(true)} />;
  }
  
  if (showLogin) {
    return <LoginPage onSwitchToRegister={() => setShowLogin(false)} />;
  } else {
    return <RegisterPage onSwitchToLogin={() => setShowLogin(true)} />;
  }
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
