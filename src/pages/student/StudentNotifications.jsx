import { motion } from 'framer-motion'
import { Bell, CheckCheck, Inbox } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import NotificationItem from '../../components/ui/Notification'
import Button from '../../components/ui/Button'
import EmptyState from '../../assets/illustrations/EmptyState'

/**
 * Pusat notifikasi siswa.
 * Desktop: wider layout with header card.
 * Mobile: compact stacked list.
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
    <div className="flex flex-col gap-4 md:gap-5">
      {/* Header: desktop gets a card-style header */}
      <div className="md:neo-card md:!bg-gradient-to-r md:!from-sky-light md:!to-white md:flex md:items-center md:justify-between md:!p-5">
        <div className="flex items-center gap-3">
          <div className="hidden md:flex w-11 h-11 rounded-xl border-2 border-ink bg-white items-center justify-center flex-shrink-0">
            <Bell size={22} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold font-heading flex items-center gap-2">
              <Bell size={20} className="md:hidden" /> Notifikasi
            </h1>
            <p className="text-xs text-ink/50 mt-0.5">
              {unread > 0 ? `${unread} belum dibaca` : 'Semua sudah dibaca 🎉'}
            </p>
          </div>
        </div>

        {unread > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllNotificationsRead(currentUser.id)}
            icon={CheckCheck}
            className="mt-2 md:mt-0"
          >
            Tandai semua
          </Button>
        )}
      </div>

      {/* Notification list */}
      {notifications.length === 0 ? (
        <div className="md:neo-card md:flex md:flex-col md:items-center md:!py-12">
          <EmptyState text="Belum ada notifikasi" />
        </div>
      ) : (
        <div className="flex flex-col gap-2 md:gap-2.5 md:max-w-2xl">
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
