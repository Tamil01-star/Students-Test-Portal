import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'

export default function AddQuestions() {
  const { test_id } = useParams()
  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a', marks: 1 })

  const fetchData = async () => {
    try {
      const res = await api.get(`/staff/tests/${test_id}/questions`)
      setTest(res.data.test)
      setQuestions(res.data.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [test_id])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.question_text || !form.option_a || !form.option_b || !form.option_c || !form.option_d) {
      setError('All fields are required.'); return
    }
    setSubmitting(true)
    try {
      await api.post(`/staff/tests/${test_id}/questions`, form)
      setForm({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a', marks: 1 })
      fetchData()
    } catch (err) { setError(err.response?.data?.message || 'Failed to add question.') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (qid) => {
    if (!window.confirm('Delete this question?')) return
    await api.delete(`/staff/questions/${qid}`)
    fetchData()
  }

  const inp = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', fontFamily: 'Inter', background: '#fff', transition: 'border-color 0.2s' }
  const optionColors = { a: '#dbeafe', b: '#d1fae5', c: '#fef3c7', d: '#fce7f3' }
  const optionTextColors = { a: '#1e40af', b: '#065f46', c: '#92400e', d: '#9d174d' }

  return (
    <DashboardLayout title="Add Questions">
      {loading ? <LoadingSpinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Test header */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a5f, #2d5a9e)', borderRadius: 14,
            padding: '20px 28px', color: '#fff',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Adding questions to:</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Poppins' }}>{test?.title}</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#c9a84c' }}>{questions.length}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Questions</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            {/* Add Form */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(30,58,95,0.06)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e3a5f', marginBottom: 20, fontFamily: 'Poppins' }}>Add New Question</h3>
              {error && <div style={{ background: '#fee2e2', borderRadius: 8, padding: '10px 12px', color: '#991b1b', fontSize: 12, marginBottom: 16 }}>⚠️ {error}</div>}
              <form onSubmit={handleAdd}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Question Text *</label>
                  <textarea value={form.question_text} onChange={e => setForm({ ...form, question_text: e.target.value })}
                    rows={3} placeholder="Enter your question here..."
                    style={{ ...inp, resize: 'vertical' }}
                    onFocus={e => e.target.style.borderColor = '#1e3a5f'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>
                {['a', 'b', 'c', 'd'].map(opt => (
                  <div key={opt} style={{ marginBottom: 10 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: optionTextColors[opt], marginBottom: 4 }}>
                      Option {opt.toUpperCase()} *
                    </label>
                    <input type="text" value={form[`option_${opt}`]} placeholder={`Option ${opt.toUpperCase()}`}
                      onChange={e => setForm({ ...form, [`option_${opt}`]: e.target.value })}
                      style={{ ...inp, borderColor: form.correct_answer === opt ? '#10b981' : '#e5e7eb', background: form.correct_answer === opt ? '#f0fdf4' : '#fff' }}
                      onFocus={e => e.target.style.borderColor = '#1e3a5f'} onBlur={e => e.target.style.borderColor = form.correct_answer === opt ? '#10b981' : '#e5e7eb'} />
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Correct Answer *</label>
                    <select value={form.correct_answer} onChange={e => setForm({ ...form, correct_answer: e.target.value })}
                      style={{ ...inp, cursor: 'pointer' }}>
                      {['a', 'b', 'c', 'd'].map(o => <option key={o} value={o}>Option {o.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Marks</label>
                    <input type="number" min={1} max={10} value={form.marks}
                      onChange={e => setForm({ ...form, marks: parseInt(e.target.value) || 1 })}
                      style={inp}
                      onFocus={e => e.target.style.borderColor = '#1e3a5f'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </div>
                </div>
                <button type="submit" disabled={submitting} style={{
                  width: '100%', padding: '11px', borderRadius: 10, border: 'none',
                  background: submitting ? '#9ca3af' : '#1e3a5f', color: '#fff', fontSize: 14,
                  fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
                }}>{submitting ? 'Adding...' : '+ Add Question'}</button>
              </form>

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f3f4f6', display: 'flex', gap: 10 }}>
                <Link to={`/staff/tests/${test_id}/enroll`} style={{
                  flex: 1, padding: '10px', borderRadius: 8, background: '#fffbeb', color: '#92400e',
                  fontSize: 13, fontWeight: 500, textAlign: 'center', border: '1px solid #fde68a',
                }}>Next: Enroll Students →</Link>
              </div>
            </div>

            {/* Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              {questions.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', border: '1px solid #e5e7eb', color: '#9ca3af' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📝</div>
                  <div>No questions yet. Add your first question.</div>
                </div>
              ) : questions.map((q, i) => (
                <div key={q.id} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb', boxShadow: '0 2px 6px rgba(30,58,95,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#1e3a5f', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#1f2937', lineHeight: 1.5 }}>{q.question_text}</p>
                    </div>
                    <button onClick={() => handleDelete(q.id)} style={{
                      padding: '4px 10px', borderRadius: 6, border: 'none', background: '#fee2e2', color: '#991b1b', fontSize: 11, cursor: 'pointer', flexShrink: 0, marginLeft: 8,
                    }}>✕</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {['a', 'b', 'c', 'd'].map(opt => (
                      <div key={opt} style={{
                        padding: '6px 10px', borderRadius: 6, fontSize: 12,
                        background: q.correct_answer === opt ? '#d1fae5' : optionColors[opt],
                        color: q.correct_answer === opt ? '#065f46' : optionTextColors[opt],
                        border: q.correct_answer === opt ? '1.5px solid #6ee7b7' : '1px solid transparent',
                        fontWeight: q.correct_answer === opt ? 600 : 400,
                      }}>
                        <strong>{opt.toUpperCase()}.</strong> {q[`option_${opt}`]}
                        {q.correct_answer === opt && ' ✓'}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 11, color: '#6b7280' }}>Marks: <strong>{q.marks}</strong></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
