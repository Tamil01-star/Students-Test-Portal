import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'

export default function Results() {
  const [tests, setTests] = useState([])
  const [selectedTest, setSelectedTest] = useState('')
  const [results, setResults] = useState([])
  const [testInfo, setTestInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchingResults, setFetchingResults] = useState(false)

  useEffect(() => {
    api.get('/staff/tests').then(r => setTests(r.data.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const fetchResults = async (testId) => {
    if (!testId) return
    setFetchingResults(true)
    try {
      const res = await api.get(`/staff/results/${testId}`)
      setResults(res.data.data)
      setTestInfo(res.data.test)
    } catch (e) { console.error(e) }
    finally { setFetchingResults(false) }
  }

  const exportCSV = () => {
    if (!results.length) return
    const headers = ['Register Number', 'Student Name', 'Score', 'Total Marks', 'Percentage', 'Submitted At', 'Auto Submitted']
    const rows = results.map(r => [r.register_number, r.student_name, r.score, r.total_marks, r.percentage + '%', r.submitted_at ? new Date(r.submitted_at).toLocaleString('en-IN') : '', r.auto_submitted ? 'Yes' : 'No'])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `results-${testInfo?.title || 'test'}.csv`; a.click()
  }

  const avg = results.length ? Math.round(results.reduce((s, r) => s + parseFloat(r.percentage), 0) / results.length) : 0
  const highest = results.length ? Math.max(...results.map(r => parseFloat(r.percentage))) : 0
  const passed = results.filter(r => parseFloat(r.percentage) >= 40).length

  return (
    <DashboardLayout title="Test Results">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Test Selector */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(30,58,95,0.06)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e3a5f', marginBottom: 14, fontFamily: 'Poppins' }}>Select a Test to View Results</h3>
          {loading ? <LoadingSpinner /> : (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <select value={selectedTest} onChange={e => { setSelectedTest(e.target.value); fetchResults(e.target.value) }}
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 8, border: '1.5px solid #e5e7eb',
                  fontSize: 14, outline: 'none', fontFamily: 'Inter', background: '#fff', cursor: 'pointer',
                }}>
                <option value="">— Choose a test —</option>
                {tests.map(t => (
                  <option key={t.id} value={t.id}>{t.title} ({t.subject} · {new Date(t.scheduled_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })})</option>
                ))}
              </select>
              {results.length > 0 && (
                <button onClick={exportCSV} style={{
                  padding: '11px 18px', borderRadius: 8, border: 'none', background: '#1e3a5f', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
                }}>⬇ Export CSV</button>
              )}
            </div>
          )}
        </div>

        {fetchingResults ? <LoadingSpinner /> : selectedTest && (
          <>
            {/* Stats */}
            {results.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                  { label: 'Total Submitted', value: results.length, icon: '📊', color: '#1e3a5f' },
                  { label: 'Average Score', value: avg + '%', icon: '📈', color: '#c9a84c' },
                  { label: 'Highest Score', value: highest + '%', icon: '🏆', color: '#10b981' },
                  { label: 'Passed (≥40%)', value: passed, icon: '✅', color: '#3b82f6' },
                ].map(s => (
                  <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ fontSize: 24, width: 44, height: 44, background: s.color + '15', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f', fontFamily: 'Poppins' }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results Table */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              {results.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
                  <div style={{ fontWeight: 500 }}>No submissions yet for this test.</div>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#1e3a5f' }}>
                    <tr>{['#', 'Reg. Number', 'Student Name', 'Score', 'Total', 'Percentage', 'Status', 'Submitted At', 'Violations'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: '#fff', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => {
                      const pct = parseFloat(r.percentage)
                      const passed = pct >= 40
                      return (
                        <tr key={i} style={{ borderBottom: i < results.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                          <td style={{ padding: '12px 14px', fontSize: 13, color: '#6b7280' }}>{i + 1}</td>
                          <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#1e3a5f', fontFamily: 'monospace' }}>{r.register_number}</td>
                          <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 500 }}>{r.student_name}</td>
                          <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>{r.score}</td>
                          <td style={{ padding: '12px 14px', fontSize: 13, color: '#6b7280' }}>{r.total_marks}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                              background: pct >= 75 ? '#d1fae5' : pct >= 40 ? '#dbeafe' : '#fee2e2',
                              color: pct >= 75 ? '#065f46' : pct >= 40 ? '#1e40af' : '#991b1b',
                            }}>{pct}%</span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: passed ? '#d1fae5' : '#fee2e2', color: passed ? '#065f46' : '#991b1b' }}>
                              {passed ? 'Pass' : 'Fail'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: 11, color: '#6b7280' }}>
                            {r.submitted_at ? new Date(r.submitted_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                            {r.auto_submitted && <span style={{ marginLeft: 4, color: '#ef4444', fontSize: 10 }}>(Auto)</span>}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            {r.warning_count > 0 ? (
                              <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>⚠ {r.warning_count}</span>
                            ) : <span style={{ color: '#10b981', fontSize: 12 }}>✓ Clean</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
