import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import StudentPillNav from './StudentPillNav'
import { Sun, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'

/**
 * Layout wrapper untuk halaman siswa.
 * Header di atas + floating pill navigation di bawah (baik desktop maupun mobile).
 */
export default function StudentLayout() {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!location.state?.toast) return
    setToast(location.state.toast)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 4000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* ==================== HEADER ==================== */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b-2 border-ink px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-sunrise rounded-xl border-2 border-ink flex items-center justify-center shadow-[2px_2px_0_#14213D]">
              <Sun size={18} className="text-white" />
            </div>
            <div>
              <span className="text-base font-bold font-heading text-ink block leading-tight">Lanjut Sekolah</span>
              <span className="text-[11px] text-ink/45 font-medium hidden sm:block">Kamu Tidak Sendirian</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="flex items-center gap-2 bg-bg border border-ink/15 rounded-full px-3 py-1">
                <span className="text-base">{currentUser.avatar}</span>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-ink leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-ink/50 leading-none">{currentUser.class || 'Siswa'}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              title="Keluar"
              aria-label="Keluar"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-ink bg-white hover:bg-danger-light hover:text-danger text-xs font-bold text-ink/70 transition-all shadow-[2px_2px_0_#14213D] active:translate-x-0.5 active:translate-y-0.5"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================== CONTENT ==================== */}
      <main className="w-full max-w-4xl mx-auto px-4 py-6 pb-28 md:px-6 md:py-8 md:pb-28">
        {toast && (
          <p
            role="status"
            className="mb-4 rounded-xl border-2 border-ink bg-mint-light p-3 text-sm font-bold shadow-[3px_3px_0_#14213D]"
          >
            {toast}
          </p>
        )}
        <Outlet />
      </main>

      {/* ==================== FLOATING PILL NAV (BOTTOM) ==================== */}
      <StudentPillNav />
    </div>
  )
}
