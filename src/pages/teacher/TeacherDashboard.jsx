import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity, CheckCircle, Clock3, Eye, Inbox, Search, Shield, Sparkles,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../assets/illustrations/EmptyState'

const STATUS_FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'new', label: 'Baru' },
  { id: 'active', label: 'Dalam Pendampingan' },
  { id: 'done', label: 'Selesai' },
]

const STATUS_LABELS = {
  dikirim: 'Baru',
  ditinjau: 'Ditinjau',
  pendampingan: 'Dalam Pendampingan',
  selesai: 'Selesai',
  eskalasi_eksternal: 'Eskalasi Eksternal',
}

const CATEGORY_LABELS = {
  ekonomi: '💰 Ekonomi',
  bullying: '😰 Bullying / Sosial',
  motivasi: '😔 Kurang Motivasi',
  lainnya: '💬 Lainnya',
}

const URGENCY_LABELS = {
  biasa: 'Biasa',
  penting: 'Penting',
  mendesak: '🚨 Mendesak',
}

function matchesStatus(report, filter) {
  if (filter === 'new') return report.status === 'dikirim'
  if (filter === 'active') return ['ditinjau', 'pendampingan'].includes(report.status)
  if (filter === 'done') return report.status === 'selesai'
  return true
}

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { currentUser, getReportsForUser, getNamaTampilan, jalankanDeteksiDini } = useApp()
  const [filter, setFilter] = useState('all')
  const [detectionMessage, setDetectionMessage] = useState('')

  const reports = currentUser
    ? getReportsForUser(currentUser.id, 'wali_kelas')
      .filter(report => report.class === currentUser.class)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : []

  const metrics = [
    {
      label: 'Jumlah Kes Baharu',
      count: reports.filter(report => report.status === 'dikirim').length,
      icon: Inbox,
      color: 'bg-sky-light',
    },
    {
      label: 'Aktif',
      count: reports.filter(report => ['ditinjau', 'pendampingan'].includes(report.status)).length,
      icon: Activity,
      color: 'bg-lemon-light',
    },
    {
      label: 'Selesai',
      count: reports.filter(report => report.status === 'selesai').length,
      icon: CheckCircle,
      color: 'bg-mint-light',
    },
  ]
  const visibleReports = reports.filter(report => matchesStatus(report, filter))

  const handleDetection = () => {
    try {
      const count = jalankanDeteksiDini(currentUser.id)
      setDetectionMessage(count > 0
        ? `${count} kes baharu dikesan untuk kelas ${currentUser.class}.`
        : `Tiada kes baharu memenuhi kriteria untuk kelas ${currentUser.class}.`)
    } catch (error) {
      console.error('Gagal menjalankan deteksi dini:', error)
      setDetectionMessage('Deteksi dini gagal dijalankan. Sila cuba lagi.')
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold font-heading">Dashboard Wali Kelas</h1>
          <p className="mt-0.5 text-xs text-ink/50">
            {currentUser?.name} — Kelas {currentUser?.class}
          </p>
        </div>
        <Button variant="secondary" icon={Sparkles} onClick={handleDetection}>
          Jalankan Deteksi Dini
        </Button>
      </div>

      {detectionMessage && (
        <p role="status" aria-live="polite" className="text-xs font-semibold text-ink/70">
          {detectionMessage}
        </p>
      )}

      <section aria-label="Ringkasan kes" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {metrics.map(({ label, count, icon: Icon, color }) => (
          <Card key={label} color={label === 'Kes Baharu' ? 'sky-light' : label === 'Aktif' ? 'lemon-light' : 'mint-light'} className="!p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-ink/60">{label}</p>
                <p className="mt-1 font-heading text-2xl font-extrabold">{count}</p>
              </div>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 border-ink ${color}`}>
                <Icon size={20} />
              </span>
            </div>
          </Card>
        ))}
      </section>

      <section aria-label="Senarai kes">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="mr-1 flex items-center gap-1.5 text-xs font-bold">
            <Search size={14} /> Tapis kes
          </div>
          {STATUS_FILTERS.map(option => (
            <button
              key={option.id}
              type="button"
              aria-pressed={filter === option.id}
              onClick={() => setFilter(option.id)}
              className={`rounded-full border-2 border-ink px-3 py-1.5 text-xs font-bold transition-all ${
                filter === option.id
                  ? 'bg-sunrise text-white shadow-[2px_2px_0_#14213D]'
                  : 'bg-white text-ink/60 hover:bg-bg'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {visibleReports.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 text-center">
            <EmptyState text={reports.length ? 'Tiada kes untuk penapis ini' : 'Belum ada kes untuk kelas ini'} />
            {reports.length === 0 && (
              <p className="max-w-sm text-xs text-ink/50">
                Gunakan Deteksi Dini untuk menyemak pelajar yang mungkin memerlukan perhatian.
              </p>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {visibleReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card
                  hoverable
                  onClick={() => navigate(`/guru/kasus/${report.id}`)}
                  className="!p-4"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-1.5">
                    <Badge variant={report.status}>{STATUS_LABELS[report.status] || report.status}</Badge>
                    <Badge variant={report.urgency === 'mendesak' ? 'danger' : report.urgency === 'penting' ? 'sunrise' : 'sky'}>
                      {URGENCY_LABELS[report.urgency] || 'Biasa'}
                    </Badge>
                    {report.source === 'deteksi' && (
                      <Badge variant="deteksi">🔍 Terdeteksi Otomatis</Badge>
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold">
                        {getNamaTampilan(report, 'wali_kelas')}
                      </h2>
                      <p className="mt-1 text-xs text-ink/50">
                        {CATEGORY_LABELS[report.category] || CATEGORY_LABELS.lainnya} · {report.class}
                      </p>
                    </div>
                    {report.status === 'dikirim'
                      ? <Inbox size={18} className="shrink-0 text-sky" />
                      : report.status === 'pendampingan'
                        ? <Shield size={18} className="shrink-0 text-sunrise" />
                        : report.status === 'selesai'
                          ? <CheckCircle size={18} className="shrink-0 text-mint" />
                          : <Eye size={18} className="shrink-0 text-ink/40" />}
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-ink/60">
                    {report.description || report.detectionReason}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t-2 border-ink/10 pt-2">
                    <span className="font-mono text-[10px] text-ink/40">{report.code}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-ink/40">
                      <Clock3 size={12} />
                      {new Date(report.createdAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
