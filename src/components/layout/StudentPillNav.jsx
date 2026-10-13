import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, PenLine, Search, Bell } from 'lucide-react'
import { useApp } from '../../context/AppContext'

/**
 * Floating pill navigation untuk siswa (mobile-first).
 * Melayang di bawah layar, bukan tab bar penuh.
 */
const NAV_ITEMS = [
  { path: '/siswa', icon: Home, label: 'Beranda' },
  { path: '/siswa/lapor', icon: PenLine, label: 'Lapor' },
  { path: '/siswa/lacak', icon: Search, label: 'Lacak' },
  { path: '/siswa/notifikasi', icon: Bell, label: 'Notif' },
]

export default function StudentPillNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, getUnreadCount } = useApp()

  const unreadCount = currentUser ? getUnreadCount(currentUser.id) : 0

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
    >
      <div className="pill-nav px-2 py-2 flex items-center gap-1">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path
          const isBell = label === 'Notif'

          return (
            <motion.button
              key={path}
              onClick={() => navigate(path)}
              whileTap={{ scale: 0.95 }}
              className={`
                relative flex items-center gap-1.5 px-3.5 py-2 rounded-full
                text-sm font-semibold transition-all
                ${isActive
                  ? 'bg-sunrise text-white shadow-sm'
                  : 'text-ink/50 hover:text-ink hover:bg-bg'
                }
              `}
            >
              <Icon size={18} />
              {isActive && (
                <motion.span
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  className="text-xs font-bold whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}

              {/* Badge notifikasi */}
              {isBell && unreadCount > 0 && (
                <span
                  aria-label={`${unreadCount} notifikasi belum dibaca`}
                  className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-danger px-1 text-[10px] font-bold text-white"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </motion.nav>
  )
}
