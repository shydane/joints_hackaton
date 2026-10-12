import { Outlet } from 'react-router-dom'
import StudentPillNav from './StudentPillNav'
import { Sun, LogOut } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'

/**
 * Layout wrapper untuk halaman siswa.
 * Menyediakan floating pill nav dan header.
 */
export default function StudentLayout() {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b-2 border-ink px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sunrise rounded-lg border-2 border-ink flex items-center justify-center">
            <Sun size={16} className="text-white" />
          </div>
          <span className="text-sm font-bold font-heading">Lanjut Sekolah</span>
        </div>
        <div className="flex items-center gap-2">
          {currentUser && (
            <span className="text-xs font-medium text-ink/50 hidden sm:block">
              Hai, {currentUser.name.split(' ')[0]}!
            </span>
          )}
          <span className="text-lg">{currentUser?.avatar}</span>
          <button onClick={handleLogout} className="p-1.5 rounded-lg text-ink/40 hover:text-danger transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        <Outlet />
      </main>

      {/* Floating pill nav */}
      <StudentPillNav />
    </div>
  )
}
