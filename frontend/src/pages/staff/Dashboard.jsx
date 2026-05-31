import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function StaffDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/staff/stats'), api.get('/staff/tests')])
      .then(([s, t]) => { setStats(s.data.data); setTests(t.data.data.slice(0, 5)) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const getStatus = (t) => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const testDate = new Date(t.scheduled_date).toISOString().split('T')[0]
    if (testDate > today) return { label: 'Upcoming', color: '#3b82f6', bg: '#dbeafe' }
    if (testDate === today) return { label: 'Today', color: '#10b981', bg: '#d1fae5' }
    return { label: 'Past', color: '#6b7280', bg: '#f3f4f6' }
  }

  return (
    <DashboardLayout title="Staff Dashboard">
      {loading ? <LoadingSpinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Welcome */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a9e 100%)',
              borderRadius: 18, padding: '32px 36px', color: '#fff',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
            <div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Good day,</div>
              <h2 style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Poppins', marginBottom: 6 }}>{user?.name} 👋</h2>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>Staff Panel · {user?.user_id}</p>
            </div>
            <div style={{ fontSize: 72, opacity: 0.25 }}>📚</div>
          </motion.div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 18 }}>
            {[
              { icon: '📋', label: 'Tests Created', value: stats?.total_tests ?? 0, color: '#1e3a5f' },
              { icon: '🎓', label: 'Total Students', value: stats?.total_students ?? 0, color: '#c9a84c' },
              { icon: '📅', label: 'Tests Today', value: stats?.tests_today ?? 0, color: '#10b981' },
            ].map(s => (
              <motion.div key={s.label} whileHover={{ y: -3 }} style={{
                background: '#fff', borderRadius: 14, padding: '22px 24px',
                boxShadow: '0 4px 16px rgba(30,58,95,0.07)', border: '1px solid #f0f0f0',
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <div style={{ fontSize: 28, width: 50, height: 50, background: s.color + '15', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: '#1e3a5f', fontFamily: 'Poppins' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e3a5f', marginBottom: 14, fontFamily: 'Poppins' }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { to: '/staff/create-test', label: '+ Create New Test', primary: true },
                { to: '/staff/tests', label: 'Manage Tests', primary: false },
                { to: '/staff/results', label: 'View Results', primary: false },
                { to: '/staff/create-student', label: '+ Add Student', primary: false },
              ].map(a => (
                <Link key={a.to} to={a.to} style={{
                  padding: '11px 22px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                  background: a.primary ? '#1e3a5f' : '#f3f4f6',
                  color: a.primary ? '#fff' : '#374151',
                  border: '1.5px solid ' + (a.primary ? '#1e3a5f' : '#e5e7eb'),
                  transition: 'all 0.2s',
                }}>{a.label}</Link>
              ))}
            </div>
          </div>

          {/* Recent Tests */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e3a5f', fontFamily: 'Poppins' }}>Recent Tests</h3>
              <Link to="/staff/tests" style={{ fontSize: 13, color: '#2d5a9e', fontWeight: 500 }}>View All →</Link>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              {tests.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
                  <div>No tests created yet. <Link to="/staff/create-test" style={{ color: '#1e3a5f', fontWeight: 600 }}>Create your first test →</Link></div>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#1e3a5f' }}>
                    <tr>{['Title', 'Subject', 'Date', 'Time', 'Questions', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', color: '#fff', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {tests.map((t, i) => {
                      const st = getStatus(t)
                      return (
                        <tr key={t.id} style={{ borderBottom: i < tests.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                          <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500 }}>{t.title}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{t.subject}</td>
                          <td style={{ padding: '12px 16px', fontSize: 12 }}>{new Date(t.scheduled_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{t.start_time} – {t.end_time}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'center' }}>
                            <span style={{ background: '#f0f4ff', color: '#1e3a5f', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{t.question_count}</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <Link to={`/staff/tests/${t.id}/questions`} style={{ fontSize: 12, color: '#1e3a5f', padding: '4px 10px', border: '1px solid #e5e7eb', borderRadius: 6 }}>Questions</Link>
                              <Link to={`/staff/tests/${t.id}/enroll`} style={{ fontSize: 12, color: '#c9a84c', padding: '4px 10px', border: '1px solid #fde68a', borderRadius: 6 }}>Enroll</Link>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
