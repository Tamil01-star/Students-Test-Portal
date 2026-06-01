import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  MdDashboard, MdAddBox, MdList, MdPeople, MdAssignment,
  MdLogout, MdMenu, MdClose, MdPerson, MdBarChart,
  MdSchool, MdQuiz, MdPersonAdd, MdGroupAdd,
} from 'react-icons/md'

const navConfig = {
  management: [
    { to: '/management/dashboard', icon: MdDashboard, label: 'Dashboard' },
    { to: '/management/create-staff', icon: MdPersonAdd, label: 'Create Staff' },
    { to: '/management/staff-list', icon: MdPeople, label: 'Staff List' },
    { to: '/management/student-list', icon: MdSchool, label: 'Student Records' },
    { to: '/profile', icon: MdPerson, label: 'My Profile' },
  ],
  staff: [
    { to: '/staff/dashboard', icon: MdDashboard, label: 'Dashboard' },
    { to: '/staff/create-test', icon: MdAddBox, label: 'Create Test' },
    { to: '/staff/tests', icon: MdList, label: 'My Tests' },
    { to: '/staff/results', icon: MdBarChart, label: 'Results' },
    { to: '/staff/create-student', icon: MdGroupAdd, label: 'Add Student' },
    { to: '/profile', icon: MdPerson, label: 'My Profile' },
  ],
  student: [
    { to: '/student/dashboard', icon: MdDashboard, label: 'Dashboard' },
    { to: '/student/tests', icon: MdQuiz, label: 'My Tests' },
    { to: '/student/results', icon: MdBarChart, label: 'My Results' },
    { to: '/profile', icon: MdPerson, label: 'My Profile' },
  ],
}

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const links = navConfig[user?.role] || []

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      setLoggingOut(true)
      setTimeout(() => logout(), 300)
    }
  }

  const activeStyle = {
    background: 'linear-gradient(90deg, rgba(201,168,76,0.2) 0%, rgba(201,168,76,0.05) 100%)',
    borderLeft: '3px solid #c9a84c',
    color: '#e8c96d',
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onToggle}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 40, display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      <aside style={{
        width: 260, minHeight: '100vh', flexShrink: 0,
        background: 'linear-gradient(180deg, #0d1b2a 0%, #1a2e45 100%)',
        display: 'flex', flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        transition: 'transform 0.3s ease',
        position: 'relative', zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{
          padding: '28px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #c9a84c, #e8c96d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0,
            }}>🎓</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: 'Poppins' }}>
                Classic Exam
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Portal</div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(201,168,76,0.2)', border: '2px solid rgba(201,168,76,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#c9a84c', fontSize: 18, flexShrink: 0,
            }}>
              <MdPerson />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                color: '#fff', fontSize: 13, fontWeight: 600,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{user?.name}</div>
              <div style={{
                color: 'rgba(255,255,255,0.45)', fontSize: 11, textTransform: 'capitalize',
              }}>{user?.role} • {user?.user_id}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          <div style={{ padding: '8px 20px 4px', color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Navigation
          </div>
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 20px', margin: '2px 8px', borderRadius: 8,
                color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: 500,
                transition: 'all 0.2s', textDecoration: 'none', borderLeft: '3px solid transparent',
                ...(isActive ? activeStyle : {}),
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={19} style={{ flexShrink: 0, color: isActive ? '#c9a84c' : 'inherit' }} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 20px', borderRadius: 8, border: 'none',
              background: 'rgba(239,68,68,0.1)', color: '#fca5a5',
              cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
          >
            <MdLogout size={19} />
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
