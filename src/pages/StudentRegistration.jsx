import { useMemo, useState } from 'react'
import { ArrowLeft, GraduationCap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function StudentRegistration() {
  const navigate = useNavigate()
  const { users, createStudentAccount } = useApp()
  const [name, setName] = useState('')
  const [className, setClassName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const availableClasses = useMemo(() => {
    const classTeachers = users.filter(user => user.role === 'wali_kelas' && user.class)
    const teacherCounts = classTeachers.reduce((counts, teacher) => {
      counts[teacher.class] = (counts[teacher.class] || 0) + 1
      return counts
    }, {})
    return classTeachers
      .filter(teacher => teacherCounts[teacher.class] === 1)
      .map(teacher => ({ name: teacher.class, teacher }))
      .sort((first, second) => first.name.localeCompare(second.name, 'id'))
  }, [users])

  const selectedClass = availableClasses.find(item => item.name === className)

  const handleSubmit = event => {
    event.preventDefault()
    setErrorMessage('')
    try {
      if (!selectedClass) {
        setErrorMessage('Pilih kelas yang memiliki tepat satu wali kelas.')
        return
      }
      createStudentAccount({ name, className })
      navigate('/siswa', { replace: true })
    } catch (error) {
      console.error('Gagal membuat akun siswa:', error)
      setErrorMessage(error.message || 'Akun siswa gagal dibuat. Silakan coba lagi.')
    }
  }

  return (
    <main className="min-h-screen bg-bg px-4 py-10 sm:px-6">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex w-fit items-center gap-1 text-sm font-semibold text-ink/55 hover:text-ink"
        >
          <ArrowLeft size={16} />
          Kembali ke login
        </button>

        <Card className="!p-5 sm:!p-8">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-ink bg-sky-light">
              <GraduationCap size={24} />
            </span>
            <div>
              <h1 className="text-xl font-bold font-heading">Buat Akun Siswa</h1>
              <p className="mt-1 text-xs text-ink/55">Daftar ke kelas dan wali kelas yang tersedia.</p>
            </div>
          </div>

          {availableClasses.length === 0 ? (
            <p role="alert" className="rounded-xl bg-danger-light p-3 text-sm font-semibold text-danger">
              Belum ada kelas yang memiliki tepat satu wali kelas. Hubungi administrator sekolah.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                Nama lengkap siswa
                <input
                  type="text"
                  autoComplete="name"
                  minLength={2}
                  maxLength={120}
                  required
                  value={name}
                  onChange={event => setName(event.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="rounded-xl border-2 border-ink bg-white px-3 py-2.5 focus:border-sunrise focus:outline-none focus:ring-2 focus:ring-sunrise"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                Kelas
                <select
                  required
                  value={className}
                  onChange={event => setClassName(event.target.value)}
                  className="rounded-xl border-2 border-ink bg-white px-3 py-2.5 focus:border-sunrise focus:outline-none focus:ring-2 focus:ring-sunrise"
                >
                  <option value="">Pilih kelas</option>
                  {availableClasses.map(item => (
                    <option key={item.name} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </label>

              {selectedClass && (
                <p className="rounded-xl border-2 border-ink/10 bg-sky-light p-3 text-xs">
                  Wali kelas: <strong>{selectedClass.teacher.name}</strong>
                </p>
              )}

              <p className="text-xs leading-relaxed text-ink/55">
                Akun akan langsung masuk setelah dibuat dan tersimpan di browser ini. Ini adalah
                pendaftaran versi demo; aplikasi belum memakai kata sandi atau server akun.
              </p>

              {errorMessage && (
                <p role="alert" className="text-sm font-semibold text-danger">
                  {errorMessage}
                </p>
              )}

              <Button type="submit" disabled={!name.trim() || !className}>
                Buat akun dan masuk
              </Button>
            </form>
          )}
        </Card>
      </div>
    </main>
  )
}
