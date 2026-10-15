import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'

const initialForm = {
  nama: '',
  kelasId: '',
  username: '',
  password: '',
  konfirmasiPassword: '',
}

export default function Daftar() {
  const navigate = useNavigate()
  const { classes, users, daftarSiswa, login } = useApp()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const selectedClass = classes.find(kelas => kelas.id === form.kelasId)
  const waliKelas = users.find(user => user.id === selectedClass?.waliKelasId)
  const waliName = waliKelas?.nama || waliKelas?.name || 'Wali kelas belum ditentukan'

  const updateField = (field) => (event) => {
    setForm(previous => ({ ...previous, [field]: event.target.value }))
    setErrors(previous => ({ ...previous, [field]: '' }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.nama.trim()) nextErrors.nama = 'Nama lengkap perlu diisi.'
    if (!form.kelasId) nextErrors.kelasId = 'Silakan pilih kelasmu.'
    if (!form.username.trim()) nextErrors.username = 'Username perlu diisi.'
    else if (users.some(user => user.username === form.username.trim())) {
      nextErrors.username = 'Username ini sudah digunakan. Coba username lain.'
    }
    if (!form.password) nextErrors.password = 'Password perlu diisi.'
    else if (form.password.length < 6) nextErrors.password = 'Gunakan minimal 6 karakter untuk password.'
    if (!form.konfirmasiPassword) nextErrors.konfirmasiPassword = 'Konfirmasi password perlu diisi.'
    else if (form.password !== form.konfirmasiPassword) {
      nextErrors.konfirmasiPassword = 'Konfirmasi password belum sama.'
    }
    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      await daftarSiswa({
        nama: form.nama.trim(),
        kelasId: form.kelasId,
        username: form.username.trim(),
        password: form.password,
        role: 'siswa',
      })
      const result = await login(form.username.trim(), form.password)
      if (!result?.user) throw new Error('Akun berhasil dibuat, tetapi belum dapat digunakan untuk masuk. Silakan coba masuk.')
      navigate('/siswa', {
        replace: true,
        state: { toast: `Selamat datang, ${form.nama.trim()}` },
      })
    } catch (error) {
      setErrors(previous => ({
        ...previous,
        form: error.message || 'Pendaftaran belum berhasil. Silakan coba lagi.',
      }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-bg px-4 py-10 sm:px-6">
      <section className="neo-card mx-auto w-full max-w-xl bg-white">
        <header className="mb-6 text-center">
          <p className="mb-2 inline-flex rounded-full border-2 border-ink bg-mint-light px-3 py-1 text-xs font-bold">
            Pendaftaran Siswa
          </p>
          <h1 className="font-heading text-2xl font-extrabold">Buat akun siswa</h1>
          <p className="mt-2 text-sm text-ink/60">
            Daftarkan akunmu untuk mulai bercerita dan mendapatkan pendampingan.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <FormField label="Nama lengkap" error={errors.nama}>
            <input
              value={form.nama}
              onChange={updateField('nama')}
              autoComplete="name"
              aria-invalid={Boolean(errors.nama)}
              className="w-full rounded-xl border-2 border-ink bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sunrise"
            />
          </FormField>

          <FormField label="Pilih kelas" error={errors.kelasId}>
            <select
              value={form.kelasId}
              onChange={updateField('kelasId')}
              aria-invalid={Boolean(errors.kelasId)}
              className="w-full rounded-xl border-2 border-ink bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sunrise"
            >
              <option value="">Pilih kelasmu</option>
              {classes.map(kelas => {
                const teacher = users.find(user => user.id === kelas.waliKelasId)
                const teacherName = teacher?.nama || teacher?.name || 'Wali kelas belum ditentukan'
                return (
                  <option key={kelas.id} value={kelas.id}>
                    {kelas.nama} — {teacherName}
                  </option>
                )
              })}
            </select>
            {selectedClass && (
              <p className="mt-1 text-xs font-semibold text-ink/70">
                Wali kelasmu: {waliName}
              </p>
            )}
          </FormField>

          <FormField label="Username" error={errors.username}>
            <input
              value={form.username}
              onChange={updateField('username')}
              autoComplete="username"
              aria-invalid={Boolean(errors.username)}
              className="w-full rounded-xl border-2 border-ink bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sunrise"
            />
          </FormField>

          <FormField label="Password" error={errors.password}>
            <div className="flex overflow-hidden rounded-xl border-2 border-ink bg-white focus-within:ring-2 focus-within:ring-sunrise">
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={form.password}
                onChange={updateField('password')}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                className="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(visible => !visible)}
                aria-label={passwordVisible ? 'Sembunyikan password' : 'Tampilkan password'}
                className="px-3 text-ink/60 hover:bg-bg"
              >
                {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormField>

          <FormField label="Konfirmasi password" error={errors.konfirmasiPassword}>
            <input
              type={passwordVisible ? 'text' : 'password'}
              value={form.konfirmasiPassword}
              onChange={updateField('konfirmasiPassword')}
              autoComplete="new-password"
              aria-invalid={Boolean(errors.konfirmasiPassword)}
              className="w-full rounded-xl border-2 border-ink bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sunrise"
            />
          </FormField>

          {errors.form && <p role="alert" className="text-sm font-semibold text-danger">{errors.form}</p>}
          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? 'Membuat akun...' : 'Daftar'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink/60">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-bold text-ink underline underline-offset-2">
            Masuk
          </Link>
        </p>
      </section>
    </main>
  )
}

function FormField({ label, error, children }) {
  return (
    <label className="block text-sm font-bold">
      {label}
      <div className="mt-1">{children}</div>
      {error && <span className="mt-1 block text-xs font-semibold text-danger">{error}</span>}
    </label>
  )
}
