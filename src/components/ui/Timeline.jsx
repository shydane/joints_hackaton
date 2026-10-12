import { motion } from 'framer-motion'
import { Check, Clock, MessageCircle, Shield, AlertTriangle } from 'lucide-react'

/**
 * Timeline status laporan untuk halaman lacak siswa.
 */
const STATUS_CONFIG = {
  dikirim: {
    label: 'Laporan Dikirim',
    icon: Clock,
    color: 'bg-sky',
  },
  ditinjau: {
    label: 'Sedang Ditinjau',
    icon: MessageCircle,
    color: 'bg-lemon',
  },
  pendampingan: {
    label: 'Dalam Pendampingan',
    icon: Shield,
    color: 'bg-sunrise',
  },
  selesai: {
    label: 'Selesai',
    icon: Check,
    color: 'bg-mint',
  },
  eskalasi_eksternal: {
    label: 'Eskalasi Eksternal',
    icon: AlertTriangle,
    color: 'bg-danger',
  },
}

const STATUS_ORDER = ['dikirim', 'ditinjau', 'pendampingan', 'selesai']

export default function Timeline({ currentStatus, notes = [] }) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus)
  const isExternal = currentStatus === 'eskalasi_eksternal'

  // Gunakan order yang sesuai
  const displayStatuses = isExternal
    ? [...STATUS_ORDER.slice(0, 3), 'eskalasi_eksternal']
    : STATUS_ORDER

  return (
    <div className="flex flex-col gap-0">
      {displayStatuses.map((status, index) => {
        const config = STATUS_CONFIG[status]
        const Icon = config.icon
        const isActive = isExternal
          ? index <= 3
          : index <= currentIndex
        const isCurrent = status === currentStatus

        // Cari catatan yang relevan untuk status ini
        const relevantNotes = notes.filter(n => n.visibleToStudent)

        return (
          <motion.div
            key={status}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            className="flex gap-3"
          >
            {/* Garis + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  border-2 border-ink flex-shrink-0
                  ${isActive ? config.color : 'bg-bg'}
                  ${isCurrent ? 'ring-2 ring-offset-2 ring-sunrise' : ''}
                `}
              >
                <Icon size={14} className={isActive ? 'text-ink' : 'text-ink/30'} />
              </div>
              {index < displayStatuses.length - 1 && (
                <div className={`w-0.5 h-8 ${isActive ? 'bg-ink' : 'bg-ink/20'}`} />
              )}
            </div>

            {/* Konten */}
            <div className="pb-6">
              <p className={`text-sm font-bold ${isActive ? 'text-ink' : 'text-ink/30'}`}>
                {config.label}
              </p>
              {isCurrent && (
                <p className="text-xs text-ink/50 mt-0.5">Status saat ini</p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
