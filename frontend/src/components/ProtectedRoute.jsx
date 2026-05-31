import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'
import AccessDenied from './AccessDenied'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner fullPage />

  if (!user) return <Navigate to="/login" replace />

  // Force password change on first login
  if (!user.password_changed && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  // Role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <AccessDenied />
  }

  return children
}

export default ProtectedRoute
