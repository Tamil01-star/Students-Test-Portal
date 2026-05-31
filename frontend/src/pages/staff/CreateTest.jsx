import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'

export default function CreateTest() {
  const [form, setForm] = useState({ title: '', subject: '', scheduled_date: '', start_time: '', end_time: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title || !form.subject || !form.scheduled_date || !form.start_time || !form.end_time) {
      setError('All fields are required.'); return
    }
    if (form.start_time >= form.end_time) { setError('End time must be after start time.'); return }
    setLoading(true)
    try {
      const res = await api.post('/staff/create-test', form)
      navigate(`/staff/tests/${res.data.data.id}/questions`)
    } catch (err) { setError(err.response?.data?.message || 'Failed to create test.') }
    finally { setLoading(false) }
  }

  const inp = {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none',
    fontFamily: 'Inter', background: '#fff', transition: 'border-color 0.2s',
  }

  return (
    <DashboardLayout title="Create Test">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: 18, padding: 36, boxShadow: '0 4px 20px rgba(30,58,95,0.08)', border: '1px solid #f0f0f0' }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f', fontFamily: 'Poppins' }}>📝 Create New Test</h2>
            <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>After creation, you can add questions and enroll students.</p>
          </div>

          {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#991b1b', fontSize: 13, marginBottom: 20 }}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Test Title *</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Mid-Semester Examination - CS101" style={inp}
                onFocus={e => e.target.style.borderColor = '#1e3a5f'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Subject *</label>
              <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Computer Science, Mathematics" style={inp}
                onFocus={e => e.target.style.borderColor = '#1e3a5f'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Scheduled Date *</label>
              <input type="date" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]} style={inp}
                onFocus={e => e.target.style.borderColor = '#1e3a5f'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
              {[['Start Time *', 'start_time'], ['End Time *', 'end_time']].map(([label, key]) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{label}</label>
                  <input type="time" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    style={inp} onFocus={e => e.target.style.borderColor = '#1e3a5f'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>
              ))}
            </div>

            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#0369a1' }}>
              💡 After creating the test, you'll be redirected to add questions.
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" disabled={loading} style={{
                flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #1e3a5f, #2d5a9e)',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Poppins',
              }}>{loading ? 'Creating...' : 'Create Test & Add Questions →'}</button>
              <button type="button" onClick={() => navigate('/staff/tests')}
                style={{ padding: '12px 20px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
