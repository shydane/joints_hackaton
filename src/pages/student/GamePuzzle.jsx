import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Eye,
  Footprints,
  HelpCircle,
  Sparkles,
  Timer,
  Trophy,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { getTodaySeed } from '../../utils/dailySeed'
import { createDailyPuzzle } from '../../utils/dailyPuzzle'

const SOLVED_BOARD = [0, 1, 2, 3, 4, 5, 6, 7, 8]

function PuzzleIllustration({ viewBox = '0 0 300 300', className = '' }) {
  return (
    <svg
      viewBox={viewBox}
      className={className}
      role="img"
      aria-label="Ilustrasi matahari, jalan menuju sekolah, dan tas"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="300" height="300" fill="#bae6fd" />
      <rect y="120" width="300" height="180" fill="#fef08a" />
      <circle cx="66" cy="65" r="37" fill="#fde047" />
      <circle cx="66" cy="61" r="25" fill="#facc15" />
      <circle cx="57" cy="59" r="2.5" fill="#854d0e" />
      <circle cx="75" cy="59" r="2.5" fill="#854d0e" />
      <path d="M57 69 Q66 78 75 69" fill="none" stroke="#854d0e" strokeWidth="2.5" strokeLinecap="round" />
      <g fill="#fff" opacity=".9">
        <ellipse cx="232" cy="52" rx="31" ry="14" />
        <ellipse cx="216" cy="44" rx="19" ry="16" />
        <ellipse cx="247" cy="45" rx="20" ry="15" />
      </g>
      <path d="M-20 226 Q75 133 195 198 T320 218 V300 H-20Z" fill="#4ade80" />
      <path d="M-20 250 Q110 169 320 258 V300 H-20Z" fill="#16a34a" />
      <path d="M175 185 C160 215 120 240 100 300 H170 C185 255 195 220 188 185Z" fill="#f59e0b" />
      <path d="M180 188 C170 218 145 245 135 300" fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="6 6" />
      <circle cx="45" cy="210" r="14" fill="#166534" />
      <circle cx="45" cy="202" r="10" fill="#22c55e" />
      <rect x="43" y="218" width="4" height="12" fill="#78350f" />
      <ellipse cx="229" cy="267" rx="28" ry="7" fill="#064e3b" opacity=".4" />
      <rect x="205" y="215" width="48" height="50" rx="14" fill="#e11d48" />
      <rect x="212" y="237" width="34" height="22" rx="6" fill="#fb7185" stroke="#fff" strokeWidth="1.5" />
      <rect x="223" y="240" width="12" height="3" rx="1.5" fill="#fda4af" />
      <path d="M207 229 Q229 233 251 229" fill="none" stroke="#fda4af" strokeWidth="3" />
      <rect x="225" y="227" width="8" height="7" rx="2" fill="#facc15" />
      <path d="M219 215 C219 201 239 201 239 215" fill="none" stroke="#9f1239" strokeWidth="4.5" strokeLinecap="round" />
      <rect x="199" y="231" width="8" height="24" rx="3" fill="#38bdf8" />
      <rect x="201" y="227" width="4" height="5" rx="1" fill="#0284c7" />
      <circle cx="110" cy="265" r="3" fill="#f43f5e" />
      <circle cx="120" cy="275" r="3" fill="#facc15" />
      <circle cx="85" cy="280" r="3" fill="#fff" />
    </svg>
  )
}

function PuzzleTile({ pieceIndex }) {
  const row = Math.floor(pieceIndex / 3)
  const column = pieceIndex % 3

  return (
    <div className="relative h-full w-full overflow-hidden">
      <PuzzleIllustration
        viewBox={`${column * 100} ${row * 100} 100 100`}
        className="h-full w-full"
      />
      <span className="absolute left-1.5 top-1 text-[10px] font-black text-white drop-shadow">
        {pieceIndex + 1}
      </span>
    </div>
  )
}

function ConfettiRain() {
  const pieces = useMemo(() => Array.from({ length: 32 }, (_, index) => ({
    id: index,
    x: Math.random() * 100,
    color: ['#f43f5e', '#3b82f6', '#eab308', '#10b981', '#a855f7'][index % 5],
    delay: Math.random() * 0.4,
    duration: 2 + Math.random(),
  })), [])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map(piece => (
        <motion.div
          key={piece.id}
          initial={{ y: '-5vh', x: `${piece.x}vw`, opacity: 1 }}
          animate={{ y: '105vh', rotate: 520, opacity: 0 }}
          transition={{ duration: piece.duration, delay: piece.delay, ease: 'easeOut' }}
          className="absolute h-3 w-2 rounded-sm"
          style={{ backgroundColor: piece.color }}
        />
      ))}
    </div>
  )
}

