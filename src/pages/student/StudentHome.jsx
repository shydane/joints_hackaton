import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PenLine, Search, Bell, ArrowRight, Clock } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import SunrisePath from '../../assets/illustrations/SunrisePath'
import EmptyState from '../../assets/illustrations/EmptyState'

/**
 * Halaman beranda siswa.
 * Menampilkan headline, shortcut, dan laporan terakhir.
 */
export default function StudentHome() {
  const navigate = useNavigate()
  const { currentUser, getReportsForUser, getUnreadCount } = useApp()

  const myReports = currentUser ? getReportsForUser(currentUser.id, 'siswa') : []
  const unreadCount = currentUser ? getUnreadCount(currentUser.id) : 0
  const recentReports = myReports.slice(0, 3)

  const statusLabels = {
    dikirim: 'Dikirim',
    ditinjau: 'Ditinjau',
    pendampingan: 'Pendampingan',
    selesai: 'Selesai',
    eskalasi_eksternal: 'Eskalasi',
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Greeting + Illustration */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-2"
      >
        <SunrisePath size={100} className="mx-auto mb-3" />
        <h1 className="text-lg font-bold font-heading">
          Hai, {currentUser?.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-xs text-ink/50 mt-1">
          Ada yang ingin kamu ceritakan? Kami siap mendengarkan.
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        <Card
          hoverable
          onClick={() => navigate('/siswa/lapor')}
          className="!p-3 text-center"
          color="sunrise-light"
        >
          <PenLine size={22} className="mx-auto mb-1 text-sunrise" />
          <span className="text-xs font-bold">Lapor</span>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/siswa/lacak')}
          className="!p-3 text-center"
          color="sky-light"
        >
          <Search size={22} className="mx-auto mb-1 text-sky" />
          <span className="text-xs font-bold">Lacak</span>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/siswa/notifikasi')}
          className="!p-3 text-center relative"
          color="lemon-light"
        >
          <Bell size={22} className="mx-auto mb-1 text-ink" />
          <span className="text-xs font-bold">Notifikasi</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </Card>
      </motion.div>

      {/* Riwayat Laporan Terbaru */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold font-heading">Laporan Terakhir</h2>
          {myReports.length > 3 && (
            <button
              onClick={() => navigate('/siswa/lacak')}
              className="text-xs text-sunrise font-semibold flex items-center gap-0.5"
            >
              Lihat semua <ArrowRight size={12} />
            </button>
          )}
        </div>

        {recentReports.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 text-center !py-5">
            <EmptyState size={100} text="Belum ada laporan" />
            <Button
              variant="primary"
              size="sm"
              className="mt-3"
              onClick={() => navigate('/siswa/lapor')}
              icon={PenLine}
            >
              Buat Laporan Pertama
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {recentReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.08 }}
              >
                <Card
                  hoverable
                  onClick={() => navigate(`/siswa/lacak?code=${report.code}`)}
                  className="flex items-center gap-3 !py-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-ink/40 font-mono">
                        {report.code}
                      </span>
                      <Badge variant={report.status}>
                        {statusLabels[report.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-ink/50 mt-1 truncate">
                      {report.description || report.detectionReason || 'Terdeteksi otomatis'}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-ink/20 flex-shrink-0" />
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Pesan motivasi */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card color="mint-light" className="text-center !py-4">
          <p className="text-xs text-ink/60 leading-relaxed">
            🌅 <strong>Ingat:</strong> Meminta bantuan adalah tanda keberanian,
            bukan kelemahan. Kami di sini untukmu.
          </p>
        </Card>
      </motion.div>
    </div>
  )
}
