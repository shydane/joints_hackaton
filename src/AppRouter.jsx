import { Navigate, Route, Routes } from 'react-router-dom'
import App from './App'
import { useApp } from './context/AppContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import StudentLayout from './components/layout/StudentLayout'
import StudentHome from './pages/student/StudentHome'
import ReportForm from './pages/student/ReportForm'
import ReportResult from './pages/student/ReportResult'
import TrackReport from './pages/student/TrackReport'
import StudentNotifications from './pages/student/StudentNotifications'
import TeacherLayout from './components/layout/TeacherLayout'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import CaseDetail from './pages/teacher/CaseDetail'
import TeacherNotifications from './pages/teacher/TeacherNotifications'
import CounselorDashboard from './pages/counselor/CounselorDashboard'
import CounselorCaseDetail from './pages/counselor/CounselorCaseDetail'
import CounselorSummary from './pages/counselor/CounselorSummary'

export default function AppRouter() {
  const { currentUser } = useApp()

  return (
    <Routes>
      <Route path="/ai" element={<App />} />
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/siswa"
        element={currentUser?.role === 'siswa' ? <StudentLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<StudentHome />} />
        <Route path="lapor" element={<ReportForm />} />
        <Route path="hasil/:code" element={<ReportResult />} />
        <Route path="lacak" element={<TrackReport />} />
        <Route path="notifikasi" element={<StudentNotifications />} />
      </Route>

      <Route
        path="/guru"
        element={currentUser?.role === 'wali_kelas' ? <TeacherLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="kasus/:id" element={<CaseDetail />} />
        <Route path="notifikasi" element={<TeacherNotifications />} />
      </Route>

      <Route
        path="/bk"
        element={currentUser?.role === 'guru_bk' ? <TeacherLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<CounselorDashboard />} />
        <Route path="kasus/:id" element={<CounselorCaseDetail />} />
        <Route path="notifikasi" element={<TeacherNotifications />} />
        <Route path="ringkasan" element={<CounselorSummary />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
