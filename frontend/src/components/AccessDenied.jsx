import { useNavigate } from 'react-router-dom'

const AccessDenied = () => {
  const navigate = useNavigate()
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 100%)',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20,
        padding: '60px 48px', textAlign: 'center', maxWidth: 480, width: '90%',
      }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🚫</div>
        <h1 style={{ color: '#e8c96d', fontSize: 28, marginBottom: 8, fontFamily: 'Poppins' }}>Access Denied</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 32, lineHeight: 1.6 }}>
          You don't have permission to access this page. Please contact your administrator.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '10px 24px', borderRadius: 8, border: '2px solid rgba(255,255,255,0.3)',
              background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500,
            }}
          >← Go Back</button>
          <button
            onClick={() => { localStorage.clear(); window.location.href = '/login' }}
            style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: '#c9a84c', color: '#0d1b2a', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            }}
          >Login Again</button>
        </div>
      </div>
    </div>
  )
}

export default AccessDenied
