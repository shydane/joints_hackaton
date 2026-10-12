import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Inbox, Eye, Shield, CheckCircle, AlertTriangle, ExternalLink, Filter
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

/**
 * Dashboard Guru BK: papan kanban dengan kolom tambahan "Eskalasi Eksternal".
 */
const KANBAN_COLUMNS = [
  { id: 'dikirim', label: 'Baru', icon: Inbox, color: 'border-t-sky', bg: 'bg-sky-light' },
  { id: 'ditinjau', label: 'Ditinjau', icon: Eye, color: 'border-t-lemon', bg: 'bg-lemon-light' },
  { id: 'pendampingan', label: 'Pendampingan', icon: Shield, color: 'border-t-sunrise', bg: 'bg-sunrise-light' },
  { id: 'selesai', label: 'Selesai', icon: CheckCircle, color: 'border-t-mint', bg: 'bg-mint-light' },
  { id: 'eskalasi_eksternal', label: 'Eskalasi Eksternal', icon: ExternalLink, color: 'border-t-danger', bg: 'bg-danger-light' },
]

const categoryEmoji = {
  ekonomi: '💰',
  bullying: '😰',
  motivasi: '😔',
  lainnya: '💬',
}

export default function CounselorDashboard() {
  const navigate = useNavigate()
  const { currentUser, getReportsForUser } = useApp()
  const [filter, setFilter] = useState('all')

  const allReports = currentUser ? getReportsForUser(currentUser.id, 'guru_bk') : []

  const reports = filter === 'all'
    ? allReports
    : filter === 'eskalasi'
    ? allReports.filter(r => r.escalatedTo === currentUser?.id)
    : allReports.filter(r => r.urgency === filter)

  const getColumnReports = (status) => reports.filter(r => r.status === status)

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-heading">Dashboard Guru BK</h1>
          <p className="text-xs text-ink/50 mt-0.5">{currentUser?.name}</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'mendesak', label: '🚨 Mendesak' },
            { id: 'eskalasi', label: '⬆️ Eskalasi' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`
                px-3 py-1.5 text-xs font-bold rounded-full border-2 border-ink transition-all
                ${filter === f.id
                  ? 'bg-sunrise text-white shadow-[2px_2px_0_#14213D]'
                  : 'bg-white text-ink/50 hover:bg-bg'
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {KANBAN_COLUMNS.map(col => {
          const colReports = getColumnReports(col.id)
          return (
            <div key={col.id} className={`kanban-column p-3 border-t-4 ${col.color}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <col.icon size={16} />
                  <span className="text-sm font-bold font-heading">{col.label}</span>
                </div>
                <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border-2 border-ink ${col.bg}`}>
                  {colReports.length}
                </span>
              </div>

              {colReports.length === 0 ? (
                <p className="text-xs text-ink/20 text-center py-6">Kosong</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {colReports.map((report, index) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        hoverable
                        onClick={() => navigate(`/bk/kasus/${report.id}`)}
                        className="!p-3"
                      >
                        <div className="flex items-center gap-1.5 flex-wrap mb-2">
                          {report.source === 'deteksi' && <Badge variant="deteksi">🔍 Auto</Badge>}
                          {report.urgency === 'mendesak' && <Badge variant="danger">🚨 Mendesak</Badge>}
                          {report.escalatedTo && <Badge variant="sunrise">⬆️ Eskalasi</Badge>}
                        </div>

                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm">{categoryEmoji[report.category]}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">
                              {report.anonymous ? report.studentInitials : report.studentName}
                            </p>
                            <p className="text-[10px] text-ink/40">{report.class}</p>
                          </div>
                        </div>

                        <p className="text-xs text-ink/50 line-clamp-2">
                          {report.description || report.detectionReason}
                        </p>

                        {/* Sesi counter */}
                        {report.sessionCount > 0 && (
                          <p className="text-[10px] text-ink/40 mt-1.5">
                            🗓️ {report.sessionCount} sesi konseling
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-ink/10">
                          <span className="text-[10px] font-mono text-ink/30">{report.code}</span>
                          <span className="text-[10px] text-ink/30">
                            {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
