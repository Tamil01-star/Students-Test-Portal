import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const StatCard = ({ icon, label, value, color, to }) => (
  <motion.div whileHover={{ y: -4 }} style={{
    background: '#fff', borderRadius: 16, padding: '24px 28px',
    boxShadow: '0 4px 20px rgba(30,58,95,0.08)', border: '1px solid #f0f0f0',
    display: 'flex', alignItems: 'center', gap: 20,
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: 14, background: color + '18',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 26, flexShrink: 0, border: `1.5px solid ${color}30`,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#1e3a5f', fontFamily: 'Poppins' }}>{value}</div>
      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{label}</div>
    </div>
  </motion.div>
)

export default function ManagementDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, staffRes] = await Promise.all([
          api.get('/management/stats'),
          api.get('/management/staff'),
        ])
        setStats(statsRes.data.data)
        setStaff(staffRes.data.data.slice(0, 5))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <DashboardLayout title="Management Dashboard">
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
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>Management Panel · {user?.user_id}</p>
            </div>
            <div style={{ fontSize: 72, opacity: 0.3 }}>🏛️</div>
          </motion.div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            <StatCard icon="👨‍🏫" label="Total Staff Members" value={stats?.total_staff ?? 0} color="#1e3a5f" />
            <StatCard icon="🎓" label="Total Students" value={stats?.total_students ?? 0} color="#c9a84c" />
            <StatCard icon="📋" label="Total Tests" value={stats?.total_tests ?? 0} color="#10b981" />
          </div>

          {/* Quick Actions */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e3a5f', marginBottom: 16, fontFamily: 'Poppins' }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {[
                { to: '/management/create-staff', label: '+ Create Staff Account', bg: '#1e3a5f', color: '#fff' },
                { to: '/management/staff-list', label: 'View All Staff', bg: '#f0f4ff', color: '#1e3a5f' },
                { to: '/management/student-list', label: 'View All Students', bg: '#fffbeb', color: '#92400e' },
              ].map(a => (
                <Link key={a.to} to={a.to} style={{
                  padding: '11px 22px', borderRadius: 10, background: a.bg, color: a.color,
                  fontSize: 14, fontWeight: 500, border: `1.5px solid ${a.bg === '#f0f4ff' ? '#dbeafe' : a.bg === '#fffbeb' ? '#fde68a' : 'transparent'}`,
                  transition: 'all 0.2s',
                }}>{a.label}</Link>
              ))}
            </div>
          </div>

          {/* Recent Staff */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e3a5f', fontFamily: 'Poppins' }}>Recent Staff</h3>
              <Link to="/management/staff-list" style={{ fontSize: 13, color: '#2d5a9e', fontWeight: 500 }}>View All →</Link>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              {staff.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No staff members yet. Create one to get started.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#1e3a5f' }}>
                    <tr>{['Staff ID', 'Name', 'Email', 'Tests', 'Status'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#fff', fontSize: 12, fontWeight: 500 }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {staff.map((s, i) => (
                      <tr key={s.id} style={{ borderBottom: i < staff.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>{s.user_id}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13 }}>{s.name}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{s.email || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13 }}>{s.tests_created}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                            background: s.is_active ? '#d1fae5' : '#fee2e2',
                            color: s.is_active ? '#065f46' : '#991b1b',
                          }}>{s.is_active ? 'Active' : 'Inactive'}</span>
                        </td>
                      </tr>
                    ))}
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
