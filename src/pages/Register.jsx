import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from "../context/AuthContext";
import '../App.css'

/* ── Icons ────────────────────────────────────────── */
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
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
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67 2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.08 6.08l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
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
const IconGoogle = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
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
  const labels = ['', 'Weak — add uppercase, numbers & symbols', 'Fair — almost there', 'Good — try adding a symbol', 'Strong password ✓']
  return { score: s, label: labels[s], cls: map[s] }
}

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirm: ''
  })
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)

  const strength = getStrength(form.password)

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'First name is required'
    if (!form.lastName.trim()) e.lastName = 'Last name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Min 8 characters required'
    if (!form.confirm) e.confirm = 'Please confirm your password'
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match'
    if (!agreed) e.agreed = 'You must agree to the terms'
    return e
  }

  const handleChange = (field) => (ev) => {
    setForm(f => ({ ...f, [field]: ev.target.value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  const { signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true); setAlert(null)
    try {
      await signUp({
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, phone: form.phone, password: form.password
      })
      setAlert({ type: 'success', msg: 'Account created! Check your email, then sign in.' })
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setAlert({ type: 'error', msg: err.response?.data?.message || 'Registration failed.' })
    } finally { setLoading(false) }
  }

  return (
    <AuthLayout
      tagline="Join the world of"
      taglineHighlight="Premium Fashion"
      description="Create your LUXE account and unlock exclusive member benefits, early access to collections, and bespoke styling services."
    >
      <div className="auth-form-container">
        {/* Header */}
        <div className="auth-header">
          <p className="auth-greeting">New Member</p>
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">
            Already a member? <Link to="/login">Sign in here</Link>
          </p>
        </div>

        {/* Social */}
        <button className="btn-social" id="btn-google-register" type="button"
          style={{ width: '100%', marginBottom: 18 }}>
          <IconGoogle /> Sign up with Google
        </button>

        <div className="auth-divider" style={{ marginBottom: 20 }}>
          <div className="divider-line" />
          <span className="divider-text">or create with email</span>
          <div className="divider-line" />
        </div>

        {/* Alert */}
        {alert && (
          <div className={`auth-alert ${alert.type}`} style={{ marginBottom: 16 }}>
            <span className="alert-icon">{alert.type === 'error' ? '⚠' : '✓'}</span>
            {alert.msg}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Name Row */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-firstname">First Name</label>
              <div className="input-wrapper">
                <span className="input-icon"><IconUser /></span>
                <input
                  id="reg-firstname"
                  type="text"
                  className={`form-input${errors.firstName ? ' input-error' : ''}`}
                  placeholder="Full Name"
                  value={form.firstName}
                  onChange={handleChange('firstName')}
                  autoComplete="given-name"
                />
              </div>
              {errors.firstName && <span className="field-error">⚠ {errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-lastname">Last Name</label>
              <div className="input-wrapper">
                <span className="input-icon"><IconUser /></span>
                <input
                  id="reg-lastname"
                  type="text"
                  className={`form-input${errors.lastName ? ' input-error' : ''}`}
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleChange('lastName')}
                  autoComplete="family-name"
                />
              </div>
              {errors.lastName && <span className="field-error">⚠ {errors.lastName}</span>}
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon"><IconEmail /></span>
              <input
                id="reg-email"
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

          {/* Phone (optional) */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-phone">
              Phone <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><IconPhone /></span>
              <input
                id="reg-phone"
                type="tel"
                className="form-input"
                placeholder="+91 1234567890"
                value={form.phone}
                onChange={handleChange('phone')}
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon"><IconLock /></span>
              <input
                id="reg-password"
                type={showPwd ? 'text' : 'password'}
                className={`form-input has-right-action${errors.password ? ' input-error' : ''}`}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange('password')}
                autoComplete="new-password"
              />
              <button type="button" className="input-action-btn"
                onClick={() => setShowPwd(s => !s)}
                aria-label={showPwd ? 'Hide password' : 'Show password'}>
                <IconEye open={showPwd} />
              </button>
            </div>
            {/* Strength meter */}
            {form.password && (
              <div className="password-strength">
                <div className="strength-bars">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`strength-bar ${i <= strength.score ? strength.cls : ''}`} />
                  ))}
                </div>
                <span className={`strength-label ${strength.cls}`}>{strength.label}</span>
              </div>
            )}
            {errors.password && <span className="field-error">⚠ {errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon"><IconLock /></span>
              <input
                id="reg-confirm"
                type={showConfirm ? 'text' : 'password'}
                className={`form-input has-right-action${errors.confirm ? ' input-error' : ''}`}
                placeholder="Re-enter your password"
                value={form.confirm}
                onChange={handleChange('confirm')}
                autoComplete="new-password"
              />
              <button type="button" className="input-action-btn"
                onClick={() => setShowConfirm(s => !s)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                <IconEye open={showConfirm} />
              </button>
            </div>
            {!errors.confirm && form.confirm && form.confirm === form.password && (
              <span className="field-error" style={{ color: 'var(--success)' }}>✓ Passwords match</span>
            )}
            {errors.confirm && <span className="field-error">⚠ {errors.confirm}</span>}
          </div>

          {/* Terms */}
          <div className="form-group">
            <div className="checkbox-group">
              <input
                id="agree-terms"
                type="checkbox"
                className="form-checkbox"
                checked={agreed}
                onChange={e => { setAgreed(e.target.checked); setErrors(er => ({ ...er, agreed: '' })) }}
              />
              <label htmlFor="agree-terms" className="checkbox-label">
                I agree to LUXE's <a href="#">Terms of Service</a> and{' '}
                <a href="#">Privacy Policy</a>, and consent to receiving personalised communications.
              </label>
            </div>
            {errors.agreed && <span className="field-error">⚠ {errors.agreed}</span>}
          </div>

          {/* Submit */}
          <button id="btn-register-submit" type="submit" className="btn-auth" disabled={loading}>
            {loading ? (
              <span className="btn-auth-spinner">
                <span className="spinner" />
                Creating account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch" style={{ marginTop: 24 }}>
          Already a member? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
