import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'

export default function StudentList() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStaff, setFilterStaff] = useState('')

  useEffect(() => {
    api.get('/management/students')
      .then(res => setStudents(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const staffList = [...new Set(students.map(s => s.created_by_name).filter(Boolean))]

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.user_id.toLowerCase().includes(search.toLowerCase())
    const matchStaff = !filterStaff || s.created_by_name === filterStaff
    return matchSearch && matchStaff
  })

  return (
    <DashboardLayout title="Student Records">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', fontFamily: 'Poppins' }}>All Students</h2>
            <p style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>{students.length} total students registered</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search students..."
              style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', width: 220, fontFamily: 'Inter' }} />
            <select value={filterStaff} onChange={e => setFilterStaff(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', fontFamily: 'Inter', background: '#fff' }}>
              <option value="">All Staff</option>
              {staffList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
                <div style={{ fontWeight: 500 }}>No students found</div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#1e3a5f' }}>
                  <tr>{['Reg. Number', 'Name', 'Email', 'Created By', 'Date Joined'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#fff', fontSize: 12, fontWeight: 500 }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600, color: '#1e3a5f', fontFamily: 'monospace' }}>{s.user_id}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 500 }}>{s.name}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280' }}>{s.email || '—'}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ background: '#f0f4ff', color: '#1e40af', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                          {s.created_by_name || 'Unknown'}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 12, color: '#6b7280' }}>
                        {new Date(s.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
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
