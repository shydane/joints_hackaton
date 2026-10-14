import { useMemo, useState } from 'react'
import { Award, Calendar, School, Trophy, Users } from 'lucide-react'
import { useApp } from '../../context/AppContext'

function rankLabel(rank) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

export default function Leaderboard() {
  const { currentUser, getLeaderboard } = useApp()
  const [scope, setScope] = useState('kelasku')
  const [timeFilter, setTimeFilter] = useState('all')

  const entries = useMemo(
    () => getLeaderboard(scope, timeFilter),
    [getLeaderboard, scope, timeFilter],
  )
  const currentIndex = entries.findIndex(entry => entry.studentId === currentUser?.id)
  const currentRank = currentIndex >= 0 ? currentIndex + 1 : null
  const currentEntry = currentIndex >= 0 ? entries[currentIndex] : null
  const topEntries = entries.slice(0, 10)

  const topThree = topEntries.slice(0, 3)
  const remainingEntries = topEntries.slice(3)

  return (
    <div className="flex flex-col gap-5 pb-4">
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-lemon-light text-sunrise">
          <Trophy size={23} />
        </span>
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-heading">Papan Peringkat</h1>
          <p className="text-xs md:text-sm text-ink/50">Bersaing dengan sehat dan terus berlatih.</p>
        </div>
      </header>

      <section className="neo-card flex flex-col gap-3 !p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-bg p-1 sm:w-auto">
          {[
            { id: 'kelasku', label: `Kelasku · ${currentUser?.class || '-'}`, icon: Users },
            { id: 'sekolah', label: 'Satu sekolah', icon: School },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={scope === id}
              onClick={() => setScope(id)}
              className={`flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold transition ${
                scope === id ? 'border-2 border-ink bg-white text-sunrise shadow-sm' : 'text-ink/50'
              }`}
            >
              <Icon size={15} />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-center sm:justify-end gap-2">
          {[
            { id: 'week', label: 'Minggu ini', icon: Calendar },
            { id: 'all', label: 'Semua waktu', icon: Award },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={timeFilter === id}
              onClick={() => setTimeFilter(id)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                timeFilter === id
                  ? 'border-ink bg-ink text-white'
                  : 'border-ink/15 bg-white text-ink/55 hover:bg-bg'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Podium for top 3 on md+ screens */}
      {topThree.length >= 3 && (
        <div className="hidden md:grid md:grid-cols-3 gap-3 items-end pt-4">
          {/* Rank 2 - Silver */}
          <div className="neo-card flex flex-col items-center p-4 bg-white border-2 border-ink text-center">
            <span className="text-3xl mb-1">🥈</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink/40">Juara 2</span>
            <p className="font-bold text-sm mt-1 truncate w-full">{topThree[1].name}</p>
            <p className="text-xs text-ink/45">{topThree[1].class || '-'}</p>
            <div className="mt-3 w-full rounded-lg bg-bg py-1.5 text-xs font-black text-ink">
              {topThree[1].score.toLocaleString('id-ID')} <span className="text-[10px] text-ink/40">pts</span>
            </div>
          </div>

          {/* Rank 1 - Gold (Elevated) */}
          <div className="neo-card flex flex-col items-center p-5 bg-lemon-light border-2 border-ink text-center -translate-y-2 relative shadow-md">
            <span className="text-4xl mb-1">👑 🥇</span>
            <span className="text-[11px] font-black uppercase tracking-wider text-sunrise">Juara 1</span>
            <p className="font-extrabold text-base mt-1 truncate w-full">{topThree[0].name}</p>
            <p className="text-xs font-semibold text-ink/60">{topThree[0].class || '-'}</p>
            <div className="mt-3 w-full rounded-lg bg-white border border-ink/20 py-2 text-sm font-black text-sunrise">
              {topThree[0].score.toLocaleString('id-ID')} <span className="text-[10px] text-ink/50">pts</span>
            </div>
          </div>

          {/* Rank 3 - Bronze */}
          <div className="neo-card flex flex-col items-center p-4 bg-white border-2 border-ink text-center">
            <span className="text-3xl mb-1">🥉</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink/40">Juara 3</span>
            <p className="font-bold text-sm mt-1 truncate w-full">{topThree[2].name}</p>
            <p className="text-xs text-ink/45">{topThree[2].class || '-'}</p>
            <div className="mt-3 w-full rounded-lg bg-bg py-1.5 text-xs font-black text-ink">
              {topThree[2].score.toLocaleString('id-ID')} <span className="text-[10px] text-ink/40">pts</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <section className="neo-card overflow-hidden !p-0">
        <div className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-2 border-b-2 border-ink bg-bg px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-ink/50 sm:grid-cols-[4.5rem_1fr_6rem_7rem]">
          <span className="text-center">Rank</span>
          <span>Nama siswa</span>
          <span className="hidden sm:block">Kelas</span>
          <span className="text-right">Skor</span>
        </div>

        {topEntries.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink/50">Belum ada siswa di peringkat ini.</p>
        ) : (
          <ol>
            {topEntries.map((entry, index) => {
              const rank = index + 1
              const isCurrent = entry.studentId === currentUser?.id
              return (
                <li
                  key={entry.studentId}
                  className={`grid grid-cols-[3.5rem_1fr_auto] items-center gap-2 border-b border-ink/10 px-4 py-3 last:border-b-0 transition sm:grid-cols-[4.5rem_1fr_6rem_7rem] ${
                    isCurrent ? 'bg-sky-light/70' : 'bg-white hover:bg-bg/40'
                  }`}
                >
                  <span className={`flex h-8 w-8 mx-auto items-center justify-center rounded-full text-sm font-black ${
                    rank <= 3 ? 'bg-lemon-light' : 'bg-bg text-ink/55'
                  }`}>
                    {rankLabel(rank)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{entry.name}</span>
                    {isCurrent && <span className="text-[10px] font-bold text-sky">Kamu</span>}
                    <span className="block text-[10px] text-ink/45 sm:hidden">{entry.class || '-'}</span>
                  </span>
                  <span className="hidden text-xs text-ink/55 sm:block">{entry.class || '-'}</span>
                  <span className="text-right text-sm font-black">{entry.score.toLocaleString('id-ID')} <span className="text-[10px] font-medium text-ink/40">pts</span></span>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      {currentEntry && currentRank > 10 && (
        <section className="neo-card bg-sky-light">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-sky">Posisimu saat ini</p>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{currentEntry.name} <span className="text-sky">(Kamu)</span></p>
              <p className="text-xs text-ink/50">Kelas {currentEntry.class || '-'}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-black">#{currentRank}</p>
              <p className="text-xs text-ink/50">{currentEntry.score.toLocaleString('id-ID')} pts</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-ink/55">Terus mainkan game untuk mengejar 10 besar!</p>
        </section>
      )}
    </div>
  )
}
