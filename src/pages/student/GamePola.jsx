import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Brain,
  CheckCircle2,
  Clock3,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getTodaySeed, getTodayString } from '../../utils/dailySeed'
import { generateNumberPatternQuestions } from '../../utils/numberPatternQuestions'

const SECONDS_PER_QUESTION = 25

export default function GamePola() {
  const navigate = useNavigate()
  const { currentUser, getSkorHariIni, simpanSkor } = useApp()
  const today = getTodayString()
  const dailyScore = getSkorHariIni(currentUser.id, 'pola')
  const questions = useMemo(
    () => generateNumberPatternQuestions(getTodaySeed(today)),
    [today],
  )
  const [gameState, setGameState] = useState('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION)
  const [userAnswers, setUserAnswers] = useState([])
  const [typedInput, setTypedInput] = useState('')
  const [isTypingMode, setIsTypingMode] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [saveError, setSaveError] = useState('')
  const currentQuestion = questions[currentIndex]

  const submitAnswer = useCallback((value, timedOut = false) => {
    if (gameState !== 'playing' || !currentQuestion) return

    const isCorrect = !timedOut && Number(value) === currentQuestion.answer
    const earned = isCorrect
      ? 10 + (timeLeft / SECONDS_PER_QUESTION) * 2.5
      : 0

    setUserAnswers(previous => [...previous, {
      questionId: currentQuestion.id,
      userChoice: timedOut ? 'Waktu habis' : value,
      isCorrect,
      timeSpent: SECONDS_PER_QUESTION - timeLeft,
      scoreEarned: earned,
      correctAnswer: currentQuestion.answer,
      explanation: currentQuestion.explanation,
      type: currentQuestion.type,
    }])
    setTypedInput('')
    setGameState('feedback')
  }, [currentQuestion, gameState, timeLeft])

  useEffect(() => {
    if (gameState !== 'playing') return undefined
    if (timeLeft === 0) {
      submitAnswer(null, true)
      return undefined
    }

    const timer = window.setTimeout(() => {
      setTimeLeft(previous => Math.max(0, previous - 1))
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [currentIndex, gameState, submitAnswer, timeLeft])

  const startGame = () => {
    setCurrentIndex(0)
    setTimeLeft(SECONDS_PER_QUESTION)
    setUserAnswers([])
    setTypedInput('')
    setTotalScore(0)
    setSaveError('')
    setGameState('playing')
  }

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(index => index + 1)
      setTimeLeft(SECONDS_PER_QUESTION)
      setGameState('playing')
      return
    }

    const score = Math.min(100, Math.round(
      userAnswers.reduce((total, answer) => total + answer.scoreEarned, 0),
    ))
    setTotalScore(score)
    setGameState('result')

    if (!dailyScore) {
      const result = simpanSkor({
        userId: currentUser.id,
        game: 'pola',
        skor: score,
        tanggal: today,
        waktu: userAnswers.reduce((total, answer) => total + answer.timeSpent, 0),
        detail: userAnswers,
      })
      if (!result.success) setSaveError(result.message)
    }
  }

  const handleManualSubmit = event => {
    event.preventDefault()
    if (!typedInput.trim()) return
    const answer = Number(typedInput)
    if (Number.isFinite(answer)) submitAnswer(answer)
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <header className="neo-card flex items-center justify-between gap-3 !p-4">
        <button
          type="button"
          onClick={() => navigate('/siswa/permainan')}
          aria-label="Kembali ke zona game"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-white transition hover:bg-bg"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Brain size={19} className="shrink-0 text-sky" />
            <h1 className="truncate font-heading text-lg font-bold">Pola Deret Bilangan</h1>
          </div>
          <p className="mt-0.5 text-xs text-ink/50">Tantangan harian · {today}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-ink bg-lemon-light px-2.5 py-1 text-[10px] font-bold">
          <Sparkles size={13} /> 8 soal
        </span>
      </header>

      {gameState === 'intro' && (
        <section className="neo-card space-y-5 !p-5 text-center sm:!p-6">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-ink bg-sky-light text-sky">
            <Zap size={30} />
          </span>
          <div>
            <h2 className="font-heading text-xl font-bold">Temukan Pola Tersembunyi!</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink/60">
              Lengkapi deret aritmatika, geometri, kuadrat, Fibonacci, dan pola kombinasi.
              Semua siswa mendapat soal harian yang sama.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-left">
            {[
              ['Jumlah soal', '8 tantangan'],
              ['Batas waktu', `${SECONDS_PER_QUESTION} detik/soal`],
              ['Skor maksimal', '100 poin'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-ink/10 bg-bg p-3">
                <span className="block text-[10px] text-ink/50">{label}</span>
                <strong className="mt-1 block text-xs sm:text-sm">{value}</strong>
              </div>
            ))}
          </div>

          {dailyScore && (
            <div className="rounded-xl border border-emerald-300 bg-mint-light p-3 text-sm text-emerald-800">
              <p className="flex items-center justify-center gap-1 font-bold">
                <CheckCircle2 size={16} /> Skor resmi hari ini: {dailyScore.skor} poin
              </p>
              <p className="mt-1 text-xs">Kamu tetap bisa bermain ulang sebagai latihan.</p>
            </div>
          )}

          <button
            type="button"
            onClick={startGame}
            className="neo-button mx-auto inline-flex w-full items-center justify-center gap-2 bg-sunrise px-5 py-3 font-bold text-white sm:w-auto"
          >
            {dailyScore ? 'Mulai latihan' : 'Mulai game pola'} <ArrowRight size={17} />
          </button>
        </section>
      )}

      {(gameState === 'playing' || gameState === 'feedback') && currentQuestion && (
        <section className="flex flex-col gap-4">
          <div className="neo-card flex items-center justify-between gap-2 !p-3 text-xs font-bold">
            <span>Soal {currentIndex + 1} dari {questions.length}</span>
            <span className="rounded-full bg-sky-light px-2.5 py-1 text-sky">
              {currentQuestion.level} · {currentQuestion.type}
            </span>
          </div>

          <div className="neo-card !p-4 sm:!p-6">
            <div className="mb-4 flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-ink/55"><Clock3 size={14} /> Waktu tersisa</span>
              <span className={timeLeft <= 5 ? 'text-danger' : 'text-ink'}>{timeLeft} detik</span>
            </div>
            <div
              className="mb-6 h-2 overflow-hidden rounded-full bg-ink/10"
              role="progressbar"
              aria-label="Waktu tersisa"
              aria-valuemin={0}
              aria-valuemax={SECONDS_PER_QUESTION}
              aria-valuenow={timeLeft}
            >
              <div
                className={`h-full rounded-full transition-[width] duration-1000 ${timeLeft <= 5 ? 'bg-danger' : 'bg-sky'}`}
                style={{ width: `${(timeLeft / SECONDS_PER_QUESTION) * 100}%` }}
              />
            </div>

            <p className="text-center text-xs font-bold uppercase tracking-wide text-ink/45">Angka yang hilang adalah</p>
            <div className="my-5 flex flex-wrap items-center justify-center gap-2">
              {currentQuestion.sequence.map((value, index) => (
                <span
                  key={`${currentQuestion.id}-${index}`}
                  className={`flex h-12 min-w-12 items-center justify-center rounded-xl border-2 px-2 font-mono text-lg font-bold sm:h-14 sm:min-w-14 ${
                    value === null ? 'border-dashed border-sunrise bg-lemon-light text-sunrise' : 'border-ink/15 bg-bg'
                  }`}
                >
                  {value ?? '?'}
                </span>
              ))}
            </div>

            {gameState === 'playing' && (
              <div className="border-t border-ink/10 pt-4">
                <div className="mb-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsTypingMode(mode => !mode)}
                    className="text-xs font-bold text-sky underline"
                  >
                    {isTypingMode ? 'Pilih jawaban' : 'Ketik angka'}
                  </button>
                </div>
                {isTypingMode ? (
                  <form onSubmit={handleManualSubmit} className="flex gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={typedInput}
                      onChange={event => setTypedInput(event.target.value)}
                      aria-label="Jawaban angka"
                      placeholder="Ketik jawaban..."
                      className="min-w-0 flex-1 rounded-xl border-2 border-ink/20 px-3 py-3 font-bold outline-none focus:border-sky"
                    />
                    <button type="submit" className="neo-button bg-sky px-4 font-bold text-white">Kirim</button>
                  </form>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {currentQuestion.options.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => submitAnswer(option)}
                        className="neo-button bg-white py-3 text-lg font-bold transition hover:bg-sky-light"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {gameState === 'feedback' && (
              <div className="space-y-3 border-t border-ink/10 pt-4">
                {userAnswers[currentIndex]?.isCorrect ? (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-mint-light p-3 text-sm font-bold text-emerald-800">
                    <CheckCircle2 size={20} /> Benar! +{Math.round(userAnswers[currentIndex].scoreEarned)} poin
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm font-bold text-rose-800">
                    <XCircle size={20} /> Belum tepat. Jawabannya {currentQuestion.answer}.
                  </div>
                )}
                <div className="flex items-start gap-2 rounded-xl border border-sky/20 bg-sky-light/60 p-3 text-sm">
                  <Lightbulb size={17} className="mt-0.5 shrink-0 text-sky" />
                  <p><strong>Penjelasan:</strong> {currentQuestion.explanation}</p>
                </div>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="neo-button inline-flex w-full items-center justify-center gap-2 bg-sky py-3 font-bold text-white"
                >
                  {currentIndex + 1 < questions.length ? 'Lanjut ke soal berikutnya' : 'Lihat hasil akhir'}
                  <ArrowRight size={17} />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {gameState === 'result' && (
        <section className="neo-card space-y-5 !p-5 text-center sm:!p-6">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-ink bg-lemon-light text-sunrise">
            <Award size={30} />
          </span>
          <div>
            <h2 className="font-heading text-xl font-bold">Tantangan selesai!</h2>
            <p className="mt-1 text-sm text-ink/55">
              {dailyScore ? 'Hasil latihan tidak mengubah skor resmi harian.' : 'Skor resmimu sudah dicatat.'}
            </p>
          </div>
          <div className="rounded-2xl border-2 border-ink bg-sky-light p-5">
            <span className="text-xs font-bold uppercase tracking-wide text-sky">Skor akhir</span>
            <strong className="my-1 block text-5xl font-black text-sky">{totalScore}</strong>
            <span className="text-xs text-ink/55">dari 100 poin</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-ink/10 bg-bg p-3">
              <span className="block text-xs text-ink/50">Jawaban benar</span>
              <strong className="text-lg text-emerald-700">{userAnswers.filter(answer => answer.isCorrect).length} / 8</strong>
            </div>
            <div className="rounded-xl border border-ink/10 bg-bg p-3">
              <span className="block text-xs text-ink/50">Rata-rata waktu</span>
              <strong className="text-lg">{Math.round(userAnswers.reduce((total, answer) => total + answer.timeSpent, 0) / questions.length)} dtk</strong>
            </div>
          </div>
          {saveError && <p role="alert" className="text-sm font-semibold text-danger">{saveError}</p>}
          <div className="space-y-2 text-left">
            <h3 className="flex items-center gap-1 text-sm font-bold"><Trophy size={15} /> Evaluasi jawaban</h3>
            {userAnswers.map((answer, index) => (
              <div key={answer.questionId} className="flex items-start justify-between gap-3 rounded-xl border border-ink/10 bg-bg p-3 text-xs">
                <div>
                  <strong>Soal {index + 1} · {answer.type}</strong>
                  <p className="mt-1 text-ink/55">{answer.explanation}</p>
                </div>
                <span className={`shrink-0 font-bold ${answer.isCorrect ? 'text-emerald-700' : 'text-danger'}`}>
                  {answer.isCorrect ? `+${Math.round(answer.scoreEarned)}` : '0'}
                </span>
              </div>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={startGame}
              className="neo-button inline-flex items-center justify-center gap-2 bg-white py-3 font-bold"
            >
              <RotateCcw size={16} /> Ulang latihan
            </button>
            <button
              type="button"
              onClick={() => navigate('/siswa/permainan')}
              className="neo-button inline-flex items-center justify-center gap-2 bg-sunrise py-3 font-bold text-white"
            >
              Kembali ke game <ArrowRight size={16} />
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
