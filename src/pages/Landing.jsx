import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Search, MessageCircle, Shield, Heart } from 'lucide-react'
import Button from '../components/ui/Button'
import SunrisePath from '../assets/illustrations/SunrisePath'

/**
 * Landing page utama "Lanjut Sekolah".
 * Headline emosional, 3 langkah cara kerja, CTA.
 */
export default function Landing() {
  const navigate = useNavigate()

  const steps = [
    {
      icon: MessageCircle,
      title: 'Ceritakan',
      description: 'Sampaikan masalahmu dengan aman. Bisa anonim.',
      color: 'bg-sky-light',
    },
    {
      icon: Search,
      title: 'Ditinjau',
      description: 'Guru akan meninjau dan memahami situasimu.',
      color: 'bg-lemon-light',
    },
    {
      icon: Shield,
      title: 'Didampingi',
      description: 'Kamu akan didampingi hingga masalah teratasi.',
      color: 'bg-mint-light',
    },
  ]

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 pt-12 pb-8">
        {/* Ilustrasi */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <SunrisePath size={180} />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6 max-w-md"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-ink leading-tight">
            Kamu tidak sendirian.
          </h1>
          <p className="text-2xl md:text-3xl font-extrabold font-heading text-sunrise mt-1">
            Ceritakan, kami dengarkan.
          </p>
          <p className="text-sm text-ink/60 mt-3 leading-relaxed">
            Punya masalah yang bikin kamu takut berhenti sekolah?
            <br />
            Laporkan di sini — aman, rahasia, dan pasti ditindaklanjuti.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-xs"
        >
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate('/login')}
            icon={ArrowRight}
          >
            Mulai Cerita
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => navigate('/login')}
            icon={Search}
          >
            Lacak Laporan
          </Button>
        </motion.div>
      </section>

      {/* Cara Kerja */}
      <section className="px-4 pb-12 max-w-lg mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm font-bold text-ink/40 uppercase tracking-wider mb-6"
        >
          Bagaimana cara kerjanya?
        </motion.h2>

        <div className="flex flex-col gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.9 + index * 0.15 }}
              className="neo-card flex items-start gap-4"
            >
              {/* Nomor + Ikon */}
              <div className={`
                w-12 h-12 ${step.color} rounded-xl border-2 border-ink
                flex items-center justify-center flex-shrink-0
                shadow-[2px_2px_0_#14213D]
              `}>
                <step.icon size={22} className="text-ink" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-ink/30">0{index + 1}</span>
                  <h3 className="text-sm font-bold font-heading">{step.title}</h3>
                </div>
                <p className="text-xs text-ink/60 mt-0.5">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Connecting dots */}
        <div className="flex flex-col items-center gap-0 -mt-1 -mb-1">
          {[0, 1].map(i => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-0.5 h-4 bg-ink/10" />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-4 border-t-2 border-ink/10">
        <p className="text-xs text-ink/30 flex items-center justify-center gap-1">
          Dibuat dengan <Heart size={12} className="text-sunrise fill-sunrise" /> untuk pendidikan Indonesia
        </p>
      </footer>
    </div>
  )
}
