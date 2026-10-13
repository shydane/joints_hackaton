import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock, Play, RotateCcw, Trophy, Zap } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getTodaySeed, getTodayString } from '../../utils/dailySeed'
import { generateMathQuestions } from '../../utils/mathQuestions'

const GAME_DURATION = 60
const QUESTION_COUNT = 100

export default function GameHitung() {
  const navigate = useNavigate()
  const { currentUser, getSkorHariIni, simpanSkor } = useApp()
  const today = useMemo(() => getTodayString(), [])
  const questions = useMemo(
    () => generateMathQuestions(getTodaySeed(today) + 31, QUESTION_COUNT),
    [today],
  )
  const [playing, setPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [attempted, setAttempted] = useState(0)
  const [finished, setFinished] = useState(false)
  const [finalScore, setFinalScore] = useState(null)
  const [saveError, setSaveError] = useState('')
  const timerRef = useRef(null)
  const finishRef = useRef(false)
  const correctRef = useRef(0)
  const attemptedRef = useRef(0)
  const dailyScore = getSkorHariIni(currentUser.id, 'hitung')
  const currentQuestion = questions[currentIndex]

  useEffect(() => () => clearInterval(timerRef.current), [])

  const finishGame = (correct = correctRef.current, elapsed = GAME_DURATION - timeLeft) => {
    if (finishRef.current) return
    finishRef.current = true
    clearInterval(timerRef.current)
    setPlaying(false)
    setFinished(true)
    const score = Math.min(100, Math.round((correct / 20) * 100))
    setFinalScore(score)

    if (!dailyScore) {
      const result = simpanSkor({
        userId: currentUser.id,
        game: 'hitung',
        skor: score,
        tanggal: today,
        waktu: elapsed,
      })
      if (!result.success) setSaveError(result.message)
    }
  }

  useEffect(() => {
    if (!playing) return undefined
    if (timeLeft === 0) {
      finishGame(correctRef.current, GAME_DURATION)
      return undefined
    }
    timerRef.current = setTimeout(() => setTimeLeft(previous => previous - 1), 1000)
    return () => clearTimeout(timerRef.current)
  }, [playing, timeLeft])

  const startGame = () => {
    clearInterval(timerRef.current)
    correctRef.current = 0
    attemptedRef.current = 0
    finishRef.current = false
    setCorrectCount(0)
    setAttempted(0)
    setCurrentIndex(0)
    setTimeLeft(GAME_DURATION)
    setFinalScore(null)
    setSaveError('')
    setFinished(false)
    setPlaying(true)
  }

  const selectOption = (chosen) => {
    if (!playing || finishRef.current || !currentQuestion) return
    const nextCorrect = correctRef.current + Number(chosen === currentQuestion.answer)
    const nextAttempted = attemptedRef.current + 1
    correctRef.current = nextCorrect
    attemptedRef.current = nextAttempted
    setCorrectCount(nextCorrect)
    setAttempted(nextAttempted)

    if (currentIndex + 1 >= questions.length) {
      finishGame(nextCorrect)
    } else {
      setCurrentIndex(index => index + 1)
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <header className="flex items-center justify-between">
        <button type="button" onClick={() => navigate('/siswa/permainan')} className="flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold text-ink/60 hover:bg-white">
          <ArrowLeft size={18} /> Semua game
        </button>
        <span className="rounded-full bg-lemon-light px-3 py-1 text-xs font-bold text-amber-800">{today}</span>
      </header>

      <section className="text-center">
        <span className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-ink bg-lemon-light text-amber-700">
          <Zap size={25} />
        </span>
        <h1 className="text-xl font-bold font-heading">Hitung Cepat</h1>
        <p className="mt-1 text-xs text-ink/50">Jawab sebanyak mungkin soal dalam 60 detik.</p>
      </section>

      {dailyScore && (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-mint-light p-3 text-xs text-emerald-800">
          <CheckCircle2 size={18} className="shrink-0" />
          Skor resmi hari ini: <strong>{dailyScore.skor}</strong>. Permainan berikutnya hanya latihan.
        </p>
      )}

      {playing && currentQuestion && (
        <>
          <section className="neo-card flex items-center justify-between !p-4">
            <span className={`flex items-center gap-2 text-2xl font-black ${timeLeft <= 10 ? 'text-danger' : ''}`}>
              <Clock size={23} /> {timeLeft}s
            </span>
            <span className="text-right">
              <span className="block text-xs font-bold uppercase text-sunrise">Level {currentQuestion.level}</span>
              <span className="text-sm text-ink/60">Benar: {correctCount}</span>
            </span>
          </section>
          <section className="neo-card py-8 text-center">
            <span className="text-xs text-ink/45">Soal #{currentIndex + 1}</span>
            <h2 className="my-3 text-4xl font-black tracking-wide sm:text-5xl">{currentQuestion.text} = ?</h2>
          </section>
          <section className="grid grid-cols-2 gap-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={`${currentIndex}-${option}-${index}`}
                type="button"
                onClick={() => selectOption(option)}
                className="neo-card py-4 text-2xl font-black transition hover:-translate-y-0.5 hover:bg-lemon-light active:scale-95"
              >
                {option}
              </button>
            ))}
          </section>
        </>
      )}

      {!playing && !finished && (
        <section className="neo-card text-center">
          <p className="mb-4 text-sm leading-relaxed text-ink/60">
            Soal bertambah sulit secara bertahap. Setiap jawaban benar menambah skor.
          </p>
          <button type="button" onClick={startGame} className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-sunrise px-5 py-3 font-bold text-white shadow-[3px_3px_0_#14213D]">
            <Play size={19} /> Mulai 60 detik
          </button>
        </section>
      )}

      {saveError && <p role="alert" className="rounded-xl border border-danger bg-danger-light p-3 text-center text-sm text-danger">{saveError}</p>}

      {finished && (
        <section className="neo-card text-center">
          <Trophy size={40} className="mx-auto mb-2 text-sunrise" />
          <h2 className="text-xl font-bold">Waktu habis!</h2>
          <p className="mt-1 text-sm text-ink/55">Tantangan hitungmu selesai.</p>
          <div className="my-4 rounded-2xl border-2 border-ink bg-lemon-light p-4">
            <span className="text-xs font-bold uppercase text-amber-800">Skor akhir</span>
            <p className="text-5xl font-black text-sunrise">{finalScore}</p>
            <div className="mt-2 flex justify-center gap-6 text-sm">
              <span>Benar: <strong>{correctCount}</strong></span>
              <span>Percobaan: <strong>{attempted}</strong></span>
            </div>
          </div>
          <div className="flex justify-center gap-2">
            <button type="button" onClick={startGame} className="flex items-center gap-1 rounded-xl border-2 border-ink bg-white px-4 py-2 text-sm font-bold">
              <RotateCcw size={15} /> Latihan lagi
            </button>
            <button type="button" onClick={() => navigate('/siswa/permainan')} className="rounded-xl border-2 border-ink bg-mint-light px-4 py-2 text-sm font-bold">
              Semua game
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
