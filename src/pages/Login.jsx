import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import '../App.css'

/* ── SVG Icons (inline, zero-dep) ────────────────── */
const IconEmail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <path d="M2 7l10 7 10-7" />
  </svg>
)

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const IconEye = ({ open }) => open ? (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

/* Google Icon */
const IconGoogle = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

/* Apple Icon */
const IconApple = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
)

/* ── Password Strength ──────────────────────────── */
const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', cls: '' }
  let s = 0
  if (pwd.length >= 8) s++
  if (/[A-Z]/.test(pwd)) s++
  if (/[0-9]/.test(pwd)) s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  const map = ['', 'weak', 'fair', 'good', 'strong']
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  return { score: s, label: labels[s], cls: map[s] }
}

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)

  const strength = getStrength(form.password)

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleChange = (field) => (ev) => {
    setForm(f => ({ ...f, [field]: ev.target.value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  const { signIn, signInWithGoogle } = useAuth()

  // Google Sign-In via GSI credential popup
  const handleGoogleLogin = () => {
    if (!window.google) {
      setAlert({ type: 'error', msg: 'Google Sign-In is not available. Please try again.' })
      return
    }
    setAlert(null)
    setLoading(true)
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          await signInWithGoogle(response.credential)
          setAlert({ type: 'success', msg: 'Google Sign-In successful! Redirecting...' })
          setTimeout(() => { window.location.href = FRONTEND_URL }, 1200)
        } catch (err) {
          setAlert({ type: 'error', msg: err.response?.data?.message || 'Google Sign-In failed. Please try again.' })
        } finally {
          setLoading(false)
        }
      },
      ux_mode: 'popup',
    })
    window.google.accounts.id.prompt()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setAlert(null)
    try {
      const { data } = await api.post('/auth/login', {
        email: form.email,
        password: form.password
      })

      localStorage.setItem('luxe_access_token', data.accessToken)
      localStorage.setItem('luxe_user', JSON.stringify(data.user))

      setAlert({ type: 'success', msg: 'Welcome back! Redirecting...' })

      setTimeout(() => {
        window.location.href = FRONTEND_URL
      }, 1200)

    } catch (err) {
      console.error('Login error:', err)
      setAlert({
        type: 'error',
        msg: err.response?.data?.message || 'Network error or backend down.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      tagline="Welcome back to"
      taglineHighlight="LUXE"
      description="Sign in to access your curated collection, exclusive member benefits, and personalised recommendations."
    >
      <div className="auth-form-container">
        {/* Header */}
        <div className="auth-header">
          <p className="auth-greeting">Member Login</p>
          <h2 className="auth-title">Sign in to your account</h2>
          <p className="auth-subtitle">
            Don't have an account? <Link to="/register">Create one free</Link>
          </p>
        </div>

        {/* Social Buttons */}
        <div className="social-buttons" style={{ marginBottom: 20 }}>
          <button className="btn-social" type="button" id="btn-google-login" onClick={handleGoogleLogin} disabled={loading}>
            <IconGoogle /> Continue with Google
          </button>
          <button className="btn-social" type="button" id="btn-apple-login" disabled>
            <IconApple /> Continue with Apple
          </button>
        </div>

        <div className="auth-divider">
          <div className="divider-line" />
          <span className="divider-text">or sign in with email</span>
          <div className="divider-line" />
        </div>

        {/* Alert */}
        {alert && (
          <div className={`auth-alert ${alert.type}`} style={{ marginTop: 16 }}>
            <span className="alert-icon">
              {alert.type === 'error' ? '⚠' : '✓'}
            </span>
            {alert.msg}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate style={{ marginTop: 20 }}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon"><IconEmail /></span>
              <input
                id="login-email"
                type="email"
                className={`form-input${errors.email ? ' input-error' : ''}`}
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange('email')}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="field-error">⚠ {errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon"><IconLock /></span>
              <input
                id="login-password"
                type={showPwd ? 'text' : 'password'}
                className={`form-input has-right-action${errors.password ? ' input-error' : ''}`}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange('password')}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-action-btn"
                onClick={() => setShowPwd(s => !s)}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                <IconEye open={showPwd} />
              </button>
            </div>
            {errors.password && <span className="field-error">⚠ {errors.password}</span>}
          </div>

          {/* Remember / Forgot */}
          <div className="form-footer-row">
            <div className="remember-group">
              <input
                id="remember-me"
                type="checkbox"
                className="form-checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
              />
              <label htmlFor="remember-me" className="remember-label">Remember me</label>
            </div>
            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
          </div>

          {/* Submit */}
          <button
            id="btn-login-submit"
            type="submit"
            className="btn-auth"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-auth-spinner">
                <span className="spinner" />
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch" style={{ marginTop: 24 }}>
          New to LUXE? <Link to="/register">Create your account →</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
