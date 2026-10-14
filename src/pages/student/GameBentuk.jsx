import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock3,
  Flame,
  HelpCircle,
  RotateCcw,
  Shapes,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getTodaySeed, getTodayString } from '../../utils/dailySeed'
import { generateShapePatternQuestions } from '../../utils/shapePatternQuestions'

function ShapeGraphic({ shape, color, size, rotation }) {
  const scale = size === 'small' ? 0.65 : size === 'large' ? 1.05 : 0.85

  let graphic
  switch (shape) {
    case 'square':
      graphic = <rect x="18" y="18" width="64" height="64" rx="8" />
      break
    case 'triangle':
      graphic = <polygon points="50,15 85,80 15,80" strokeLinejoin="round" />
      break
    case 'diamond':
      graphic = <polygon points="50,14 86,50 50,86 14,50" strokeLinejoin="round" />
      break
    case 'star':
      graphic = <polygon points="50,15 61,38 86,41 67,58 72,83 50,70 28,83 33,58 14,41 39,38" strokeLinejoin="round" />
      break
    case 'hexagon':
      graphic = <polygon points="50,16 82,32 82,68 50,84 18,68 18,32" strokeLinejoin="round" />
      break
    case 'circle':
    default:
      graphic = <circle cx="50" cy="50" r="32" />
      break
  }

  return (
    <span
      className="flex h-full w-full items-center justify-center transition-transform duration-300"
      style={{ transform: `rotate(${rotation}deg) scale(${scale})` }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-sm" aria-hidden="true">
        <g fill={color.fill} stroke={color.border} strokeWidth="6">
          {graphic}
        </g>
      </svg>
    </span>
  )
}

function matchesShape(first, second) {
  return first.shape === second.shape
    && first.color.name === second.color.name
    && first.size === second.size
    && first.rotation === second.rotation
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

export default function GameBentuk() {
  const navigate = useNavigate()
  const { currentUser, getSkorHariIni, simpanSkor } = useApp()
  const today = useMemo(() => getTodayString(), [])
  const dailyScore = getSkorHariIni(currentUser.id, 'bentuk')
  const questions = useMemo(
    () => generateShapePatternQuestions(getTodaySeed(today) + 77),
    [today],
  )
  const [started, setStarted] = useState(false)
  const [isPractice, setIsPractice] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isAnswerChecked, setIsAnswerChecked] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [answerResults, setAnswerResults] = useState([])
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [finalScore, setFinalScore] = useState(null)
  const [saveError, setSaveError] = useState('')
  const currentQuestion = questions[currentIndex]

  useEffect(() => {
    if (!started || isCompleted) return undefined
    const timer = window.setInterval(() => {
      setSecondsElapsed(seconds => seconds + 1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isCompleted, started])

  const startGame = () => {
    setIsPractice(Boolean(dailyScore))
    setStarted(true)
    setCurrentIndex(0)
    setSelectedOption(null)
    setIsAnswerChecked(false)
    setCorrectCount(0)
    setAnswerResults([])
    setSecondsElapsed(0)
    setFinalScore(null)
    setSaveError('')
    setIsCompleted(false)
  }

  const handleVerifyAnswer = () => {
    if (!selectedOption || isAnswerChecked) return
    setIsAnswerChecked(true)
    const isCorrect = matchesShape(selectedOption, currentQuestion.correctAnswer)
    setAnswerResults(results => [...results, { questionId: currentQuestion.id, correct: isCorrect }])
    if (isCorrect) {
      setCorrectCount(count => count + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(index => index + 1)
      setSelectedOption(null)
      setIsAnswerChecked(false)
      return
    }

    const isLastAnswerCorrect = matchesShape(selectedOption, currentQuestion.correctAnswer)
    const totalCorrect = correctCount + Number(isLastAnswerCorrect)
    const basePoints = Math.round((totalCorrect / questions.length) * 80)
    const speedBonus = totalCorrect === 0
      ? 0
      : secondsElapsed <= 45
        ? 20
        : secondsElapsed <= 90
          ? 15
          : secondsElapsed <= 150
            ? 10
            : 5
    const score = Math.min(100, basePoints + speedBonus)
    setFinalScore(score)
    setIsCompleted(true)

    if (!dailyScore) {
      const result = simpanSkor({
        userId: currentUser.id,
        game: 'bentuk',
        skor: score,
        tanggal: today,
        waktu: secondsElapsed,
        detail: [...answerResults, { questionId: currentQuestion.id, correct: isLastAnswerCorrect }],
      })
      if (!result.success) setSaveError(result.message)
    }
  }

  const correctSelection = selectedOption
    ? matchesShape(selectedOption, currentQuestion.correctAnswer)
    : false

  return (
    <div className="flex flex-col gap-4 pb-4">
      <header className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate('/siswa/permainan')}
          className="flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold text-ink/60 hover:bg-white"
        >
          <ArrowLeft size={18} /> Semua game
        </button>
        <span className="inline-flex items-center gap-1 rounded-full bg-lemon-light px-3 py-1 text-xs font-bold text-amber-800">
          <Flame size={14} /> {today}
        </span>
      </header>

      <section className="text-center">
        <span className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-ink bg-mint-light text-emerald-700">
          <Shapes size={25} />
        </span>
        <h1 className="font-heading text-xl font-bold">Matriks Pola Bentuk</h1>
        <p className="mt-1 text-xs text-ink/50">Lengkapi pola dan asah penalaran spasialmu.</p>
      </section>

      {dailyScore && (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-mint-light p-3 text-xs text-emerald-800">
          <CheckCircle2 size={18} className="shrink-0" />
          Skor resmi hari ini: <strong>{dailyScore.skor}</strong>. Permainan berikutnya hanya latihan.
        </p>
      )}

      {started && !isCompleted && currentQuestion && (
        <>
          <section className="neo-card flex items-center justify-between !p-3">
            <span className="text-lg font-black"><Clock3 size={18} className="mr-1 inline" />{formatTime(secondsElapsed)}</span>
            <span className="text-right">
              <span className="block text-xs font-bold uppercase text-sunrise">Soal {currentIndex + 1} / {questions.length}</span>
              <span className="text-xs text-ink/60">{currentQuestion.difficulty}</span>
            </span>
          </section>

          <section className="neo-card !p-4 sm:!p-6">
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-ink/10 bg-bg px-3 py-2.5 text-xs text-ink/60">
              <HelpCircle size={16} className="shrink-0 text-ink/45" />
              <span>{currentQuestion.hint}</span>
            </div>

            <div className="mx-auto mb-5 grid aspect-square w-full max-w-[18rem] grid-cols-3 gap-2 rounded-2xl border border-ink/10 bg-bg p-2 sm:gap-3 sm:p-3">
              {currentQuestion.grid.map((row, rowIndex) => row.map((cell, columnIndex) => {
                const isMissing = rowIndex === 2 && columnIndex === 2
                return (
                  <div
                    key={`${rowIndex}-${columnIndex}`}
                    className={`flex aspect-square items-center justify-center rounded-xl p-1 ${
                      isMissing ? 'border-2 border-dashed border-sunrise bg-lemon-light/50' : 'border border-ink/10 bg-white'
                    }`}
                  >
                    {isMissing
                      ? selectedOption
                        ? <ShapeGraphic {...selectedOption} />
                        : <span className="text-3xl font-black text-sunrise/50">?</span>
                      : <ShapeGraphic {...cell} />}
                  </div>
                )
              }))}
            </div>

            <p className="mb-3 text-center text-xs font-semibold text-ink/55">
              Pilih elemen yang melengkapi pola:
            </p>
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOption === option
                const isCorrectOption = matchesShape(option, currentQuestion.correctAnswer)
                let optionStyle = 'border-ink/15 bg-white hover:border-sky'
                if (isSelected) optionStyle = 'border-sky ring-2 ring-sky/20 bg-sky-light'
                if (isAnswerChecked && isCorrectOption) optionStyle = 'border-emerald-500 bg-mint-light ring-2 ring-emerald-200'
                if (isAnswerChecked && isSelected && !isCorrectOption) optionStyle = 'border-rose-500 bg-rose-50 ring-2 ring-rose-200'

                return (
                  <button
                    key={`${option.shape}-${option.color.name}-${option.size}-${option.rotation}-${index}`}
                    type="button"
                    aria-label={`Pilihan ${index + 1}: ${option.shape}, ${option.color.name}, ${option.size}, rotasi ${option.rotation} derajat`}
                    aria-pressed={isSelected}
                    disabled={isAnswerChecked}
                    onClick={() => setSelectedOption(option)}
                    className={`h-16 w-16 rounded-xl border-2 p-2 transition sm:h-[4.5rem] sm:w-[4.5rem] ${optionStyle}`}
                  >
                    <ShapeGraphic {...option} />
                  </button>
                )
              })}
            </div>

            {!isAnswerChecked ? (
              <button
                type="button"
                disabled={!selectedOption}
                onClick={handleVerifyAnswer}
                className="neo-button mx-auto block w-full bg-sky py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-64"
              >
                Kunci jawaban
              </button>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className={`flex items-center gap-1.5 text-sm font-bold ${correctSelection ? 'text-emerald-700' : 'text-danger'}`}>
                  {correctSelection
                    ? <><CheckCircle2 size={18} /> Pola tepat!</>
                    : <><XCircle size={18} /> Kurang tepat.</>}
                </p>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="neo-button inline-flex w-full items-center justify-center gap-2 bg-ink py-3 font-bold text-white sm:w-auto sm:px-6"
                >
                  {currentIndex + 1 < questions.length ? 'Lanjut' : 'Lihat hasil'}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </section>
        </>
      )}

      {!started && (
        <section className="neo-card space-y-4 !p-5 text-center">
          <p className="text-sm leading-relaxed text-ink/60">
            Lengkapi 6 matriks dengan menemukan perubahan bentuk, warna, ukuran, dan rotasi.
            Tantangan harian sama untuk semua siswa.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl border border-ink/10 bg-bg p-3">
              <span className="block text-ink/50">Jumlah soal</span><strong>6 soal</strong>
            </div>
            <div className="rounded-xl border border-ink/10 bg-bg p-3">
              <span className="block text-ink/50">Skor maksimal</span><strong>100 poin</strong>
            </div>
          </div>
          <button
            type="button"
            onClick={startGame}
            className="neo-button inline-flex items-center justify-center gap-2 bg-sunrise px-5 py-3 font-bold text-white"
          >
            <Sparkles size={17} /> {dailyScore ? 'Mulai latihan' : 'Mulai tantangan'}
          </button>
        </section>
      )}

      {saveError && <p role="alert" className="rounded-xl border border-danger bg-danger-light p-3 text-center text-sm text-danger">{saveError}</p>}

      {isCompleted && (
        <section className="neo-card mx-auto w-full max-w-md space-y-4 !p-5 text-center">
          <Award size={40} className="mx-auto text-sunrise" />
          <div>
            <h2 className="text-xl font-bold">Tantangan selesai!</h2>
            <p className="mt-1 text-xs text-ink/55">
              {isPractice ? 'Hasil latihan tidak mengubah skor resmi harian.' : 'Skor resmi hari ini sudah dicatat.'}
            </p>
          </div>
          <div className="rounded-2xl border-2 border-ink bg-lemon-light p-4">
            <span className="text-xs font-bold uppercase text-amber-800">Skor akhir</span>
            <p className="text-5xl font-black text-sunrise">{finalScore}</p>
            <div className="mt-2 grid grid-cols-2 gap-3 border-t border-ink/10 pt-3 text-sm">
              <div>
                <span className="block text-xs text-ink/50">Jawaban benar</span>
                <strong>{correctCount} / {questions.length}</strong>
              </div>
              <div>
                <span className="block text-xs text-ink/50">Total waktu</span>
                <strong>{formatTime(secondsElapsed)}</strong>
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <button
              type="button"
              onClick={startGame}
              className="neo-button inline-flex items-center justify-center gap-2 bg-white py-3 font-bold"
            >
              <RotateCcw size={16} /> Ulangi latihan
            </button>
            <button
              type="button"
              onClick={() => navigate('/siswa/permainan')}
              className="neo-button inline-flex items-center justify-center gap-2 bg-sky py-3 font-bold text-white"
            >
              <Trophy size={16} /> Pilih game lainnya
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
