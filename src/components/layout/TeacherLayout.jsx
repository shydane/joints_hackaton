import { Outlet } from 'react-router-dom'
import TeacherSidebar from './TeacherSidebar'

/**
 * Layout wrapper untuk halaman guru (wali kelas & BK).
 * Sidebar kiri + area konten.
 */
export default function TeacherLayout() {
  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <TeacherSidebar />

      {/* Main content */}
      <main className="flex-1 md:p-6 p-4 pt-16 md:pt-6 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  )
}
