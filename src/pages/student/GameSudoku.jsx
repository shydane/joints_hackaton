import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eraser,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getTodayString } from '../../utils/dailySeed'
import { generateDailySudoku, getSudokuConflicts } from '../../utils/dailySudoku'

const GRID_SIZE = 4
const EMPTY_GRID = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0))

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

export default function GameSudoku() {
  const navigate = useNavigate()
  const { currentUser, getSkorHariIni, simpanSkor } = useApp()
  const today = useMemo(() => getTodayString(), [])
  const dailyScore = getSkorHariIni(currentUser.id, 'sudoku')
  const puzzleData = useMemo(() => generateDailySudoku(today), [today])
  const initialMask = useMemo(
    () => puzzleData.puzzle.map(row => row.map(value => value !== 0)),
    [puzzleData],
  )
  const [grid, setGrid] = useState(() => puzzleData.puzzle.map(row => [...row]))
  const [selectedCell, setSelectedCell] = useState(null)
  const [mistakes, setMistakes] = useState(0)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isPractice, setIsPractice] = useState(false)
  const [finalScore, setFinalScore] = useState(null)
  const [saveError, setSaveError] = useState('')
  const conflicts = useMemo(() => getSudokuConflicts(grid), [grid])
  const activeValue = selectedCell ? grid[selectedCell.row][selectedCell.column] : 0

  useEffect(() => {
    if (!isPlaying || isCompleted) return undefined
    const interval = window.setInterval(() => {
      setTimer(seconds => seconds + 1)
    }, 1000)
    return () => window.clearInterval(interval)
  }, [isCompleted, isPlaying])

  const finishGame = useCallback((elapsedTime, mistakeCount) => {
    if (isCompleted) return
    setIsPlaying(false)
    setIsCompleted(true)

    const score = Math.max(10, Math.min(
      100,
      100 - mistakeCount * 5 - Math.floor(Math.max(0, elapsedTime - 40) / 4),
    ))
    setFinalScore(score)

    if (!isPractice) {
      const result = simpanSkor({
        userId: currentUser.id,
        game: 'sudoku',
        skor: score,
        tanggal: today,
        waktu: elapsedTime,
        detail: { waktuDetik: elapsedTime, kesalahan: mistakeCount },
      })
      if (!result.success) setSaveError(result.message)
    }
  }, [currentUser.id, isCompleted, isPractice, simpanSkor, today])

  const handleInputNumber = useCallback((value) => {
    if (!isPlaying || isCompleted || !selectedCell) return
    const { row, column } = selectedCell
    if (initialMask[row][column]) return

    const previousValue = grid[row][column]
    if (previousValue === value) return
    const nextGrid = grid.map(line => [...line])
    nextGrid[row][column] = value
    const nextConflicts = getSudokuConflicts(nextGrid)
    const nextMistakes = mistakes + Number(nextConflicts.has(`${row}-${column}`))

    setGrid(nextGrid)
    if (nextConflicts.has(`${row}-${column}`)) setMistakes(nextMistakes)

    const isFilled = nextGrid.every(line => line.every(cell => cell !== 0))
    if (isFilled && nextConflicts.size === 0) {
      finishGame(timer, nextMistakes)
    }
  }, [conflicts.size, finishGame, grid, initialMask, isCompleted, isPlaying, mistakes, selectedCell, timer])

  const handleErase = useCallback(() => {
    if (!isPlaying || isCompleted || !selectedCell) return
    const { row, column } = selectedCell
    if (initialMask[row][column] || grid[row][column] === 0) return
    setGrid(previous => previous.map((line, rowIndex) =>
      line.map((value, columnIndex) => rowIndex === row && columnIndex === column ? 0 : value),
    ))
  }, [grid, initialMask, isCompleted, isPlaying, selectedCell])

  useEffect(() => {
    const handleKeyDown = event => {
      if (!isPlaying || isCompleted) return
      if (['1', '2', '3', '4'].includes(event.key)) {
        handleInputNumber(Number(event.key))
        return
      }
      if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
        handleErase()
        return
      }
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return
      event.preventDefault()
      setSelectedCell(previous => {
        const current = previous || { row: 0, column: 0 }
        return {
          row: Math.max(0, Math.min(GRID_SIZE - 1, current.row + Number(event.key === 'ArrowDown') - Number(event.key === 'ArrowUp'))),
          column: Math.max(0, Math.min(GRID_SIZE - 1, current.column + Number(event.key === 'ArrowRight') - Number(event.key === 'ArrowLeft'))),
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleErase, handleInputNumber, isCompleted, isPlaying])

  const startGame = () => {
    setGrid(puzzleData.puzzle.map(row => [...row]))
    setSelectedCell(null)
    setMistakes(0)
    setTimer(0)
    setFinalScore(null)
    setSaveError('')
    setIsPractice(Boolean(dailyScore))
    setIsCompleted(false)
    setIsPlaying(true)
  }

  const handleReset = () => {
    setGrid(puzzleData.puzzle.map(row => [...row]))
    setSelectedCell(null)
    setMistakes(0)
    setTimer(0)
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 pb-4">
      <header className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate('/siswa/permainan')}
          className="flex items-center gap-1.5 rounded-xl border-2 border-ink bg-white px-3 py-2 text-sm font-semibold text-ink/65 transition hover:bg-bg"
        >
          <ArrowLeft size={16} /> Semua game
        </button>
        <span className="inline-flex items-center gap-1.5 rounded-xl border border-sky/20 bg-sky-light px-3 py-2 text-xs font-bold text-sky">
          <CalendarDays size={14} /> Harian: {today}
        </span>
      </header>

      <section className="text-center">
        <h1 className="flex items-center justify-center gap-2 font-heading text-2xl font-black">
          Sudoku Mini 4×4 <Sparkles size={18} className="text-sunrise" />
        </h1>
        <p className="mt-1 text-xs text-ink/55">Isi setiap baris, kolom, dan kotak 2×2 dengan angka 1–4.</p>
      </section>

      {dailyScore && (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-mint-light p-3 text-xs text-emerald-800">
          <CheckCircle2 size={17} className="shrink-0" />
          Skor resmi hari ini: <strong>{dailyScore.skor}</strong>. Berikutnya hanya latihan.
        </p>
      )}

      {!isPlaying && !isCompleted && (
        <section className="neo-card space-y-4 text-center">
          <p className="text-sm leading-relaxed text-ink/60">
            Pecahkan Sudoku harian dengan solusi unik. Pilih kotak kosong lalu masukkan angka
            melalui papan angka atau keyboard. Gunakan tombol panah untuk berpindah sel.
          </p>
          <button
            type="button"
            onClick={startGame}
            className="neo-button inline-flex items-center justify-center gap-2 bg-sunrise px-5 py-3 font-bold text-white"
          >
            <Sparkles size={17} /> {dailyScore ? 'Mulai latihan' : 'Mulai Sudoku'}
          </button>
        </section>
      )}

      {(isPlaying || isCompleted) && (
        <>
          <section className="grid grid-cols-2 gap-3">
            <div className="neo-card flex items-center gap-3 !p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-light text-sky"><Clock3 size={19} /></span>
              <span><span className="block text-[10px] font-bold uppercase text-ink/40">Waktu</span><strong>{formatTime(timer)}</strong></span>
            </div>
            <div className="neo-card flex items-center gap-3 !p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-danger"><AlertTriangle size={18} /></span>
              <span><span className="block text-[10px] font-bold uppercase text-ink/40">Kesalahan</span><strong className="text-danger">{mistakes}</strong></span>
            </div>
          </section>

          <section className="neo-card !p-3">
            <div className="mx-auto grid aspect-square w-full max-w-[21rem] grid-cols-4 gap-1 rounded-xl border-4 border-ink bg-ink p-1">
              {grid.map((row, rowIndex) => row.map((value, columnIndex) => {
                const key = `${rowIndex}-${columnIndex}`
                const isInitial = initialMask[rowIndex][columnIndex]
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.column === columnIndex
                const isConflict = conflicts.has(key)
                const isSameValue = activeValue !== 0 && activeValue === value
                const borderRight = columnIndex === 1 ? 'border-r-4 border-r-ink' : ''
                const borderBottom = rowIndex === 1 ? 'border-b-4 border-b-ink' : ''
                let cellStyle = isInitial ? 'bg-bg font-black text-ink' : 'bg-white font-bold text-sky'
                if (isSameValue && !isSelected) cellStyle = 'bg-sky-light font-bold text-sky'
                if (isSelected) cellStyle = 'z-10 bg-lemon-light font-black text-ink ring-2 ring-inset ring-sunrise'
                if (isConflict) cellStyle = 'bg-rose-100 font-black text-danger'

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={!isPlaying}
                    aria-label={`Baris ${rowIndex + 1}, kolom ${columnIndex + 1}${value ? `, angka ${value}` : ', kosong'}`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedCell({ row: rowIndex, column: columnIndex })}
                    className={`flex min-h-0 min-w-0 items-center justify-center rounded-md text-2xl transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky disabled:cursor-default sm:text-3xl ${borderRight} ${borderBottom} ${cellStyle}`}
                  >
                    {value || ''}
                  </button>
                )
              }))}
            </div>

            {conflicts.size > 0 && isPlaying && (
              <p role="status" className="mt-3 text-center text-xs font-semibold text-danger">
                Ada angka yang berulang pada baris, kolom, atau kotak 2×2.
              </p>
            )}

            <div className="mx-auto mt-4 grid w-full max-w-[21rem] grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(number => (
                <button
                  key={number}
                  type="button"
                  disabled={!isPlaying || !selectedCell}
                  onClick={() => handleInputNumber(number)}
                  className="neo-button bg-white py-3 text-xl font-black text-sky disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {number}
                </button>
              ))}
            </div>

            <div className="mx-auto mt-2 grid w-full max-w-[21rem] grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!isPlaying || !selectedCell || initialMask[selectedCell.row][selectedCell.column]}
                onClick={handleErase}
                className="neo-button inline-flex items-center justify-center gap-2 bg-bg py-2.5 text-sm font-bold disabled:opacity-45"
              >
                <Eraser size={16} /> Hapus
              </button>
              <button
                type="button"
                disabled={!isPlaying}
                onClick={handleReset}
                className="neo-button inline-flex items-center justify-center gap-2 bg-bg py-2.5 text-sm font-bold disabled:opacity-45"
              >
                <RotateCcw size={16} /> Ulangi
              </button>
            </div>
          </section>
        </>
      )}

      {saveError && <p role="alert" className="rounded-xl border border-danger bg-danger-light p-3 text-center text-sm text-danger">{saveError}</p>}

      {isCompleted && (
        <section className="neo-card space-y-4 text-center">
          <Trophy size={38} className="mx-auto text-sunrise" />
          <div>
            <h2 className="text-xl font-black">Sudoku selesai!</h2>
            <p className="mt-1 text-xs text-ink/55">
              {isPractice ? 'Hasil latihan tidak mengubah skor resmi.' : 'Skor harianmu sudah dicatat.'}
            </p>
          </div>
          <div className="rounded-2xl border-2 border-ink bg-lemon-light p-4">
            <span className="text-xs font-bold uppercase text-amber-800">Skor akhir</span>
            <strong className="block text-5xl font-black text-sunrise">{finalScore}</strong>
            <div className="mt-2 grid grid-cols-2 border-t border-ink/10 pt-3 text-xs">
              <span>Waktu <strong className="block text-sm">{formatTime(timer)}</strong></span>
              <span>Kesalahan <strong className="block text-sm">{mistakes}</strong></span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/siswa/permainan')}
            className="neo-button inline-flex w-full items-center justify-center gap-2 bg-sky py-3 font-bold text-white"
          >
            <CheckCircle2 size={17} /> Kembali ke zona game
          </button>
        </section>
      )}
    </div>
  )
}
