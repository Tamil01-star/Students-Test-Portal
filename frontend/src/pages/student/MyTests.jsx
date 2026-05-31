import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'

const statusConfig = {
  active:    { label: '● LIVE',      bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  upcoming:  { label: '⏳ Upcoming', bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
  completed: { label: '✓ Completed', bg: '#f3f4f6', color: '#4b5563', border: '#e5e7eb' },
  expired:   { label: '✕ Expired',   bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
}

export default function MyTests() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/student/tests').then(r => setTests(r.data.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? tests : tests.filter(t => t.status === filter)

  return (
    <DashboardLayout title="My Tests">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['all', 'active', 'upcoming', 'completed', 'expired'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 500, transition: 'all 0.2s',
                background: filter === f ? '#1e3a5f' : '#f3f4f6',
                color: filter === f ? '#fff' : '#6b7280',
              }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'all' ? ` (${tests.length})` : ` (${tests.filter(t => t.status === f).length})`}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: 60, textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>📋</div>
            <h3 style={{ color: '#374151', marginBottom: 8 }}>No tests found</h3>
            <p style={{ color: '#9ca3af', fontSize: 14 }}>
              {filter === 'all' ? 'You have no tests assigned yet.' : `No ${filter} tests at the moment.`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(t => {
              const sc = statusConfig[t.status] || statusConfig.upcoming
              return (
                <div key={t.id} style={{
                  background: '#fff', borderRadius: 14, padding: '20px 24px',
                  border: `1.5px solid ${t.status === 'active' ? '#10b981' : '#e5e7eb'}`,
                  boxShadow: t.status === 'active' ? '0 4px 20px rgba(16,185,129,0.12)' : '0 2px 8px rgba(30,58,95,0.04)',
                  display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
                }}>
                  {/* Status bar */}
                  <div style={{ width: 4, height: 60, borderRadius: 4, background: sc.color, flexShrink: 0 }} />

                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e3a5f' }}>{t.title}</h3>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                        {sc.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, color: '#6b7280', fontSize: 13, flexWrap: 'wrap' }}>
                      <span>📚 {t.subject}</span>
                      <span>📅 {new Date(t.scheduled_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span>⏰ {t.start_time} – {t.end_time}</span>
                      {t.total_questions > 0 && <span>❓ {t.total_questions} Qs</span>}
                    </div>
                    {t.status === 'completed' && t.score !== null && (
                      <div style={{ marginTop: 8, display: 'flex', gap: 14 }}>
                        <span style={{ fontSize: 13, color: '#374151' }}>
                          Score: <strong style={{ color: '#1e3a5f' }}>{t.score}/{t.total_marks}</strong>
                        </span>
                        <span style={{
                          fontSize: 13, fontWeight: 700,
                          color: (t.score / t.total_marks * 100) >= 40 ? '#10b981' : '#ef4444'
                        }}>
                          {t.total_marks > 0 ? Math.round((t.score / t.total_marks) * 100) : 0}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div>
                    {t.status === 'active' && !t.is_submitted && (
                      <Link to={`/student/tests/${t.id}/attend`} style={{
                        padding: '11px 24px', borderRadius: 10, background: '#10b981', color: '#fff',
                        fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
                        boxShadow: '0 4px 12px rgba(16,185,129,0.3)', display: 'block',
                      }}>Attend Now →</Link>
                    )}
                    {t.status === 'completed' && (
                      <Link to="/student/results" style={{
                        padding: '10px 20px', borderRadius: 10, background: '#f0f4ff', color: '#1e3a5f',
                        fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', border: '1.5px solid #dbeafe', display: 'block',
                      }}>View Score</Link>
                    )}
                    {t.status === 'upcoming' && (
                      <div style={{ padding: '10px 18px', borderRadius: 10, background: '#f9fafb', color: '#9ca3af', fontSize: 13, border: '1.5px solid #e5e7eb', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        Not started
                      </div>
                    )}
                    {t.status === 'expired' && !t.is_submitted && (
                      <div style={{ padding: '10px 18px', borderRadius: 10, background: '#fee2e2', color: '#991b1b', fontSize: 13, border: '1.5px solid #fca5a5', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        Missed
                      </div>
                    )}
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
