/**
 * Data akun dummy untuk simulasi login.
 * Setiap role punya beberapa akun untuk demo.
 */
export const users = [
  // === SISWA ===
  {
    id: 'siswa-01',
    name: 'Rina Amelia',
    initials: 'RA',
    role: 'siswa',
    class: 'XI IPA 2',
    email: 'rina@siswa.id',
    avatar: '🧑‍🎓',
  },
  {
    id: 'siswa-02',
    name: 'Budi Santoso',
    initials: 'BS',
    role: 'siswa',
    class: 'X IPS 1',
    email: 'budi@siswa.id',
    avatar: '👦',
  },
  {
    id: 'siswa-03',
    name: 'Dina Fitriani',
    initials: 'DF',
    role: 'siswa',
    class: 'XI IPA 2',
    email: 'dina@siswa.id',
    avatar: '👧',
  },
  {
    id: 'siswa-04',
    name: 'Siti Aminah',
    initials: 'SA',
    role: 'siswa',
    class: 'XI IPA 2',
    email: 'siti@siswa.id',
    avatar: '👧',
  },

  // === WALI KELAS ===
  {
    id: 'guru-01',
    name: 'Ibu Sari Dewi',
    initials: 'SD',
    role: 'wali_kelas',
    class: 'XI IPA 2',
    email: 'sari@guru.id',
    avatar: '👩‍🏫',
  },
  {
    id: 'guru-02',
    name: 'Pak Ahmad Fauzi',
    initials: 'AF',
    role: 'wali_kelas',
    class: 'X IPS 1',
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
]

export const initialUsers = users
