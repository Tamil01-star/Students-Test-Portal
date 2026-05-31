import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'

export default function EnrollStudents() {
  const { test_id } = useParams()
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [enrolled, setEnrolled] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    Promise.all([api.get('/staff/students'), api.get(`/staff/tests/${test_id}/enrolled`)])
      .then(([s, e]) => {
        setStudents(s.data.data)
        const enrolledIds = new Set(e.data.data.map(x => x.id))
        setEnrolled(enrolledIds)
        setSelected(new Set(enrolledIds))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [test_id])

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const selectAll = () => setSelected(new Set(filtered.map(s => s.id)))
  const clearAll = () => setSelected(new Set())

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.post(`/staff/tests/${test_id}/enroll`, { student_ids: [...selected] })
      setSuccess(true)
      setTimeout(() => navigate('/staff/tests'), 1500)
    } catch (e) { alert(e.response?.data?.message || 'Failed to save enrollment.') }
    finally { setSaving(false) }
  }

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.user_id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout title="Enroll Students">
      {loading ? <LoadingSpinner /> : (
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {success && (
            <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 12, padding: 16, color: '#065f46', fontWeight: 500, textAlign: 'center' }}>
              ✅ {selected.size} student(s) enrolled successfully! Redirecting...
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(30,58,95,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', fontFamily: 'Poppins' }}>Select Students to Enroll</h3>
                <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>{selected.size} of {students.length} students selected</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={selectAll} style={{ padding: '7px 14px', borderRadius: 8, border: '1.5px solid #1e3a5f', background: '#f0f4ff', color: '#1e3a5f', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>Select All</button>
                <button onClick={clearAll} style={{ padding: '7px 14px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280', fontSize: 13, cursor: 'pointer' }}>Clear</button>
              </div>
            </div>

            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search students..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', marginBottom: 16, fontFamily: 'Inter' }} />

            <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>No students found</div>
              ) : filtered.map(s => (
                <label key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                  borderRadius: 10, border: `1.5px solid ${selected.has(s.id) ? '#1e3a5f' : '#e5e7eb'}`,
                  background: selected.has(s.id) ? '#f0f4ff' : '#fff',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)}
                    style={{ width: 17, height: 17, accentColor: '#1e3a5f', cursor: 'pointer' }} />
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: selected.has(s.id) ? '#1e3a5f' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: selected.has(s.id) ? '#fff' : '#9ca3af', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#1f2937' }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{s.user_id}</div>
                  </div>
                  {enrolled.has(s.id) && (
                    <span style={{ marginLeft: 'auto', fontSize: 11, background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: 12, fontWeight: 500 }}>Already enrolled</span>
                  )}
                </label>
              ))}
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f3f4f6', display: 'flex', gap: 12 }}>
              <button onClick={handleSave} disabled={saving || selected.size === 0} style={{
                flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                background: (saving || selected.size === 0) ? '#9ca3af' : '#1e3a5f',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: (saving || selected.size === 0) ? 'not-allowed' : 'pointer', fontFamily: 'Poppins',
              }}>{saving ? 'Saving...' : `Enroll ${selected.size} Student(s)`}</button>
              <button onClick={() => navigate('/staff/tests')} style={{ padding: '12px 20px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
