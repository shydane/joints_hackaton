import { seedUsers } from './users'

/**
 * Data akademik per bulan untuk simulasi deteksi dini.
 */
const seededAcademicRecords = [
  {
    studentId: 'siswa-02',
    riwayatBulanan: [
      { bulan: 'Bulan 1', nilaiRataRata: 76, kehadiranPersen: 90 },
      { bulan: 'Bulan 2', nilaiRataRata: 74, kehadiranPersen: 88 },
      { bulan: 'Bulan 3', nilaiRataRata: 70, kehadiranPersen: 85 },
      { bulan: 'Bulan 4', nilaiRataRata: 65, kehadiranPersen: 78 },
      { bulan: 'Bulan 5', nilaiRataRata: 62, kehadiranPersen: 72 },
      { bulan: 'Bulan 6', nilaiRataRata: 60, kehadiranPersen: 68 },
    ],
  },
  {
    studentId: 'siswa-04',
    riwayatBulanan: [
      { bulan: 'Bulan 1', nilaiRataRata: 85, kehadiranPersen: 95 },
      { bulan: 'Bulan 2', nilaiRataRata: 82, kehadiranPersen: 92 },
      { bulan: 'Bulan 3', nilaiRataRata: 80, kehadiranPersen: 88 },
      { bulan: 'Bulan 4', nilaiRataRata: 78, kehadiranPersen: 85 },
      { bulan: 'Bulan 5', nilaiRataRata: 75, kehadiranPersen: 82 },
      { bulan: 'Bulan 6', nilaiRataRata: 58, kehadiranPersen: 74 },
    ],
  },
  {
    studentId: 'siswa-03',
    riwayatBulanan: [
      { bulan: 'Bulan 1', nilaiRataRata: 75, kehadiranPersen: 88 },
      { bulan: 'Bulan 2', nilaiRataRata: 76, kehadiranPersen: 90 },
      { bulan: 'Bulan 3', nilaiRataRata: 74, kehadiranPersen: 86 },
      { bulan: 'Bulan 4', nilaiRataRata: 78, kehadiranPersen: 88 },
      { bulan: 'Bulan 5', nilaiRataRata: 77, kehadiranPersen: 87 },
      { bulan: 'Bulan 6', nilaiRataRata: 75, kehadiranPersen: 85 },
    ],
  },
  {
    studentId: 'siswa-01',
    riwayatBulanan: [
      { bulan: 'Bulan 1', nilaiRataRata: 82, kehadiranPersen: 95 },
      { bulan: 'Bulan 2', nilaiRataRata: 80, kehadiranPersen: 92 },
      { bulan: 'Bulan 3', nilaiRataRata: 78, kehadiranPersen: 88 },
      { bulan: 'Bulan 4', nilaiRataRata: 72, kehadiranPersen: 82 },
      { bulan: 'Bulan 5', nilaiRataRata: 68, kehadiranPersen: 75 },
      { bulan: 'Bulan 6', nilaiRataRata: 65, kehadiranPersen: 70 },
    ],
  },
]

export const seedStudents = seededAcademicRecords.map(student => {
  const user = seedUsers.find(seedUser => seedUser.id === student.studentId)
  const riwayat = (student.riwayatBulanan || []).map(entry => ({
    bulan: entry.bulan,
    nilai: entry.nilaiRataRata,
    kehadiran: entry.kehadiranPersen,
  }))

  return {
    ...student,
    id: student.studentId,
    kelasId: user?.kelasId,
    riwayat,
    kehadiran: riwayat.map(({ bulan, kehadiran: value }) => ({ bulan, kehadiran: value })),
  }
})

export const initialStudents = seedStudents
