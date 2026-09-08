'use client'

import axios from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from "next/navigation";
import { API_ORIGIN, API_URL, TURNSTILE_SITE_KEY } from '@/lib/config'

export default function Login() {
  const containerRef = useRef(null)
  const particlesRef = useRef(null)
  const countersRan = useRef(false)
  const router = useRouter();

  const [showSiPass, setShowSiPass] = useState(false)
  const [showSuPass, setShowSuPass] = useState(false)
  const [showSuConfirmPass, setShowSuConfirmPass] = useState(false)
  const [siError, setSiError] = useState('')
  const [suError, setSuError] = useState('')
  const [suSuccess, setSuSuccess] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')

  const [siForm, setSiForm] = useState({
    username: '',
    password: '',
    remember: false,
  })

  // Load Turnstile Script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script)
    }
  }, [])

  // Safe Turnstile Callback
  useEffect(() => {
    window.onTurnstileSuccess = (token) => {
      setTurnstileToken(token)
    }
  }, [])
  const [suForm, setSuForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const [forgotModalOpen, setForgotModalOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showForgotNewPass, setShowForgotNewPass] = useState(false)
  const [showForgotConfirmPass, setShowForgotConfirmPass] = useState(false)

  useEffect(() => {
    const symbols = ['✚', '♥', '⚕', '💊', '🧬']
    const container = particlesRef.current
    if (!container) return

    for (let i = 0; i < 24; i++) {
      const span = document.createElement('span')
      span.className = 'tm-particle'
      span.innerText = symbols[Math.floor(Math.random() * symbols.length)]
      span.style.left = `${Math.random() * 100}%`
      span.style.animationDelay = `${Math.random() * 8}s`
      span.style.animationDuration = `${7 + Math.random() * 7}s`
      span.style.fontSize = `${14 + Math.random() * 14}px`
      container.appendChild(span)
    }

    return () => container.querySelectorAll('.tm-particle').forEach(p => p.remove())
  }, [])

  useEffect(() => {
    if (countersRan.current) return
    countersRan.current = true

    document.querySelectorAll('.tm-count').forEach(el => {
      const target = Number(el.getAttribute('data-target')) || 0
      let current = 0
      const step = Math.ceil(target / 80)
      const timer = setInterval(() => {
        current = Math.min(current + step, target)
        el.textContent = target > 1000 ? current.toLocaleString() : current
        if (current >= target) clearInterval(timer)
      }, 25)
    })
  }, [])

  const goSignUp = () => {
    setSiError('')
    containerRef.current?.classList.add('right-panel-active')
  }

  const goSignIn = () => {
    setSuError('')
    setSuSuccess('')
    containerRef.current?.classList.remove('right-panel-active')
  }

  function shake(id) {
    const el = document.getElementById(id)
    if (!el) return
    el.classList.remove('tm-shake')
    void el.offsetWidth
    el.classList.add('tm-shake')
  }

  function openForgotModal() {
    setForgotModalOpen(true)
    setForgotEmail('')
    setOtp('')
    setNewPassword('')
    setConfirmPassword('')
    setCurrentStep(1)
    setLoading(false)
    setErrorMessage('')
    setSuccessMessage('')
    setShowForgotNewPass(false)
    setShowForgotConfirmPass(false)
  }

  function closeForgotModal() {
    setForgotModalOpen(false)
    setOtp('')
    setNewPassword('')
    setConfirmPassword('')
    setCurrentStep(1)
    setLoading(false)
    setErrorMessage('')
    setSuccessMessage('')
    setShowForgotNewPass(false)
    setShowForgotConfirmPass(false)
  }

  async function handleForgotPassword(e) {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!forgotEmail.trim()) {
      setErrorMessage('Please enter your registered email.')
      return
    }

    try {
      setLoading(true)
      await axios.post(`${API_URL}/forgot-password`, {
        email: forgotEmail,
      })
      setCurrentStep(2)
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
        error?.response?.data ||
        'Failed to send OTP.'
      )
    } finally {
      setLoading(false)
    }
  }
