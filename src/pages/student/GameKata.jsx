import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Delete,
  HelpCircle,
  Lightbulb,
  Send,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { gameWords } from '../../data/gameWords'
import { useApp } from '../../context/AppContext'
import { getTodaySeed, getTodayString, seededShuffle } from '../../utils/dailySeed'

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
]

function makeDailyQuestions(seed) {
  return seededShuffle(gameWords, seed).slice(0, 5).map((item, index) => {
    const type = index % 2 === 0 ? 'SUSUN' : 'TEBAK'
    let scrambledLetters = []

    if (type === 'SUSUN') {
      scrambledLetters = seededShuffle(
        [...item.word].map((char, letterIndex) => ({ id: `${letterIndex}-${char}`, char })),
        seed + (index + 1) * 7919,
      )
      if (scrambledLetters.every((tile, tileIndex) => tile.char === item.word[tileIndex])) {
        scrambledLetters.push(scrambledLetters.shift())
      }
    }

    return { ...item, id: index + 1, type, scrambledLetters }
  })
}

function formatTime(seconds = 0) {
  const safeSeconds = Math.max(0, Number(seconds) || 0)
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, '0')}:${String(safeSeconds % 60).padStart(2, '0')}`
}

export default function GameKata() {
  const navigate = useNavigate()
  const { currentUser, getSkorHariIni, simpanSkor } = useApp()
  const today = useMemo(() => getTodayString(), [])
  const questions = useMemo(() => makeDailyQuestions(getTodaySeed(today)), [today])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [selectedTiles, setSelectedTiles] = useState([])
  const [answer, setAnswer] = useState([])
  const [revealedIndices, setRevealedIndices] = useState(() => new Set())
  const [hintsUsed, setHintsUsed] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [roundScores, setRoundScores] = useState([])
  const [savedResult, setSavedResult] = useState(() => getSkorHariIni(currentUser.id, 'kata'))
  const [saveError, setSaveError] = useState('')
  const feedbackTimer = useRef(null)
  const answerLocked = useRef(false)

  const currentQuestion = questions[currentIndex]
  const completed = Boolean(savedResult)

  useEffect(() => () => clearTimeout(feedbackTimer.current), [])

  useEffect(() => {
    if (!currentQuestion) return
    setSelectedTiles([])
    setAnswer(Array(currentQuestion.word.length).fill(''))
    setRevealedIndices(new Set())
    setHintsUsed(0)
    setFeedback(null)
    answerLocked.current = false
  }, [currentQuestion])

  const showFeedback = useCallback((nextFeedback, duration = 1600) => {
    clearTimeout(feedbackTimer.current)
    setFeedback(nextFeedback)
    if (duration) {
      feedbackTimer.current = setTimeout(() => setFeedback(null), duration)
    }
  }, [])

  const finishGame = useCallback((results, finalScore, finalSeconds) => {
    const details = results.map(result => ({
      kata: result.kata,
      tipe: result.tipe,
      benar: result.benar,
      skor: result.skor,
      petunjuk: result.petunjuk,
    }))
    const result = simpanSkor({
      userId: currentUser.id,
      game: 'kata',
      skor: finalScore,
      tanggal: today,
      waktu: finalSeconds,
      detail: details,
    })

    if (!result.success) {
      setSaveError(result.message)
      answerLocked.current = false
      return false
    }

    setSavedResult(result.skor)
    setSaveError('')
    return true
  }, [currentUser.id, simpanSkor, today])

  const checkAnswer = useCallback(() => {
    if (completed || answerLocked.current || feedback) return

    const userWord = currentQuestion.type === 'SUSUN'
      ? selectedTiles.map(tile => tile.char).join('')
      : answer.join('')

    const isIncomplete = currentQuestion.type === 'SUSUN'
      ? selectedTiles.length < currentQuestion.word.length
      : answer.some(letter => !letter)
    if (isIncomplete) {
      showFeedback({ type: 'error', text: 'Lengkapi semua kotak huruf terlebih dahulu!' }, 1800)
      return
    }

    answerLocked.current = true
    const correct = userWord.toUpperCase() === currentQuestion.word
    const roundScore = correct ? Math.max(8, 20 - hintsUsed * 4) : 0
    showFeedback(correct
      ? { type: 'success', text: 'Luar biasa! Jawabanmu benar.' }
      : { type: 'error', text: `Belum tepat. Jawabannya: ${currentQuestion.word}` }, 1200)

    feedbackTimer.current = setTimeout(() => {
      const nextResults = [...roundScores, {
        kata: currentQuestion.word,
        tipe: currentQuestion.type,
        benar: correct,
        skor: roundScore,
        petunjuk: hintsUsed,
      }]
      setRoundScores(nextResults)
      setFeedback(null)

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(index => index + 1)
        return
      }

      const rawScore = nextResults.reduce((total, item) => total + item.skor, 0)
      const speedBonus = seconds < 90 ? Math.min(5, Math.floor((90 - seconds) / 10)) : 0
      const finalScore = Math.min(100, rawScore + speedBonus)
      if (!finishGame(nextResults, finalScore, seconds)) {
        answerLocked.current = false
        return
      }
    }, 1200)
  }, [
    answer,
    completed,
    currentIndex,
    currentQuestion,
    feedback,
    finishGame,
    hintsUsed,
    questions.length,
    roundScores,
    seconds,
    selectedTiles,
    showFeedback,
  ])

  const selectTile = useCallback((tile) => {
    if (completed || answerLocked.current || selectedTiles.some(selected => selected.id === tile.id)) return
    setSelectedTiles(previous => [...previous, tile])
  }, [completed, selectedTiles])

  const addLetter = useCallback((letter) => {
    if (!currentQuestion || completed || answerLocked.current) return
    if (currentQuestion.type === 'SUSUN') {
      const tile = currentQuestion.scrambledLetters.find(item =>
        item.char === letter && !selectedTiles.some(selected => selected.id === item.id)
      )
      if (tile) selectTile(tile)
      return
    }

    const emptyIndex = answer.findIndex(value => !value)
    if (emptyIndex < 0) return
    const nextAnswer = [...answer]
    nextAnswer[emptyIndex] = letter
    setAnswer(nextAnswer)
  }, [answer, completed, currentQuestion, selectTile, selectedTiles])

  const removeLetter = useCallback(() => {
    if (!currentQuestion || completed || answerLocked.current) return
    if (currentQuestion.type === 'SUSUN') {
      setSelectedTiles(previous => previous.slice(0, -1))
      return
    }

    const removableIndex = [...answer].map((letter, index) => ({ letter, index }))
      .filter(item => item.letter && !revealedIndices.has(item.index))
      .pop()?.index
    if (removableIndex == null) return
    const nextAnswer = [...answer]
    nextAnswer[removableIndex] = ''
    setAnswer(nextAnswer)
  }, [answer, completed, currentQuestion, revealedIndices])

  const useHint = useCallback(() => {
    if (currentQuestion?.type !== 'TEBAK' || completed || answerLocked.current) return
    const availableIndices = [...currentQuestion.word].map((letter, index) => ({ letter, index }))
      .filter(item => !revealedIndices.has(item.index) && answer[item.index] !== item.letter)
      .map(item => item.index)
    if (!availableIndices.length) return

    const random = seededShuffle(availableIndices, getTodaySeed(today) + currentQuestion.id * 104729 + hintsUsed)
    const revealedIndex = random[0]
    const nextAnswer = [...answer]
    nextAnswer[revealedIndex] = currentQuestion.word[revealedIndex]
    setAnswer(nextAnswer)
    setRevealedIndices(previous => new Set([...previous, revealedIndex]))
    setHintsUsed(count => count + 1)
  }, [answer, completed, currentQuestion, hintsUsed, revealedIndices, today])

  useEffect(() => {
    if (completed) return undefined
    const onKeyDown = (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      if (event.key === 'Backspace') {
        event.preventDefault()
        removeLetter()
      } else if (event.key === 'Enter') {
        event.preventDefault()
        checkAnswer()
      } else if (/^[a-z]$/i.test(event.key)) {
        event.preventDefault()
        addLetter(event.key.toUpperCase())
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [addLetter, checkAnswer, completed, removeLetter])

  if (completed) {
    const details = savedResult.detail || []
    return (
      <div className="flex flex-col gap-4">
        <button type="button" onClick={() => navigate('/siswa')} className="flex w-fit items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold text-ink/60 hover:bg-white">
          <ArrowLeft size={18} /> Kembali
        </button>
        <section className="neo-card text-center">
          <Trophy className="mx-auto mb-3 text-sunrise" size={48} />
          <h1 className="text-xl font-bold font-heading">Tantangan Kata Selesai!</h1>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs text-ink/50">
            <Calendar size={14} /> Edisi {savedResult.tanggal}
          </p>
          <div className="my-4 rounded-2xl border-2 border-ink bg-lemon-light p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/55">Skor akhir</span>
            <p className="text-5xl font-black text-sunrise">{savedResult.skor}<span className="text-xl text-ink/40"> / 100</span></p>
            <p className="mt-2 flex items-center justify-center gap-1 text-sm text-ink/60">
              <Clock size={15} /> Waktu pengerjaan: {formatTime(savedResult.waktu)}
            </p>
          </div>
          {details.length > 0 && (
            <div className="text-left">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink/55">Ringkasan kata hari ini</h2>
              <div className="flex flex-col gap-2">
                {details.map((item, index) => (
                  <div key={`${item.kata}-${index}`} className="flex items-center justify-between gap-2 rounded-xl border border-ink/10 bg-white p-3">
                    <span className="flex min-w-0 items-center gap-2">
                      {item.benar
                        ? <CheckCircle2 className="shrink-0 text-emerald-600" size={18} />
                        : <XCircle className="shrink-0 text-rose-500" size={18} />}
                      <span className="min-w-0">
                        <strong className="block text-sm">{item.kata}</strong>
                        <span className="text-[11px] text-ink/45">{item.tipe === 'SUSUN' ? 'Susun huruf' : 'Tebak petunjuk'}</span>
                      </span>
                    </span>
                    <strong className="shrink-0 text-xs">+{item.skor} poin</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300 bg-lemon-light p-3 text-left text-xs text-ink/70">
            <AlertTriangle className="shrink-0 text-amber-600" size={17} />
            Satu skor resmi per hari. Kembali besok untuk lima kata baru!
          </p>
        </section>
      </div>
    )
  }

  const displayedLetters = currentQuestion.type === 'SUSUN'
    ? selectedTiles.map(tile => tile.char)
    : answer

  return (
    <div className="neo-card flex flex-col gap-4 select-none">
      <header className="flex items-center justify-between border-b border-ink/10 pb-3">
        <button type="button" onClick={() => navigate('/siswa')} className="flex items-center gap-1 rounded-lg px-1 py-1 text-sm font-semibold text-ink/60 hover:bg-bg">
          <ArrowLeft size={17} /> Kembali
        </button>
        <span className="flex items-center gap-1 rounded-full bg-sky-light px-3 py-1 font-mono text-sm font-bold">
          <Clock size={15} className="text-sky" /> {formatTime(seconds)}
        </span>
      </header>

      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="rounded-full bg-sunrise-light px-2.5 py-1 text-[11px] font-bold text-sunrise">
            Soal {currentIndex + 1} dari {questions.length}
          </span>
          <h1 className="mt-2 text-lg font-bold font-heading">
            {currentQuestion.type === 'SUSUN' ? 'Susun huruf acak' : 'Tebak kata dari petunjuk'}
          </h1>
        </div>
        <Sparkles className="shrink-0 text-sunrise" size={23} />
      </div>

      <section className="rounded-2xl border border-ink/10 bg-bg p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink/45">Kategori: {currentQuestion.category}</span>
        <p className="mt-1 text-sm font-medium leading-relaxed">“{currentQuestion.clue}”</p>
      </section>

      {feedback && (
        <p role="status" className={`rounded-xl border p-3 text-center text-sm font-bold ${
          feedback.type === 'success'
            ? 'border-emerald-300 bg-mint-light text-emerald-800'
            : 'border-rose-300 bg-danger-light text-danger'
        }`}>
          {feedback.text}
        </p>
      )}

      {currentQuestion.type === 'SUSUN' ? (
        <section>
          <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-ink/45">Jawabanmu · ketuk huruf untuk melepas</p>
          <div className="flex min-h-14 flex-wrap items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-sky/30 bg-sky-light/50 p-2">
            {displayedLetters.length === 0 && <span className="text-xs italic text-ink/40">Pilih huruf di bawah</span>}
            {selectedTiles.map((tile, index) => (
              <button
                key={tile.id}
                type="button"
                disabled={Boolean(feedback)}
                onClick={() => setSelectedTiles(previous => previous.filter((_, selectedIndex) => selectedIndex !== index))}
                className="flex h-11 w-10 items-center justify-center rounded-xl border-2 border-ink bg-sky px-2 text-lg font-black text-white shadow-[2px_2px_0_#14213D] disabled:opacity-60"
              >
                {tile.char}
              </button>
            ))}
          </div>
          <p className="mb-2 mt-4 text-center text-[10px] font-bold uppercase tracking-wide text-ink/45">Huruf tersedia</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {currentQuestion.scrambledLetters.map(tile => {
              const used = selectedTiles.some(selected => selected.id === tile.id)
              return (
                <button
                  key={tile.id}
                  type="button"
                  disabled={used || Boolean(feedback)}
                  onClick={() => selectTile(tile)}
                  className="flex h-11 w-10 items-center justify-center rounded-xl border-2 border-ink bg-white text-lg font-black shadow-[2px_2px_0_#14213D] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-25"
                >
                  {tile.char}
                </button>
              )
            })}
          </div>
        </section>
      ) : (
        <section>
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={useHint}
              disabled={revealedIndices.size >= currentQuestion.word.length - 1 || Boolean(feedback)}
              className="flex items-center gap-1 rounded-xl border border-amber-300 bg-lemon-light px-3 py-1.5 text-xs font-bold text-amber-800 disabled:opacity-40"
              title="Setiap petunjuk mengurangi 4 poin"
            >
              <Lightbulb size={15} /> Buka huruf (-4 poin)
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {answer.map((letter, index) => (
              <div
                key={index}
                className={`flex h-12 w-10 items-center justify-center rounded-xl border-2 text-lg font-black ${
                  revealedIndices.has(index)
                    ? 'border-amber-400 bg-lemon-light text-amber-800'
                    : letter
                      ? 'border-sky bg-sky-light text-sky'
                      : 'border-ink/15 bg-bg text-ink/25'
                }`}
              >
                {letter}
              </div>
            ))}
          </div>
          {hintsUsed > 0 && <p className="mt-2 text-center text-[11px] text-ink/45">Petunjuk digunakan: {hintsUsed}</p>}
        </section>
      )}

      <section className="border-t border-ink/10 pt-3">
        <div className="flex flex-col gap-1.5">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1">
              {row.map(letter => (
                <button
                  key={letter}
                  type="button"
                  disabled={Boolean(feedback)}
                  onClick={() => addLetter(letter)}
                  className="h-9 min-w-0 flex-1 rounded-lg border border-ink/10 bg-bg text-xs font-bold transition active:scale-95 disabled:opacity-50"
                >
                  {letter}
                </button>
              ))}
            </div>
          ))}
          <div className="mt-1 flex justify-center gap-2">
            <button type="button" disabled={Boolean(feedback)} onClick={removeLetter} className="flex h-10 flex-1 items-center justify-center gap-1 rounded-xl border-2 border-ink bg-danger-light text-sm font-bold text-danger disabled:opacity-50">
              <Delete size={16} /> Hapus
            </button>
            <button type="button" disabled={Boolean(feedback)} onClick={checkAnswer} className="flex h-10 flex-[1.4] items-center justify-center gap-2 rounded-xl border-2 border-ink bg-sunrise text-sm font-bold text-white shadow-[2px_2px_0_#14213D] disabled:opacity-50">
              <Send size={15} /> Jawab
            </button>
          </div>
        </div>
      </section>

      {saveError && <p role="alert" className="rounded-xl border border-danger bg-danger-light p-3 text-center text-xs text-danger">{saveError}</p>}

      <p className="flex items-center justify-center gap-1 text-center text-[11px] text-ink/40">
        <HelpCircle size={13} /> Bisa gunakan keyboard fisik, Backspace, dan Enter.
      </p>
    </div>
  )
}
