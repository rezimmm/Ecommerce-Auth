// src/pages/VerifyEmail.jsx
// Handles /verify-email?token=xxx links sent by the backend
import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { verifyEmail } from '../services/auth.service'

/* ── Icons ─────────────────────────────────────── */
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
    <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
    <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
  </svg>
)
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="32" height="32">
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <path d="M2 7l10 7 10-7" />
  </svg>
)

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link — the token is missing.')
      return
    }

    verifyEmail(token)
      .then((data) => {
        setStatus('success')
        setMessage(data.message || 'Your email has been verified successfully.')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(
          err.response?.data?.message ||
          'Verification failed. The link may have expired or already been used.'
        )
      })
  }, [searchParams])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '24px 16px',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(201,168,76,0.06) 0%, transparent 70%)',
      }} />

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 460,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '48px 40px',
        textAlign: 'center',
        animation: 'fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1)',
      }}>

        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 9, marginBottom: 36,
        }}>
          <div style={{
            width: 30, height: 30,
            border: '1.5px solid var(--accent-gold)',
            borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: 'var(--accent-gold)',
          }}>✦</div>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 18, fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}>LUXE</span>
        </div>

        {/* ── Verifying state ── */}
        {status === 'verifying' && (
          <>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
              color: 'var(--accent-gold)',
            }}>
              <IconMail />
            </div>

            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '3px solid rgba(201,168,76,0.15)',
              borderTopColor: 'var(--accent-gold)',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 20px',
            }} />

            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 24, fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 10,
            }}>Verifying your email…</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Please wait while we confirm your email address.
            </p>
          </>
        )}

        {/* ── Success state ── */}
        {status === 'success' && (
          <>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(76,175,138,0.1)',
              border: '1px solid rgba(76,175,138,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
              color: '#4caf8a',
            }}>
              <IconCheck />
            </div>

            <p style={{
              fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
              color: '#4caf8a', fontWeight: 500, marginBottom: 8,
            }}>Verified ✓</p>

            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 26, fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: 12,
            }}>Email Confirmed!</h2>

            <p style={{
              fontSize: 14, color: 'var(--text-secondary)',
              lineHeight: 1.7, marginBottom: 32,
            }}>{message}</p>

            <Link to="/login" style={{
              display: 'inline-block',
              width: '100%',
              padding: '13px 24px',
              background: 'linear-gradient(135deg, #c9a84c 0%, #e8c97a 50%, #c9a84c 100%)',
              color: '#0a0a0f',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              borderRadius: 8,
              textDecoration: 'none',
              transition: 'all 0.3s',
              boxSizing: 'border-box',
            }}>
              Sign In to LUXE
            </Link>
          </>
        )}

        {/* ── Error state ── */}
        {status === 'error' && (
          <>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(224,92,92,0.08)',
              border: '1px solid rgba(224,92,92,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
              color: '#e05c5c',
            }}>
              <IconX />
            </div>

            <p style={{
              fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
              color: '#e05c5c', fontWeight: 500, marginBottom: 8,
            }}>Failed</p>

            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 26, fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: 12,
            }}>Verification Failed</h2>

            <p style={{
              fontSize: 14, color: 'var(--text-secondary)',
              lineHeight: 1.7, marginBottom: 32,
            }}>{message}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link to="/login" style={{
                display: 'block',
                padding: '13px 24px',
                background: 'linear-gradient(135deg, #c9a84c 0%, #e8c97a 50%, #c9a84c 100%)',
                color: '#0a0a0f',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                borderRadius: 8,
                textDecoration: 'none',
                textAlign: 'center',
              }}>
                Back to Sign In
              </Link>
              <Link to="/register" style={{
                display: 'block',
                padding: '12px 24px',
                background: 'transparent',
                border: '1.5px solid var(--border-medium)',
                color: 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 500,
                borderRadius: 8,
                textDecoration: 'none',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}>
                Create a new account
              </Link>
            </div>
          </>
        )}

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  )
}
