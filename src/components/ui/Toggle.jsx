import { motion } from 'framer-motion'

/**
 * Toggle switch dengan label.
 */
export default function Toggle({ label, description, checked, onChange, className = '' }) {
  return (
    <label className={`flex items-start gap-3 cursor-pointer ${className}`}>
      <div
        className={`
          relative w-12 h-7 rounded-full border-2 border-ink transition-colors flex-shrink-0 mt-0.5
          ${checked ? 'bg-sunrise' : 'bg-bg'}
        `}
        onClick={() => onChange(!checked)}
      >
        <motion.div
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full border-2 border-ink"
          animate={{ left: checked ? '22px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
      <div className="flex flex-col">
        {label && <span className="text-sm font-semibold text-ink">{label}</span>}
        {description && <span className="text-xs text-ink/50">{description}</span>}
      </div>
    </label>
  )
}
