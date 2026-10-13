function getDateOffset(daysAgo = 0) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const today = getDateOffset()
const yesterday = getDateOffset(1)
const twoDaysAgo = getDateOffset(2)
const threeDaysAgo = getDateOffset(3)

export const initialGameScores = [
  { id: 'score-1', userId: 'siswa-01', game: 'puzzle', skor: 85, tanggal: twoDaysAgo },
  { id: 'score-2', userId: 'siswa-01', game: 'kata', skor: 90, tanggal: yesterday },
  { id: 'score-3', userId: 'siswa-01', game: 'memori', skor: 95, tanggal: today },
  { id: 'score-4', userId: 'siswa-01', game: 'hitung', skor: 80, tanggal: today },
  { id: 'score-5', userId: 'siswa-02', game: 'kata', skor: 95, tanggal: yesterday },
  { id: 'score-6', userId: 'siswa-02', game: 'hitung', skor: 100, tanggal: today },
  { id: 'score-7', userId: 'siswa-03', game: 'memori', skor: 80, tanggal: threeDaysAgo },
  { id: 'score-8', userId: 'siswa-03', game: 'puzzle', skor: 75, tanggal: twoDaysAgo },
  { id: 'score-9', userId: 'siswa-03', game: 'kata', skor: 85, tanggal: yesterday },
  { id: 'score-10', userId: 'siswa-03', game: 'hitung', skor: 90, tanggal: today },
  { id: 'score-11', userId: 'siswa-04', game: 'kata', skor: 70, tanggal: yesterday },
  { id: 'score-12', userId: 'siswa-04', game: 'memori', skor: 80, tanggal: yesterday },
]
