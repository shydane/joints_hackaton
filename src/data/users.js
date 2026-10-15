/**
 * Data akun dummy untuk simulasi login.
 * Setiap role punya beberapa akun untuk demo.
 */
const DUMMY_PASSWORD_HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'

export const seedUsers = [
  // === SISWA ===
  {
    id: 'siswa-01',
    name: 'Rina Amelia',
    initials: 'RA',
    role: 'siswa',
    class: 'XI-2',
    classId: 'XI-2',
    kelasId: 'XI-2',
    email: 'rina@siswa.id',
    avatar: '🧑‍🎓',
  },
  {
    id: 'siswa-02',
    name: 'Budi Santoso',
    initials: 'BS',
    role: 'siswa',
    class: 'X-2',
    classId: 'X-2',
    kelasId: 'X-2',
    email: 'budi@siswa.id',
    avatar: '👦',
  },
  {
    id: 'siswa-03',
    name: 'Dina Fitriani',
    initials: 'DF',
    role: 'siswa',
    class: 'XI-2',
    classId: 'XI-2',
    kelasId: 'XI-2',
    email: 'dina@siswa.id',
    avatar: '👧',
  },
  {
    id: 'siswa-04',
    name: 'Siti Aminah',
    initials: 'SA',
    role: 'siswa',
    class: 'XI-2',
    classId: 'XI-2',
    kelasId: 'XI-2',
    email: 'siti@siswa.id',
    avatar: '👧',
  },

  // === WALI KELAS ===
  {
    id: 'guru-01',
    name: 'Ibu Sari Dewi',
    initials: 'SD',
    role: 'wali_kelas',
    class: 'XI-2',
    classId: 'XI-2',
    kelasId: 'XI-2',
    email: 'sari@guru.id',
    avatar: '👩‍🏫',
  },
  {
    id: 'guru-02',
    name: 'Pak Ahmad Fauzi',
    initials: 'AF',
    role: 'wali_kelas',
    class: 'X-2',
    classId: 'X-2',
    kelasId: 'X-2',
    email: 'ahmad@guru.id',
    avatar: '👨‍🏫',
  },

  // === GURU BK ===
  {
    id: 'bk-01',
    name: 'Ibu Ratna Kusuma',
    initials: 'RK',
    role: 'guru_bk',
    email: 'ratna@bk.id',
    avatar: '👩‍⚕️',
  },
  ...[
    { id: 'X-1', username: 'waliX1' },
    { id: 'XI-1', username: 'waliXI1' },
    { id: 'XII-1', username: 'waliXII1' },
  ].map(({ id: kelasId, username }) => ({
    id: `wali-${kelasId.toLowerCase()}`,
    nama: 'Wali Dummy',
    name: 'Wali Dummy',
    username,
    password: DUMMY_PASSWORD_HASH,
    role: 'wali',
    kelasId,
    classId: kelasId,
    class: kelasId,
    initials: 'WD',
    avatar: '👩‍🏫',
  })),
]

export const users = seedUsers
export const initialUsers = seedUsers
