import { useState } from 'react'
import { motion } from 'framer-motion'
import { MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdBadge, MdShield } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/DashboardLayout'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()

  // Profile fields state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })
  const [profileLoading, setProfileLoading] = useState(false)

  // Password fields state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Password strength logic
  const getStrength = (pw) => {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/\d/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }
  const strength = getStrength(passwordForm.new_password)
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['', '#ef4444', '#f59e0b', '#10b981', '#059669']

  // Handlers
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    if (!profileForm.name.trim()) {
      toast.error('Name is required.')
      return
    }
    setProfileLoading(true)
    try {
      const res = await api.post('/auth/update-profile', profileForm)
      updateUser(res.data.user, res.data.token)
      toast.success('Profile details updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile details.')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!passwordForm.new_password || !passwordForm.confirm_password) {
      toast.error('New password and confirmation are required.')
      return
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Passwords do not match.')
      return
    }
    if (!/(?=.*[A-Z])(?=.*\d).{8,}/.test(passwordForm.new_password)) {
      toast.error('Password must be 8+ characters with at least one uppercase and one number.')
      return
    }

    setPasswordLoading(true)
    try {
      const res = await api.post('/auth/change-password', passwordForm)
      updateUser(res.data.user, res.data.token)
      toast.success('Password updated successfully!')
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px 12px 40px', borderRadius: 10,
    border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none',
    fontFamily: 'Inter', background: '#fff', transition: 'border-color 0.2s',
  }

  const inputStyleWithEye = {
    width: '100%', padding: '12px 44px 12px 40px', borderRadius: 10,
    border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none',
    fontFamily: 'Inter', background: '#fff', transition: 'border-color 0.2s',
  }

  return (
    <DashboardLayout title="My Profile">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1000, margin: '0 auto' }}>
        
        {/* Welcome Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a9e 100%)',
            borderRadius: 18, padding: '30px', color: '#fff',
            display: 'flex', alignItems: 'center', gap: 24,
            boxShadow: '0 8px 25px rgba(30,58,95,0.15)',
          }}
        >
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, flexShrink: 0,
          }}>
            👤
          </div>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Poppins', marginBottom: 4 }}>{user?.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{
                background: 'rgba(255,255,255,0.2)', padding: '3px 10px', 
                borderRadius: 12, fontSize: 12, fontWeight: 600, textTransform: 'capitalize'
              }}>
                {user?.role}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                User ID: <strong>{user?.user_id}</strong>
              </span>
              {user?.email && (
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                  • {user?.email}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Edit Fields Forms */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          
          {/* Profile Details Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: '#fff', borderRadius: 16, padding: '28px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: '#1e3a5f15',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a5f',
              }}>
                <MdPerson size={22} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e3a5f', fontFamily: 'Poppins' }}>Profile Details</h3>
            </div>

            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <MdBadge style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 18 }} />
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    style={inputStyle}
                    placeholder="Enter your full name"
                    onFocus={e => e.target.style.borderColor = '#1e3a5f'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <MdEmail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 18 }} />
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. name@college.edu"
                    onFocus={e => e.target.style.borderColor = '#1e3a5f'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              {/* User ID (Disabled) */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>User ID (Non-editable)</label>
                <div style={{ position: 'relative' }}>
                  <MdBadge style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 18 }} />
                  <input
                    type="text"
                    value={user?.user_id || ''}
                    disabled
                    style={{ ...inputStyle, background: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              {/* Role (Disabled) */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>Role (Non-editable)</label>
                <div style={{ position: 'relative' }}>
                  <MdShield style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 18 }} />
                  <input
                    type="text"
                    value={user?.role || ''}
                    disabled
                    style={{ ...inputStyle, background: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed', textTransform: 'capitalize' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                style={{
                  marginTop: 8, padding: '12px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #1e3a5f, #2d5a9e)',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: profileLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Poppins', transition: 'opacity 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                {profileLoading ? 'Saving...' : 'Save Profile Details'}
              </button>
            </form>
          </motion.div>

          {/* Change Password Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: '#fff', borderRadius: 16, padding: '28px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: '#c9a84c15',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9a84c',
              }}>
                <MdLock size={22} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e3a5f', fontFamily: 'Poppins' }}>Change Password</h3>
            </div>

            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Current Password (if already changed password) */}
              {user?.password_changed && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <MdLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 18 }} />
                    <input
                      type={showPw.current ? 'text' : 'password'}
                      value={passwordForm.current_password}
                      onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      style={inputStyleWithEye}
                      placeholder="Enter current password"
                      onFocus={e => e.target.style.borderColor = '#1e3a5f'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                    <button type="button" onClick={() => setShowPw(s => ({ ...s, current: !s.current }))} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
                    }}>
                      {showPw.current ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {/* New Password */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <MdLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 18 }} />
                  <input
                    type={showPw.new ? 'text' : 'password'}
                    value={passwordForm.new_password}
                    onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    style={inputStyleWithEye}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    onFocus={e => e.target.style.borderColor = '#1e3a5f'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <button type="button" onClick={() => setShowPw(s => ({ ...s, new: !s.new }))} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
                  }}>
                    {showPw.new ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {passwordForm.new_password && (
                <div style={{ marginTop: -8 }}>
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
                    {strengthLabels[strength]} Password
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <MdLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 18 }} />
                  <input
                    type={showPw.confirm ? 'text' : 'password'}
                    value={passwordForm.confirm_password}
                    onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    style={{
                      ...inputStyleWithEye,
                      borderColor: passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password ? '#ef4444' : '#e5e7eb'
                    }}
                    placeholder="Re-enter new password"
                    onFocus={e => e.target.style.borderColor = '#1e3a5f'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <button type="button" onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
                  }}>
                    {showPw.confirm ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                style={{
                  marginTop: 8, padding: '12px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #c9a84c, #e8c96d)',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: passwordLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Poppins', transition: 'opacity 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
