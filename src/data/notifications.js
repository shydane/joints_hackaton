/**
 * Notifikasi dummy.
 * Tipe: 'laporan_dibaca' | 'eskalasi_bk' | 'konseling_dijadwalkan' | 'kasus_selesai'
 *       | 'laporan_masuk' | 'deteksi_dini' | 'eskalasi_masuk'
 */
export const initialNotifications = [
  // Notifikasi untuk siswa
  {
    id: 'notif-01',
    userId: 'siswa-01',
    type: 'laporan_dibaca',
    title: 'Laporanmu sedang ditinjau',
    message: 'Wali kelas telah membaca laporan LS-2847-A. Kamu akan segera dihubungi.',
    reportCode: 'LS-2847-A',
    read: false,
    createdAt: '2025-01-11T10:05:00',
  },
  {
    id: 'notif-02',
    userId: 'siswa-02',
    type: 'konseling_dijadwalkan',
    title: 'Jadwal konseling disiapkan',
    message: 'Guru BK akan mengadakan sesi konseling untukmu. Tenang, ini untuk membantumu.',
    reportCode: 'LS-3912-B',
    read: false,
    createdAt: '2025-01-09T08:00:00',
  },
  {
    id: 'notif-03',
    userId: 'siswa-01',
    type: 'kasus_selesai',
    title: 'Kasusmu telah ditangani! 🎉',
    message: 'Laporan LS-6230-D telah selesai ditangani. Semoga situasimu terus membaik!',
    reportCode: 'LS-6230-D',
    read: true,
    createdAt: '2024-12-20T14:05:00',
  },

  // Notifikasi untuk wali kelas
  {
    id: 'notif-04',
    userId: 'guru-01',
    type: 'laporan_masuk',
    title: 'Laporan baru dari siswa',
    message: 'Ada laporan baru kategori Ekonomi dari siswa kelasmu.',
    reportCode: 'LS-2847-A',
    read: true,
    createdAt: '2025-01-10T08:35:00',
  },
  {
    id: 'notif-05',
    userId: 'guru-01',
    type: 'deteksi_dini',
    title: '⚠️ Peringatan otomatis',
    message: 'Sistem mendeteksi penurunan kehadiran & nilai pada Dina Fitriani (XI IPA 2).',
    reportCode: 'LS-5501-C',
    read: false,
    createdAt: '2025-01-13T07:05:00',
  },

  // Notifikasi untuk guru BK
  {
    id: 'notif-06',
    userId: 'bk-01',
    type: 'laporan_masuk',
    title: 'Laporan mendesak masuk',
    message: 'Laporan MENDESAK kategori Bullying telah masuk langsung ke Anda.',
    reportCode: 'LS-3912-B',
    read: true,
    createdAt: '2025-01-08T14:25:00',
  },
]
