import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'

export default function CreateStaff() {
  const [form, setForm] = useState({ name: '', email: '', staff_id: '', temp_password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.staff_id || !form.temp_password) { setError('Name, Staff ID, and password are required.'); return }
    setLoading(true)
    try {
      const res = await api.post('/management/create-staff', form)
      setSuccess({ staffId: form.staff_id, name: form.name })
      setForm({ name: '', email: '', staff_id: '', temp_password: '' })
    } catch (err) { setError(err.response?.data?.message || 'Failed to create staff.') }
    finally { setLoading(false) }
  }

  const inp = {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none',
    fontFamily: 'Inter', background: '#fff', transition: 'border-color 0.2s',
  }

  return (
    <DashboardLayout title="Create Staff Account">
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: 18, padding: 36, boxShadow: '0 4px 20px rgba(30,58,95,0.08)', border: '1px solid #f0f0f0' }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f', fontFamily: 'Poppins' }}>Create Staff Account</h2>
            <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Staff will be required to change their password on first login.</p>
          </div>

          {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#991b1b', fontSize: 13, marginBottom: 20 }}>⚠️ {error}</div>}

          {success && (
            <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 14, padding: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>✅</div>
              <div style={{ fontWeight: 600, color: '#065f46', marginBottom: 6 }}>Staff account created successfully!</div>
              <div style={{ fontSize: 13, color: '#047857' }}>
                <strong>Staff ID:</strong> <code style={{ background: '#fff', padding: '2px 8px', borderRadius: 6, fontSize: 14, fontWeight: 700 }}>{success.staffId}</code>
              </div>
              <div style={{ fontSize: 13, color: '#047857', marginTop: 4 }}><strong>Name:</strong> {success.name}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>Share the Staff ID and temporary password with the staff member.</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'e.g. Dr. Rajesh Kumar' },
              { label: 'Email Address', key: 'email', type: 'email', placeholder: 'staff@college.edu (optional)' },
              { label: 'Staff ID *', key: 'staff_id', type: 'text', placeholder: 'e.g. STF001, STF002' },
              { label: 'Temporary Password *', key: 'temp_password', type: 'password', placeholder: 'Temporary password for first login' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={inp}
                  onFocus={e => e.target.style.borderColor = '#1e3a5f'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>
            ))}

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="submit" disabled={loading} style={{
                flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #1e3a5f, #2d5a9e)',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Poppins',
              }}>{loading ? 'Creating...' : 'Create Staff Account'}</button>
              <button type="button" onClick={() => navigate('/management/staff-list')}
                style={{ padding: '12px 20px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 14, cursor: 'pointer' }}>
                View Staff List
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
