import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'

const ROLES = [
  {
    id: 'siswa',
    title: 'Siswa',
    description: 'Sampaikan cerita dan pantau perkembangan laporanmu.',
    icon: GraduationCap,
    selectedClasses: 'border-sky-500 bg-sky-50 ring-2 ring-sky-100',
    iconClasses: 'bg-sky-100 text-sky-800',
  },
  {
    id: 'wali_kelas',
    title: 'Wali Kelas',
    description: 'Tinjau laporan dan dampingi siswa di kelasmu.',
    icon: BookOpen,
    selectedClasses: 'border-amber-500 bg-amber-50 ring-2 ring-amber-100',
    iconClasses: 'bg-amber-100 text-amber-800',
  },
  {
    id: 'guru_bk',
    title: 'Guru BK',
    description: 'Kelola pendampingan dan tindak lanjut kasus.',
    icon: HeartHandshake,
    selectedClasses: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100',
    iconClasses: 'bg-emerald-100 text-emerald-800',
  },
]

const ROLE_PATHS = {
  siswa: '/siswa',
  wali_kelas: '/guru',
  guru_bk: '/bk',
}

export default function Login() {
  const navigate = useNavigate()
  const { users, login } = useApp()
  const [selectedRole, setSelectedRole] = useState('siswa')
  const accounts = users.filter((user) => user.role === selectedRole)
  const [selectedUserId, setSelectedUserId] = useState(
    users.find((user) => user.role === 'siswa')?.id ?? '',
  )

  const selectRole = (role) => {
    setSelectedRole(role)
    setSelectedUserId(users.find((user) => user.role === role)?.id ?? '')
  }

  const handleLogin = () => {
    const user = login(selectedUserId)
    if (user) {
      navigate(ROLE_PATHS[user.role] || '/', { replace: true })
    }
  }

  return (
    <main className="min-h-screen bg-bg px-4 py-10 sm:px-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="text-center">
          <span className="mb-3 inline-flex rounded-full bg-sunrise-light px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink">
            Masuk simulasi
          </span>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Selamat datang di Lanjut Sekolah
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink/60 sm:text-base">
            Pilih peran dan akun demo untuk melanjutkan.
          </p>
        </header>

        <section aria-label="Pilih peran" className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {ROLES.map(({ id, title, description, icon: Icon, selectedClasses, iconClasses }, index) => {
            const isSelected = selectedRole === id
            const accountCount = users.filter((user) => user.role === id).length

            return (
              <motion.button
                key={id}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                aria-pressed={isSelected}
                onClick={() => selectRole(id)}
                className={`flex min-h-52 flex-col justify-between rounded-2xl border-2 p-5 text-left shadow-sm transition ${
                  isSelected
                    ? selectedClasses
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClasses}`}>
                      <Icon size={24} aria-hidden="true" />
                    </span>
                    {isSelected && <CheckCircle2 size={20} className="text-ink" aria-label="Peran dipilih" />}
                  </div>
                  <h2 className="font-heading text-lg font-bold text-ink">{title}</h2>
                  <p className="mt-2 text-xs leading-relaxed text-ink/60">{description}</p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-3 text-xs font-semibold text-ink/60">
                  <span>{accountCount} akun tersedia</span>
                  <span>{isSelected ? 'Dipilih' : 'Pilih →'}</span>
                </div>
              </motion.button>
            )
          })}
        </section>

        <section className="mx-auto w-full max-w-xl rounded-2xl border border-ink/10 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="mb-4 text-sm font-bold text-ink">
            Pilih akun demo — {ROLES.find((role) => role.id === selectedRole)?.title}
          </h2>

          {accounts.length > 0 ? (
            <div className="mb-6 space-y-2" role="radiogroup" aria-label="Akun demo">
              {accounts.map((account) => {
                const selected = selectedUserId === account.id

                return (
                  <button
                    key={account.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSelectedUserId(account.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition ${
                      selected
                        ? 'border-ink bg-ink text-white shadow-sm'
                        : 'border-stone-200 bg-stone-50/70 text-ink hover:bg-stone-100'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                        selected ? 'bg-white/10' : 'bg-white'
                      }`}>
                        {account.avatar || account.initials || account.name?.[0] || '?'}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold">{account.name}</span>
                        <span className={`mt-0.5 block truncate text-xs ${selected ? 'text-white/65' : 'text-ink/50'}`}>
                          {account.class ? `Kelas ${account.class}` : account.email}
                        </span>
                      </span>
                    </span>
                    {selected && (
                      <span className="shrink-0 rounded-md bg-white/10 px-2 py-1 font-mono text-[10px] text-white/80">
                        Aktif
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="mb-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900" role="status">
              Belum ada akun demo untuk peran ini.
            </p>
          )}

          <Button
            type="button"
            fullWidth
            disabled={!selectedUserId || accounts.length === 0}
            onClick={handleLogin}
            icon={ArrowRight}
          >
            Masuk sebagai {accounts.find((account) => account.id === selectedUserId)?.name.split(' ')[0] || 'akun demo'}
          </Button>
        </section>

        <p className="text-center text-sm text-ink/60">
          Siswa baru?{' '}
          <button
            type="button"
            onClick={() => navigate('/daftar-siswa')}
            className="font-bold text-sunrise hover:underline"
          >
            Buat akun siswa
          </button>
        </p>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs font-medium text-ink/50 transition hover:text-ink"
          >
            ← Kembali ke beranda
          </button>
        </div>
      </div>
    </main>
  )
}
