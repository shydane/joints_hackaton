import { motion } from 'framer-motion'

/**
 * Progress form berbentuk jalan menuju sekolah.
 * Dipakai di form percakapan siswa.
 */
export default function ProgressPath({ currentStep, totalSteps }) {
  const progress = ((currentStep) / (totalSteps - 1)) * 100

  return (
    <div className="relative w-full max-w-xs mx-auto py-4">
      {/* Label step */}
      <div className="text-center mb-3">
        <span className="text-xs font-bold text-ink/40">
          Langkah {currentStep + 1} dari {totalSteps}
        </span>
      </div>

      {/* Track jalan */}
      <div className="relative h-3 bg-bg rounded-full border-2 border-ink overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-sunrise rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
      </div>

      {/* Titik-titik step */}
      <div className="flex justify-between mt-1 px-0.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <motion.div
            key={i}
            className={`
              w-2 h-2 rounded-full border border-ink
              ${i <= currentStep ? 'bg-sunrise' : 'bg-bg'}
            `}
            animate={i === currentStep ? { scale: [1, 1.3, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        ))}
      </div>

      {/* Ikon: rumah di awal, sekolah di akhir */}
      <div className="flex justify-between mt-1">
        <span className="text-sm">🏠</span>
        <span className="text-sm">🏫</span>
      </div>
    </div>
  )
}
