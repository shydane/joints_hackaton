import { Outlet } from 'react-router-dom'
import TeacherSidebar from './TeacherSidebar'

/**
 * Layout wrapper untuk halaman guru (wali kelas & BK).
 * Sidebar kiri + area konten.
 */
export default function TeacherLayout() {
  return (
    <div className="flex min-h-screen w-full bg-bg">
      {/* Sidebar */}
      <TeacherSidebar />

      {/* Main content */}
      <main className="min-w-0 flex-1 overflow-x-hidden p-4 pt-16 md:p-6 md:pt-6">
        <Outlet />
      </main>
    </div>
  )
}
