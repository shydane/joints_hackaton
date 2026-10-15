import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, GraduationCap, HeartHandshake } from 'lucide-react'
import Button from './ui/Button'
import { useApp } from '../context/AppContext'

const QUICK_ROLES = [
  { role: 'siswa', label: 'Siswa', path: '/siswa', icon: GraduationCap },
  { role: 'wali_kelas', label: 'Wali Kelas', path: '/guru', icon: BookOpen },
  { role: 'guru_bk', label: 'BK', path: '/bk', icon: HeartHandshake },
]

export default function DemoPanel() {
  const navigate = useNavigate()
  const { demoUsers, classes, loginDemo } = useApp()
  const [search, setSearch] = useState('')
  const studentsByClass = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('id')
    const filtered = demoUsers.filter(user =>
      user.role === 'siswa'
      && (user.name || user.nama || '').toLocaleLowerCase('id').includes(query),
    )
    return filtered.reduce((groups, user) => {
      const classId = user.kelasId || user.classId || user.class || 'Belum ada kelas'
      groups[classId] ||= []
      groups[classId].push(user)
      return groups
    }, {})
  }, [demoUsers, search])

  const enterDemo = (roleOrId, path) => {
    const user = loginDemo(roleOrId)
    if (user) navigate(path, { replace: true })
  }

  return (
    <section className="neo-card flex flex-col gap-4 bg-white">
      <div>
        <h2 className="text-center font-heading text-lg font-bold">Coba akun demo</h2>
        <p className="mt-1 text-center text-xs text-ink/50">
          Akun demo hanya menggunakan data seed, bukan akun pendaftaran.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {QUICK_ROLES.map(({ role, label, path, icon }) => (
          <Button
            key={role}
            type="button"
            variant="outline"
            onClick={() => enterDemo(role, path)}
            icon={icon}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="border-t-2 border-ink/10 pt-3">
        <h3 className="font-heading text-sm font-bold">Pilih akun siswa</h3>
        <input
          type="search"
          placeholder="Cari nama siswa"
          aria-label="Cari nama siswa demo"
          value={search}
          onChange={event => setSearch(event.target.value)}
          className="mt-2 w-full rounded-xl border-2 border-ink px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sunrise"
        />

        <div className="mt-3 flex max-h-64 flex-col gap-3 overflow-y-auto">
          {classes.map(kelas => {
            const students = studentsByClass[kelas.id] || []
            if (students.length === 0) return null
            return (
              <div key={kelas.id}>
                <h4 className="mb-1 text-xs font-bold text-ink/60">Kelas {kelas.nama}</h4>
                <div className="flex flex-col gap-1">
                  {students.map(student => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => enterDemo(student.id, '/siswa')}
                      className="flex items-center justify-between rounded-lg border border-ink/15 px-3 py-2 text-left text-sm font-semibold hover:bg-sky-light"
                    >
                      <span>{student.name || student.nama}</span>
                      <span className="rounded-full border border-ink/20 bg-lemon-light px-2 py-0.5 text-[10px] font-bold">
                        Demo
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
          {Object.keys(studentsByClass).length === 0 && (
            <p className="text-xs text-ink/50">Tidak ada siswa demo dengan nama tersebut.</p>
          )}
        </div>
      </div>

      <div className="border-t-2 border-ink/10 pt-3">
        <h3 className="font-heading text-sm font-bold">Pilih wali kelas</h3>
        <div className="mt-2 flex flex-col gap-2">
          {classes.map(kelas => {
            const wali = demoUsers.find(user =>
              user.id === kelas.waliKelasId
              && (user.role === 'wali' || user.role === 'wali_kelas'),
            )
            if (!wali) return null
            return (
              <button
                key={kelas.id}
                type="button"
                onClick={() => enterDemo(wali.id, '/guru')}
                className="flex items-center justify-between rounded-lg border border-ink/15 px-3 py-2 text-left text-sm hover:bg-lemon-light"
              >
                <span>
                  <strong>{kelas.nama}</strong>
                  <span className="ml-2">{wali.nama || wali.name}</span>
                </span>
                <span className="rounded-full border border-ink/20 bg-lemon-light px-2 py-0.5 text-[10px] font-bold">
                  Demo
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
