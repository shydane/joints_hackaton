import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * Modal dialog.
 */
export default function Modal({ isOpen, onClose, title, children, className = '' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/30 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`
              fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              w-[90vw] max-w-lg max-h-[85vh] overflow-y-auto
              neo-card bg-white
              ${className}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-heading">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-bg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
