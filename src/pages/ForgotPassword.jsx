import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import '../App.css'
import api from '../services/api'

/* ── Icons ────────────────────────────────────────── */
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
const IconBack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
)
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

/* ── Step Indicators ─────────────────────────────── */
const Steps = ({ current }) => (
  <div className="step-indicators">
    {[0, 1, 2].map(i => (
      <div
        key={i}
        className={`step-dot ${i < current ? 'done' : ''} ${i === current ? 'active' : ''}`}
      />
    ))}
  </div>
)

/* ── OTP Input ───────────────────────────────────── */
const OtpInput = ({ value, onChange }) => {
  const inputs = useRef([])
  const digits = (value || '').split('').concat(Array(6).fill('')).slice(0, 6)

  const focus = (i) => inputs.current[i]?.focus()

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      if (!digits[i] && i > 0) focus(i - 1)
    }
  }

  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/, '').slice(-1)
    const next = [...digits]
    next[i] = val
    onChange(next.join(''))
    if (val && i < 5) focus(i + 1)
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted.padEnd(6, '').slice(0, 6))
    focus(Math.min(pasted.length, 5))
  }

  return (
    <div className="otp-group">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className={`otp-input${d ? ' filled' : ''}`}
          value={d}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  )
}

/* ── Password Strength ──────────────────────────── */
const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', cls: '' }
  let s = 0
  if (pwd.length >= 8) s++
  if (/[A-Z]/.test(pwd)) s++
  if (/[0-9]/.test(pwd)) s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  const map = ['', 'weak', 'fair', 'good', 'strong']
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong ✓']
  return { score: s, label: labels[s], cls: map[s] }
}

