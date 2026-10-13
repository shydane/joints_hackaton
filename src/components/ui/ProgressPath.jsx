import { motion } from 'framer-motion'

const STEP_LABELS = [
  { emoji: '📋', label: 'Kategori' },
  { emoji: '🕐', label: 'Kapan' },
  { emoji: '💬', label: 'Cerita' },
  { emoji: '🚨', label: 'Urgensi' },
  { emoji: '📎', label: 'Bukti' },
  { emoji: '👩‍🏫', label: 'Jalur' },
  { emoji: '🔒', label: 'Privasi' },
  { emoji: '✅', label: 'Review' },
]

/**
 * Progress form berbentuk jalan menuju sekolah.
 * Menampilkan figur berjalan dari rumah ke sekolah dengan trail animasi.
 */
export default function ProgressPath({ currentStep, totalSteps }) {
  const progress = currentStep / (totalSteps - 1)

  return (
    <div className="w-full py-3 select-none">
      {/* Label langkah */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold text-ink/40">
          Langkah {currentStep + 1} / {totalSteps}
        </span>
        <span className="text-xs font-bold text-sunrise">
          {STEP_LABELS[currentStep]?.label}
        </span>
      </div>

      {/* Jalur + figur berjalan */}
      <div className="relative w-full h-10 flex items-center">
        {/* Jalur background (abu) */}
        <div className="absolute inset-y-0 left-4 right-4 flex items-center">
          <div className="w-full h-3 bg-bg rounded-full border-2 border-ink overflow-hidden">
            {/* Trail terisi */}
            <motion.div
              className="h-full bg-gradient-to-r from-sunrise to-lemon rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            />
          </div>
        </div>

        {/* Titik-titik milestone */}
        <div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <motion.div
              key={i}
              className={`
                relative z-10 flex items-center justify-center
                w-5 h-5 rounded-full border-2 border-ink
                ${i < currentStep
                  ? 'bg-sunrise'
                  : i === currentStep
                    ? 'bg-lemon shadow-[0_0_0_3px_rgba(255,217,102,0.4)]'
                    : 'bg-white'
                }
              `}
              animate={i === currentStep
                ? { scale: [1, 1.25, 1] }
                : i < currentStep
                  ? { scale: 1 }
                  : { scale: 0.85 }
              }
              transition={i === currentStep
                ? { repeat: Infinity, duration: 1.4, ease: 'easeInOut' }
                : { duration: 0.2 }
              }
            >
              {i < currentStep && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </motion.div>
          ))}
        </div>

        {/* Figur berjalan (emoji) */}
        <motion.div
          className="absolute z-20 top-1/2 -translate-y-1/2 text-lg"
          animate={{ left: `calc(${progress * 88}% + 4px)` }}
          initial={{ left: '4px' }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
          style={{ translateX: '-50%' }}
        >
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 0.7, ease: 'easeInOut' }}
            className="block"
          >
            🚶
          </motion.span>
        </motion.div>
      </div>

      {/* Label ikon awal & akhir */}
      <div className="flex justify-between mt-1 px-0.5">
        <span className="text-sm">🏠</span>
        <span className="text-sm">🏫</span>
      </div>
    </div>
  )
}
