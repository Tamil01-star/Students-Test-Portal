import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'

/* ─────────── ANTI-CHEAT HELPERS ─────────── */
const enterFullscreen = () => {
  const el = document.documentElement
  if (el.requestFullscreen) return el.requestFullscreen()
  if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen()
  if (el.mozRequestFullScreen) return el.mozRequestFullScreen()
}
const isFullscreen = () => !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement)

/* ─────────── TIMER COMPONENT ─────────── */
const ExamTimer = ({ endTime, date, onExpire }) => {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    const testDate = new Date(date).toISOString().split('T')[0]
    const end = new Date(`${testDate}T${endTime}`)
    const tick = () => {
      const diff = Math.max(0, Math.floor((end - new Date()) / 1000))
      setSecs(diff)
      if (diff === 0) onExpire()
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endTime, date, onExpire])

  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  const isLow = secs < 300
  const display = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`

  return (
    <div style={{
      fontFamily: 'monospace', fontSize: 22, fontWeight: 700, letterSpacing: 2,
      color: isLow ? '#ef4444' : '#1e3a5f',
      background: isLow ? '#fee2e2' : '#f0f4ff',
      padding: '8px 18px', borderRadius: 10,
      border: `2px solid ${isLow ? '#fca5a5' : '#dbeafe'}`,
      animation: isLow ? 'pulse 1s ease-in-out infinite' : 'none',
    }}>
      {display}
    </div>
  )
}

/* ─────────── PALETTE DOT ─────────── */
const PaletteDot = ({ num, status, isCurrent, onClick }) => {
  const colors = {
    answered: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
    marked:   { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
    current:  { bg: '#1e3a5f', color: '#fff',    border: '#1e3a5f' },
    default:  { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  }
  const c = isCurrent ? colors.current : colors[status] || colors.default
  return (
    <button onClick={onClick} style={{
      width: 36, height: 36, borderRadius: 8, border: `2px solid ${c.border}`,
      background: c.bg, color: c.color, fontSize: 12, fontWeight: 700,
      cursor: 'pointer', transition: 'all 0.15s',
      transform: isCurrent ? 'scale(1.12)' : 'scale(1)',
    }}>{num}</button>
  )
}

/* ─────────── MAIN EXAM PAGE ─────────── */
export default function AttendTest() {
  const { test_id } = useParams()
  const navigate = useNavigate()
  const [phase, setPhase] = useState('loading') // loading | instructions | exam | result
  const [testData, setTestData] = useState(null)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({}) // { [question_id]: selected_answer }
  const [marked, setMarked] = useState(new Set())
  const [warnings, setWarnings] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMsg, setWarningMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const autoSaveRef = useRef(null)
  const warningsRef = useRef(0)
  const submittedRef = useRef(false)
  const answersRef = useRef({})

  // Keep answersRef in sync
  useEffect(() => { answersRef.current = answers }, [answers])

  // ── Load test data ──
  useEffect(() => {
    api.get(`/student/tests/${test_id}`)
      .then(res => {
        const { test, questions: qs, saved_answers } = res.data.data
        setTestData(test)
        setQuestions(qs)
        // Restore saved answers
        const saved = {}
        if (Array.isArray(saved_answers)) saved_answers.forEach(a => { saved[a.question_id] = a.selected_answer })
        setAnswers(saved)
        setPhase('instructions')
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load test. Please check your enrollment and exam time.')
        setPhase('error')
      })
  }, [test_id])

  // ── Auto-save every 10 seconds ──
  const autoSave = useCallback(() => {
    if (submittedRef.current) return
    const payload = Object.entries(answersRef.current).map(([qid, ans]) => ({ question_id: parseInt(qid), selected_answer: ans }))
    sessionStorage.setItem(`exam_${test_id}`, JSON.stringify(payload))
  }, [test_id])

  // ── Record warning ──
  const recordWarning = useCallback(async (reason) => {
    if (submittedRef.current || phase !== 'exam') return
    warningsRef.current += 1
    setWarnings(warningsRef.current)
    setWarningMsg(reason)
    setShowWarning(true)

    try {
      const res = await api.post(`/student/tests/${test_id}/warning`)
      if (res.data.auto_submit || warningsRef.current >= 3) {
        setShowWarning(false)
        await doSubmit(true)
      }
    } catch (e) {
      if (warningsRef.current >= 3) await doSubmit(true)
    }
  }, [phase, test_id])

  // ── Submit exam ──
  const doSubmit = useCallback(async (auto = false) => {
    if (submittedRef.current) return
    submittedRef.current = true
    setSubmitting(true)
    try {
      const payload = Object.entries(answersRef.current).map(([qid, ans]) => ({ question_id: parseInt(qid), selected_answer: ans }))
      const res = await api.post(`/student/tests/${test_id}/submit`, { answers: payload })
      setResult({ ...res.data.data, auto_submitted: auto })
      setPhase('result')
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {})
    } catch (e) {
      setSubmitting(false)
      submittedRef.current = false
      alert('Failed to submit. Please try again immediately.')
    }
  }, [test_id])

  // ── Start exam (after fullscreen) ──
  const startExam = async () => {
    try {
      await enterFullscreen()
      setTimeout(() => {
        if (!isFullscreen()) {
          alert('Fullscreen is required to start the exam.')
          return
        }
        setPhase('exam')
        autoSaveRef.current = setInterval(autoSave, 10000)
      }, 500)
    } catch {
      alert('Could not enter fullscreen mode. Please allow fullscreen and try again.')
    }
  }

  // ── Anti-cheat event listeners (only during exam) ──
  useEffect(() => {
    if (phase !== 'exam') return

    // Prevent right-click
    const noContext = e => e.preventDefault()
    document.addEventListener('contextmenu', noContext)

    // Prevent keyboard shortcuts
    const noKeys = e => {
      const blocked = (
        (e.ctrlKey && ['c','v','a','u','s','p'].includes(e.key.toLowerCase())) ||
        e.key === 'F12' || e.key === 'PrintScreen' ||
        (e.ctrlKey && e.shiftKey && ['i','j','c'].includes(e.key.toLowerCase())) ||
        (e.altKey && e.key === 'Tab')
      )
      if (blocked) { e.preventDefault(); e.stopPropagation() }
    }
    document.addEventListener('keydown', noKeys, true)

    // Detect fullscreen exit
    const onFSChange = () => {
      if (!isFullscreen() && !submittedRef.current) {
        recordWarning('You exited fullscreen mode. Please return to fullscreen immediately.')
        setTimeout(() => { if (!submittedRef.current) enterFullscreen().catch(() => {}) }, 2000)
      }
    }
    document.addEventListener('fullscreenchange', onFSChange)
    document.addEventListener('webkitfullscreenchange', onFSChange)
    document.addEventListener('mozfullscreenchange', onFSChange)

    // Detect tab switch / window blur
    const onVisChange = () => {
      if (document.hidden && !submittedRef.current) recordWarning('You switched tabs or windows.')
    }
    document.addEventListener('visibilitychange', onVisChange)

    const onBlur = () => {
      if (!submittedRef.current) recordWarning('You left the exam window.')
    }
    window.addEventListener('blur', onBlur)

    // Prevent refresh
    const onBeforeUnload = (e) => {
      if (!submittedRef.current) { e.preventDefault(); e.returnValue = ''; return '' }
    }
    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      document.removeEventListener('contextmenu', noContext)
      document.removeEventListener('keydown', noKeys, true)
      document.removeEventListener('fullscreenchange', onFSChange)
      document.removeEventListener('webkitfullscreenchange', onFSChange)
      document.removeEventListener('mozfullscreenchange', onFSChange)
      document.removeEventListener('visibilitychange', onVisChange)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('beforeunload', onBeforeUnload)
      if (autoSaveRef.current) clearInterval(autoSaveRef.current)
    }
  }, [phase, recordWarning])

  // ── Cleanup on unmount ──
  useEffect(() => () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current) }, [])

  const q = questions[current]
  const answered = Object.keys(answers).length
  const totalQuestions = questions.length

  // ── LOADING ──
  if (phase === 'loading') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
      <LoadingSpinner />
    </div>
  )

  // ── ERROR ──
  if (phase === 'error') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 18, padding: 48, maxWidth: 480, textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🚫</div>
        <h2 style={{ color: '#1e3a5f', marginBottom: 12, fontFamily: 'Poppins' }}>Cannot Access Test</h2>
        <p style={{ color: '#6b7280', lineHeight: 1.7, marginBottom: 24 }}>{error}</p>
        <button onClick={() => navigate('/student/tests')} style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: '#1e3a5f', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          ← Back to My Tests
        </button>
      </div>
    </div>
  )

  // ── RESULT ──
  if (phase === 'result' && result) {
    const pct = result.percentage
    const passed = pct >= 40
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0d1b2a, #1e3a5f)', fontFamily: 'Inter, sans-serif', padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: '52px 48px', maxWidth: 520, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
          <div style={{ fontSize: 72, marginBottom: 12 }}>{pct >= 75 ? '🏆' : pct >= 40 ? '✅' : '📊'}</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e3a5f', fontFamily: 'Poppins', marginBottom: 6 }}>
            {result.auto_submitted ? 'Test Auto-Submitted' : 'Test Submitted!'}
          </h2>
          {result.auto_submitted && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#991b1b', fontSize: 13, marginBottom: 16 }}>
              ⚠️ Test was auto-submitted due to exam violations.
            </div>
          )}

          {/* Score Ring */}
          <div style={{ margin: '28px auto', width: 140, height: 140, borderRadius: '50%', background: `conic-gradient(${passed ? '#10b981' : '#ef4444'} ${pct * 3.6}deg, #f3f4f6 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
            <div style={{ width: 110, height: 110, borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: passed ? '#10b981' : '#ef4444', fontFamily: 'Poppins' }}>{pct}%</div>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{passed ? 'Passed' : 'Failed'}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Score', value: `${result.score}/${result.total_marks}`, color: '#1e3a5f' },
              { label: 'Correct', value: result.score, color: '#10b981' },
              { label: 'Incorrect', value: result.total_marks - result.score, color: '#ef4444' },
            ].map(s => (
              <div key={s.label} style={{ background: '#f8f9fa', borderRadius: 12, padding: '14px 10px' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: 'Poppins' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <button onClick={() => navigate('/student/results')} style={{
            width: '100%', padding: '13px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #1e3a5f, #2d5a9e)', color: '#fff',
            fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins',
          }}>View All Results →</button>
        </div>
      </div>
    )
  }

  // ── INSTRUCTIONS ──
  if (phase === 'instructions') return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '44px 40px', maxWidth: 620, width: '100%', boxShadow: '0 8px 40px rgba(30,58,95,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>📋</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e3a5f', fontFamily: 'Poppins', marginBottom: 4 }}>{testData?.title}</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>{testData?.subject} · {totalQuestions} Questions</p>
        </div>

        {/* Exam Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Questions', value: totalQuestions },
            { label: 'End Time', value: testData?.end_time },
          ].map(i => (
            <div key={i.label} style={{ background: '#f8f9fa', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', fontFamily: 'Poppins' }}>{i.value}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{i.label}</div>
            </div>
          ))}
        </div>

        {/* Rules */}
        <div style={{ background: '#fff8e6', border: '1.5px solid #fde68a', borderRadius: 14, padding: 20, marginBottom: 28 }}>
          <h3 style={{ color: '#92400e', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>⚠️ Important Examination Rules</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'This exam will run in fullscreen mode — do NOT exit fullscreen',
              'Switching tabs or windows will count as a violation',
              'You will receive a maximum of 3 warnings before auto-submission',
              'Copy, paste, right-click, and keyboard shortcuts are disabled',
              'Answers are auto-saved every 10 seconds',
              'Timer counts down to the exam end time — submit before it expires',
              'Once submitted, you cannot re-attempt the exam',
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: '#78350f' }}>
                <span style={{ color: '#d97706', fontWeight: 700, flexShrink: 0 }}>✦</span>
                {r}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={startExam} style={{
            flex: 1, padding: '14px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #1e3a5f, #2d5a9e)', color: '#fff',
            fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins',
            boxShadow: '0 4px 16px rgba(30,58,95,0.3)',
          }}>🖥️ Enable Fullscreen & Start Exam</button>
          <button onClick={() => navigate('/student/tests')} style={{
            padding: '14px 20px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer', fontSize: 14,
          }}>← Back</button>
        </div>
      </div>
    </div>
  )

  // ── EXAM INTERFACE ──
  return (
    <div className="no-select" style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: '#f3f4f6', fontFamily: 'Inter, sans-serif', overflow: 'hidden',
    }}>
      {/* Warning Overlay */}
      {showWarning && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(239,68,68,0.15)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '36px 40px', maxWidth: 440, width: '90%', textAlign: 'center', boxShadow: '0 24px 48px rgba(0,0,0,0.2)', border: '3px solid #ef4444' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ color: '#dc2626', fontSize: 22, fontWeight: 700, fontFamily: 'Poppins', marginBottom: 8 }}>Violation Detected!</h2>
            <p style={{ color: '#374151', fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>{warningMsg}</p>
            <div style={{ background: '#fee2e2', borderRadius: 10, padding: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#991b1b' }}>Warning {warnings} of 3</span>
              <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 4 }}>
                {3 - warnings > 0 ? `${3 - warnings} warning(s) remaining before auto-submission` : 'Submitting exam now...'}
              </div>
            </div>
            {warnings < 3 && (
              <button onClick={() => { setShowWarning(false); enterFullscreen().catch(() => {}) }} style={{
                width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>I Understand — Return to Exam</button>
            )}
          </div>
        </div>
      )}

      {/* Submit Confirm Modal */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '36px 40px', maxWidth: 420, width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📤</div>
            <h2 style={{ color: '#1e3a5f', fontFamily: 'Poppins', marginBottom: 8 }}>Submit Examination?</h2>
            <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
              You have answered <strong>{answered}</strong> of <strong>{totalQuestions}</strong> questions.
            </p>
            {answered < totalQuestions && (
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', color: '#92400e', fontSize: 13, marginBottom: 16 }}>
                ⚠️ {totalQuestions - answered} question(s) unanswered.
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 14 }}>
                Cancel
              </button>
              <button onClick={() => { setShowConfirm(false); doSubmit(false) }} disabled={submitting}
                style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: '#1e3a5f', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                {submitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div style={{
        background: '#fff', padding: '10px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '2px solid #e5e7eb', gap: 16, flexWrap: 'wrap', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f', fontFamily: 'Poppins' }}>{testData?.title}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Q {current + 1} of {totalQuestions} · {answered} answered</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Warning indicator */}
          <div style={{
            padding: '6px 14px', borderRadius: 8,
            background: warnings > 0 ? '#fee2e2' : '#f0fdf4',
            border: `1.5px solid ${warnings > 0 ? '#fca5a5' : '#bbf7d0'}`,
            color: warnings > 0 ? '#991b1b' : '#065f46', fontSize: 13, fontWeight: 600,
          }}>
            ⚠️ Warnings: {warnings}/3
          </div>

          {/* Timer */}
          {testData && <ExamTimer endTime={testData.end_time} date={testData.scheduled_date} onExpire={() => doSubmit(true)} />}

          <button onClick={() => setShowConfirm(true)} disabled={submitting}
            style={{
              padding: '9px 20px', borderRadius: 8, border: 'none',
              background: '#1e3a5f', color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
            Submit Exam
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Question Panel */}
        <div style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
          {q && (
            <div style={{ maxWidth: 700 }}>
              {/* Question */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #e5e7eb', marginBottom: 20, boxShadow: '0 2px 8px rgba(30,58,95,0.05)' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
                  <span style={{ background: '#1e3a5f', color: '#fff', fontWeight: 700, fontSize: 13, padding: '4px 12px', borderRadius: 20, flexShrink: 0 }}>Q{current + 1}</span>
                  <p style={{ fontSize: 16, color: '#1f2937', lineHeight: 1.7, fontWeight: 500 }}>{q.question_text}</p>
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Marks: {q.marks}</div>
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {['a', 'b', 'c', 'd'].map(opt => {
                  const optText = q[`option_${opt}`]
                  const isSelected = answers[q.id] === opt
                  return (
                    <label key={opt} style={{
                      display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                      borderRadius: 12, border: `2px solid ${isSelected ? '#1e3a5f' : '#e5e7eb'}`,
                      background: isSelected ? '#f0f4ff' : '#fff',
                      cursor: 'pointer', transition: 'all 0.15s',
                      boxShadow: isSelected ? '0 2px 12px rgba(30,58,95,0.12)' : 'none',
                    }}>
                      <input type="radio" name={`q_${q.id}`} value={opt}
                        checked={isSelected}
                        onChange={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                        style={{ width: 18, height: 18, accentColor: '#1e3a5f', cursor: 'pointer' }} />
                      <span style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: isSelected ? '#1e3a5f' : '#f3f4f6',
                        color: isSelected ? '#fff' : '#9ca3af',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700,
                      }}>{opt.toUpperCase()}</span>
                      <span style={{ fontSize: 15, color: '#1f2937' }}>{optText}</span>
                    </label>
                  )
                })}
              </div>

              {/* Navigation */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                  style={{ padding: '10px 20px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', color: current === 0 ? '#d1d5db' : '#374151', cursor: current === 0 ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 500 }}>
                  ← Previous
                </button>

                <button onClick={() => {
                  setMarked(m => { const n = new Set(m); if (n.has(q.id)) n.delete(q.id); else n.add(q.id); return n })
                }} style={{
                  padding: '10px 20px', borderRadius: 8, border: `1.5px solid ${marked.has(q.id) ? '#f59e0b' : '#e5e7eb'}`,
                  background: marked.has(q.id) ? '#fffbeb' : '#fff', color: marked.has(q.id) ? '#92400e' : '#6b7280',
                  cursor: 'pointer', fontSize: 14, fontWeight: 500,
                }}>{marked.has(q.id) ? '★ Marked' : '☆ Mark for Review'}</button>

                <button onClick={() => setCurrent(c => Math.min(totalQuestions - 1, c + 1))} disabled={current === totalQuestions - 1}
                  style={{
                    padding: '10px 20px', borderRadius: 8, border: '1.5px solid #1e3a5f',
                    background: current === totalQuestions - 1 ? '#f3f4f6' : '#1e3a5f',
                    color: current === totalQuestions - 1 ? '#d1d5db' : '#fff',
                    cursor: current === totalQuestions - 1 ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 500,
                  }}>Next →</button>

                {current === totalQuestions - 1 && (
                  <button onClick={() => setShowConfirm(true)}
                    style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, marginLeft: 'auto' }}>
                    Submit Now ✓
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                  <span>Progress</span>
                  <span>{Math.round((answered / totalQuestions) * 100)}% completed</span>
                </div>
                <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3 }}>
                  <div style={{ height: '100%', background: '#10b981', borderRadius: 3, width: `${(answered / totalQuestions) * 100}%`, transition: 'width 0.3s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Palette Panel */}
        <div style={{
          width: 220, background: '#fff', borderLeft: '1px solid #e5e7eb',
          padding: 20, overflowY: 'auto', flexShrink: 0,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e3a5f', marginBottom: 14, fontFamily: 'Poppins' }}>Question Palette</div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {[
              { color: '#d1fae5', border: '#6ee7b7', textColor: '#065f46', label: 'Answered' },
              { color: '#fee2e2', border: '#fca5a5', textColor: '#991b1b', label: 'Not Answered' },
              { color: '#fef3c7', border: '#fde68a', textColor: '#92400e', label: 'Marked for Review' },
              { color: '#1e3a5f', border: '#1e3a5f', textColor: '#fff', label: 'Current' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: l.color, border: `1.5px solid ${l.border}`, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#6b7280' }}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* Dots grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {questions.map((q, i) => {
              const status = answers[q.id] ? 'answered' : marked.has(q.id) ? 'marked' : 'default'
              return (
                <PaletteDot key={q.id} num={i + 1} status={status} isCurrent={i === current}
                  onClick={() => setCurrent(i)} />
              )
            })}
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f3f4f6', fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
            <div>Answered: <strong style={{ color: '#10b981' }}>{answered}</strong></div>
            <div>Unanswered: <strong style={{ color: '#ef4444' }}>{totalQuestions - answered}</strong></div>
            <div>Marked: <strong style={{ color: '#f59e0b' }}>{marked.size}</strong></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      `}</style>
    </div>
  )
}
