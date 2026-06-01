import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/LoadingSpinner'

// Public
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import ChangePassword from './pages/ChangePassword'
import ProfilePage from './pages/ProfilePage'

// Management
import ManagementDashboard from './pages/management/Dashboard'
import CreateStaff from './pages/management/CreateStaff'
import StaffList from './pages/management/StaffList'
import StudentList from './pages/management/StudentList'

// Staff
import StaffDashboard from './pages/staff/Dashboard'
import CreateTest from './pages/staff/CreateTest'
import MyTests from './pages/staff/MyTests'
import AddQuestions from './pages/staff/AddQuestions'
import EnrollStudents from './pages/staff/EnrollStudents'
import Results from './pages/staff/Results'
import CreateStudent from './pages/staff/CreateStudent'

// Student
import StudentDashboard from './pages/student/Dashboard'
import StudentMyTests from './pages/student/MyTests'
import AttendTest from './pages/student/AttendTest'
import MyResults from './pages/student/MyResults'

export default function App() {
  const { loading } = useAuth()

  if (loading) return <LoadingSpinner fullPage />

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: 'Inter, sans-serif', fontSize: 14 },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ── Auth Required (any role) ── */}
        <Route path="/change-password" element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />

        {/* ── Management ── */}
        <Route path="/management/dashboard" element={
          <ProtectedRoute allowedRoles={['management']}>
            <ManagementDashboard />
          </ProtectedRoute>
        } />
        <Route path="/management/create-staff" element={
          <ProtectedRoute allowedRoles={['management']}>
            <CreateStaff />
          </ProtectedRoute>
        } />
        <Route path="/management/staff-list" element={
          <ProtectedRoute allowedRoles={['management']}>
            <StaffList />
          </ProtectedRoute>
        } />
        <Route path="/management/student-list" element={
          <ProtectedRoute allowedRoles={['management']}>
            <StudentList />
          </ProtectedRoute>
        } />

        {/* ── Staff ── */}
        <Route path="/staff/dashboard" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffDashboard />
          </ProtectedRoute>
        } />
        <Route path="/staff/create-test" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <CreateTest />
          </ProtectedRoute>
        } />
        <Route path="/staff/tests" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <MyTests />
          </ProtectedRoute>
        } />
        <Route path="/staff/tests/:test_id/questions" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <AddQuestions />
          </ProtectedRoute>
        } />
        <Route path="/staff/tests/:test_id/enroll" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <EnrollStudents />
          </ProtectedRoute>
        } />
        <Route path="/staff/results" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <Results />
          </ProtectedRoute>
        } />
        <Route path="/staff/create-student" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <CreateStudent />
          </ProtectedRoute>
        } />

        {/* ── Student ── */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/tests" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentMyTests />
          </ProtectedRoute>
        } />
        <Route path="/student/tests/:test_id/attend" element={
          <ProtectedRoute allowedRoles={['student']}>
            <AttendTest />
          </ProtectedRoute>
        } />
        <Route path="/student/results" element={
          <ProtectedRoute allowedRoles={['student']}>
            <MyResults />
          </ProtectedRoute>
        } />

        {/* ── 404 ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
