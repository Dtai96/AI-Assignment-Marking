import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import * as api from './api/client';

function AuthenticatedApp() {
  const { isAuthenticated, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (!isAuthenticated) {
    if (showLogin) {
      return <LoginPage onSwitchToRegister={() => setShowLogin(false)} />;
    } else {
      return <RegisterPage onSwitchToLogin={() => setShowLogin(true)} />;
    }
  }

  return <Dashboard onLogout={logout} />;
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
