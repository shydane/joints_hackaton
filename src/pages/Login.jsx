import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, BookOpen, HeartHandshake, ArrowLeft, LogIn } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import SunrisePath from '../assets/illustrations/SunrisePath'

/**
 * Halaman login simulasi.
 * Pilih role dulu, lalu pilih akun dummy.
 */
const ROLES = [
  {
    id: 'siswa',
    label: 'Siswa',
    description: 'Laporkan masalah & lacak status',
    icon: GraduationCap,
    color: 'bg-sky-light',
    path: '/siswa',
  },
  {
    id: 'wali_kelas',
    label: 'Wali Kelas',
    description: 'Pantau & dampingi siswa',
    icon: BookOpen,
    color: 'bg-lemon-light',
    path: '/guru',
  },
  {
    id: 'guru_bk',
    label: 'Guru BK',
    description: 'Konseling & tindak lanjut',
    icon: HeartHandshake,
    color: 'bg-mint-light',
    path: '/bk',
  },
]

export default function Login() {
  const navigate = useNavigate()
  const { users, login } = useApp()
  const [selectedRole, setSelectedRole] = useState(null)

  // Filter users berdasarkan role terpilih
  const filteredUsers = selectedRole
    ? users.filter(u => u.role === selectedRole.id)
    : []

  const handleLogin = (userId) => {
    const user = login(userId)
    if (user) {
      const role = ROLES.find(r => r.id === user.role)
      navigate(role?.path || '/siswa')
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <SunrisePath size={80} className="mx-auto mb-3" />
          <h1 className="text-xl font-bold font-heading">
            {selectedRole ? `Masuk sebagai ${selectedRole.label}` : 'Pilih Peranmu'}
          </h1>
          <p className="text-xs text-ink/50 mt-1">
            {selectedRole
              ? 'Pilih akun untuk simulasi demo'
              : 'Kamu ingin masuk sebagai siapa?'
            }
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!selectedRole ? (
            /* STEP 1: Pilih role */
            <motion.div
              key="roles"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-3"
            >
              {ROLES.map((role, index) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    hoverable
                    onClick={() => setSelectedRole(role)}
                    className="flex items-center gap-4"
                  >
                    <div className={`
                      w-12 h-12 ${role.color} rounded-xl border-2 border-ink
                      flex items-center justify-center flex-shrink-0
                      shadow-[2px_2px_0_#14213D]
                    `}>
                      <role.icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold font-heading">{role.label}</h3>
                      <p className="text-xs text-ink/50">{role.description}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* STEP 2: Pilih akun */
            <motion.div
              key="accounts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-3"
            >
              {/* Tombol kembali */}
              <button
                onClick={() => setSelectedRole(null)}
                className="flex items-center gap-1 text-sm text-ink/50 hover:text-ink transition-colors mb-1"
              >
                <ArrowLeft size={16} />
                Kembali pilih peran
              </button>

              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    hoverable
                    onClick={() => handleLogin(user.id)}
                    className="flex items-center gap-4"
                    color={selectedRole.color.replace('bg-', '')}
                  >
                    <span className="text-2xl">{user.avatar}</span>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold">{user.name}</h3>
                      <p className="text-xs text-ink/50">
                        {user.class ? `Kelas ${user.class}` : user.email}
                      </p>
                    </div>
                    <LogIn size={18} className="text-ink/30" />
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer link kembali ke landing */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-ink/30 hover:text-ink transition-colors"
          >
            ← Kembali ke beranda
          </button>
        </div>
      </motion.div>
    </div>
  )
}
