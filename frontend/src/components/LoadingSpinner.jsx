const LoadingSpinner = ({ fullPage = false, size = 40 }) => {
  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: size, height: size,
        border: `3px solid #e5e7eb`,
        borderTopColor: '#1e3a5f',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (fullPage) {
    return (
      <div style={{
        position: 'fixed', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#f8f9fa', zIndex: 9999,
      }}>
        {spinner}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      {spinner}
    </div>
  )
}

export default LoadingSpinner
