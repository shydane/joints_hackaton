import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PenLine, Search, Bell, ArrowRight, Gamepad2, Trophy, Flame, CheckCircle2, Clock } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import SunrisePath from '../../assets/illustrations/SunrisePath'
import EmptyState from '../../assets/illustrations/EmptyState'

/**
 * Halaman beranda siswa.
 * Menampilkan headline, shortcut, dan laporan terakhir.
 * Desktop: layout dua kolom. Mobile: layout stack.
 */
export default function StudentHome() {
  const navigate = useNavigate()
  const { currentUser, getReportsForUser, getUnreadCount, getStudentGameStats } = useApp()
  const [savedGrades] = useLocalStorage('ls_manual_grade_records', [])

  const myReports = currentUser ? getReportsForUser(currentUser.id, 'siswa') : []
  const unreadCount = currentUser ? getUnreadCount(currentUser.id) : 0
  const gameStats = currentUser ? getStudentGameStats(currentUser.id) : null
  const myGrades = (Array.isArray(savedGrades) ? savedGrades : [])
    .filter(record => (
      record.class === currentUser?.class &&
      record.scores &&
      Object.hasOwn(record.scores, currentUser?.id)
    ))
    .sort((first, second) => (
      second.date.localeCompare(first.date) || second.updatedAt.localeCompare(first.updatedAt)
    ))
  const subjectSummaries = Object.values(myGrades.reduce((summary, record) => {
    const subjectKey = record.subject.trim().toLocaleLowerCase()
    if (!summary[subjectKey]) {
      summary[subjectKey] = { subject: record.subject, total: 0, count: 0 }
    }
    summary[subjectKey].total += Number(record.scores[currentUser.id])
    summary[subjectKey].count += 1
    return summary
  }, {}))
  const recentReports = myReports.slice(0, 3)

  const statusLabels = {
    dikirim: 'Dikirim',
    ditinjau: 'Ditinjau',
    pendampingan: 'Pendampingan',
    selesai: 'Selesai',
    eskalasi_eksternal: 'Eskalasi',
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ==================== GREETING ==================== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center md:text-left pt-2 md:pt-0"
      >
        {/* Mobile: centered illustration */}
        <div className="md:hidden">
          <SunrisePath size={100} className="mx-auto mb-3" />
        </div>

        {/* Desktop: horizontal greeting with illustration */}
        <div className="hidden md:flex items-center gap-6 neo-card !bg-gradient-to-r !from-sunrise-light !to-lemon-light !p-6">
          <SunrisePath size={80} className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold font-heading">
              Hai, {currentUser?.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-sm text-ink/60 mt-1">
              Ada yang ingin kamu ceritakan? Kami siap mendengarkan. Kamu tidak sendirian.
            </p>
            <div className="flex gap-3 mt-4">
              <Button variant="primary" size="sm" icon={PenLine} onClick={() => navigate('/siswa/lapor')}>
                Buat Laporan
              </Button>
              <Button variant="outline" size="sm" icon={Search} onClick={() => navigate('/siswa/lacak')}>
                Lacak Laporan
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile: simple text greeting */}
        <div className="md:hidden">
          <h1 className="text-lg font-bold font-heading">
            Hai, {currentUser?.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-xs text-ink/50 mt-1">
            Ada yang ingin kamu ceritakan? Kami siap mendengarkan.
          </p>
        </div>
      </motion.div>

      {/* ==================== MOBILE QUICK ACTIONS ==================== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3 md:hidden"
      >
        <Card
          hoverable
          onClick={() => navigate('/siswa/lapor')}
          className="!p-3 text-center"
          color="sunrise-light"
        >
          <PenLine size={22} className="mx-auto mb-1 text-sunrise" />
          <span className="text-xs font-bold">Lapor</span>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/siswa/lacak')}
          className="!p-3 text-center"
          color="sky-light"
        >
          <Search size={22} className="mx-auto mb-1 text-sky" />
          <span className="text-xs font-bold">Lacak</span>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/siswa/notifikasi')}
          className="!p-3 text-center relative"
          color="lemon-light"
        >
          <Bell size={22} className="mx-auto mb-1 text-ink" />
          <span className="text-xs font-bold">Notifikasi</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </Card>
      </motion.div>

      {/* ==================== DESKTOP: TWO COLUMN LAYOUT ==================== */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-5">
        {/* Left column: Game stats */}
        <div className="flex flex-col gap-5">
          {/* Quick stat cards row */}
          <div className="grid grid-cols-3 gap-3">
            <Card hoverable onClick={() => navigate('/siswa/notifikasi')} className="!p-4 text-center relative" color="lemon-light">
              <Bell size={24} className="mx-auto mb-2 text-ink" />
              <span className="text-sm font-bold">Notifikasi</span>
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </Card>
            <Card hoverable onClick={() => navigate('/siswa/permainan')} className="!p-4 text-center" color="sunrise-light">
              <Gamepad2 size={24} className="mx-auto mb-2 text-sunrise" />
              <span className="text-sm font-bold">Zona Game</span>
            </Card>
            <Card hoverable onClick={() => navigate('/siswa/leaderboard')} className="!p-4 text-center" color="sky-light">
              <Trophy size={24} className="mx-auto mb-2 text-sky" />
              <span className="text-sm font-bold">Peringkat</span>
            </Card>
          </div>

          {/* Game stats card */}
          {gameStats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
            >
              <Card className="!p-5" color="sky-light">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Trophy size={22} className="text-sunrise" />
                    <div>
                      <h2 className="text-base font-bold">Pencapaian Game</h2>
                      <p className="text-xs text-ink/50">Skor dan aktivitasmu hari ini</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/siswa/leaderboard')}
                    className="flex items-center gap-1 text-xs font-bold text-sky hover:underline"
                  >
                    Peringkat <ArrowRight size={13} />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl border border-ink/10 bg-white p-3">
                    <span className="flex items-center justify-center gap-1 text-[11px] text-ink/50"><Trophy size={13} /> Total poin</span>
                    <strong className="mt-1 block text-xl">{gameStats.totalScore}</strong>
                  </div>
                  <div className="rounded-xl border border-ink/10 bg-white p-3">
                    <span className="flex items-center justify-center gap-1 text-[11px] text-ink/50"><Flame size={13} /> Streak</span>
                    <strong className="mt-1 block text-xl">{gameStats.streak} hari</strong>
                  </div>
                  <div className="rounded-xl border border-ink/10 bg-white p-3">
                    <span className="flex items-center justify-center gap-1 text-[11px] text-ink/50"><CheckCircle2 size={13} /> Hari ini</span>
                    <strong className="mt-1 block text-xl">
                      {Object.values(gameStats.todayScores).filter(score => score !== null).length}/{Object.keys(gameStats.todayScores).length}
                    </strong>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { id: 'puzzle', name: 'Puzzle' },
                    { id: 'kata', name: 'Game Kata' },
                    { id: 'memori', name: 'Memori' },
                    { id: 'hitung', name: 'Hitung Cepat' },
                    { id: 'pola', name: 'Pola Bilangan' },
                    { id: 'bentuk', name: 'Pola Bentuk' },
                    { id: 'sudoku', name: 'Sudoku Mini' },
                    { id: 'hanoi', name: 'Menara Hanoi' },
                  ].map(game => {
                    const score = gameStats.todayScores[game.id]
                    return (
                      <div key={game.id} className="flex items-center justify-between rounded-lg border border-ink/10 bg-white px-3 py-2.5">
                        <span className="truncate text-xs font-semibold">{game.name}</span>
                        <span className={`flex shrink-0 items-center gap-1 text-[11px] font-bold ${score == null ? 'text-ink/35' : 'text-emerald-700'}`}>
                          {score == null ? <Clock size={13} /> : <CheckCircle2 size={13} />}
                          {score == null ? 'Belum' : `${score} pts`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right column: Reports + CTA */}
        <div className="flex flex-col gap-5">
          {/* Zona Game CTA */}
          <Card
            hoverable
            onClick={() => navigate('/siswa/permainan')}
            className="flex items-center gap-4 !p-5"
            color="lemon-light"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-white text-sunrise">
              <Gamepad2 size={26} />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-base">Zona Game Edukasi</strong>
              <span className="mt-0.5 block text-xs text-ink/55">Pilih puzzle, kata, memori, hitung cepat, pola, Sudoku, atau Menara Hanoi.</span>
            </span>
            <ArrowRight size={20} className="shrink-0 text-ink/40" />
          </Card>

          {/* Riwayat Laporan Terbaru */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold font-heading">Laporan Terakhir</h2>
              {myReports.length > 3 && (
                <button
                  onClick={() => navigate('/siswa/lacak')}
                  className="text-xs text-sunrise font-semibold flex items-center gap-0.5 hover:underline"
                >
                  Lihat semua <ArrowRight size={12} />
                </button>
              )}
            </div>

            {recentReports.length === 0 ? (
              <Card className="flex flex-col items-center gap-2 text-center !py-8">
                <EmptyState size={120} text="Belum ada laporan" />
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/siswa/lapor')}
                  icon={PenLine}
                >
                  Buat Laporan Pertama
                </Button>
              </Card>
            ) : (
              <div className="flex flex-col gap-2.5">
                {recentReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.08 }}
                  >
                    <Card
                      hoverable
                      onClick={() => navigate(`/siswa/lacak?code=${report.code}`)}
                      className="flex items-center gap-3 !py-3.5"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-ink/40 font-mono">
                            {report.code}
                          </span>
                          <Badge variant={report.status}>
                            {statusLabels[report.status]}
                          </Badge>
                        </div>
                        <p className="text-xs text-ink/50 mt-1 truncate">
                          {report.description || report.detectionReason || 'Terdeteksi otomatis'}
                        </p>
                      </div>
                      <ArrowRight size={16} className="text-ink/20 flex-shrink-0" />
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Pesan motivasi */}
          <Card color="mint-light" className="text-center !py-5">
            <p className="text-sm text-ink/60 leading-relaxed">
              🌅 <strong>Ingat:</strong> Meminta bantuan adalah tanda keberanian,
              bukan kelemahan. Kami di sini untukmu.
            </p>
          </Card>
        </div>
      </div>

      <section aria-labelledby="student-grades-title">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="student-grades-title" className="text-sm font-bold font-heading">Nilai Saya</h2>
          {myGrades.length > 0 && (
            <span className="text-[11px] text-ink/50">{myGrades.length} nilai tercatat</span>
          )}
        </div>
        {myGrades.length === 0 ? (
          <Card className="!p-4">
            <p className="text-xs text-ink/60">Nilai dari wali kelas akan muncul di sini setelah disimpan.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            <Card color="sky-light" className="!p-4">
              <h3 className="mb-2 text-xs font-bold">Rekap per mata pelajaran</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {subjectSummaries.map(summary => (
                  <div key={summary.subject.toLocaleLowerCase()} className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white px-3 py-2">
                    <span className="truncate text-xs font-semibold">{summary.subject}</span>
                    <strong className="shrink-0 text-sm">{(summary.total / summary.count).toFixed(1)}</strong>
                  </div>
                ))}
              </div>
            </Card>
            {myGrades.map(record => (
              <Card key={record.id} className="!p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-xs font-bold">{record.subject}</h3>
                    <p className="mt-1 text-[11px] text-ink/55">{record.assessment}</p>
                    <p className="mt-1 text-[10px] text-ink/45">
                      {new Date(`${record.date}T00:00:00`).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <strong className="shrink-0 rounded-lg border-2 border-ink bg-lemon-light px-3 py-1.5 text-base">
                    {record.scores[currentUser.id]}
                  </strong>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ==================== MOBILE LAYOUT (keep original) ==================== */}
      <div className="md:hidden flex flex-col gap-5">
        {gameStats && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <Card className="!p-4" color="sky-light">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Trophy size={20} className="text-sunrise" />
                  <div>
                    <h2 className="text-sm font-bold">Pencapaian Game</h2>
                    <p className="text-[11px] text-ink/50">Skor dan aktivitasmu</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/siswa/leaderboard')}
                  className="flex items-center gap-1 text-xs font-bold text-sky"
                >
                  Peringkat <ArrowRight size={13} />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-ink/10 bg-white p-2">
                  <span className="flex items-center justify-center gap-1 text-[10px] text-ink/50"><Trophy size={12} /> Total poin</span>
                  <strong className="mt-0.5 block text-base">{gameStats.totalScore}</strong>
                </div>
                <div className="rounded-xl border border-ink/10 bg-white p-2">
                  <span className="flex items-center justify-center gap-1 text-[10px] text-ink/50"><Flame size={12} /> Streak</span>
                  <strong className="mt-0.5 block text-base">{gameStats.streak} hari</strong>
                </div>
                <div className="rounded-xl border border-ink/10 bg-white p-2">
                  <span className="flex items-center justify-center gap-1 text-[10px] text-ink/50"><CheckCircle2 size={12} /> Hari ini</span>
                  <strong className="mt-0.5 block text-base">
                    {Object.values(gameStats.todayScores).filter(score => score !== null).length}/{Object.keys(gameStats.todayScores).length}
                  </strong>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { id: 'puzzle', name: 'Puzzle' },
                  { id: 'kata', name: 'Game Kata' },
                  { id: 'memori', name: 'Memori' },
                  { id: 'hitung', name: 'Hitung Cepat' },
                  { id: 'pola', name: 'Pola Bilangan' },
                  { id: 'bentuk', name: 'Pola Bentuk' },
                  { id: 'sudoku', name: 'Sudoku Mini' },
                  { id: 'hanoi', name: 'Menara Hanoi' },
                ].map(game => {
                  const score = gameStats.todayScores[game.id]
                  return (
                    <div key={game.id} className="flex items-center justify-between rounded-lg border border-ink/10 bg-white px-2.5 py-2">
                      <span className="truncate text-[11px] font-semibold">{game.name}</span>
                      <span className={`flex shrink-0 items-center gap-1 text-[10px] font-bold ${score == null ? 'text-ink/35' : 'text-emerald-700'}`}>
                        {score == null ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                        {score == null ? 'Belum' : `${score} pts`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card
            hoverable
            onClick={() => navigate('/siswa/permainan')}
            className="flex items-center gap-3 !p-4"
            color="lemon-light"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-white text-sunrise">
              <Gamepad2 size={23} />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-sm">Zona Game Edukasi</strong>
              <span className="mt-0.5 block text-xs text-ink/55">Pilih puzzle, kata, memori, hitung cepat, pola, Sudoku, atau Menara Hanoi.</span>
            </span>
            <ArrowRight size={18} className="shrink-0 text-ink/40" />
          </Card>
        </motion.div>

        {/* Riwayat Laporan Terbaru */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold font-heading">Laporan Terakhir</h2>
            {myReports.length > 3 && (
              <button
                onClick={() => navigate('/siswa/lacak')}
                className="text-xs text-sunrise font-semibold flex items-center gap-0.5"
              >
                Lihat semua <ArrowRight size={12} />
              </button>
            )}
          </div>

          {recentReports.length === 0 ? (
            <Card className="flex flex-col items-center gap-2 text-center !py-5">
              <EmptyState size={100} text="Belum ada laporan" />
              <Button
                variant="primary"
                size="sm"
                className="mt-3"
                onClick={() => navigate('/siswa/lapor')}
                icon={PenLine}
              >
                Buat Laporan Pertama
              </Button>
            </Card>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.08 }}
                >
                  <Card
                    hoverable
                    onClick={() => navigate(`/siswa/lacak?code=${report.code}`)}
                    className="flex items-center gap-3 !py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink/40 font-mono">
                          {report.code}
                        </span>
                        <Badge variant={report.status}>
                          {statusLabels[report.status]}
                        </Badge>
                      </div>
                      <p className="text-xs text-ink/50 mt-1 truncate">
                        {report.description || report.detectionReason || 'Terdeteksi otomatis'}
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-ink/20 flex-shrink-0" />
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pesan motivasi */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card color="mint-light" className="text-center !py-4">
            <p className="text-xs text-ink/60 leading-relaxed">
              🌅 <strong>Ingat:</strong> Meminta bantuan adalah tanda keberanian,
              bukan kelemahan. Kami di sini untukmu.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
