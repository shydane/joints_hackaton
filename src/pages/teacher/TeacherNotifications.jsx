import { motion } from 'framer-motion'
import { Bell, CheckCheck } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import NotificationItem from '../../components/ui/Notification'
import Button from '../../components/ui/Button'
import EmptyState from '../../assets/illustrations/EmptyState'

/**
 * Halaman notifikasi guru (wali kelas & BK).
 */
export default function TeacherNotifications() {
  const { currentUser, getNotificationsForUser, markNotificationRead, markAllNotificationsRead, getUnreadCount } = useApp()

  const notifications = currentUser ? getNotificationsForUser(currentUser.id) : []
  const unread = currentUser ? getUnreadCount(currentUser.id) : 0

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-heading flex items-center gap-2">
            <Bell size={22} /> Notifikasi
          </h1>
          <p className="text-xs text-ink/50 mt-0.5">
            {unread > 0 ? `${unread} belum dibaca` : 'Semua sudah dibaca'}
          </p>
        </div>
        {unread > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllNotificationsRead(currentUser.id)}
            icon={CheckCheck}
          >
            Tandai semua dibaca
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState text="Belum ada notifikasi" />
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NotificationItem
                notification={notif}
                onClick={() => markNotificationRead(notif.id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
