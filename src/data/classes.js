import { seedUsers } from './users'

const classNames = ['X-1', 'X-2', 'XI-1', 'XI-2', 'XII-1']

export const classes = classNames.map(nama => {
  const waliKelas = seedUsers.find(user =>
    (user.role === 'wali' || user.role === 'wali_kelas')
    && (user.kelasId === nama || user.classId === nama),
  )

  if (!waliKelas) {
    throw new Error(`Wali kelas untuk kelas "${nama}" belum tersedia di seedUsers`)
  }

  return {
    id: nama,
    nama,
    waliKelasId: waliKelas.id,
  }
})
