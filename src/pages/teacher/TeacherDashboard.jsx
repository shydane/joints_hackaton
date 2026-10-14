import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity, ArrowDown, ArrowUp, CheckCircle, Clock3, Eye, Inbox, Minus, Search, Shield, Sparkles,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../assets/illustrations/EmptyState'
import { ATTENDANCE_THRESHOLD, GRADE_DROP_THRESHOLD } from '../../utils/detection'

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
  const {
    currentUser,
    users,
    students,
    uploadedFiles,
    getReportsForUser,
    getNamaTampilan,
    jalankanDeteksiDini,
  } = useApp()
  const [filter, setFilter] = useState('all')
  const [detectionMessage, setDetectionMessage] = useState('')

  const reports = useMemo(() => (
    currentUser
      ? getReportsForUser(currentUser.id, 'wali_kelas')
        .filter(report => report.class === currentUser.class)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      : []
  ), [currentUser, getReportsForUser])
  const academicData = useMemo(() => {
    const classStudents = users.filter(user => (
      user.role === 'siswa' && user.class === currentUser?.class
    ))
    const rows = classStudents.map(studentUser => {
      const studentData = students.find(student => student.studentId === studentUser.id)
      const history = studentData?.riwayatBulanan || []
      const legacyEntries = history.filter(entry => !entry.periode)
      const periodEntries = history
        .filter(entry => entry.periode)
        .sort((first, second) => first.periode.localeCompare(second.periode))
      const orderedHistory = [...legacyEntries, ...periodEntries]
      const latest = orderedHistory.at(-1) || null
      const previous = orderedHistory.at(-2) || null
      const gradeDrop = previous?.nilaiRataRata > 0 && latest
        ? ((previous.nilaiRataRata - latest.nilaiRataRata) / previous.nilaiRataRata) * 100
        : 0
      const attendanceAtRisk = Boolean(latest && latest.kehadiranPersen < ATTENDANCE_THRESHOLD)
      const gradeAtRisk = gradeDrop > GRADE_DROP_THRESHOLD
      const linkedReport = reports
        .filter(report => report.studentId === studentUser.id && report.class === currentUser?.class)
        .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))[0] || null

      return {
        studentId: studentUser.id,
        name: linkedReport ? getNamaTampilan(linkedReport, 'wali_kelas') : studentUser.name,
        latest,
        previous,
        gradeDrop,
        attendanceAtRisk,
        gradeAtRisk,
        atRisk: attendanceAtRisk || gradeAtRisk,
        linkedReport,
      }
    })
    const rowsWithData = rows.filter(row => row.latest)
    const latestFile = uploadedFiles
      .filter(file => file.class === currentUser?.class)
      .sort((first, second) => new Date(second.uploadedAt) - new Date(first.uploadedAt))[0] || null

    return {
      rows,
      rowsWithData,
      latestFile,
      averageAttendance: rowsWithData.length
        ? rowsWithData.reduce((total, row) => total + row.latest.kehadiranPersen, 0) / rowsWithData.length
        : null,
      averageGrade: rowsWithData.length
        ? rowsWithData.reduce((total, row) => total + row.latest.nilaiRataRata, 0) / rowsWithData.length
        : null,
      atRiskCount: rowsWithData.filter(row => row.atRisk).length,
    }
  }, [currentUser?.class, getNamaTampilan, reports, students, uploadedFiles, users])

  const metrics = [
    {
      label: 'Kasus Baru',
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
        ? `${count} kasus baru terdeteksi untuk kelas ${currentUser.class}.`
        : `Tidak ada kasus baru yang memenuhi kriteria untuk kelas ${currentUser.class}.`)
    } catch (error) {
      console.error('Gagal menjalankan deteksi dini:', error)
      setDetectionMessage('Deteksi dini gagal dijalankan. Silakan coba lagi.')
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

      <section aria-label="Ringkasan kasus" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {metrics.map(({ label, count, icon: Icon, color }) => (
          <Card key={label} color={label === 'Kasus Baru' ? 'sky-light' : label === 'Aktif' ? 'lemon-light' : 'mint-light'} className="!p-4">
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

      <section aria-label="Data akademik kelas" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold font-heading">Data Akademik Kelas</h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/guru/data-akademik')}>
            Kelola data
          </Button>
        </div>
        {academicData.latestFile && (
          <p className="text-xs text-ink/60">
            Terakhir diperbarui: {new Date(academicData.latestFile.uploadedAt).toLocaleString('id-ID')}
            {' '}dari {academicData.latestFile.fileName}
          </p>
        )}

        {academicData.rowsWithData.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 text-center">
            <EmptyState text="Belum ada data akademik untuk kelas ini" />
            <Button onClick={() => navigate('/guru/data-akademik')}>Unggah data akademik</Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Card color="sky-light" className="!p-4">
                <p className="text-xs font-semibold text-ink/60">Siswa dengan data</p>
                <p className="mt-1 font-heading text-2xl font-extrabold">{academicData.rowsWithData.length}</p>
              </Card>
              <Card color="mint-light" className="!p-4">
                <p className="text-xs font-semibold text-ink/60">Rata-rata kehadiran terbaru</p>
                <p className="mt-1 font-heading text-2xl font-extrabold">
                  {academicData.averageAttendance.toFixed(1)}%
                </p>
              </Card>
              <Card color="lemon-light" className="!p-4">
                <p className="text-xs font-semibold text-ink/60">Rata-rata nilai terbaru</p>
                <p className="mt-1 font-heading text-2xl font-extrabold">
                  {academicData.averageGrade.toFixed(1)}
                </p>
              </Card>
              <Card color={academicData.atRiskCount ? 'danger-light' : 'mint-light'} className="!p-4">
                <p className="text-xs font-semibold text-ink/60">Siswa perlu perhatian</p>
                <p className="mt-1 font-heading text-2xl font-extrabold">{academicData.atRiskCount}</p>
              </Card>
            </div>

            <Card className="!p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-ink/20">
                      <th className="p-3">Nama siswa</th>
                      <th className="p-3">Periode terbaru</th>
                      <th className="p-3">Nilai</th>
                      <th className="p-3">Kehadiran</th>
                      <th className="p-3">Tren nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {academicData.rows.map(row => {
                      const TrendIcon = !row.previous || row.latest?.nilaiRataRata === row.previous.nilaiRataRata
                        ? Minus
                        : row.latest?.nilaiRataRata > row.previous.nilaiRataRata ? ArrowUp : ArrowDown
                      const trendLabel = TrendIcon === ArrowUp ? 'Naik' : TrendIcon === ArrowDown ? 'Turun' : 'Tetap'
                      return (
                        <tr
                          key={row.studentId}
                          onClick={() => row.linkedReport && navigate(`/guru/kasus/${row.linkedReport.id}`)}
                          onKeyDown={event => {
                            if (row.linkedReport && (event.key === 'Enter' || event.key === ' ')) {
                              event.preventDefault()
                              navigate(`/guru/kasus/${row.linkedReport.id}`)
                            }
                          }}
                          role={row.linkedReport ? 'button' : undefined}
                          tabIndex={row.linkedReport ? 0 : undefined}
                          className={`border-b border-ink/10 ${
                            row.atRisk ? 'bg-danger-light' : ''
                          } ${row.linkedReport ? 'cursor-pointer hover:bg-sky-light' : ''}`}
                        >
                          <td className="p-3 font-semibold">{row.name}</td>
                          <td className="p-3">{row.latest?.periode || row.latest?.bulan || '—'}</td>
                          <td className="p-3">{row.latest ? row.latest.nilaiRataRata : '—'}</td>
                          <td className="p-3">{row.latest ? `${row.latest.kehadiranPersen}%` : '—'}</td>
                          <td className="p-3">
                            {row.latest && (
                              <span className={`inline-flex items-center gap-1 font-semibold ${
                                trendLabel === 'Turun' ? 'text-danger' : 'text-ink/70'
                              }`} aria-label={trendLabel}>
                                <TrendIcon size={14} /> {trendLabel}
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </section>

      <section aria-label="Daftar kasus">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="mr-1 flex items-center gap-1.5 text-xs font-bold">
            <Search size={14} /> Filter kasus
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
            <EmptyState text={reports.length ? 'Tidak ada kasus untuk filter ini' : 'Belum ada kasus untuk kelas ini'} />
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
                      {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
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
