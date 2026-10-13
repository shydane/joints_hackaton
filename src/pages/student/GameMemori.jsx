import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Brain, CheckCircle2, Clock, HelpCircle, RotateCcw, Trophy } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getTodaySeed, getTodayString, seededShuffle } from '../../utils/dailySeed'

const CARD_ITEMS = [
  { id: 'microscope', emoji: '🔬', label: 'Sains' },
  { id: 'book', emoji: '📚', label: 'Buku' },
  { id: 'globe', emoji: '🌍', label: 'Geografi' },
  { id: 'palette', emoji: '🎨', label: 'Seni' },
  { id: 'rocket', emoji: '🚀', label: 'Fisika' },
  { id: 'calculator', emoji: '📐', label: 'Matematika' },
  { id: 'atom', emoji: '⚛️', label: 'Kimia' },
  { id: 'music', emoji: '🎵', label: 'Musik' },
]

function makeCards(seed) {
  return seededShuffle(
    [...CARD_ITEMS, ...CARD_ITEMS].map((item, index) => ({
      ...item,
      uniqueId: `${item.id}-${index}`,
    })),
    seed,
  )
}

export default function GameMemori() {
  const navigate = useNavigate()
  const { currentUser, getSkorHariIni, simpanSkor } = useApp()
  const today = useMemo(() => getTodayString(), [])
  const cards = useMemo(() => makeCards(getTodaySeed(today) + 17), [today])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [started, setStarted] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [finalScore, setFinalScore] = useState(null)
  const [saveError, setSaveError] = useState('')
  const dailyScore = getSkorHariIni(currentUser.id, 'memori')
  const lockedRef = useRef(false)
  const completionRef = useRef(false)
  const movesRef = useRef(0)
  const secondsRef = useRef(0)
  const mismatchTimer = useRef(null)

  useEffect(() => () => clearTimeout(mismatchTimer.current), [])

  useEffect(() => {
    if (!started || completed) return undefined
    const interval = setInterval(() => {
      secondsRef.current += 1
      setSeconds(secondsRef.current)
    }, 1000)
    return () => clearInterval(interval)
  }, [completed, started])

  const startGame = () => {
    clearTimeout(mismatchTimer.current)
    setFlipped([])
    setMatched([])
    setMoves(0)
    movesRef.current = 0
    setSeconds(0)
    secondsRef.current = 0
    setFinalScore(null)
    setSaveError('')
    setCompleted(false)
    completionRef.current = false
    lockedRef.current = false
    setStarted(true)
  }

  const finishGame = (nextMatched) => {
    if (completionRef.current) return
    completionRef.current = true
    lockedRef.current = true
    setCompleted(true)

    const movePenalty = Math.max(0, (movesRef.current - 8) * 4)
    const timePenalty = Math.max(0, Math.floor(secondsRef.current / 4) * 2)
    const score = Math.max(20, Math.min(100, 100 - movePenalty - timePenalty))
    setFinalScore(score)

    if (!dailyScore) {
      const result = simpanSkor({
        userId: currentUser.id,
        game: 'memori',
        skor: score,
        tanggal: today,
        langkah: movesRef.current,
        waktu: secondsRef.current,
      })
      if (!result.success) setSaveError(result.message)
    }

    setMatched(nextMatched)
  }

  const handleCardClick = (uniqueId) => {
    if (!started || completed || lockedRef.current || flipped.includes(uniqueId) || matched.includes(uniqueId)) return

    const nextFlipped = [...flipped, uniqueId]
    setFlipped(nextFlipped)
    if (nextFlipped.length !== 2) return

    const nextMoves = movesRef.current + 1
    movesRef.current = nextMoves
    setMoves(nextMoves)
    const [firstId, secondId] = nextFlipped
    const firstCard = cards.find(card => card.uniqueId === firstId)
    const secondCard = cards.find(card => card.uniqueId === secondId)

    if (firstCard.id === secondCard.id) {
      const nextMatched = [...matched, firstId, secondId]
      if (nextMatched.length === cards.length) {
        finishGame(nextMatched)
      } else {
        setMatched(nextMatched)
        setFlipped([])
      }
      return
    }

    lockedRef.current = true
    mismatchTimer.current = setTimeout(() => {
      setFlipped([])
      lockedRef.current = false
    }, 900)
  }

  const shownScore = completed ? finalScore : dailyScore?.skor

  return (
    <div className="flex flex-col gap-4 pb-4">
      <header className="flex items-center justify-between">
        <button type="button" onClick={() => navigate('/siswa/permainan')} className="flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold text-ink/60 hover:bg-white">
          <ArrowLeft size={18} /> Semua game
        </button>
        <span className="rounded-full bg-sky-light px-3 py-1 text-xs font-bold text-sky">{today}</span>
      </header>

      <section className="text-center">
        <span className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-ink bg-sky-light text-sky">
          <Brain size={25} />
        </span>
        <h1 className="text-xl font-bold font-heading">Memori Kartu</h1>
        <p className="mt-1 text-xs text-ink/50">Cocokkan semua 8 pasang kartu.</p>
      </section>

      {dailyScore && (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-mint-light p-3 text-xs text-emerald-800">
          <CheckCircle2 size={18} className="shrink-0" />
          Skor resmi hari ini: <strong>{dailyScore.skor}</strong>. Permainan berikutnya hanya latihan.
        </p>
      )}

      <section className="neo-card grid grid-cols-3 text-center !p-3">
        <div><span className="block text-[10px] text-ink/45">Langkah</span><strong className="text-lg">{moves}</strong></div>
        <div><span className="block text-[10px] text-ink/45">Waktu</span><strong className="flex items-center justify-center gap-1 text-lg"><Clock size={15} /> {seconds}s</strong></div>
        <div><span className="block text-[10px] text-ink/45">Pasangan</span><strong className="text-lg text-emerald-700">{matched.length / 2}/8</strong></div>
      </section>

      {!started && (
        <div className="neo-card text-center">
          <p className="mb-4 text-sm text-ink/60">Ingat posisi setiap kartu, lalu temukan pasangannya.</p>
          <button type="button" onClick={startGame} className="rounded-xl border-2 border-ink bg-sky px-5 py-2.5 font-bold text-white shadow-[3px_3px_0_#14213D]">
            Mulai bermain
          </button>
        </div>
      )}

      <section className="mx-auto grid aspect-square w-full max-w-[440px] grid-cols-4 gap-2 sm:gap-3">
        {cards.map(card => {
          const isOpen = flipped.includes(card.uniqueId) || matched.includes(card.uniqueId)
          const isMatched = matched.includes(card.uniqueId)
          return (
            <button
              key={card.uniqueId}
              type="button"
              onClick={() => handleCardClick(card.uniqueId)}
              disabled={!started || isOpen || completed || lockedRef.current}
              aria-label={isOpen ? `${card.label}, ${card.emoji}` : 'Kartu tertutup'}
              className={`flex min-h-0 items-center justify-center rounded-2xl border-2 text-3xl transition active:scale-95 sm:text-4xl ${
                isMatched
                  ? 'scale-95 border-emerald-400 bg-mint-light'
                  : isOpen
                    ? 'border-sky bg-white'
                    : 'border-ink bg-sky text-white shadow-[2px_2px_0_#14213D]'
              } disabled:cursor-default`}
            >
              {isOpen ? <span aria-hidden="true">{card.emoji}</span> : <HelpCircle size={27} className="text-white/75" />}
            </button>
          )
        })}
      </section>

      {saveError && <p role="alert" className="rounded-xl border border-danger bg-danger-light p-3 text-center text-sm text-danger">{saveError}</p>}

      {completed && (
        <section className="neo-card text-center">
          <Trophy size={38} className="mx-auto mb-2 text-sunrise" />
          <h2 className="text-lg font-bold">Hebat sekali!</h2>
          <p className="mt-1 text-sm text-ink/60">Semua pasangan berhasil ditemukan.</p>
          <p className="mt-2 font-bold">Skor {shownScore} · {moves} langkah · {seconds}s</p>
          <div className="mt-4 flex justify-center gap-2">
            <button type="button" onClick={startGame} className="flex items-center gap-1 rounded-xl border-2 border-ink bg-white px-4 py-2 text-sm font-bold">
              <RotateCcw size={15} /> Latihan lagi
            </button>
            <button type="button" onClick={() => navigate('/siswa/permainan')} className="rounded-xl border-2 border-ink bg-mint-light px-4 py-2 text-sm font-bold">
              Selesai
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
