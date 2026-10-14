import { motion } from 'framer-motion'
import { Bell, MessageCircle, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react'

/**
 * Komponen notifikasi individual.
 */
const TYPE_CONFIG = {
  laporan_dibaca: { icon: MessageCircle, color: 'bg-sky-light', accent: 'border-l-sky' },
  eskalasi_bk: { icon: ArrowRight, color: 'bg-sunrise-light', accent: 'border-l-sunrise' },
  konseling_dijadwalkan: { icon: Bell, color: 'bg-lemon-light', accent: 'border-l-lemon' },
  kasus_selesai: { icon: CheckCircle, color: 'bg-mint-light', accent: 'border-l-mint' },
  laporan_masuk: { icon: Bell, color: 'bg-sky-light', accent: 'border-l-sky' },
  deteksi_dini: { icon: AlertTriangle, color: 'bg-lemon-light', accent: 'border-l-lemon' },
  eskalasi_masuk: { icon: ArrowRight, color: 'bg-sunrise-light', accent: 'border-l-sunrise' },
}

export default function NotificationItem({ notification, onClick }) {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.laporan_masuk
  const Icon = config.icon

  const timeAgo = getTimeAgo(notification.createdAt)

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      aria-label={`${notification.read ? 'Buka' : 'Notifikasi belum dibaca'}: ${notification.title}`}
      className={`
        w-full text-left flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-colors
        border-l-4 ${config.accent}
        ${notification.read ? 'bg-white' : config.color}
        hover:bg-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunrise
      `}
    >
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
        ${notification.read ? 'bg-bg' : 'bg-white'}
        border-2 border-ink
      `}>
        <Icon size={14} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${notification.read ? 'text-ink/60' : 'text-ink'}`}>
          {notification.title}
        </p>
        <p className="text-xs text-ink/50 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-ink/30 mt-1">{timeAgo}</p>
      </div>

      {!notification.read && (
        <span className="self-start flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sunrise text-white text-[11px] font-bold shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Baru
        </span>
      )}
    </motion.button>
  )
}

// Helper: waktu relatif sederhana
function getTimeAgo(dateString) {
  const now = new Date()
  const date = new Date(dateString)
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'Baru saja'
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}
