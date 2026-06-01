import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'

export default function MyTests() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Edit test state
  const [editingTest, setEditingTest] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', subject: '', scheduled_date: '', start_time: '', end_time: '' })
  const [updating, setUpdating] = useState(false)
  const [editError, setEditError] = useState('')

  const fetchTests = () => {
    setLoading(true)
    api.get('/staff/tests').then(r => setTests(r.data.data)).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { fetchTests() }, [])

  const getStatus = (t) => {
    const today = new Date().toISOString().split('T')[0]
    const testDate = new Date(t.scheduled_date).toISOString().split('T')[0]
    if (testDate > today) return { label: 'Upcoming', color: '#3b82f6', bg: '#dbeafe' }
    if (testDate === today) return { label: 'Today', color: '#10b981', bg: '#d1fae5' }
    return { label: 'Completed', color: '#6b7280', bg: '#f3f4f6' }
  }

  const openEditModal = (t) => {
    setEditError('')
    setEditingTest(t.id)
    setEditForm({
      title: t.title,
      subject: t.subject,
      scheduled_date: new Date(t.scheduled_date).toISOString().split('T')[0],
      start_time: t.start_time,
      end_time: t.end_time
    })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setEditError('')
    if (!editForm.title || !editForm.subject || !editForm.scheduled_date || !editForm.start_time || !editForm.end_time) {
      setEditError('All fields are required.'); return
    }
    if (editForm.start_time >= editForm.end_time) { setEditError('End time must be after start time.'); return }
    setUpdating(true)
    try {
      await api.put(`/staff/tests/${editingTest}`, editForm)
      setEditingTest(null)
      fetchTests()
    } catch (err) { setEditError(err.response?.data?.message || 'Failed to update test.') }
    finally { setUpdating(false) }
  }

  const inp = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', fontFamily: 'Inter', background: '#fff' }

  return (
    <DashboardLayout title="My Tests">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', fontFamily: 'Poppins' }}>My Tests</h2>
            <p style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>{tests.length} tests created</p>
          </div>
          <Link to="/staff/create-test" style={{
            padding: '10px 20px', borderRadius: 10, background: '#1e3a5f', color: '#fff', fontSize: 14, fontWeight: 500,
          }}>+ Create New Test</Link>
        </div>

        {loading ? <LoadingSpinner /> : tests.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: 60, textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>📋</div>
            <h3 style={{ color: '#374151', marginBottom: 8 }}>No tests yet</h3>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 20 }}>Create your first examination to get started.</p>
            <Link to="/staff/create-test" style={{ padding: '11px 24px', borderRadius: 10, background: '#1e3a5f', color: '#fff', fontSize: 14, fontWeight: 500 }}>Create First Test</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {tests.map((t) => {
              const st = getStatus(t)
              return (
                <div key={t.id} style={{
                  background: '#fff', borderRadius: 14, padding: '20px 24px',
                  border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(30,58,95,0.05)',
                  display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
                }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e3a5f' }}>{t.title}</h3>
                      <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, color: '#6b7280', fontSize: 13 }}>
                      <span>📚 {t.subject}</span>
                      <span>📅 {new Date(t.scheduled_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span>⏰ {t.start_time} – {t.end_time}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>❓ {t.question_count} questions</span>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>👥 {t.enrolled_count} enrolled</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => openEditModal(t)} style={{
                      padding: '8px 14px', borderRadius: 8, background: '#f3f4f6', color: '#374151', fontSize: 13, fontWeight: 500, border: '1px solid #e5e7eb', cursor: 'pointer'
                    }}>⚙️ Edit</button>
                    <Link to={`/staff/tests/${t.id}/questions`} style={{
                      padding: '8px 14px', borderRadius: 8, background: '#f0f4ff', color: '#1e3a5f', fontSize: 13, fontWeight: 500, border: '1px solid #dbeafe',
                    }}>📝 Questions</Link>
                    <Link to={`/staff/tests/${t.id}/enroll`} style={{
                      padding: '8px 14px', borderRadius: 8, background: '#fffbeb', color: '#92400e', fontSize: 13, fontWeight: 500, border: '1px solid #fde68a',
                    }}>👥 Enroll</Link>
                    <Link to={`/staff/results`} style={{
                      padding: '8px 14px', borderRadius: 8, background: '#f0fdf4', color: '#065f46', fontSize: 13, fontWeight: 500, border: '1px solid #bbf7d0',
                    }}>📊 Results</Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {editingTest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 500, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e3a5f', marginBottom: 20 }}>Edit Test Details</h3>
            {editError && <div style={{ background: '#fee2e2', borderRadius: 8, padding: '10px', color: '#991b1b', fontSize: 13, marginBottom: 16 }}>⚠️ {editError}</div>}
            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Test Title</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} style={inp} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Subject</label>
                <input type="text" value={editForm.subject} onChange={e => setEditForm({ ...editForm, subject: e.target.value })} style={inp} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Scheduled Date</label>
                <input type="date" value={editForm.scheduled_date} onChange={e => setEditForm({ ...editForm, scheduled_date: e.target.value })} style={inp} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Start Time</label>
                  <input type="time" value={editForm.start_time} onChange={e => setEditForm({ ...editForm, start_time: e.target.value })} style={inp} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>End Time</label>
                  <input type="time" value={editForm.end_time} onChange={e => setEditForm({ ...editForm, end_time: e.target.value })} style={inp} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={updating} style={{ flex: 1, padding: '12px', borderRadius: 8, background: updating ? '#9ca3af' : '#1e3a5f', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: updating ? 'not-allowed' : 'pointer' }}>
                  {updating ? 'Updating...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditingTest(null)} style={{ padding: '12px 20px', borderRadius: 8, background: '#f3f4f6', color: '#374151', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
