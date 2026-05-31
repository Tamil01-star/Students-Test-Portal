import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/student/stats'), api.get('/student/tests')])
      .then(([s, t]) => {
        setStats(s.data.data)
        setTests(t.data.data.filter(x => x.status === 'active' || x.status === 'upcoming').slice(0, 4))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const Countdown = ({ endTime, date }) => {
    const [remaining, setRemaining] = useState('')
    useEffect(() => {
      const calc = () => {
        const testDate = new Date(date).toISOString().split('T')[0]
        const end = new Date(`${testDate}T${endTime}`)
        const now = new Date()
        const diff = end - now
        if (diff <= 0) { setRemaining('Ended'); return }
        const h = Math.floor(diff / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        setRemaining(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`)
      }
      calc()
      const id = setInterval(calc, 1000)
      return () => clearInterval(id)
    }, [endTime, date])
    return <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#10b981' }}>{remaining}</span>
  }

  return (
    <DashboardLayout title="Student Dashboard">
      {loading ? <LoadingSpinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Welcome Banner */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a9e 100%)',
              borderRadius: 18, padding: '32px 36px', color: '#fff',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
            <div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Welcome back,</div>
              <h2 style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Poppins', marginBottom: 6 }}>{user?.name} 👋</h2>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>📋 {user?.user_id}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>🎓 Student</span>
              </div>
            </div>
            <div style={{ fontSize: 72, opacity: 0.2 }}>📚</div>
          </motion.div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 18 }}>
            {[
              { icon: '📅', label: 'Upcoming Tests', value: stats?.upcoming_tests ?? 0, color: '#3b82f6', bg: '#dbeafe' },
              { icon: '✅', label: 'Tests Completed', value: stats?.completed_tests ?? 0, color: '#10b981', bg: '#d1fae5' },
              { icon: '📊', label: 'Average Score', value: (stats?.average_score ?? 0) + '%', color: '#c9a84c', bg: '#fef3c7' },
            ].map(s => (
              <motion.div key={s.label} whileHover={{ y: -3 }} style={{
                background: '#fff', borderRadius: 14, padding: '22px 24px',
                boxShadow: '0 4px 16px rgba(30,58,95,0.07)', border: '1px solid #f0f0f0',
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: '#1e3a5f', fontFamily: 'Poppins' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Nav */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { to: '/student/tests', label: '📋 My Tests', primary: true },
              { to: '/student/results', label: '📊 My Results', primary: false },
            ].map(a => (
              <Link key={a.to} to={a.to} style={{
                padding: '11px 22px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                background: a.primary ? '#1e3a5f' : '#f3f4f6', color: a.primary ? '#fff' : '#374151',
                border: '1.5px solid ' + (a.primary ? '#1e3a5f' : '#e5e7eb'), transition: 'all 0.2s',
              }}>{a.label}</Link>
            ))}
          </div>

          {/* Active / Upcoming Tests */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e3a5f', fontFamily: 'Poppins' }}>Active & Upcoming Tests</h3>
              <Link to="/student/tests" style={{ fontSize: 13, color: '#2d5a9e', fontWeight: 500 }}>View All →</Link>
            </div>
            {tests.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', border: '1px solid #e5e7eb', color: '#9ca3af' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
                <div>No active tests at the moment. Check back later.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tests.map(t => (
                  <div key={t.id} style={{
                    background: '#fff', borderRadius: 14, padding: '20px 24px',
                    border: t.status === 'active' ? '2px solid #10b981' : '1px solid #e5e7eb',
                    boxShadow: t.status === 'active' ? '0 4px 20px rgba(16,185,129,0.15)' : '0 2px 8px rgba(30,58,95,0.05)',
                    display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
                  }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e3a5f' }}>{t.title}</h3>
                        <span style={{
                          padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                          background: t.status === 'active' ? '#d1fae5' : '#dbeafe',
                          color: t.status === 'active' ? '#065f46' : '#1e40af',
                        }}>{t.status === 'active' ? '● LIVE' : '⏳ Upcoming'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 14, color: '#6b7280', fontSize: 13 }}>
                        <span>📚 {t.subject}</span>
                        <span>📅 {new Date(t.scheduled_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                        <span>⏰ {t.start_time} – {t.end_time}</span>
                      </div>
                      {t.status === 'active' && (
                        <div style={{ marginTop: 8, fontSize: 13 }}>
                          ⏱ Time remaining: <Countdown endTime={t.end_time} date={t.scheduled_date} />
                        </div>
                      )}
                    </div>
                    {t.status === 'active' && (
                      <Link to={`/student/tests/${t.id}/attend`} style={{
                        padding: '11px 22px', borderRadius: 10, background: '#10b981', color: '#fff',
                        fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                      }}>Attend Now →</Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
