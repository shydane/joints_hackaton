import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, RotateCcw, Sparkles, Users } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Button from '../ui/Button'
import { DEMO_MODE } from '../../config'

const ROLE_OPTIONS = [
  { role: 'siswa', label: 'Siswa', path: '/siswa' },
  { role: 'wali_kelas', label: 'Wali Kelas', path: '/guru' },
  { role: 'guru_bk', label: 'Guru BK', path: '/bk' },
]

export default function FloatingDemoBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, loginDemo, resetData } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [resetConfirmation, setResetConfirmation] = useState(false)

  if (!DEMO_MODE) return null
  if (location.pathname === '/ai' || location.pathname.startsWith('/ai/')) return null

  const switchRole = (role, path) => {
    const account = loginDemo(role)
    if (!account) {
      setFeedback(`Akun demo ${role} tidak tersedia.`)
      return
    }

    navigate(path)
    setFeedback(`Demo bertukar kepada ${account.name || account.nama}.`)
    setIsOpen(true)
  }

  const handleReset = () => {
    if (!resetConfirmation) {
      setResetConfirmation(true)
      setFeedback('Klik sekali lagi untuk mengesahkan reset semua data demo.')
      return
    }

    resetData()
    setResetConfirmation(false)
    setFeedback('Data demo berjaya dipulihkan ke keadaan asal.')
  }

  return (
    <aside className="fixed bottom-4 right-4 z-[60] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2">
      {isOpen && !isMinimized && (
        <section
          aria-label="Panel demo juri"
          className="w-72 max-w-[calc(100vw-2rem)] rounded-2xl border-2 border-ink bg-white p-4 shadow-[4px_4px_0_#14213D]"
        >
          <header className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold font-heading">Demo Juri</h2>
              <p className="text-[11px] text-ink/50">
                {currentUser ? `Peranan: ${currentUser.role === 'wali_kelas' ? 'Wali Kelas' : currentUser.role === 'guru_bk' ? 'Guru BK' : 'Siswa'}` : 'Belum masuk'}
              </p>
            </div>
            <button
              type="button"
              aria-label="Minimalkan panel demo"
              onClick={() => setIsMinimized(true)}
              className="rounded-lg p-1.5 text-ink/50 transition hover:bg-bg hover:text-ink"
            >
              <ChevronDown size={16} />
            </button>
          </header>

          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink/50">Tukar peranan</p>
            {ROLE_OPTIONS.map(option => (
              <Button
                key={option.role}
                variant={currentUser?.role === option.role ? 'secondary' : 'outline'}
                size="sm"
                fullWidth
                onClick={() => switchRole(option.role, option.path)}
              >
                {option.label}
              </Button>
            ))}

            <div className="my-1 border-t-2 border-ink/10" />
            <Button
              variant={resetConfirmation ? 'danger' : 'outline'}
              size="sm"
              fullWidth
              icon={RotateCcw}
              onClick={handleReset}
            >
              {resetConfirmation ? 'Sahkan Reset Data' : 'Reset Data Demo'}
            </Button>
            {resetConfirmation && (
              <button
                type="button"
                onClick={() => {
                  setResetConfirmation(false)
                  setFeedback('')
                }}
                className="text-xs font-semibold text-ink/50 underline underline-offset-2"
              >
                Batal reset
              </button>
            )}
            {feedback && (
              <p role="status" aria-live="polite" className="rounded-xl bg-sky-light p-2 text-xs font-semibold text-ink">
                {feedback}
              </p>
            )}
          </div>
        </section>
      )}

      <div className="flex items-center gap-2">
        {isOpen && isMinimized && (
          <button
            type="button"
            aria-label="Buka semula panel demo"
            onClick={() => setIsMinimized(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-white text-ink shadow-[2px_2px_0_#14213D]"
          >
            <ChevronUp size={16} />
          </button>
        )}
        <button
          type="button"
          aria-expanded={isOpen && !isMinimized}
          onClick={() => {
            setIsOpen(open => !open)
            setIsMinimized(false)
          }}
          className="flex items-center gap-2 rounded-full border-2 border-ink bg-sunrise px-4 py-2 text-xs font-extrabold text-white shadow-[3px_3px_0_#14213D] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#14213D]"
        >
          {isOpen ? <Users size={15} /> : <Sparkles size={15} />}
          Demo
        </button>
      </div>
    </aside>
  )
}
