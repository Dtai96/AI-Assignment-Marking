import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import LandingPage from './components/LandingPage';


function AuthenticatedApp() {
  const { isAuthenticated, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

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
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
