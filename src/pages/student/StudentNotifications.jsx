import { motion } from 'framer-motion'
import { Bell, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import NotificationItem from '../../components/ui/Notification'
import Button from '../../components/ui/Button'
import EmptyState from '../../assets/illustrations/EmptyState'

/**
 * Pusat notifikasi siswa.
 */
export default function StudentNotifications() {
  const navigate = useNavigate()
  const { currentUser, getNotificationsForUser, markNotificationRead, markAllNotificationsRead, getUnreadCount } = useApp()

  const notifications = currentUser ? getNotificationsForUser(currentUser.id) : []
  const unread = currentUser ? getUnreadCount(currentUser.id) : 0

  const handleNotificationClick = (notification) => {
    markNotificationRead(notification.id)
    const destination = notification.reportCode
      ? `/siswa/lacak?code=${encodeURIComponent(notification.reportCode)}`
      : '/siswa/lacak'
    navigate(destination)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-heading flex items-center gap-2">
            <Bell size={20} /> Notifikasi
          </h1>
          <p className="text-xs text-ink/50 mt-0.5">{unread > 0 ? `${unread} belum dibaca` : 'Semua sudah dibaca'}</p>
        </div>

        {unread > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllNotificationsRead(currentUser.id)}
            icon={CheckCheck}
          >
            Tandai semua
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
                onClick={() => handleNotificationClick(notif)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
