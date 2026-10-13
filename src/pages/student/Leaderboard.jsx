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

  return (
    <div className="flex flex-col gap-5 pb-4">
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-lemon-light text-sunrise">
          <Trophy size={23} />
        </span>
        <div>
          <h1 className="text-xl font-bold font-heading">Papan Peringkat</h1>
          <p className="text-xs text-ink/50">Bersaing dengan sehat dan terus berlatih.</p>
        </div>
      </header>

      <section className="neo-card flex flex-col gap-3 !p-3">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-bg p-1">
          {[
            { id: 'kelasku', label: `Kelasku · ${currentUser?.class || '-'}`, icon: Users },
            { id: 'sekolah', label: 'Satu sekolah', icon: School },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={scope === id}
              onClick={() => setScope(id)}
              className={`flex min-h-10 items-center justify-center gap-1 rounded-lg px-2 text-xs font-bold transition ${
                scope === id ? 'border-2 border-ink bg-white text-sunrise shadow-sm' : 'text-ink/50'
              }`}
            >
              <Icon size={15} />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-2">
          {[
            { id: 'week', label: 'Minggu ini', icon: Calendar },
            { id: 'all', label: 'Semua waktu', icon: Award },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={timeFilter === id}
              onClick={() => setTimeFilter(id)}
              className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                timeFilter === id
                  ? 'border-ink bg-ink text-white'
                  : 'border-ink/15 bg-white text-ink/55'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="neo-card overflow-hidden !p-0">
        <div className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-2 border-b-2 border-ink bg-bg px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-ink/50 sm:grid-cols-[4rem_1fr_5rem_6rem]">
          <span className="text-center">Rank</span>
          <span>Nama siswa</span>
          <span className="hidden sm:block">Kelas</span>
          <span className="text-right">Skor</span>
        </div>

        {topEntries.length === 0 ? (
          <p className="p-6 text-center text-sm text-ink/50">Belum ada siswa di peringkat ini.</p>
        ) : (
          <ol>
            {topEntries.map((entry, index) => {
              const rank = index + 1
              const isCurrent = entry.studentId === currentUser?.id
              return (
                <li
                  key={entry.studentId}
                  className={`grid grid-cols-[3.5rem_1fr_auto] items-center gap-2 border-b border-ink/10 px-3 py-3 last:border-b-0 sm:grid-cols-[4rem_1fr_5rem_6rem] ${
                    isCurrent ? 'bg-sky-light/70' : 'bg-white'
                  }`}
                >
                  <span className={`flex h-8 items-center justify-center rounded-full text-sm font-black ${
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
