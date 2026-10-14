import { useNavigate } from 'react-router-dom'
import { ArrowRight, Brain, Calculator, CheckCircle2, Flame, Gamepad2, Grid2X2, Puzzle, Shapes, SpellCheck, TowerControl, Trophy, Waypoints } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getTodayString } from '../../utils/dailySeed'

const GAMES = [
  { id: 'puzzle', category: 'Seru-seruan', title: 'Puzzle Gambar', description: 'Susun gambar sekolah yang berbeda setiap hari.', icon: Puzzle, path: '/siswa/game/puzzle', tone: 'bg-sky-light text-sky' },
  { id: 'kata', category: 'Seru-seruan', title: 'Game Kata', description: 'Susun huruf dan tebak kata edukatif.', icon: SpellCheck, path: '/siswa/game/kata', tone: 'bg-mint-light text-emerald-700' },
  { id: 'memori', category: 'Seru-seruan', title: 'Memori Kartu', description: 'Temukan delapan pasang gambar.', icon: Brain, path: '/siswa/game/memori', tone: 'bg-sunrise-light text-sunrise' },
  { id: 'hitung', category: 'Seru-seruan', title: 'Hitung Cepat', description: 'Asah kemampuan berhitung dalam 60 detik.', icon: Calculator, path: '/siswa/game/hitung', tone: 'bg-lemon-light text-amber-800' },
  { id: 'pola', category: 'Asah Logika', title: 'Pola Deret Bilangan', description: 'Temukan angka yang hilang dari pola bilangan.', icon: Waypoints, path: '/siswa/game/pola', tone: 'bg-sky-light text-sky' },
  { id: 'bentuk', category: 'Asah Logika', title: 'Matriks Pola Bentuk', description: 'Lengkapi matriks dengan mengenali pola bentuk.', icon: Shapes, path: '/siswa/game/bentuk', tone: 'bg-mint-light text-emerald-700' },
  { id: 'sudoku', category: 'Asah Logika', title: 'Sudoku Mini 4×4', description: 'Isi angka 1–4 tanpa pengulangan di baris, kolom, dan kotak.', icon: Grid2X2, path: '/siswa/game/sudoku', tone: 'bg-sunrise-light text-sunrise' },
  { id: 'hanoi', category: 'Asah Logika', title: 'Menara Hanoi', description: 'Pindahkan semua cakram dengan langkah seefisien mungkin.', icon: TowerControl, path: '/siswa/game/hanoi', tone: 'bg-sky-light text-sky' },
]

const GAME_CATEGORIES = ['Asah Logika', 'Seru-seruan']

export default function GameHub() {
  const navigate = useNavigate()
  const { currentUser, getSkorHariIni, getTotalSkor } = useApp()
  const today = getTodayString()
  const scores = GAMES.map(game => ({ ...game, score: getSkorHariIni(currentUser.id, game.id) }))
  const completedCount = scores.filter(game => game.score !== null).length
  const todayTotal = scores.reduce((total, game) => total + (game.score?.skor || 0), 0)
  const overall = getTotalSkor(currentUser.id)

  return (
    <div className="flex flex-col gap-5 pb-4">
      <section className="neo-card overflow-hidden !bg-white !p-5 text-ink sm:!p-6">
        <span className="inline-flex items-center gap-1 rounded-full bg-lemon-light px-3 py-1 text-xs font-bold text-amber-800">
          <Flame size={14} className="text-amber-600" /> Tantangan harian · {today}
        </span>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold font-heading sm:text-2xl">Zona Game Edukasi</h1>
            <p className="mt-1 text-xs leading-relaxed text-ink/70">
              Asah logika, ingatan, kosakata, dan kemampuan berhitungmu.
            </p>
          </div>
          <Gamepad2 size={30} className="shrink-0 text-sunrise" />
        </div>
        <button
          type="button"
          onClick={() => navigate('/siswa/leaderboard')}
          className="mt-3 inline-flex items-center gap-1 rounded-lg bg-sky-light px-3 py-1.5 text-xs font-bold text-sky transition hover:bg-sky/15"
        >
          <Trophy size={14} /> Lihat leaderboard
        </button>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-bg p-2">
            <span className="block text-[10px] text-ink/60">Selesai hari ini</span>
            <strong className="text-lg text-ink">{completedCount}/{GAMES.length}</strong>
          </div>
          <div className="rounded-xl bg-bg p-2">
            <span className="block text-[10px] text-ink/60">Skor hari ini</span>
            <strong className="text-lg text-sunrise">{todayTotal}</strong>
          </div>
          <div className="rounded-xl bg-bg p-2">
            <span className="block text-[10px] text-ink/60">Total poin</span>
            <strong className="text-lg text-ink">{overall.total}</strong>
          </div>
        </div>
      </section>

      {GAME_CATEGORIES.map(category => (
        <section key={category}>
          <h2 className="mb-3 font-heading text-base font-bold">{category}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {scores.filter(game => game.category === category).map(game => {
              const Icon = game.icon
              const hasScore = game.score !== null
              return (
                <article key={game.id} className="neo-card flex min-h-44 flex-col justify-between !p-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink ${game.tone}`}>
                        <Icon size={23} />
                      </span>
                      {hasScore
                        ? <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-mint-light px-2 py-1 text-[10px] font-bold text-emerald-800"><CheckCircle2 size={13} /> {game.score.skor} poin</span>
                        : <span className="rounded-full border border-amber-300 bg-lemon-light px-2 py-1 text-[10px] font-bold text-amber-800">Belum dimainkan</span>}
                    </div>
                    <h3 className="mt-3 text-base font-bold">{game.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-ink/55">{game.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(game.path)}
                    className="mt-4 flex items-center justify-between rounded-xl border-2 border-ink bg-white px-3 py-2 text-xs font-bold transition hover:bg-bg"
                  >
                    {hasScore ? 'Main lagi · latihan' : 'Main sekarang'}
                    <ArrowRight size={15} />
                  </button>
                </article>
              )
            })}
          </div>
        </section>
      ))}

      <p className="flex items-center justify-center gap-1 text-center text-xs text-ink/45">
        <Trophy size={14} /> Setiap game hanya mencatat satu skor resmi per hari.
      </p>
    </div>
  )
}
