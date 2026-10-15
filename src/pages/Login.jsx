import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'
import { DEMO_MODE } from '../config'
import DemoPanel from '../components/DemoPanel'

export default function Login() {
  const navigate = useNavigate()
  const { login, loginDemo } = useApp()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await login(form.username.trim(), form.password)
      if (!result?.user) {
        setError('Username atau password belum cocok. Periksa kembali, ya.')
        return
      }
      navigate(getRolePath(result.user.role), {
        replace: true,
      })
    } catch (loginError) {
      setError(loginError.message || 'Belum berhasil masuk. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-bg px-4 py-10 sm:px-6">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <header className="text-center">
          <span className="mb-3 inline-flex rounded-full border-2 border-ink bg-sunrise-light px-3 py-1 text-xs font-bold uppercase tracking-wider">
            Masuk
          </span>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight">
            Selamat datang kembali
          </h1>
          <p className="mt-2 text-sm text-ink/60">Masuk menggunakan username dan password akunmu.</p>
          {DEMO_MODE && (
            <p className="mt-3 inline-flex rounded-full border-2 border-ink bg-lemon-light px-3 py-1 text-xs font-bold">
              Mode Demo: login tanpa password
            </p>
          )}
        </header>

        <section className="neo-card bg-white">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm font-bold">
              Username
              <input
                required
                autoComplete="username"
                value={form.username}
                onChange={event => setForm(previous => ({ ...previous, username: event.target.value }))}
                className="rounded-xl border-2 border-ink bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sunrise"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-bold">
              Password
              <input
                required
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={event => setForm(previous => ({ ...previous, password: event.target.value }))}
                className="rounded-xl border-2 border-ink bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sunrise"
              />
            </label>
            {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
            <Button type="submit" fullWidth disabled={submitting} icon={ArrowRight}>
              {submitting ? 'Memeriksa...' : 'Masuk'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-ink/60">
            Belum punya akun?{' '}
            <Link to="/daftar" className="font-bold text-ink underline underline-offset-2">
              Daftar
            </Link>
          </p>
        </section>

        {DEMO_MODE && <DemoPanel />}

        <p className="text-center">
          <Link to="/" className="text-xs font-semibold text-ink/50 underline underline-offset-2">
            Kembali ke beranda
          </Link>
        </p>
      </div>
    </main>
  )
}

function getRolePath(role) {
  if (role === 'wali_kelas' || role === 'wali') return '/guru'
  if (role === 'guru_bk') return '/bk'
  return '/siswa'
}
