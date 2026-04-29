import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AdminDashboard from './components/AdminDashboard';
import AdminRoute from './components/AdminRoute';

function AuthenticatedApp() {
  const { isAuthenticated, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  if (isAuthenticated) {
    return <Dashboard onLogout={logout} />;
  }
  else if (!hasStarted) {
    return <LandingPage onStart={() => setHasStarted(true)} />;
  }
  else {
    if (showLogin) {
      return <LoginPage onSwitchToRegister={() => setShowLogin(false)} />;
    } else {
      return <RegisterPage onSwitchToLogin={() => setShowLogin(true)} />;
    }
  }

  // Admin Dashboard with route protection
  if (showAdminDashboard) {
    return (
      <AdminRoute onUnauthorized={() => setShowAdminDashboard(false)}>
        <AdminDashboard onBack={() => setShowAdminDashboard(false)} />
      </AdminRoute>
    );
  }

  return <Dashboard onLogout={logout} onNavigateToAdmin={() => setShowAdminDashboard(true)} />;
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
