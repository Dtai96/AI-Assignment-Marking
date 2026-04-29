import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import ForbiddenPage from '../components/ForbiddenPage';

interface AdminRouteProps {
  children: ReactNode;
  onUnauthorized: () => void;
}

/**
 * Higher-Order Component to protect admin-only routes
 * Redirects to 403 Forbidden page if user is not an admin
 */
export default function AdminRoute({ children, onUnauthorized }: AdminRouteProps) {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <ForbiddenPage onGoBack={onUnauthorized} />;
  }

  return <>{children}</>;
}
