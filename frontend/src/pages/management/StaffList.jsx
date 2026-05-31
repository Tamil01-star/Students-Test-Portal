import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'

export default function StaffList() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deactivating, setDeactivating] = useState(null)

  const fetchStaff = async () => {
    try {
      const res = await api.get('/management/staff')
      setStaff(res.data.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchStaff() }, [])

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Deactivate staff account for "${name}"? They will no longer be able to login.`)) return
    setDeactivating(id)
    try {
      await api.patch(`/management/staff/${id}/deactivate`)
      setStaff(s => s.map(x => x.id === id ? { ...x, is_active: false } : x))
    } catch (e) { alert(e.response?.data?.message || 'Failed to deactivate.') }
    finally { setDeactivating(null) }
  }

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.user_id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout title="Staff Management">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', fontFamily: 'Poppins' }}>All Staff Members</h2>
            <p style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>{staff.length} total staff registered</p>
          </div>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search by name or ID..."
            style={{
              padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e5e7eb',
              fontSize: 14, outline: 'none', width: 260, fontFamily: 'Inter',
            }}
          />
        </div>

        {loading ? <LoadingSpinner /> : (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍🏫</div>
                <div style={{ fontWeight: 500 }}>No staff members found</div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#1e3a5f' }}>
                  <tr>{['Staff ID', 'Name', 'Email', 'Tests Created', 'Created Date', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#fff', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>{s.user_id}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 500 }}>{s.name}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280' }}>{s.email || '—'}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, textAlign: 'center' }}>
                        <span style={{ background: '#f0f4ff', color: '#1e3a5f', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{s.tests_created}</span>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 12, color: '#6b7280' }}>
                        {new Date(s.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                          background: s.is_active ? '#d1fae5' : '#fee2e2',
                          color: s.is_active ? '#065f46' : '#991b1b',
                        }}>{s.is_active ? '● Active' : '○ Inactive'}</span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        {s.is_active && (
                          <button onClick={() => handleDeactivate(s.id, s.name)} disabled={deactivating === s.id}
                            style={{
                              padding: '6px 14px', borderRadius: 6, border: 'none',
                              background: '#fee2e2', color: '#991b1b', fontSize: 12, fontWeight: 500,
                              cursor: 'pointer', whiteSpace: 'nowrap',
                            }}>
                            {deactivating === s.id ? 'Deactivating...' : 'Deactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
