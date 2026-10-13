import { motion } from 'framer-motion'
import {
  AlertTriangle, CheckCircle, ExternalLink, Inbox, Shield, TrendingUp, Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Cell, Pie, PieChart, ResponsiveContainer, Tooltip,
} from 'recharts'
import { useApp } from '../../context/AppContext'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import EmptyState from '../../assets/illustrations/EmptyState'

const KANBAN_COLUMNS = [
  { id: 'dikirim', label: 'Baru', icon: Inbox, color: 'border-t-sky', bg: 'bg-sky-light' },
  { id: 'ditinjau', label: 'Ditinjau', icon: TrendingUp, color: 'border-t-lemon', bg: 'bg-lemon-light' },
  { id: 'pendampingan', label: 'Pendampingan', icon: Shield, color: 'border-t-sunrise', bg: 'bg-sunrise-light' },
  { id: 'selesai', label: 'Selesai', icon: CheckCircle, color: 'border-t-mint', bg: 'bg-mint-light' },
  { id: 'eskalasi_eksternal', label: 'Eskalasi Eksternal', icon: ExternalLink, color: 'border-t-danger', bg: 'bg-danger-light' },
]

const CATEGORY_LABELS = {
  ekonomi: 'Ekonomi',
  bullying: 'Bullying / Sosial',
  motivasi: 'Kurang Motivasi',
  lainnya: 'Lainnya',
}

const CATEGORY_COLORS = {
  ekonomi: '#7CC6FE',
  bullying: '#FF7A3D',
  motivasi: '#FFD966',
  lainnya: '#8EE3C2',
}

const STATUS_LABELS = {
  dikirim: 'Baru',
  ditinjau: 'Ditinjau',
  pendampingan: 'Pendampingan',
  selesai: 'Selesai',
  eskalasi_eksternal: 'Eskalasi Eksternal',
}

function isHighRisk(student) {
  const history = student.riwayatBulanan || []
  if (!history.length) return false

  const latest = history[history.length - 1]
  const previous = history[history.length - 2]
  const attendanceIsLow = latest.kehadiranPersen < 80
  const gradeDropped = previous?.nilaiRataRata > 0
    && ((previous.nilaiRataRata - latest.nilaiRataRata) / previous.nilaiRataRata) * 100 > 15
  return attendanceIsLow || gradeDropped
}

const priorityOrder = { mendesak: 0, penting: 1, biasa: 2 }

