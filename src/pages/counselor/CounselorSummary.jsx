import { motion } from 'framer-motion'
import { BarChart3, Users, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../assets/illustrations/EmptyState'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts'

/**
 * Halaman ringkasan statistik Guru BK.
 */
const COLORS = {
  ekonomi: '#7CC6FE',
  bullying: '#FF7A3D',
  motivasi: '#FFD966',
  lainnya: '#8EE3C2',
}

export default function CounselorSummary() {
  const { currentUser, getReportsForUser } = useApp()
  const allReports = currentUser ? getReportsForUser(currentUser.id, 'guru_bk') : []

  // Stats
  const activeCount = allReports.filter(r => !['selesai', 'eskalasi_eksternal'].includes(r.status)).length
  const completedCount = allReports.filter(r => r.status === 'selesai').length
  const escalatedCount = allReports.filter(r => r.status === 'eskalasi_eksternal').length
  const urgentCount = allReports.filter(r => r.urgency === 'mendesak' && r.status !== 'selesai').length

  // Kategori chart data
  const categoryData = Object.entries(
    allReports.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1
      return acc
    }, {})
  ).map(([key, value]) => ({
    name: key === 'ekonomi' ? 'Ekonomi' : key === 'bullying' ? 'Bullying' : key === 'motivasi' ? 'Motivasi' : 'Lainnya',
    value,
    color: COLORS[key],
  }))

  // Siswa berisiko tinggi (mendesak atau eskalasi)
  const highRiskStudents = allReports.filter(
    r => (r.urgency === 'mendesak' || r.sessionCount >= 3) && r.status !== 'selesai'
  )

  const stats = [
    { label: 'Kasus Aktif', value: activeCount, icon: TrendingUp, color: 'bg-sky-light', textColor: 'text-sky' },
    { label: 'Selesai', value: completedCount, icon: CheckCircle, color: 'bg-mint-light', textColor: 'text-mint' },
    { label: 'Eskalasi Eksternal', value: escalatedCount, icon: AlertTriangle, color: 'bg-danger-light', textColor: 'text-danger' },
    { label: 'Mendesak', value: urgentCount, icon: AlertTriangle, color: 'bg-lemon-light', textColor: 'text-sunrise' },
  ]

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold font-heading flex items-center gap-2">
          <BarChart3 size={22} /> Ringkasan
        </h1>
        <p className="text-xs text-ink/50 mt-0.5">Statistik penanganan kasus</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className={`text-center ${stat.color}`}>
              <stat.icon size={20} className={`mx-auto mb-1 ${stat.textColor}`} />
              <p className="text-2xl font-extrabold font-heading">{stat.value}</p>
              <p className="text-xs text-ink/50 font-medium">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pie: Kasus per Kategori */}
        <Card>
          <h3 className="text-sm font-bold font-heading mb-3">Kasus per Kategori</h3>
          {categoryData.length === 0 ? (
            <EmptyState size={100} text="Belum ada data kasus" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="#14213D"
                  strokeWidth={2}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    border: '2px solid #14213D',
                    borderRadius: '12px',
                    boxShadow: '2px 2px 0 #14213D',
                  }}
                />
                <Legend
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Siswa berisiko tinggi */}
        <Card>
          <h3 className="text-sm font-bold font-heading mb-3 flex items-center gap-2">
            <Users size={16} /> Siswa Berisiko Tinggi
          </h3>
          {highRiskStudents.length === 0 ? (
            <EmptyState size={100} text="Tiada siswa berisiko tinggi" />
          ) : (
            <div className="flex flex-col gap-2">
              {highRiskStudents.map(r => (
                <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg bg-bg">
                  <span className="text-lg">{r.anonymous ? '🔒' : '👤'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">
                      {r.anonymous ? r.studentInitials : r.studentName}
                    </p>
                    <p className="text-[10px] text-ink/40">{r.code} • {r.sessionCount} sesi</p>
                  </div>
                  <div className="flex gap-1">
                    {r.urgency === 'mendesak' && <Badge variant="danger">Mendesak</Badge>}
                    {r.sessionCount >= 3 && <Badge variant="sunrise">≥3 Sesi</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
