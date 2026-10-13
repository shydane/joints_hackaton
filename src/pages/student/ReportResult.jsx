import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Copy, Home, PartyPopper, Search } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import SunrisePath from '../../assets/illustrations/SunrisePath'

/**
 * Halaman hasil setelah kirim laporan.
 * Menampilkan kode unik, konfeti singkat, dan pesan menenangkan.
 */
export default function ReportResult() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { getReportByCode } = useApp()
  const report = code ? getReportByCode(code.toUpperCase()) : null
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const confettiPieces = useMemo(() => createConfettiPieces(), [])

  useEffect(() => {
    if (!report) return undefined

    setShowConfetti(true)
    const timer = setTimeout(() => setShowConfetti(false), 4000)
    return () => clearTimeout(timer)
  }, [report?.code])

  const handleCopy = async () => {
    if (!report) return

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API tidak tersedia')
      }
      await navigator.clipboard.writeText(report.code)
      setCopied(true)
      setCopyError('')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      try {
        const field = document.createElement('textarea')
        field.value = report.code
        field.setAttribute('readonly', '')
        field.style.position = 'fixed'
        field.style.opacity = '0'
        document.body.appendChild(field)
        field.select()
        const didCopy = document.execCommand('copy')
        document.body.removeChild(field)
        if (!didCopy) throw new Error('Salin kode gagal')

        setCopied(true)
        setCopyError('')
        setTimeout(() => setCopied(false), 2000)
      } catch {
        setCopied(false)
        setCopyError('Kode belum berhasil disalin. Silakan salin secara manual.')
      }
    }
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center gap-4 pt-8 text-center">
        <Card color="sky-light" className="w-full">
          <h1 className="text-lg font-bold font-heading">Kode laporan tidak ditemukan</h1>
          <p className="mt-2 text-sm text-ink/60">
            Periksa kembali kode yang kamu terima setelah mengirim laporan.
          </p>
        </Card>
        <div className="flex w-full gap-3">
          <Button variant="outline" onClick={() => navigate('/siswa')} icon={Home} className="flex-1">
            Kembali ke Beranda
          </Button>
          <Button variant="primary" onClick={() => navigate('/lacak')} icon={Search} className="flex-1">
            Lacak Laporan
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col items-center gap-5 pt-4">
      {showConfetti && <Confetti pieces={confettiPieces} />}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
      >
        <SunrisePath size={120} />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <h1 className="flex items-center justify-center gap-2 text-xl font-bold font-heading">
          Laporanmu Terkirim! <PartyPopper size={22} className="text-sunrise" />
        </h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink/60">
          Terima kasih sudah berani bercerita. Laporanmu sudah diterima dan akan ditinjau dengan tenang serta penuh perhatian.
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full"
      >
        <Card color="sunrise-light" className="text-center">
          <p className="mb-2 text-xs font-medium text-ink/60">Kode Laporanmu</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="font-heading text-2xl font-extrabold tracking-wider text-sunrise">
              {report.code}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? 'Kode laporan tersalin' : 'Salin kode laporan'}
              className={`inline-flex items-center gap-2 rounded-xl border-2 border-ink px-3 py-2 text-xs font-semibold transition-all ${
                copied ? 'bg-mint text-ink' : 'bg-white text-ink hover:bg-bg'
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Tersalin' : 'Salin Kode'}
            </button>
          </div>
          {copyError && <p role="alert" className="mt-2 text-xs font-semibold text-danger">{copyError}</p>}
          {copied && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-xs font-semibold text-ink"
            >
              Simpan kode ini untuk melihat perkembangan laporanmu.
            </motion.p>
          )}
        </Card>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full"
      >
        <Card color="sky-light" className="!py-3">
          <p className="text-center text-xs text-ink/70">
            ⏱️ Estimasi peninjauan oleh <strong>{report.channel === 'guru_bk' ? 'Guru BK' : 'Wali Kelas'}</strong>:
            {' '}<strong>1–2 hari kerja</strong>
            <br />
            Kamu akan menerima kabar saat ada perkembangan. Kamu tidak harus menghadapi ini sendirian.
          </p>
        </Card>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex w-full gap-3"
      >
        <Button
          variant="outline"
          onClick={() => navigate('/siswa')}
          icon={Home}
          className="flex-1"
        >
          Kembali ke Beranda
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate(`/siswa/lacak?code=${report.code}`)}
          icon={Search}
          className="flex-1"
        >
          Lacak Laporan Sekarang
        </Button>
      </motion.div>
    </div>
  )
}

function createConfettiPieces() {
  const colors = ['#FF7A3D', '#7CC6FE', '#FFD966', '#8EE3C2', '#FF4D4F']
  return Array.from({ length: 24 }, (_, id) => ({
    id,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
    shape: Math.random() > 0.5 ? '50%' : '2px',
  }))
}

function Confetti({ pieces }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map(piece => (
        <motion.div
          key={piece.id}
          initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: '100vh',
            x: [0, 30, -30, 10],
            opacity: [1, 1, 0.5, 0],
            rotate: piece.rotation + 720,
          }}
          transition={{ duration: piece.duration, delay: piece.delay, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: piece.left,
            top: -20,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: piece.shape,
          }}
        />
      ))}
    </div>
  )
}
