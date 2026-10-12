import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  LockKeyhole,
  MessageSquareHeart,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'
import { Badge } from '../components/ui/accessible'

function SunriseIllustration() {
  return (
    <div className="aspect-square w-full max-w-md overflow-hidden rounded-[2rem] border-2 border-ink/10 bg-gradient-to-b from-amber-100/70 via-orange-50 to-emerald-50 p-4 shadow-inner">
      <svg
        viewBox="0 0 400 400"
        className="h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Matahari terbit di balik jalan setapak"
      >
        <motion.circle
          cx="200"
          cy="190"
          r="112"
          fill="url(#sunGlow)"
          animate={{ opacity: [0.35, 0.65, 0.35], scale: [0.95, 1.04, 0.95] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="200"
          cy="178"
          r="54"
          fill="url(#sunGradient)"
          initial={{ cy: 220, opacity: 0.6 }}
          animate={{ cy: 175, opacity: 1 }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
        />
        <motion.path
          d="M-40 280C60 210 160 250 260 220C340 195 410 240 450 280V400H-40V280Z"
          fill="#C7E8D8"
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 0.9 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
        <motion.path
          d="M-20 315C100 270 200 300 300 280C360 268 410 290 430 320V400H-20V315Z"
          fill="#8EE3C2"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.35 }}
        />
        <motion.path
          d="M197 235C205 272 173 311 192 350C202 371 187 390 181 400H231C237 384 239 360 220 330C201 299 220 263 202 233Z"
          fill="#FDE68A"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.95 }}
          transition={{ duration: 1.8, delay: 0.5, ease: 'easeInOut' }}
        />
        <circle cx="148" cy="315" r="10" fill="#047857" opacity="0.8" />
        <circle cx="263" cy="306" r="12" fill="#059669" opacity="0.8" />
        <circle cx="128" cy="343" r="13" fill="#10B981" opacity="0.7" />
        <motion.path
          d="M78 120Q90 108 102 120Q114 108 126 120"
          stroke="#78716C"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M286 96Q298 84 310 96Q322 84 334 96"
          stroke="#78716C"
          strokeWidth="2.5"
          strokeLinecap="round"
          animate={{ y: [2, -4, 2] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
        <defs>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sunGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

const steps = [
  {
    number: '1',
    title: 'Ceritakan',
    label: 'Bebas & anonim',
    description: 'Ceritakan hal yang kamu alami. Kamu bisa memilih untuk menyembunyikan nama dari tampilan laporan.',
    classes: 'bg-amber-50 border-amber-300 shadow-amber-500/20',
    numberClasses: 'bg-amber-200/70 text-amber-900',
  },
  {
    number: '2',
    title: 'Ditinjau',
    label: 'Dengan hati-hati',
    description: 'Wali kelas atau Guru BK meninjau laporan dan menentukan langkah pendampingan yang sesuai.',
    classes: 'bg-sky-50 border-sky-300 shadow-sky-500/20',
    numberClasses: 'bg-sky-200/70 text-sky-900',
  },
  {
    number: '3',
    title: 'Didampingi',
    label: 'Satu langkah demi satu',
    description: 'Kamu dapat mengikuti perkembangan laporan dan mendapat dukungan selama proses penanganan.',
    classes: 'bg-emerald-50 border-emerald-300 shadow-emerald-500/20',
    numberClasses: 'bg-emerald-200/70 text-emerald-900',
  },
]

function getStatusBadge(status) {
  const variants = {
    dikirim: { label: 'Laporan diterima', icon: Clock3, className: 'bg-amber-50 text-amber-800 border-amber-300' },
    ditinjau: { label: 'Sedang ditinjau', icon: Search, className: 'bg-sky-50 text-sky-800 border-sky-300' },
    pendampingan: { label: 'Dalam pendampingan', icon: HeartHandshake, className: 'bg-violet-50 text-violet-800 border-violet-300' },
    selesai: { label: 'Telah ditindaklanjuti', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
    eskalasi_eksternal: { label: 'Penanganan lanjutan', icon: ShieldCheck, className: 'bg-orange-50 text-orange-800 border-orange-300' },
  }
  return variants[status] || { label: status || 'Status belum tersedia', icon: AlertCircle, className: 'bg-stone-100 text-stone-700 border-stone-300' }
}

export default function LandingPage() {
  const { reports } = useApp()
  const [trackCode, setTrackCode] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleTrack = (event) => {
    event.preventDefault()
    const cleanedCode = trackCode.trim().toUpperCase()
    if (!cleanedCode) return

    setSearchResult(reports.find((report) => report.code?.toUpperCase() === cleanedCode) || null)
    setHasSearched(true)
  }

  const status = searchResult ? getStatusBadge(searchResult.status) : null
  const StatusIcon = status?.icon

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-heading text-base font-extrabold text-stone-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <HeartHandshake size={20} />
            </span>
            <span>Lanjut Sekolah</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <a href="#alur" className="hidden text-sm font-medium text-stone-600 hover:text-stone-900 sm:inline">
              Cara kerja
            </a>
            <a href="#lacak" className="hidden text-sm font-medium text-stone-600 hover:text-stone-900 sm:inline">
              Lacak laporan
            </a>
            <Link to="/login" className="rounded-xl border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50">
              Masuk
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-stone-200/60 bg-gradient-to-b from-amber-50/60 via-white to-stone-50 py-12 md:py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="space-y-6 text-center lg:col-span-7 lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 sm:text-sm"
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Ruang cerita dan pendampingan siswa
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-4xl md:text-5xl lg:text-6xl"
              >
                Kamu tidak sendirian.{' '}
                <span className="text-amber-700 decoration-amber-300 decoration-wavy underline decoration-2">
                  Ceritakan,
                </span>{' '}
                kami dengarkan.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mx-auto max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg lg:mx-0"
              >
                Setiap kegelisahan, perundungan, atau beban pikiran berhak mendapat ruang untuk didengar.
                Wali kelas dan Guru BK siap mendampingi tanpa menghakimi.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row lg:justify-start"
              >
                <Link to="/login" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full gap-2 sm:w-auto" icon={MessageSquareHeart}>
                    Mulai Cerita Sekarang
                  </Button>
                </Link>
                <a href="#lacak" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full gap-2 sm:w-auto" icon={Search}>
                    Lacak Laporan
                  </Button>
                </a>
              </motion.div>
              <p className="text-xs text-stone-500">
                Kamu dapat mengirim laporan setelah masuk dengan akun siswa.
              </p>
            </div>
            <div className="flex justify-center lg:col-span-5">
              <SunriseIllustration />
            </div>
          </div>
        </section>

        <section id="alur" className="bg-stone-100/70 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <Badge status="default" label="Alur pendampingan" showIcon={false} className="mb-3" />
              <h2 className="font-heading text-2xl font-extrabold text-stone-900 sm:text-3xl">
                Tiga langkah menuju dukungan
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:text-base">
                Proses yang sederhana dan jelas, dirancang supaya kamu merasa nyaman saat meminta bantuan.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <motion.article
                  key={step.number}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, rotate: index === 1 ? 0.6 : -0.6 }}
                  className={`rounded-3xl border-2 border-dashed p-6 shadow-[4px_4px_0] sm:p-7 ${step.classes}`}
                >
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-extrabold ${step.numberClasses}`}>
                    {step.number}
                  </div>
                  <h3 className="flex flex-wrap items-center gap-2 font-heading text-lg font-bold text-stone-900">
                    {step.title}
                    <span className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-semibold text-stone-600">
                      {step.label}
                    </span>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{step.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-stone-200/70 bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="font-heading text-2xl font-extrabold text-stone-900 sm:text-3xl">
                Dukungan yang menghargai ceritamu
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:text-base">
                Kamu berhak diperlakukan dengan hormat dan mendapat informasi mengenai proses laporanmu.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <article className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <span className="rounded-xl bg-amber-100 p-3 text-amber-800"><LockKeyhole size={22} /></span>
                <div>
                  <h3 className="font-bold text-stone-900">Pilihan privasi</h3>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">
                    Kamu dapat memilih mode anonim pada formulir laporan. Informasi tetap ditangani dengan hati-hati.
                  </p>
                </div>
              </article>
              <article className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <span className="rounded-xl bg-sky-100 p-3 text-sky-800"><HeartHandshake size={22} /></span>
                <div>
                  <h3 className="font-bold text-stone-900">Pendampingan manusia</h3>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">
                    Laporan ditinjau oleh pihak sekolah yang bertugas agar tindak lanjut sesuai dengan situasi.
                  </p>
                </div>
              </article>
              <article className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <span className="rounded-xl bg-emerald-100 p-3 text-emerald-800"><ShieldCheck size={22} /></span>
                <div>
                  <h3 className="font-bold text-stone-900">Langkah yang jelas</h3>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">
                    Gunakan kode laporan untuk melihat status penanganan tanpa harus mencari kembali laporannya.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="lacak" className="scroll-mt-20 bg-amber-50/50 py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-lg sm:p-9">
              <div className="text-center">
                <span className="mb-3 inline-flex rounded-2xl bg-amber-100 p-3 text-amber-800">
                  <Search size={24} />
                </span>
                <h2 className="font-heading text-2xl font-extrabold text-stone-900">
                  Lacak status laporanmu
                </h2>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-stone-600">
                  Masukkan kode yang muncul setelah laporan dikirim, contohnya{' '}
                  <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-stone-800">LS-ABCD-1</code>.
                </p>
              </div>
              <form onSubmit={handleTrack} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="track-code">Kode laporan</label>
                <input
                  id="track-code"
                  type="text"
                  autoComplete="off"
                  placeholder="Masukkan kode laporan"
                  value={trackCode}
                  onChange={(event) => {
                    setTrackCode(event.target.value)
                    if (hasSearched) setHasSearched(false)
                  }}
                  className="min-h-12 flex-1 rounded-xl border border-stone-300 bg-white px-4 font-mono text-base uppercase tracking-wide text-stone-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                />
                <Button type="submit" className="min-h-12 sm:w-44">
                  Periksa status
                </Button>
              </form>

              <AnimatePresence mode="wait">
                {hasSearched && (
                  <motion.div
                    key={searchResult?.id || 'not-found'}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-6 border-t border-stone-200 pt-5"
                    aria-live="polite"
                  >
                    {searchResult ? (
                      <div className="space-y-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-stone-500">
                            Kode: {searchResult.code}
                          </span>
                          {StatusIcon && (
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}>
                              <StatusIcon size={14} />
                              {status.label}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold capitalize text-stone-900">
                            {searchResult.category || 'Laporan siswa'}
                          </h3>
                          <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-stone-600">
                            {searchResult.description || 'Laporan sedang ditinjau oleh pihak sekolah.'}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 pt-3 text-xs text-stone-500">
                          <span>
                            Dikirim:{' '}
                            {searchResult.createdAt
                              ? new Date(searchResult.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })
                              : 'Baru saja'}
                          </span>
                          <span className="font-medium text-emerald-800">
                            {searchResult.anonymous ? 'Mode anonim' : 'Laporan bernama'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950" role="status">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                        <p>
                          Kode <span className="font-mono font-bold">{trackCode.trim().toUpperCase()}</span> belum ditemukan.
                          Periksa kembali kode laporan dan coba lagi.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-stone-900 py-10 text-stone-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
          <div>
            <div className="flex items-center justify-center gap-2 font-heading text-lg font-bold text-white md:justify-start">
              <HeartHandshake className="text-amber-400" size={20} />
              <span>Lanjut Sekolah</span>
            </div>
            <p className="mt-2 max-w-md text-xs leading-relaxed text-stone-400">
              Ruang untuk menyampaikan masalah dan memperoleh dukungan di lingkungan sekolah.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-5 text-sm">
            <a href="#alur" className="transition hover:text-white">Cara kerja</a>
            <a href="#lacak" className="transition hover:text-white">Lacak laporan</a>
            <Link to="/login" className="transition hover:text-white">Masuk</Link>
          </div>
          <p className="flex items-center gap-1.5 text-xs">
            <Zap className="text-emerald-400" size={15} />
            Dukungan dimulai dari cerita yang didengar
          </p>
        </div>
      </footer>
    </div>
  )
}
