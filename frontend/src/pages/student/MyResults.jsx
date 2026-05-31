import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'

export default function MyResults() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/student/results').then(r => setResults(r.data.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const avg = results.length
    ? Math.round(results.reduce((s, r) => s + parseFloat(r.percentage), 0) / results.length)
    : 0

  return (
    <DashboardLayout title="My Results">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Summary */}
        {results.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
            {[
              { label: 'Tests Taken', value: results.length, icon: '📋', color: '#1e3a5f' },
              { label: 'Average Score', value: avg + '%', icon: '📊', color: '#c9a84c' },
              { label: 'Best Score', value: Math.max(...results.map(r => parseFloat(r.percentage))) + '%', icon: '🏆', color: '#10b981' },
              { label: 'Passed', value: results.filter(r => parseFloat(r.percentage) >= 40).length, icon: '✅', color: '#3b82f6' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(30,58,95,0.05)' }}>
                <div style={{ fontSize: 22, width: 44, height: 44, background: s.color + '18', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f', fontFamily: 'Poppins' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Table */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {loading ? <LoadingSpinner /> : results.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>📊</div>
              <h3 style={{ color: '#374151', marginBottom: 8 }}>No Results Yet</h3>
              <p style={{ color: '#9ca3af', fontSize: 14 }}>Your exam results will appear here once you complete tests.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#1e3a5f' }}>
                <tr>{['Test Name', 'Subject', 'Date', 'Score', 'Total Marks', 'Percentage', 'Status', 'Submitted'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#fff', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const pct = parseFloat(r.percentage)
                  const passed = pct >= 40
                  return (
                    <tr key={i} style={{ borderBottom: i < results.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 500, color: '#1e3a5f' }}>{r.title}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280' }}>{r.subject}</td>
                      <td style={{ padding: '13px 16px', fontSize: 12, color: '#6b7280' }}>
                        {new Date(r.scheduled_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>{r.score}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280' }}>{r.total_marks}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                          background: pct >= 75 ? '#d1fae5' : pct >= 40 ? '#dbeafe' : '#fee2e2',
                          color: pct >= 75 ? '#065f46' : pct >= 40 ? '#1e40af' : '#991b1b',
                        }}>{pct}%</span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                          background: passed ? '#d1fae5' : '#fee2e2',
                          color: passed ? '#065f46' : '#991b1b',
                        }}>{passed ? '✓ Pass' : '✕ Fail'}</span>
                        {r.auto_submitted && <span style={{ marginLeft: 6, fontSize: 10, color: '#ef4444' }}>(Auto)</span>}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 11, color: '#9ca3af' }}>
                        {r.submitted_at ? new Date(r.submitted_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