/* ── Main Component ──────────────────────────────── */
export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0) // 0=email, 1=otp, 2=new-pwd, 3=done
  const [email, setEmail] = useState('')
  const [emailErr, setEmailErr] = useState('')
  const [otp, setOtp] = useState('')
  const [otpErr, setOtpErr] = useState('')
  const [resendTimer, setResendTimer] = useState(60)
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwdErrors, setPwdErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [maskedEmail, setMaskedEmail] = useState('')

  const strength = getStrength(newPwd)

  // Countdown timer for OTP resend
  useEffect(() => {
    if (step !== 1) return
    if (resendTimer <= 0) return
    const id = setTimeout(() => setResendTimer(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [step, resendTimer])

  const maskEmail = (em) => {
    const [user, domain] = em.split('@')
    return `${user[0]}${'*'.repeat(Math.max(user.length - 2, 2))}${user.slice(-1)}@${domain}`
  }

  /* Step 0 → Send OTP */
  // Step 0 - Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setEmailErr('Please enter a valid email address')
      return
    }
    setEmailErr('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setMaskedEmail(maskEmail(email))
      setResendTimer(60)
      setStep(1)
    } catch (err) {
      setEmailErr(err.response?.data?.message || 'Failed to send code.')
    } finally { setLoading(false) }
  }

  // Step 1 - Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (otp.length < 6) { setOtpErr('Enter the 6-digit code'); return }
    setOtpErr('')
    setLoading(true)
    try {
      await api.post('/auth/verify-otp', { email, otp })
      setStep(2)
    } catch (err) {
      setOtpErr(err.response?.data?.message || 'Incorrect or expired code.')
    } finally { setLoading(false) }
  }

  // Step 2 - Reset Password
  const handleResetPwd = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!newPwd) errs.newPwd = 'New password is required'
    else if (newPwd.length < 8) errs.newPwd = 'Minimum 8 characters'
    if (!confirmPwd) errs.confirmPwd = 'Please confirm your password'
    else if (confirmPwd !== newPwd) errs.confirmPwd = 'Passwords do not match'
    if (Object.keys(errs).length) { setPwdErrors(errs); return }

    setPwdErrors({})
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { email, password: newPwd })
      setStep(3)
    } catch (err) {
      setPwdErrors({ newPwd: err.response?.data?.message || 'Reset failed.' })
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setResendTimer(60)
    setOtp('')
  }

  return (
    <AuthLayout
      tagline="Secure account"
      taglineHighlight="recovery"
      description="We'll send a verification code to your registered email so you can safely reset your password."
    >
      <div className="auth-form-container">
        {/* Back to Login */}
        <Link to="/login" className="back-link">
          <IconBack /> Back to Sign In
        </Link>

        {/* Step Dots */}
        {step < 3 && <Steps current={step} />}

        {/* ── Step 0: Email ── */}
        {step === 0 && (
          <>
            <div className="auth-header">
              <p className="auth-greeting">Password Recovery</p>
              <h2 className="auth-title">Forgot your password?</h2>
              <p className="auth-subtitle">
                No worries. Enter your registered email and we'll send you a verification code.
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSendOtp} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon"><IconEmail /></span>
                  <input
                    id="forgot-email"
                    type="email"
                    className={`form-input${emailErr ? ' input-error' : ''}`}
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailErr('') }}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                {emailErr && <span className="field-error">⚠ {emailErr}</span>}
              </div>

              <button id="btn-send-otp" type="submit" className="btn-auth" disabled={loading}>
                {loading ? (
                  <span className="btn-auth-spinner">
                    <span className="spinner" />
                    Sending code...
                  </span>
                ) : 'Send Verification Code'}
              </button>
            </form>
          </>
        )}

        {/* ── Step 1: OTP ── */}
        {step === 1 && (
          <>
            <div className="auth-header">
              <p className="auth-greeting">Verify your email</p>
              <h2 className="auth-title">Check your inbox</h2>
              <p className="auth-subtitle">
                We sent a 6-digit code to <strong style={{ color: 'var(--accent-gold)' }}>{maskedEmail}</strong>.
                Enter it below — it expires in 10 minutes.
              </p>
            </div>

            <form className="auth-form" onSubmit={handleVerifyOtp} noValidate>
              <OtpInput value={otp} onChange={setOtp} />
              {otpErr && (
                <p className="field-error" style={{ textAlign: 'center', justifyContent: 'center' }}>
                  ⚠ {otpErr}
                </p>
              )}

              <div className="otp-resend">
                {resendTimer > 0
                  ? `Resend code in ${resendTimer}s`
                  : <><span>Didn't receive it? </span>
                    <button type="button" onClick={handleResend} disabled={loading}>Resend code</button>
                  </>
                }
              </div>

              <button id="btn-verify-otp" type="submit" className="btn-auth" disabled={loading || otp.length < 6}>
                {loading ? (
                  <span className="btn-auth-spinner">
                    <span className="spinner" />
                    Verifying...
                  </span>
                ) : 'Verify Code'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                Wrong email? <button type="button" onClick={() => setStep(0)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--accent-gold)',
                    fontSize: 13, cursor: 'pointer', fontWeight: 500
                  }}>Change it</button>
              </p>
            </form>
          </>
        )}

        {/* ── Step 2: New Password ── */}
        {step === 2 && (
          <>
            <div className="auth-header">
              <p className="auth-greeting">Almost done</p>
              <h2 className="auth-title">Set a new password</h2>
              <p className="auth-subtitle">
                Choose a strong password that you haven't used before.
              </p>
            </div>

            <form className="auth-form" onSubmit={handleResetPwd} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">New Password</label>
                <div className="input-wrapper">
                  <span className="input-icon"><IconLock /></span>
                  <input
                    id="new-password"
                    type={showNew ? 'text' : 'password'}
                    className={`form-input has-right-action${pwdErrors.newPwd ? ' input-error' : ''}`}
                    placeholder="Min. 8 characters"
                    value={newPwd}
                    onChange={e => { setNewPwd(e.target.value); setPwdErrors(er => ({ ...er, newPwd: '' })) }}
                    autoComplete="new-password"
                  />
                  <button type="button" className="input-action-btn"
                    onClick={() => setShowNew(s => !s)}>
                    <IconEye open={showNew} />
                  </button>
                </div>
                {newPwd && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`strength-bar ${i <= strength.score ? strength.cls : ''}`} />
                      ))}
                    </div>
                    <span className={`strength-label ${strength.cls}`}>{strength.label}</span>
                  </div>
                )}
                {pwdErrors.newPwd && <span className="field-error">⚠ {pwdErrors.newPwd}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm-new-password">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon"><IconLock /></span>
                  <input
                    id="confirm-new-password"
                    type={showConfirm ? 'text' : 'password'}
                    className={`form-input has-right-action${pwdErrors.confirmPwd ? ' input-error' : ''}`}
                    placeholder="Re-enter new password"
                    value={confirmPwd}
                    onChange={e => { setConfirmPwd(e.target.value); setPwdErrors(er => ({ ...er, confirmPwd: '' })) }}
                    autoComplete="new-password"
                  />
                  <button type="button" className="input-action-btn"
                    onClick={() => setShowConfirm(s => !s)}>
                    <IconEye open={showConfirm} />
                  </button>
                </div>
                {!pwdErrors.confirmPwd && confirmPwd && confirmPwd === newPwd && (
                  <span className="field-error" style={{ color: 'var(--success)' }}>✓ Passwords match</span>
                )}
                {pwdErrors.confirmPwd && <span className="field-error">⚠ {pwdErrors.confirmPwd}</span>}
              </div>

              <button id="btn-reset-password" type="submit" className="btn-auth" disabled={loading}>
                {loading ? (
                  <span className="btn-auth-spinner">
                    <span className="spinner" />
                    Resetting password...
                  </span>
                ) : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        {/* ── Step 3: Done ── */}
        {step === 3 && (
          <div className="success-box">
            <div className="success-icon">
              <IconShield />
            </div>
            <h3 className="success-title">Password reset!</h3>
            <p className="success-text">
              Your password has been successfully updated for{' '}
              <strong>{email}</strong>. You can now sign in with your new credentials.
            </p>
            <button
              id="btn-go-login"
              className="btn-auth"
              onClick={() => navigate('/login')}
            >
              Sign In Now
            </button>
          </div>
        )}

        <p className="auth-switch" style={{ marginTop: 28 }}>
          Remembered it? <Link to="/login">Back to Sign In</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
