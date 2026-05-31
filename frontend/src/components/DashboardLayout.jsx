import { useState } from 'react'
import Sidebar from './Sidebar'
import { MdMenu, MdNotifications, MdPerson } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'

const DashboardLayout = ({ children, title }) => {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const roleColors = {
    management: { bg: '#c9a84c22', text: '#92400e', label: 'Management' },
    staff: { bg: '#dbeafe', text: '#1e40af', label: 'Staff' },
    student: { bg: '#d1fae5', text: '#065f46', label: 'Student' },
  }
  const rc = roleColors[user?.role] || roleColors.student

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{
          background: '#fff', padding: '0 28px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e3a5f', fontFamily: 'Poppins' }}>
              {title || 'Dashboard'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Role badge */}
            <span style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: rc.bg, color: rc.text,
            }}>{rc.label}</span>

            {/* Notification bell */}
            <button style={{
              width: 38, height: 38, borderRadius: 10, border: '1.5px solid #e5e7eb',
              background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#6b7280', transition: 'all 0.2s',
            }}>
              <MdNotifications size={20} />
            </button>

            {/* User avatar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 14px', borderRadius: 10, background: '#f9fafb',
              border: '1.5px solid #e5e7eb', cursor: 'pointer',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e3a5f, #2d5a9e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 14,
              }}>
                <MdPerson />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
