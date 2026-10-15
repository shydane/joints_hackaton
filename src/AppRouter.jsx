import { Navigate, Route, Routes } from 'react-router-dom'
import App from './App'
import { useApp } from './context/AppContext'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Daftar from './pages/Daftar'
import StudentLayout from './components/layout/StudentLayout'
import StudentHome from './pages/student/StudentHome'
import ReportForm from './pages/student/ReportForm'
import ReportResult from './pages/student/ReportResult'
import TrackReport from './pages/student/TrackReport'
import StudentNotifications from './pages/student/StudentNotifications'
import GamePuzzle from './pages/student/GamePuzzle'
import GameKata from './pages/student/GameKata'
import GameMemori from './pages/student/GameMemori'
import GameHitung from './pages/student/GameHitung'
import GameHub from './pages/student/GameHub'
import Leaderboard from './pages/student/Leaderboard'
import GamePola from './pages/student/GamePola'
import GameBentuk from './pages/student/GameBentuk'
import GameSudoku from './pages/student/GameSudoku'
import GameHanoi from './pages/student/GameHanoi'
import TeacherLayout from './components/layout/TeacherLayout'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import CaseDetail from './pages/teacher/CaseDetail'
import TeacherNotifications from './pages/teacher/TeacherNotifications'
import TeacherAcademicData from './pages/teacher/TeacherAcademicData'
import CounselorDashboard from './pages/counselor/CounselorDashboard'
import CounselorCaseDetail from './pages/counselor/CounselorCaseDetail'
import CounselorSummary from './pages/counselor/CounselorSummary'
import FloatingDemoBar from './components/layout/FloatingDemoBar'

export default function AppRouter() {
  const { currentUser } = useApp()

  return (
    <>
      <Routes>
        <Route path="/ai" element={<App />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/daftar" element={<Daftar />} />
        <Route path="/lacak" element={<StudentLayout />}>
          <Route index element={<TrackReport />} />
        </Route>

        <Route
          path="/siswa"
          element={currentUser?.role === 'siswa' ? <StudentLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<StudentHome />} />
          <Route path="lapor" element={<ReportForm />} />
          <Route path="hasil/:code" element={<ReportResult />} />
          <Route path="lacak" element={<TrackReport />} />
          <Route path="notifikasi" element={<StudentNotifications />} />
          <Route path="permainan" element={<GameHub />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="game/puzzle" element={<GamePuzzle />} />
          <Route path="game/kata" element={<GameKata />} />
          <Route path="game/memori" element={<GameMemori />} />
          <Route path="game/hitung" element={<GameHitung />} />
          <Route path="game/pola" element={<GamePola />} />
          <Route path="game/bentuk" element={<GameBentuk />} />
          <Route path="game/sudoku" element={<GameSudoku />} />
          <Route path="game/hanoi" element={<GameHanoi />} />
        </Route>

        <Route
          path="/guru"
          element={currentUser?.role === 'wali_kelas' ? <TeacherLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<TeacherDashboard />} />
          <Route path="kasus/:id" element={<CaseDetail />} />
          <Route path="notifikasi" element={<TeacherNotifications />} />
          <Route path="data-akademik" element={<TeacherAcademicData />} />
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
      <FloatingDemoBar />
    </>
  )
}