async function handleVerifyOtp(e) {
  e.preventDefault();
  setErrorMessage('');
  setSuccessMessage('');

  if (!otp.trim() || otp.length !== 6) {
    setErrorMessage('Please enter a valid 6-digit OTP.');
    return;
  }

  try {
    setLoading(true);
    await axios.post(`${API_URL}/verify-otp`, {
      email: forgotEmail,
      otp: otp.trim(),
    });
    
    // Only move forward on success
    setErrorMessage('');
    setCurrentStep(3);
  } catch (error) {
    console.error("OTP Verify Error:", error);
    setErrorMessage(
      error?.response?.data?.message || 
      error?.response?.data || 
      'Invalid or Expired OTP. Please try again.'
    );
    setOtp('');                    // Clear OTP input
    // Do NOT change currentStep
  } finally {
    setLoading(false);
  }
}

  async function handleResetPassword(e) {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Both password fields are required.')
      return
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    try {
      setLoading(true)
      await axios.post(`${API_URL}/reset-password`, {
        email: forgotEmail,
        newPassword,
      })

      setSuccessMessage('Password Reset Successfully')
      setErrorMessage('')

      setTimeout(() => {
        closeForgotModal()
      }, 1800)
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
        error?.response?.data ||
        'Unable to reset password.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleSignIn(e) {
    e.preventDefault()
    setSiError('')

    if (!siForm.username || !siForm.password ) {
      shake('siPanel')
      setSiError('Please enter username and password.')
      return
    }
    if (!turnstileToken) {
      setSiError('Please complete the security verification.')
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: siForm.username,
            password: siForm.password,
            turnstileToken: turnstileToken
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", siForm.username);
      localStorage.setItem("role", data.role);

      if (data.role === "ROLE_ADMIN") {
          router.push("/admin");
      } else {
          router.push("/dashboard");
      }
      } else {
        setSiError(data.message || "Login failed");
      }
    } catch (error) {
      setSiError("Unable to connect to server");
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();

    setSuError('');
    setSuSuccess('');

    if (
      !suForm.username ||
      !suForm.email ||
      !suForm.phone ||
      !suForm.password ||
      !suForm.confirmPassword
    ) {
      shake('suPanel');
      setSuError('Please fill all required fields.');
      return;
    }

    if (suForm.password !== suForm.confirmPassword) {
      shake('suPanel');
      setSuError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: suForm.username,
            email: suForm.email,
            phone: suForm.phone,
            password: suForm.password,
          }),
        }
      );

      const data = await response.json();
      setSuSuccess(typeof data === 'string' ? data : data.message || 'Registration successful');

      setSuForm({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      setSuError("Registration failed");
    }
  }

  const passwordMatch = useMemo(() => {
    if (!suForm.confirmPassword) return null
    return suForm.password === suForm.confirmPassword
  }, [suForm.password, suForm.confirmPassword])

  const forgotPasswordMatch = useMemo(() => {
    if (!confirmPassword) return null
    return newPassword === confirmPassword
  }, [newPassword, confirmPassword])

  return (
    <div className="tm-page">
      <div className="tm-medical-orb tm-orb-one" />
      <div className="tm-medical-orb tm-orb-two" />
      <div className="tm-medical-orb tm-orb-three" />
      <div className="tm-particles" ref={particlesRef} />

      <button
        type="button"
        className="tm-page-back"
        onClick={() => router.push('/')}
        aria-label="Back to home page"
      >
        <span aria-hidden="true">←</span>
        <span>Back to home</span>
      </button>

      <div className="tm-container" id="container" ref={containerRef}>
        <div className="tm-form-container tm-sign-in-container" id="siPanel">
          <div className="tm-form-head">
            <h3>Sign In</h3>
            <p>Access your TrustMedAI clinical workspace securely.</p>
          </div>

          <form className="tm-form" onSubmit={handleSignIn}>
            <label htmlFor="signin-username">Username</label>
            <div className="tm-input-wrap">
              <input
                id="signin-username"
                type="text"
                placeholder="Enter your username"
                autoComplete="username"
                value={siForm.username}
                onChange={e => setSiForm(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>

            <label htmlFor="signin-password">Password</label>
            <div className="tm-input-wrap">
              <input
                id="signin-password"
                type={showSiPass ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={siForm.password}
                onChange={e => setSiForm(prev => ({ ...prev, password: e.target.value }))}
              />
              <button
                type="button"
                className="tm-eye-btn"
                onClick={() => setShowSiPass(v => !v)}
                aria-label={showSiPass ? 'Hide password' : 'Show password'}
              >
                {showSiPass ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="my-4">
              <div 
                className="cf-turnstile" 
                data-sitekey={TURNSTILE_SITE_KEY}
                data-callback="onTurnstileSuccess"
                data-theme="auto"
                data-size="normal"
                data-retry="auto"
              ></div>
            </div>
            {siError && <p className="tm-form-message error">{siError}</p>}

            <div className="tm-form-row">
              <label className="tm-check">
              </label>
              <button
                type="button"
                className="tm-forgot-link"
                onClick={openForgotModal}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="tm-login-btn">Sign In</button>

            <div className="tm-divider"><span>or continue with</span></div>

            <div className="tm-sso">
              <button
                type="button"
                className="tm-sso-btn"
                onClick={() =>
                  window.location.href =
                    `${API_ORIGIN}/oauth2/authorization/google`
                }
              >
                Google
              </button>
              <button
                type="button"
                className="tm-sso-btn"
                onClick={() =>
                  window.location.href =
                    `${API_ORIGIN}/oauth2/authorization/microsoft`
                }
              >
                Microsoft
              </button>
            </div>
          </form>
        </div>

        <div className="tm-form-container tm-sign-up-container" id="suPanel">
          <div className="tm-form-head">
            <h3>Create Account</h3>
            <p>Create your account to join the TrustMedAI healthcare network.</p>
          </div>

          <form className="tm-form" onSubmit={handleSignUp}>
            <label htmlFor="signup-username">Username</label>
            <div className="tm-input-wrap">
              <input
                id="signup-username"
                type="text"
                placeholder="Choose a username"
                autoComplete="username"
                value={suForm.username}
                onChange={e => setSuForm(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>

            <label htmlFor="signup-email">Email</label>
            <div className="tm-input-wrap">
              <input
                id="signup-email"
                type="email"
                placeholder="you@hospital.com"
                autoComplete="email"
                value={suForm.email}
                onChange={e => setSuForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <label htmlFor="signup-phone">Phone number</label>
            <div className="tm-input-wrap">
              <input
                id="signup-phone"
                type="tel"
                placeholder="+91 9876543210"
                autoComplete="tel"
                value={suForm.phone}
                onChange={e => setSuForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <label htmlFor="signup-password">Password</label>
            <div className="tm-input-wrap">
              <input
                id="signup-password"
                type={showSuPass ? 'text' : 'password'}
                placeholder="Create a strong password"
                autoComplete="new-password"
                value={suForm.password}
                onChange={e => setSuForm(prev => ({ ...prev, password: e.target.value }))}
              />
              <button
                type="button"
                className="tm-eye-btn"
                onClick={() => setShowSuPass(v => !v)}
                aria-label={showSuPass ? 'Hide password' : 'Show password'}
              >
                {showSuPass ? 'Hide' : 'Show'}
              </button>
            </div>

            <label htmlFor="signup-confirm-password">Confirm password</label>
            <div
              className={`tm-input-wrap ${
                passwordMatch === false
                  ? 'tm-input-error'
                  : passwordMatch === true
                  ? 'tm-input-success'
                  : ''
              }`}
            >
              <input
                id="signup-confirm-password"
                type={showSuConfirmPass ? 'text' : 'password'}
                placeholder="Re-enter password"
                autoComplete="new-password"
                value={suForm.confirmPassword}
                onChange={e =>
                  setSuForm(prev => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
              />
              <button
                type="button"
                className="tm-eye-btn"
                onClick={() => setShowSuConfirmPass(v => !v)}
                aria-label={showSuConfirmPass ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showSuConfirmPass ? 'Hide' : 'Show'}
              </button>
            </div>

            {passwordMatch === false && (
              <p className="tm-inline-note error">Passwords do not match.</p>
            )}
            {passwordMatch === true && (
              <p className="tm-inline-note success">Passwords match.</p>
            )}

            {suError && <p className="tm-form-message error">{suError}</p>}
            {suSuccess && <p className="tm-form-message success">{suSuccess}</p>}

            <button type="submit" className="tm-login-btn">Create Account</button>
          </form>
        </div>

        <div className="tm-overlay-container">
          <div className="tm-overlay">
            <div className="tm-overlay-panel tm-overlay-left">
              <div className="tm-overlay-logo">
                <div className="tm-logo-cross">✚</div>
                <div>
                  <h1>TrustMedAI</h1>
                  <p>Smart care. Secure access.</p>
                </div>
              </div>

              <div className="tm-overlay-body">
                <h2>Already part of our network?</h2>
                <p>
                  Sign in to access your dashboard, patient intelligence tools,
                  and secure clinical workflows.
                </p>
                <ul className="tm-overlay-list">
                  <li>AI-assisted diagnostic support</li>
                  <li>Real-time health insights</li>
                  <li>Secure and scalable infrastructure</li>
                </ul>
              </div>

              <button className="tm-ghost-btn" id="signIn" onClick={goSignIn}>
                ← Back to Sign In
              </button>

              <div className="tm-ecg">
                <svg viewBox="0 0 500 70" preserveAspectRatio="none">
                  <path d="M0 42 L70 42 L95 42 L112 20 L135 60 L160 10 L188 52 L220 42 L500 42" pathLength="100" />
                </svg>
              </div>
            </div>

            <div className="tm-overlay-panel tm-overlay-right">
              <div className="tm-overlay-logo">
                <div className="tm-logo-cross">✚</div>
                <div>
                  <h1>TrustMedAI</h1>
                  <p>Smart care. Secure access.</p>
                </div>
              </div>

              <div className="tm-overlay-body">
                <h2>Welcome to healthcare intelligence</h2>
                <p>
                  Join hospitals and clinicians using TrustMedAI to deliver
                  smarter, faster, and safer digital healthcare experiences.
                </p>

                <div className="tm-overlay-stats">
                  <div className="tm-stat-box">
                    <span className="tm-count" data-target="12400">0</span>
                    <small>Patients served</small>
                  </div>
                  <div className="tm-stat-box">
                    <span className="tm-count" data-target="340">0</span>
                    <small>Hospitals</small>
                  </div>
                  <div className="tm-stat-box">
                    <span className="tm-count" data-target="98">0</span>
                    <small>Accuracy %</small>
                  </div>
                </div>
              </div>

              <button className="tm-ghost-btn" id="signUp" onClick={goSignUp}>
                Create Account →
              </button>

              <div className="tm-ecg">
                <svg viewBox="0 0 500 70" preserveAspectRatio="none">
                  <path d="M0 42 L70 42 L95 42 L112 20 L135 60 L160 10 L188 52 L220 42 L500 42" pathLength="100" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {forgotModalOpen && (
        <div className="tm-forgot-modal-backdrop" onClick={closeForgotModal}>
          <div
            className="tm-forgot-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="tm-forgot-close"
              onClick={closeForgotModal}
              aria-label="Close forgot password modal"
            >
              ✕
            </button>

            <div className="tm-forgot-head">
              <p className="tm-forgot-eyebrow">Account Recovery</p>

              {currentStep === 1 && (
                <>
                  <h3>Forgot Password</h3>
                  <p>Enter your registered email address to receive a verification code.</p>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <h3>Verify OTP</h3>
                  <p>Enter the 6-digit verification code sent to your email.</p>
                </>
              )}

              {currentStep === 3 && !successMessage && (
                <>
                  <h3>Reset Password</h3>
                  <p>Create a new password for your TrustMedAI account.</p>
                </>
              )}

              {successMessage && (
                <>
                  <h3>Password Reset Successfully</h3>
                  <p>Your password has been updated successfully.</p>
                </>
              )}
            </div>

            <div className="tm-forgot-steps">
              <span className={currentStep >= 1 ? 'active' : ''}>1</span>
              <span className={currentStep >= 2 ? 'active' : ''}>2</span>
              <span className={currentStep >= 3 ? 'active' : ''}>3</span>
            </div>

            {errorMessage && (
              <p className="tm-form-message error tm-forgot-msg">{errorMessage}</p>
            )}

            {successMessage ? (
              <div className="tm-forgot-success-wrap">
                <div className="tm-success-ring">✓</div>
                <p className="tm-form-message success tm-forgot-msg">
                  {successMessage}
                </p>
                <button
                  type="button"
                  className="tm-login-btn"
                  onClick={closeForgotModal}
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <>
                {currentStep === 1 && (
                  <form className="tm-forgot-form" onSubmit={handleForgotPassword}>
                    <label htmlFor="forgot-email">Email</label>
                    <div className="tm-input-wrap">
                      <input
                        id="forgot-email"
                        type="email"
                        placeholder="Enter your registered email"
                        autoComplete="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      className="tm-login-btn"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="tm-btn-loader" />
                      ) : (
                        'Send OTP'
                      )}
                    </button>
                  </form>
                )}

                {currentStep === 2 && (
                  <form className="tm-forgot-form" onSubmit={handleVerifyOtp}>
                    <label htmlFor="forgot-otp">OTP</label>
                    <div className="tm-input-wrap">
                      <input
                        id="forgot-otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      />
                    </div>

                    <div className="tm-forgot-actions">
                      <button
                        type="button"
                        className="tm-forgot-back-btn"
                        onClick={() => {
                          setCurrentStep(1)
                          setErrorMessage('')
                        }}
                        disabled={loading}
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        className="tm-login-btn"
                        disabled={loading}
                      >
                        {loading ? <span className="tm-btn-loader" /> : 'Verify OTP'}
                      </button>
                    </div>
                  </form>
                )}

                {currentStep === 3 && (
                  <form className="tm-forgot-form" onSubmit={handleResetPassword}>
                    <label htmlFor="forgot-new-password">New Password</label>
                    <div className="tm-input-wrap">
                      <input
                        id="forgot-new-password"
                        type={showForgotNewPass ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="tm-eye-btn"
                        onClick={() => setShowForgotNewPass(v => !v)}
                      >
                        {showForgotNewPass ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    <label htmlFor="forgot-confirm-password">Confirm Password</label>
                    <div
                      className={`tm-input-wrap ${
                        forgotPasswordMatch === false
                          ? 'tm-input-error'
                          : forgotPasswordMatch === true
                          ? 'tm-input-success'
                          : ''
                      }`}
                    >
                      <input
                        id="forgot-confirm-password"
                        type={showForgotConfirmPass ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="tm-eye-btn"
                        onClick={() => setShowForgotConfirmPass(v => !v)}
                      >
                        {showForgotConfirmPass ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    {forgotPasswordMatch === false && (
                      <p className="tm-inline-note error">Passwords do not match.</p>
                    )}
                    {forgotPasswordMatch === true && (
                      <p className="tm-inline-note success">Passwords match.</p>
                    )}

                    <p className="tm-forgot-hint">
                      Password must be at least 8 characters long.
                    </p>

                    <div className="tm-forgot-actions">
                      <button
                        type="button"
                        className="tm-forgot-back-btn"
                        onClick={() => {
                          setCurrentStep(2)
                          setErrorMessage('')
                        }}
                        disabled={loading}
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        className="tm-login-btn"
                        disabled={loading}
                      >
                        {loading ? <span className="tm-btn-loader" /> : 'Reset Password'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
