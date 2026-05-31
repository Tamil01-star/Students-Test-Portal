import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdVisibility, MdVisibilityOff, MdLock, MdBadge } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function LoginPage() {
  const [form, setForm] = useState({ user_id: '', password: '', rememberMe: false })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.user_id.trim() || !form.password) {
      setError('Please enter your User ID and password.')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { user_id: form.user_id.trim(), password: form.password })
      const { token, user } = res.data
      login(token, user)

      if (!user.password_changed) {
        navigate('/change-password')
      } else if (user.role === 'management') {
        navigate('/management/dashboard')
      } else if (user.role === 'staff') {
        navigate('/staff/dashboard')
      } else {
        navigate('/student/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr',
      fontFamily: 'Inter, Poppins, sans-serif',
    }}>
      {/* Left Panel */}
      <div style={{
        background: 'linear-gradient(145deg, #0d1b2a 0%, #1e3a5f 50%, #2d5a9e 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '60px 48px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.1)', top: -100, right: -100 }} />
        <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.08)', bottom: 40, left: -60 }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎓</div>
          <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 800, fontFamily: 'Poppins', marginBottom: 12 }}>
            Classic Exam<br /><span style={{ color: '#c9a84c' }}>Portal</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.7, maxWidth: 320 }}>
            "Education is the most powerful weapon which you can use to change the world."
          </p>
          <div style={{ marginTop: 16, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>— Nelson Mandela</div>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 40 }}>
            {['🔒 Secure JWT Authentication', '🖥️ Anti-Cheat Fullscreen Mode', '📊 Instant Result Calculation'].map(t => (
              <div key={t} style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, padding: '10px 18px', color: 'rgba(255,255,255,0.75)', fontSize: 13, textAlign: 'left',
              }}>{t}</div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div style={{
        background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 48px',
      }}>
        <motion.div
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          <div style={{ marginBottom: 36 }}>
            <Link to="/" style={{ color: '#6b7280', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 28 }}>
              ← Back to Home
            </Link>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e3a5f', fontFamily: 'Poppins', marginBottom: 6 }}>Welcome Back</h2>
            <p style={{ color: '#6b7280', fontSize: 14 }}>Sign in to your examination portal account</p>
          </div>

          {error && (
            <div style={{
              background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10,
              padding: '12px 16px', color: '#991b1b', fontSize: 14, marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {/* User ID */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                User ID / Register Number
              </label>
              <div style={{ position: 'relative' }}>
                <MdBadge style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 18 }} />
                <input
                  id="login-userid"
                  type="text"
                  value={form.user_id}
                  onChange={e => setForm({ ...form, user_id: e.target.value })}
                  placeholder="e.g. STF001, REG2024001, MGMT001"
                  style={{
                    width: '100%', padding: '12px 14px 12px 40px', borderRadius: 10,
                    border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none',
                    fontFamily: 'Inter', background: '#fff',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1e3a5f'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <MdLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 18 }} />
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  style={{
                    width: '100%', padding: '12px 44px 12px 40px', borderRadius: 10,
                    border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none',
                    fontFamily: 'Inter', background: '#fff', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1e3a5f'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
                }}>
                  {showPw ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <input
                id="remember-me"
                type="checkbox"
                checked={form.rememberMe}
                onChange={e => setForm({ ...form, rememberMe: e.target.checked })}
                style={{ width: 16, height: 16, accentColor: '#1e3a5f', cursor: 'pointer' }}
              />
              <label htmlFor="remember-me" style={{ fontSize: 13, color: '#6b7280', cursor: 'pointer' }}>Remember me</label>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #1e3a5f, #2d5a9e)',
                color: '#fff', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Signing in...
                </>
              ) : 'Sign In →'}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>

          <div style={{
            marginTop: 28, padding: '16px', borderRadius: 10,
            background: '#f0f4ff', border: '1px solid #dbeafe',
          }}>
            <p style={{ fontSize: 12, color: '#1e40af', fontWeight: 500, marginBottom: 6 }}>🔑 Default Management Login:</p>
            <p style={{ fontSize: 12, color: '#374151' }}>User ID: <strong>MGMT001</strong> | Password: <strong>Admin@1234</strong></p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
