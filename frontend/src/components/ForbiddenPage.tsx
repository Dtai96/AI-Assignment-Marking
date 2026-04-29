import { useAuth } from '../context/AuthContext';

interface ForbiddenPageProps {
  onGoBack: () => void;
}

export default function ForbiddenPage({ onGoBack }: ForbiddenPageProps) {
  const { user } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '24px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        padding: '48px'
      }}>
        {/* Error Icon */}
        <div style={{
          fontSize: '6rem',
          marginBottom: '24px'
        }}>
          🚫
        </div>

        {/* Error Code */}
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 700,
          color: 'var(--danger)',
          margin: '0 0 16px 0'
        }}>
          403
        </h1>

        {/* Error Title */}
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 12px 0'
        }}>
          Access Forbidden
        </h2>

        {/* Error Message */}
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          margin: '0 0 32px 0'
        }}>
          Sorry, you don't have permission to access this page. 
          This area requires <strong>Administrator</strong> privileges.
        </p>

        {/* User Info */}
        {user && (
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '32px',
            fontSize: '0.875rem'
          }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>
              Current User:
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {user.full_name || user.username}
            </div>
            <div style={{ 
              display: 'inline-block',
              marginTop: '8px',
              padding: '4px 12px',
              borderRadius: '12px',
              backgroundColor: user.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
              color: user.role === 'admin' ? '#ef4444' : '#3b82f6',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              {user.role}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onGoBack}
            className="btn-secondary"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
