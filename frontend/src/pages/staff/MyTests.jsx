import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'

export default function MyTests() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/staff/tests').then(r => setTests(r.data.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const getStatus = (t) => {
    const today = new Date().toISOString().split('T')[0]
    const testDate = new Date(t.scheduled_date).toISOString().split('T')[0]
    if (testDate > today) return { label: 'Upcoming', color: '#3b82f6', bg: '#dbeafe' }
    if (testDate === today) return { label: 'Today', color: '#10b981', bg: '#d1fae5' }
    return { label: 'Completed', color: '#6b7280', bg: '#f3f4f6' }
  }

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
    </DashboardLayout>
  )
}
