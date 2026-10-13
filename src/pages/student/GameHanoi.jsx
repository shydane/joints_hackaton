import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CircleHelp,
  RotateCcw,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getTodayString } from '../../utils/dailySeed'
import { createHanoiPegs, createShuffledHanoiPegs, getDailyHanoiConfig, isLegalHanoiMove } from '../../utils/dailyHanoi'

const DISK_COLORS = {
  1: 'from-cyan-400 to-blue-500 shadow-cyan-500/40',
  2: 'from-emerald-400 to-teal-500 shadow-emerald-500/40',
  3: 'from-amber-400 to-orange-500 shadow-amber-500/40',
  4: 'from-rose-400 to-pink-500 shadow-rose-500/40',
  5: 'from-indigo-400 to-violet-600 shadow-indigo-500/40',
  6: 'from-fuchsia-400 to-pink-600 shadow-fuchsia-500/40',
}

const DIFFICULTY_LABELS = {
  3: { text: 'Santai · 3 cakram', tone: 'border-emerald-300 bg-mint-light text-emerald-800' },
  4: { text: 'Menantang · 4 cakram', tone: 'border-amber-300 bg-lemon-light text-amber-800' },
  5: { text: 'Master · 5 cakram', tone: 'border-rose-300 bg-rose-50 text-rose-800' },
  6: { text: 'Ahli · 6 cakram', tone: 'border-violet-300 bg-violet-50 text-violet-800' },
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

export default function GameHanoi() {
  const navigate = useNavigate()
  const { currentUser, getSkorHariIni, simpanSkor } = useApp()
  const today = useMemo(() => getTodayString(), [])
  const { diskCount, initialPegs, optimalMoves } = useMemo(() => getDailyHanoiConfig(today), [today])
  const dailyScore = getSkorHariIni(currentUser.id, 'hanoi')
  const [pegs, setPegs] = useState(() => (initialPegs ? initialPegs.map(peg => [...peg]) : createHanoiPegs(diskCount)))
  const [selectedPeg, setSelectedPeg] = useState(null)
  const [draggedFromPeg, setDraggedFromPeg] = useState(null)
  const [moves, setMoves] = useState(0)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isWon, setIsWon] = useState(false)
  const [isPractice, setIsPractice] = useState(() => Boolean(dailyScore))
  const [finalScore, setFinalScore] = useState(null)
  const [showTutorial, setShowTutorial] = useState(false)
  const [invalidShakePeg, setInvalidShakePeg] = useState(null)
  const [saveError, setSaveError] = useState('')
  const completedRef = useRef(false)
  const invalidTimeoutRef = useRef(null)
  const dragJustDroppedRef = useRef(false)
  const difficulty = DIFFICULTY_LABELS[diskCount]

  useEffect(() => () => window.clearTimeout(invalidTimeoutRef.current), [])

  useEffect(() => {
    if (!isPlaying || isWon) return undefined
    const interval = window.setInterval(() => setTimer(seconds => seconds + 1), 1000)
    return () => window.clearInterval(interval)
  }, [isPlaying, isWon])

  const handleVictory = useCallback((totalMoves, totalTime) => {
    if (completedRef.current) return
    completedRef.current = true
    setIsPlaying(false)
    setIsWon(true)

    const moveScore = (optimalMoves / Math.max(optimalMoves, totalMoves)) * 70
    const targetTime = optimalMoves * 2.5
    const timeRatio = Math.max(0.2, Math.min(1, targetTime / Math.max(targetTime, totalTime)))
    const score = Math.min(100, Math.max(10, Math.round(moveScore + timeRatio * 30)))
    setFinalScore(score)

    if (!isPractice) {
      const result = simpanSkor({
        userId: currentUser.id,
        game: 'hanoi',
        skor: score,
        tanggal: today,
        langkah: totalMoves,
        waktu: totalTime,
        detail: { moves: totalMoves, optimalMoves, disks: diskCount },
      })
      if (!result.success) setSaveError(result.message)
    }
  }, [currentUser.id, diskCount, isPractice, optimalMoves, simpanSkor, today])

  const resetGame = () => {
    setPegs(initialPegs ? initialPegs.map(peg => [...peg]) : createHanoiPegs(diskCount))
    setSelectedPeg(null)
    setDraggedFromPeg(null)
    setMoves(0)
    setTimer(0)
    setIsPlaying(false)
    setIsWon(false)
    setIsPractice(Boolean(dailyScore))
    setFinalScore(null)
    setSaveError('')
    completedRef.current = false
  }

  const executeMove = (fromIndex, toIndex) => {
    if (isWon || completedRef.current) return
    if (fromIndex === toIndex) {
      setSelectedPeg(null)
      return
    }
    if (!isLegalHanoiMove(pegs, fromIndex, toIndex)) {
      if (pegs[fromIndex]?.length) {
        setInvalidShakePeg(toIndex)
        window.clearTimeout(invalidTimeoutRef.current)
        invalidTimeoutRef.current = window.setTimeout(() => setInvalidShakePeg(null), 400)
      }
      setSelectedPeg(null)
      return
    }

    const movingDisk = pegs[fromIndex][pegs[fromIndex].length - 1]
    const nextPegs = pegs.map((peg, index) => {
      if (index === fromIndex) return peg.slice(0, -1)
      if (index === toIndex) return [...peg, movingDisk]
      return peg
    })
    const nextMoves = moves + 1
    const nextTime = isPlaying ? timer : 0

    setPegs(nextPegs)
    setMoves(nextMoves)
    setSelectedPeg(null)
    setIsPlaying(true)

    if (nextPegs[2].length === diskCount) {
      handleVictory(nextMoves, nextTime)
    }
  }

  const handlePegTap = pegIndex => {
    if (dragJustDroppedRef.current) {
      dragJustDroppedRef.current = false
      return
    }
    if (isWon) return
    if (selectedPeg === null) {
      if (pegs[pegIndex].length > 0) setSelectedPeg(pegIndex)
      return
    }
    executeMove(selectedPeg, pegIndex)
  }

  const handleDragStart = (event, pegIndex) => {
    if (isWon || pegs[pegIndex].length === 0) return
    setDraggedFromPeg(pegIndex)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(pegIndex))
  }

  const handleDrop = (event, toIndex) => {
    event.preventDefault()
    event.stopPropagation()
    const fromIndex = draggedFromPeg ?? Number(event.dataTransfer.getData('text/plain'))
    if (Number.isInteger(fromIndex) && fromIndex >= 0 && fromIndex < 3) {
      executeMove(fromIndex, toIndex)
    }
    dragJustDroppedRef.current = true
    window.setTimeout(() => {
      dragJustDroppedRef.current = false
    }, 150)
    setDraggedFromPeg(null)
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-4">
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/siswa/permainan')}
          className="flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold text-ink/60 hover:bg-white"
        >
          <ArrowLeft size={18} /> Semua game
        </button>
        <button
          type="button"
          onClick={() => setShowTutorial(open => !open)}
          aria-expanded={showTutorial}
          className="neo-button inline-flex items-center gap-1.5 bg-white px-3 py-2 text-xs font-bold"
        >
          <CircleHelp size={15} /> Cara bermain
        </button>
      </header>

      <section className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-black">Menara Hanoi</h1>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${difficulty.tone}`}>{difficulty.text}</span>
          </div>
          <p className="mt-1 text-xs text-ink/55">Kumpulkan semua cakram di tiang C dengan langkah seefisien mungkin.</p>
        </div>
        <span className="rounded-full bg-sky-light px-3 py-1 text-xs font-bold text-sky">Tantangan harian · {today}</span>
      </section>

      {dailyScore && (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-mint-light p-3 text-xs text-emerald-800">
          <CheckCircle2 size={17} className="shrink-0" />
          Skor resmi hari ini: <strong>{dailyScore.skor}</strong>. Permainan ulang hanya latihan.
        </p>
      )}

      {showTutorial && (
        <section className="neo-card flex gap-2 !p-4 text-xs leading-relaxed text-ink/65">
          <AlertCircle size={17} className="mt-0.5 shrink-0 text-sunrise" />
          <ul className="list-inside list-disc space-y-1">
            <li>Pindahkan satu cakram setiap kali.</li>
            <li>Cakram besar tidak boleh diletakkan di atas cakram yang lebih kecil.</li>
            <li>Ketuk tiang untuk memilih dan memindahkan cakram, atau seret cakram teratas ke tiang tujuan.</li>
          </ul>
        </section>
      )}

      <section className="grid grid-cols-3 gap-2">
        <div className="neo-card flex flex-col items-center !p-3">
          <span className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase text-ink/50"><Zap size={13} className="text-sunrise" /> Langkah</span>
          <strong className="text-lg">{moves}<span className="ml-1 text-[10px] font-semibold text-ink/40">/ {optimalMoves} optimal</span></strong>
        </div>
        <div className="neo-card flex flex-col items-center !p-3">
          <span className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase text-ink/50"><Timer size={13} className="text-sky" /> Waktu</span>
          <strong className="font-mono text-lg">{formatTime(timer)}</strong>
        </div>
        <div className="neo-card flex flex-col items-center !p-3">
          <span className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase text-ink/50"><Trophy size={13} className="text-emerald-600" /> Cakram</span>
          <strong className="text-lg">{diskCount}</strong>
        </div>
      </section>

      <section className="neo-card overflow-hidden bg-ink !p-3 text-white sm:!p-5">
        <div className="grid min-h-[17rem] grid-cols-3 items-end gap-2 pb-2 sm:min-h-[21rem] sm:gap-5">
          {pegs.map((peg, pegIndex) => {
            const isSelected = selectedPeg === pegIndex
            const isShaking = invalidShakePeg === pegIndex
            return (
              <div
                key={pegIndex}
                role="button"
                tabIndex={isWon ? -1 : 0}
                aria-label={`Tiang ${String.fromCharCode(65 + pegIndex)}${isSelected ? ', dipilih' : ''}`}
                aria-disabled={isWon}
                onClick={() => handlePegTap(pegIndex)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handlePegTap(pegIndex)
                  }
                }}
                onDragOver={event => event.preventDefault()}
                onDrop={event => handleDrop(event, pegIndex)}
                className={`group relative flex h-full min-h-[16rem] cursor-pointer flex-col items-center justify-end rounded-xl px-1 outline-none transition focus-visible:ring-2 focus-visible:ring-sky sm:min-h-[20rem] ${
                  isShaking ? 'animate-bounce' : ''
                } ${isSelected ? 'bg-white/5' : ''} ${isWon ? 'cursor-default' : ''}`}
              >
                {isSelected && (
                  <span className="absolute top-2 rounded-full bg-sky/20 px-2 py-0.5 text-[10px] font-bold text-sky-200">Dipilih</span>
                )}
                <div className="pointer-events-none absolute bottom-8 h-[75%] w-2 rounded-t-full bg-gradient-to-t from-white/25 to-white/45 sm:w-3" />
                <div className="z-10 flex w-full flex-col-reverse items-center gap-1 pb-2">
                  {peg.map((diskSize, diskIndex) => {
                    const isTopDisk = diskIndex === peg.length - 1
                    const width = 32 + (diskSize / diskCount) * 62
                    return (
                      <div
                        key={diskSize}
                        draggable={isTopDisk && !isWon}
                        onDragStart={event => handleDragStart(event, pegIndex)}
                        onDragEnd={() => setDraggedFromPeg(null)}
                        style={{ width: `${width}%` }}
                        className={`flex h-7 items-center justify-center rounded-full border border-white/20 bg-gradient-to-r text-[10px] font-bold text-white shadow-md transition sm:h-9 sm:text-xs ${DISK_COLORS[diskSize]} ${
                          isTopDisk ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'
                        } ${isSelected && isTopDisk ? '-translate-y-2 ring-2 ring-sky-300 sm:-translate-y-3' : ''}`}
                      >
                        {diskSize}
                      </div>
                    )
                  })}
                </div>
                <div className="z-10 flex h-4 w-full items-center justify-center rounded-lg border border-white/10 bg-white/15 text-[10px] font-black text-white/70 sm:h-5">
                  {String.fromCharCode(65 + pegIndex)}
                </div>
              </div>
            )
          })}
        </div>
        <p className="pt-2 text-center text-[10px] text-white/55 sm:text-xs">
          Ketuk tiang untuk memindahkan cakram, atau seret cakram teratas.
        </p>
      </section>

      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={resetGame}
          className="neo-button inline-flex items-center gap-2 bg-white px-4 py-2.5 text-sm font-bold"
        >
          <RotateCcw size={16} /> {isWon ? 'Main lagi' : 'Reset'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/siswa/permainan')}
          className="neo-button inline-flex items-center gap-2 bg-mint-light px-4 py-2.5 text-sm font-bold"
        >
          <ArrowLeft size={16} /> Zona game
        </button>
      </div>

      {saveError && <p role="alert" className="rounded-xl border border-danger bg-danger-light p-3 text-center text-sm text-danger">{saveError}</p>}

      {isWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="hanoi-result-title" className="neo-card w-full max-w-md space-y-4 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-lemon-light text-sunrise">
              <Trophy size={29} />
            </span>
            <div>
              <h2 id="hanoi-result-title" className="font-heading text-2xl font-black">Luar biasa, berhasil!</h2>
              <p className="mt-1 text-xs text-ink/55">
                {isPractice ? 'Hasil latihan tidak mengubah skor resmi hari ini.' : 'Semua cakram sudah sampai di Tiang C.'}
              </p>
            </div>
            <div className="rounded-2xl border-2 border-ink bg-sky-light p-4">
              <span className="text-xs font-bold uppercase text-sky">Skor akhir</span>
              <strong className="block text-5xl font-black text-sky">{finalScore}</strong>
              <div className="mt-3 grid grid-cols-2 border-t border-ink/10 pt-3 text-xs">
                <span>Total langkah<strong className="mt-1 block text-sm">{moves} / {optimalMoves} optimal</strong></span>
                <span>Waktu<strong className="mt-1 block text-sm">{formatTime(timer)}</strong></span>
              </div>
            </div>
            <button
              type="button"
              onClick={resetGame}
              className="neo-button inline-flex w-full items-center justify-center gap-2 bg-sunrise py-3 font-bold text-white"
            >
              <RotateCcw size={16} /> {isPractice ? 'Latihan lagi' : 'Main latihan'}
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
