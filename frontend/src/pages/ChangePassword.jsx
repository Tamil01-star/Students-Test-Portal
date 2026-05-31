import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdVisibility, MdVisibilityOff, MdLock } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function ChangePassword() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const isFirstTime = !user?.password_changed
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const getStrength = (pw) => {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/\d/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }
  const strength = getStrength(form.new_password)
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['', '#ef4444', '#f59e0b', '#10b981', '#059669']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.new_password !== form.confirm_password) { setError('Passwords do not match.'); return }
    if (!/(?=.*[A-Z])(?=.*\d).{8,}/.test(form.new_password)) {
      setError('Password must be 8+ characters with at least one uppercase and one number.')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/change-password', form)
      updateUser(res.data.user, res.data.token)
      setSuccess('Password changed successfully! Redirecting...')
      setTimeout(() => {
        const role = res.data.user.role
        navigate(role === 'management' ? '/management/dashboard' : role === 'staff' ? '/staff/dashboard' : '/student/dashboard')
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 44px 12px 40px', borderRadius: 10,
    border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none',
    fontFamily: 'Inter', background: '#fff', transition: 'border-color 0.2s',
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0d1b2a, #1e3a5f)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '44px 40px',
        width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🔐</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e3a5f', fontFamily: 'Poppins', marginBottom: 8 }}>
            {isFirstTime ? 'Set Your Password' : 'Change Password'}
          </h2>
          {isFirstTime && (
            <div style={{
              background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 10,
              padding: '10px 14px', color: '#92400e', fontSize: 13, marginTop: 12,
            }}>
              ⚠️ This is your first login. You must set a new password to continue.
            </div>
          )}
        </div>

        {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#991b1b', fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}
        {success && <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 10, padding: '10px 14px', color: '#065f46', fontSize: 13, marginBottom: 16 }}>✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          {!isFirstTime && (
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Current Password</label>
              <div style={{ position: 'relative' }}>
                <MdLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 18 }} />
                <input type={show.current ? 'text' : 'password'} value={form.current_password}
                  onChange={e => setForm({ ...form, current_password: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#1e3a5f'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                <button type="button" onClick={() => setShow(s => ({ ...s, current: !s.current }))}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  {show.current ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <MdLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 18 }} />
              <input type={show.new ? 'text' : 'password'} value={form.new_password}
                onChange={e => setForm({ ...form, new_password: e.target.value })}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#1e3a5f'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              <button type="button" onClick={() => setShow(s => ({ ...s, new: !s.new }))}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                {show.new ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
              </button>
            </div>
          </div>

          {/* Password Strength */}
          {form.new_password && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[1, 2, 3, 4].map(s => (
                  <div key={s} style={{
                    flex: 1, height: 4, borderRadius: 2,
                    background: s <= strength ? strengthColors[strength] : '#e5e7eb',
                    transition: 'background 0.3s',
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 12, color: strengthColors[strength], fontWeight: 500 }}>
                {strengthLabels[strength]}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <MdLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 18 }} />
              <input type={show.confirm ? 'text' : 'password'} value={form.confirm_password}
                onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                placeholder="Re-enter new password"
                style={{
                  ...inputStyle,
                  borderColor: form.confirm_password && form.new_password !== form.confirm_password ? '#ef4444' : '#e5e7eb',
                }}
                onFocus={e => e.target.style.borderColor = '#1e3a5f'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                {show.confirm ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: 10, border: 'none',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #1e3a5f, #2d5a9e)',
              color: '#fff', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
