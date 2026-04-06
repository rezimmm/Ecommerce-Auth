// ─────────────────────────────────────────────────────────
// Frontend/src/components/ProtectedRoute.jsx
// Redirects to /login if not authenticated
// ─────────────────────────────────────────────────────────
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show nothing (or a spinner) while we verify the stored token
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}


// ─────────────────────────────────────────────────────────
// Frontend/src/pages/auth/VerifyEmail.jsx
// Handles the /verify-email?token=xxx link from the email
// ─────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail } from '../../services/auth.service';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('error'); setMessage('Invalid verification link.'); return; }

    verifyEmail(token)
      .then((data) => { setStatus('success'); setMessage(data.message); })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
      });
  }, [searchParams]);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center p-5 bg-white border rounded shadow-sm" style={{ maxWidth: 460 }}>
        {status === 'verifying' && (
          <>
            <div className="spinner-border text-primary mb-3" />
            <p className="text-muted">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="display-4 mb-3">✅</div>
            <h2 className="h4 fw-bold mb-2">Email Verified!</h2>
            <p className="text-muted mb-4">{message}</p>
            <Link to="/login" className="btn btn-primary rounded-2 px-5 py-2 fw-bold">Sign In</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="display-4 mb-3">❌</div>
            <h2 className="h4 fw-bold mb-2">Verification Failed</h2>
            <p className="text-muted mb-4">{message}</p>
            <Link to="/login" className="btn btn-outline-dark rounded-2 px-4 py-2">Back to Login</Link>
          </>
        )}
      </div>
    </div>
  );
}