function formatTime(seconds = 0) {
  const safeSeconds = Math.max(0, Number(seconds) || 0)
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, '0')}:${String(safeSeconds % 60).padStart(2, '0')}`
}

export default function GamePuzzle() {
  const navigate = useNavigate()
  const { currentUser, getSkorHariIni, simpanSkor } = useApp()
  const [board, setBoard] = useState(SOLVED_BOARD)
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [started, setStarted] = useState(false)
  const [won, setWon] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [savedScore, setSavedScore] = useState(() => getSkorHariIni(currentUser.id, 'puzzle'))
  const [saveError, setSaveError] = useState('')
  const timerRef = useRef(null)

  const dailyBoard = useMemo(() => createDailyPuzzle(getTodaySeed()), [])

  useEffect(() => () => clearInterval(timerRef.current), [])

  useEffect(() => {
    if (started && !won && !savedScore) {
      timerRef.current = setInterval(() => setSeconds(value => value + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [savedScore, started, won])

  const startGame = () => {
    setBoard(dailyBoard)
    setMoves(0)
    setSeconds(0)
    setSaveError('')
    setWon(false)
    setStarted(true)
  }

  const finishGame = (totalMoves, totalSeconds) => {
    setWon(true)
    clearInterval(timerRef.current)

    const movePenalty = Math.max(0, (totalMoves - 25) * 1.2)
    const timePenalty = Math.max(0, (totalSeconds - 45) * 0.4)
    const score = Math.max(20, Math.min(100, Math.round(100 - movePenalty - timePenalty)))
    const result = simpanSkor({
      userId: currentUser.id,
      game: 'puzzle',
      skor: score,
      langkah: totalMoves,
      waktu: totalSeconds,
    })

    if (result.success) {
      setSavedScore(result.skor)
    } else {
      setSaveError(result.message)
    }
  }

  const moveTile = (index) => {
    if (!started || won || savedScore) return

    const blankIndex = board.indexOf(8)
    const isAdjacent =
      Math.abs(Math.floor(index / 3) - Math.floor(blankIndex / 3)) +
      Math.abs((index % 3) - (blankIndex % 3)) === 1
    if (!isAdjacent) return

    const nextBoard = [...board]
    const tile = nextBoard[index]
    nextBoard[index] = 8
    nextBoard[blankIndex] = tile
    const nextMoves = moves + 1
    setBoard(nextBoard)
    setMoves(nextMoves)

    if (nextBoard.every((value, position) => value === position)) {
      finishGame(nextMoves, seconds)
    }
  }

  const score = savedScore?.skor
  const resultMoves = savedScore?.langkah ?? moves
  const resultSeconds = savedScore?.waktu ?? seconds

  return (
    <div className="flex flex-col gap-4 pb-4">
      {won && <ConfettiRain />}

      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/siswa')}
          className="flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold text-ink/60 hover:bg-white"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold text-sky hover:bg-white"
        >
          <Eye size={18} />
          Lihat gambar
        </button>
      </header>

      <section className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-ink bg-lemon-light text-sunrise">
          <Sparkles size={24} />
        </div>
        <h1 className="text-xl font-bold font-heading">Teka-Teki Pagi</h1>
        <p className="mt-1 text-xs text-ink/50">Susun puzzle 3×3 untuk membuka jalan ke sekolah.</p>
      </section>

      {savedScore && (
        <motion.section
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-ink bg-mint-light p-4 text-center"
        >
          <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700">
            <CheckCircle2 size={15} />
            Tantangan hari ini selesai
          </div>
          <p className="text-lg font-black">Skor kamu: {score} / 100</p>
          <p className="text-xs text-ink/60">
            {savedScore.langkah != null
              ? `Selesai dalam ${savedScore.langkah} langkah (${formatTime(savedScore.waktu)}).`
              : 'Skor puzzle hari ini sudah tercatat.'}
          </p>
          <p className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-emerald-800">
            <Calendar size={14} />
            Kembali lagi besok untuk puzzle baru!
          </p>
        </motion.section>
      )}

      <section className="grid grid-cols-2 gap-3">
        <div className="neo-card flex items-center gap-3 !p-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lemon-light text-amber-700">
            <Footprints size={20} />
          </span>
          <span>
            <span className="block text-[10px] font-semibold uppercase text-ink/45">Langkah</span>
            <strong className="text-lg">{resultMoves}</strong>
          </span>
        </div>
        <div className="neo-card flex items-center gap-3 !p-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-light text-sky">
            <Timer size={20} />
          </span>
          <span>
            <span className="block text-[10px] font-semibold uppercase text-ink/45">Waktu</span>
            <strong className="text-lg">{formatTime(resultSeconds)}</strong>
          </span>
        </div>
      </section>

      <section className="relative mx-auto aspect-square w-full max-w-[360px] rounded-3xl border-2 border-ink bg-white p-2.5 shadow-[4px_4px_0_#14213D]">
        {!started && !savedScore && (
          <div className="absolute inset-2.5 z-10 flex flex-col items-center justify-center rounded-2xl bg-ink/85 p-6 text-center text-white">
            <Sparkles size={30} className="mb-3 text-yellow-300" />
            <h2 className="font-bold">Misi Tas & Matahari</h2>
            <p className="my-2 text-xs text-white/75">
              Geser kepingan gambar sampai jalan menuju sekolah tersusun kembali.
            </p>
            <button
              type="button"
              onClick={startGame}
              className="mt-2 rounded-xl border-2 border-ink bg-sunrise px-5 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0_#14213D] transition hover:-translate-y-0.5"
            >
              Mulai main
            </button>
          </div>
        )}

        <div className="grid h-full grid-cols-3 grid-rows-3 gap-1.5">
          {board.map((tile, index) => {
            const isBlank = tile === 8
            const showCompletePicture = won || Boolean(savedScore)
            if (isBlank && !showCompletePicture) {
              return (
                <div
                  key="blank"
                  aria-label="Celah kosong"
                  className="flex items-center justify-center rounded-xl border-2 border-dashed border-ink/15 bg-bg text-[9px] font-bold uppercase text-ink/30"
                >
                  Kosong
                </div>
              )
            }

            return (
              <motion.button
                key={tile}
                type="button"
                layout
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                onClick={() => moveTile(index)}
                disabled={!started || won || Boolean(savedScore)}
                aria-label={`Keping puzzle ${tile + 1}`}
                className={`overflow-hidden rounded-xl border border-ink/10 shadow-sm ${
                  started && !won && !savedScore ? 'cursor-pointer hover:brightness-105 active:scale-95' : 'cursor-default'
                }`}
              >
                <PuzzleTile pieceIndex={tile} />
              </motion.button>
            )
          })}
        </div>
      </section>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink/45">
        <HelpCircle size={14} />
        Klik kepingan di dekat celah kosong untuk menggesernya.
      </p>

      {saveError && (
        <p role="alert" className="rounded-xl border border-danger bg-danger-light p-3 text-center text-sm text-danger">
          {saveError}
        </p>
      )}

      {won && savedScore && (
        <motion.section
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="neo-card text-center"
        >
          <Trophy size={34} className="mx-auto mb-2 text-sunrise" />
          <h2 className="text-lg font-bold">Luar biasa!</h2>
          <p className="text-sm text-ink/60">Kamu berhasil menyelesaikan puzzle hari ini.</p>
          <p className="mt-2 font-bold">Skor {score} · {moves} langkah · {formatTime(seconds)}</p>
          <button
            type="button"
            onClick={() => navigate('/siswa')}
            className="mt-4 rounded-xl border-2 border-ink bg-mint-light px-5 py-2 text-sm font-bold"
          >
            Selesai
          </button>
        </motion.section>
      )}

      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-5 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.94, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 12 }}
              onClick={event => event.stopPropagation()}
              className="w-full max-w-xs rounded-3xl border-2 border-ink bg-white p-4 text-center shadow-[5px_5px_0_#14213D]"
            >
              <h2 className="font-bold">Gambar tujuan</h2>
              <p className="mb-3 mt-1 text-xs text-ink/50">Ingat posisi matahari, jalan, dan tas merah.</p>
              <PuzzleIllustration className="aspect-square w-full rounded-2xl border border-ink/10" />
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="mt-3 rounded-xl bg-bg px-5 py-2 text-sm font-bold"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