export default function CounselorDashboard() {
  const navigate = useNavigate()
  const { currentUser, getReportsForUser, getNamaTampilan, students } = useApp()
  const reports = currentUser ? getReportsForUser(currentUser.id, 'guru_bk') : []
  const activeCount = reports.filter(report => !['selesai', 'eskalasi_eksternal'].includes(report.status)).length
  const highRiskStudentIds = new Set(students.filter(isHighRisk).map(student => student.studentId))
  const escalatedCount = reports.filter(report => report.status === 'eskalasi_eksternal').length
  const categoryData = Object.keys(CATEGORY_LABELS)
    .map(category => ({
      name: CATEGORY_LABELS[category],
      value: reports.filter(report => report.category === category).length,
      color: CATEGORY_COLORS[category],
    }))
    .filter(item => item.value > 0)

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
      <header>
        <h1 className="text-xl font-bold font-heading">Dashboard Guru BK</h1>
        <p className="mt-0.5 text-xs text-ink/50">{currentUser?.name} · Ringkasan penanganan kasus</p>
      </header>

      <section aria-label="Ringkasan metrik" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard label="Kasus Aktif" value={activeCount} icon={TrendingUp} color="bg-sky-light" />
        <MetricCard label="Siswa Berisiko Tinggi" value={highRiskStudentIds.size} icon={Users} color="bg-lemon-light" />
        <MetricCard label="Eskalasi Eksternal" value={escalatedCount} icon={AlertTriangle} color="bg-danger-light" />
        <MetricCard label="Jumlah Kasus" value={reports.length} icon={CheckCircle} color="bg-mint-light" />
      </section>

      <Card className="!p-4">
        <h2 className="mb-2 text-sm font-bold font-heading">Distribusi Kasus per Kategori</h2>
        {categoryData.length === 0 ? (
          <p className="py-5 text-center text-xs text-ink/40">Belum ada data kasus.</p>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="h-48 w-full sm:max-w-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={78}
                    paddingAngle={3}
                    stroke="#14213D"
                    strokeWidth={2}
                  >
                    {categoryData.map(item => <Cell key={item.name} fill={item.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ border: '2px solid #14213D', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid w-full grid-cols-2 gap-2">
              {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
                <div key={id} className="flex items-center gap-2 rounded-xl border-2 border-ink/10 p-2">
                  <span className="h-3 w-3 rounded-full border border-ink" style={{ backgroundColor: CATEGORY_COLORS[id] }} />
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold">{label}</span>
                  <span className="text-xs font-bold">{reports.filter(report => report.category === id).length}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <section aria-label="Papan Kanban kasus">
        <h2 className="mb-3 text-sm font-bold font-heading">Daftar Kes</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {KANBAN_COLUMNS.map(column => {
            const Icon = column.icon
            const columnReports = reports
              .filter(report => report.status === column.id)
              .sort((a, b) => (priorityOrder[a.urgency] ?? 3) - (priorityOrder[b.urgency] ?? 3))

            return (
              <div key={column.id} className={`kanban-column min-w-0 border-t-4 ${column.color} p-3`}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon size={16} />
                    <h3 className="text-xs font-bold font-heading">{column.label}</h3>
                  </div>
                  <span className={`flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-ink px-1 text-xs font-bold ${column.bg}`}>
                    {columnReports.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {columnReports.length === 0 ? (
                    <p className="py-5 text-center text-xs text-ink/30">Tiada kes</p>
                  ) : columnReports.map((report, index) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Card
                        hoverable
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/bk/kasus/${report.id}`)}
                        onKeyDown={event => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            navigate(`/bk/kasus/${report.id}`)
                          }
                        }}
                        className={`!p-3 ${report.urgency === 'mendesak' ? 'border-danger bg-danger-light' : ''}`}
                      >
                        <div className="mb-2 flex flex-wrap gap-1">
                          <Badge variant={report.status}>{STATUS_LABELS[report.status] || report.status}</Badge>
                          {report.urgency === 'mendesak' && <Badge variant="danger">🚨 Mendesak</Badge>}
                          {report.urgency === 'penting' && <Badge variant="sunrise">Penting</Badge>}
                          {report.source === 'deteksi' && <Badge variant="deteksi">Terdeteksi Otomatis</Badge>}
                          {report.escalatedTo && <Badge variant="sky">Dari Wali Kelas</Badge>}
                        </div>
                        <p className="truncate text-xs font-bold">
                          {getNamaTampilan(report, 'guru_bk')}
                        </p>
                        <p className="mt-1 text-[10px] text-ink/50">
                          {CATEGORY_LABELS[report.category] || CATEGORY_LABELS.lainnya} · {report.class}
                        </p>
                        <p className="mt-2 line-clamp-2 text-xs text-ink/60">
                          {report.description || report.detectionReason || 'Tiada cerita tambahan.'}
                        </p>
                        <div className="mt-2 flex items-center justify-between border-t border-ink/10 pt-2 text-[10px] text-ink/40">
                          <span className="font-mono">{report.code}</span>
                          <span>{report.sessionCount || 0} sesi</span>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        {reports.length === 0 && (
          <Card className="mt-4 flex justify-center">
            <EmptyState text="Belum ada kes untuk ditangani" />
          </Card>
        )}
      </section>
    </div>
  )
}

function MetricCard({ label, value, icon: Icon, color }) {
  return (
    <Card className={color}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-ink/60">{label}</p>
          <p className="mt-1 font-heading text-2xl font-extrabold">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-ink bg-white/70">
          <Icon size={20} />
        </span>
      </div>
    </Card>
  )
}
