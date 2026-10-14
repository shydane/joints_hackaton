import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Bell, LogOut, Sun, User,
  FileText, BarChart3, Users, ChevronLeft, ChevronRight, BookOpen
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useState } from 'react'

/**
 * Sidebar navigasi untuk guru (wali kelas & BK).
 * Ikon besar, bisa collapse di mobile.
 */
export default function TeacherSidebar() {
  const { currentUser, logout, getUnreadCount } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const isWaliKelas = currentUser?.role === 'wali_kelas'
  const basePath = isWaliKelas ? '/guru' : '/bk'

  const unreadCount = currentUser ? getUnreadCount(currentUser.id) : 0

  const navItems = isWaliKelas
    ? [
        { path: basePath, icon: LayoutDashboard, label: 'Dashboard' },
        { path: `${basePath}/data-akademik`, icon: BookOpen, label: 'Data Akademik' },
        { path: `${basePath}/notifikasi`, icon: Bell, label: 'Notifikasi', badge: unreadCount },
      ]
    : [
        { path: basePath, icon: LayoutDashboard, label: 'Dashboard' },
        { path: `${basePath}/notifikasi`, icon: Bell, label: 'Notifikasi', badge: unreadCount },
        { path: `${basePath}/ringkasan`, icon: BarChart3, label: 'Ringkasan' },
      ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      {/* Sidebar desktop */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 240 }}
        className="hidden md:flex teacher-sidebar h-screen shrink-0 flex-col sticky top-0 overflow-visible border-r-2 border-ink z-30"
      >
        {/* Header */}
        <div className="p-4 flex items-center gap-3 border-b-2 border-ink">
          <div className="w-10 h-10 bg-sunrise rounded-xl border-2 border-ink flex items-center justify-center flex-shrink-0">
            <Sun size={20} className="text-white" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-w-0"
            >
              <h2 className="text-sm font-bold font-heading truncate">Lanjut Sekolah</h2>
              <p className="text-xs text-ink/50 truncate">
                {isWaliKelas ? 'Wali Kelas' : 'Guru BK'}
              </p>
            </motion.div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 flex flex-col gap-1.5">
          {navItems.map(({ path, icon: Icon, label, badge }) => {
            const isActive = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-sm font-semibold transition-all text-left
                  ${isActive
                    ? 'bg-sunrise text-white shadow-[2px_2px_0_#14213D]'
                    : 'text-ink/60 hover:bg-bg hover:text-ink'
                  }
                `}
              >
                <Icon size={22} className="flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
                {badge > 0 && (
                  <span className={`
                    ${collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'}
                    w-5 h-5 bg-danger text-white text-[10px] font-bold
                    rounded-full flex items-center justify-center border-2 border-white
                  `}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-3 border-t-2 border-ink">
          {!collapsed && currentUser && (
            <div className="flex items-center gap-2 mb-3 px-2">
              <span className="text-xl">{currentUser.avatar}</span>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{currentUser.name}</p>
                <p className="text-[10px] text-ink/50 truncate">{currentUser.class || currentUser.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-ink/60 hover:bg-danger-light hover:text-danger transition-all w-full"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>

        {/* Toggle collapse */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Luaskan sidebar' : 'Ciutkan sidebar'}
          aria-expanded={!collapsed}
          className="absolute top-4 -right-3 z-40 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-white shadow-[2px_2px_0_#14213D] transition-colors hover:bg-bg"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </motion.aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b-2 border-ink px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sunrise rounded-lg border-2 border-ink flex items-center justify-center">
            <Sun size={16} className="text-white" />
          </div>
          <span className="text-sm font-bold font-heading">Lanjut Sekolah</span>
        </div>
        <div className="flex items-center gap-2">
          {navItems.map(({ path, icon: Icon, badge }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`relative p-2 rounded-lg ${location.pathname === path ? 'bg-sunrise text-white' : 'text-ink/50'}`}
            >
              <Icon size={20} />
              {badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {badge}
                </span>
              )}
            </button>
          ))}
          <button onClick={handleLogout} className="p-2 rounded-lg text-ink/50 hover:text-danger">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </>
  )
}
