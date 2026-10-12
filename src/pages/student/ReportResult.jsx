import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Search, Home, PartyPopper } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import SunrisePath from '../../assets/illustrations/SunrisePath'

/**
 * Halaman hasil setelah kirim laporan.
 * Menampilkan kode unik + konfeti + pesan menenangkan.
 */
export default function ReportResult() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(true)

  // Matikan konfeti setelah 4 detik
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const el = document.createElement('textarea')
      el.value = code
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 pt-4 relative">
      {/* Konfeti */}
      {showConfetti && <Confetti />}

      {/* Ilustrasi */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
      >
        <SunrisePath size={120} />
      </motion.div>

      {/* Pesan sukses */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <h1 className="text-xl font-bold font-heading flex items-center justify-center gap-2">
          Laporanmu Terkirim! <PartyPopper size={22} className="text-sunrise" />
        </h1>
        <p className="text-sm text-ink/50 mt-2 max-w-xs leading-relaxed">
          Terima kasih sudah berani bercerita. Guru akan meninjau laporanmu dan menghubungimu.
        </p>
      </motion.div>

      {/* Kode Laporan */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full"
      >
        <Card color="sunrise-light" className="text-center">
          <p className="text-xs text-ink/50 mb-2 font-medium">Kode Laporanmu</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-extrabold font-heading text-sunrise tracking-wider">
              {code}
            </span>
            <button
              onClick={handleCopy}
              className={`
                p-2 rounded-lg border-2 border-ink transition-all
                ${copied ? 'bg-mint text-ink' : 'bg-white text-ink hover:bg-bg'}
              `}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          {copied && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-mint font-semibold mt-1"
            >
              Tersalin!
            </motion.p>
          )}
        </Card>
      </motion.div>

      {/* Info estimasi */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full"
      >
        <Card className="!py-3">
          <p className="text-xs text-ink/60 text-center">
            ⏱️ Estimasi waktu ditinjau: <strong>1-2 hari kerja</strong>
            <br />
            Kamu akan menerima notifikasi saat ada perkembangan.
          </p>
        </Card>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex gap-3 w-full"
      >
        <Button
          variant="outline"
          onClick={() => navigate('/siswa')}
          icon={Home}
          className="flex-1"
        >
          Beranda
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate(`/siswa/lacak?code=${code}`)}
          icon={Search}
          className="flex-1"
        >
          Lacak
        </Button>
      </motion.div>
    </div>
  )
}

// Komponen konfeti sederhana
function Confetti() {
  const colors = ['#FF7A3D', '#7CC6FE', '#FFD966', '#8EE3C2', '#FF4D4F']
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(piece => (
        <motion.div
          key={piece.id}
          initial={{
            y: -20,
            x: 0,
            opacity: 1,
            rotate: 0,
          }}
          animate={{
            y: '100vh',
            x: [0, 30, -30, 10],
            opacity: [1, 1, 0.5, 0],
            rotate: piece.rotation + 720,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            left: piece.left,
            top: -20,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  )
}
