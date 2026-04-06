// src/components/ProtectedRoute.jsx
// Redirects to /login if not authenticated; shows LUXE spinner while loading
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PageSpinner = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
    gap: 20,
  }}>
    {/* LUXE logo mark */}
    <div style={{
      width: 48,
      height: 48,
      border: '1.5px solid var(--accent-gold)',
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 22,
      color: 'var(--accent-gold)',
      marginBottom: 8,
    }}>✦</div>

    {/* Animated ring */}
    <div style={{
      width: 36,
      height: 36,
      borderRadius: '50%',
      border: '3px solid rgba(201,168,76,0.15)',
      borderTopColor: 'var(--accent-gold)',
      animation: 'spin 0.8s linear infinite',
    }} />

    <p style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: 13,
      color: 'var(--text-muted)',
      letterSpacing: '1.5px',
      textTransform: 'uppercase',
      marginTop: 4,
    }}>
      Verifying session…
    </p>

    {/* Inject keyframe inline since we're outside a stylesheet scope */}
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageSpinner />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
