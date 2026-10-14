import { createContext, useContext, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { initialReports } from '../data/reports'
import { initialNotifications } from '../data/notifications'
import { users } from '../data/users'
import { generateReportCode } from '../utils/generateCode'
import { initialStudents } from '../data/students'
import { checkEarlyDetection } from '../utils/detection'
import { initialGameScores } from '../data/gameScores'
import { getTodayString } from '../utils/dailySeed'

const BULAN_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

// Buat context
const AppContext = createContext(null)
const VALID_GAMES = ['puzzle', 'kata', 'memori', 'hitung', 'pola', 'bentuk', 'sudoku', 'hanoi']
const isValidDateString = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
}

/**
 * Provider utama aplikasi.
 * Mengelola: user login, laporan, notifikasi, semuanya via localStorage.
 */
export function AppProvider({ children }) {
  // State utama
  const [currentUser, setCurrentUser] = useLocalStorage('ls_current_user', null)
  const [reports, setReports] = useLocalStorage('ls_reports', initialReports)
  const [notifications, setNotifications] = useLocalStorage('ls_notifications', initialNotifications)
  const [students, setStudents] = useLocalStorage('ls_students', initialStudents)
  const [gameScores, setGameScores] = useLocalStorage('ls_game_scores', initialGameScores)

  // === AUTH ===
  const login = useCallback((userId) => {
    const user = users.find(u => u.id === userId)
    if (user) setCurrentUser(user)
    return user
  }, [setCurrentUser])

  const logout = useCallback(() => {
    setCurrentUser(null)
  }, [setCurrentUser])

  // === LAPORAN ===

  // Buat laporan baru (dari siswa)
  const createReport = useCallback((reportData) => {
    const code = generateReportCode()
    const now = new Date().toISOString()

    // Jika mendesak, langsung ke BK
    const isUrgent = reportData.urgency === 'mendesak'
    const channel = isUrgent ? 'guru_bk' : reportData.channel
    const assignedTo = isUrgent ? 'bk-01' : (
      channel === 'guru_bk' ? 'bk-01' :
      // Cari wali kelas berdasarkan kelas siswa
      users.find(u => u.role === 'wali_kelas' && u.class === reportData.class)?.id || 'guru-01'
    )

    const newReport = {
      id: `rpt-${Date.now()}`,
      code,
      studentId: reportData.studentId,
      studentName: reportData.studentName,
      studentInitials: reportData.studentInitials,
      class: reportData.class,
      category: reportData.category,
      description: reportData.description,
      urgency: reportData.urgency,
      anonymous: reportData.anonymous,
      source: 'siswa',
      channel,
      assignedTo,
      escalatedTo: null,
      status: 'dikirim',
      startDate: reportData.startDate,
      createdAt: now,
      updatedAt: now,
      sessionCount: 0,
      notes: [],
      followUp: null,
      evidence: reportData.evidence || null,
    }

    setReports(prev => [newReport, ...prev])

    // Kirim notifikasi ke guru terkait
    const targetNotif = {
      id: `notif-${Date.now()}`,
      userId: assignedTo,
      type: isUrgent ? 'laporan_masuk' : 'laporan_masuk',
      title: isUrgent ? '🚨 Laporan MENDESAK masuk' : 'Laporan baru dari siswa',
      message: isUrgent
        ? `Laporan mendesak kategori ${reportData.category} telah masuk langsung.`
        : `Ada laporan baru kategori ${reportData.category} dari siswa kelasmu.`,
      reportCode: code,
      read: false,
      createdAt: now,
    }
    setNotifications(prev => [targetNotif, ...prev])

    return code
  }, [setReports, setNotifications])

  // Update status laporan
  const updateReportStatus = useCallback((reportId, newStatus, note = null, extraData = {}) => {
    const now = new Date().toISOString()

    setReports(prev => prev.map(r => {
      if (r.id !== reportId) return r

      const updated = {
        ...r,
        status: newStatus,
        updatedAt: now,
        ...extraData,
      }

      // Tambah catatan jika ada
      if (note) {
        updated.notes = [
          ...r.notes,
          {
            id: `note-${Date.now()}`,
            ...note,
            date: now,
          }
        ]
      }

      return updated
    }))
  }, [setReports])

  // Eskalasi ke BK
  const escalateToBK = useCallback((reportId, note) => {
    const now = new Date().toISOString()

    setReports(prev => prev.map(r => {
      if (r.id !== reportId) return r
      return {
        ...r,
        status: 'pendampingan',
        escalatedTo: 'bk-01',
        assignedTo: 'bk-01',
        updatedAt: now,
        notes: [
          ...r.notes,
          {
            id: `note-${Date.now()}`,
            author: note.author,
            role: 'wali_kelas',
            content: `Dieskalasi ke Guru BK. Catatan: ${note.content}`,
            date: now,
            visibleToStudent: true,
          }
        ],
      }
    }))

    // Notifikasi ke BK
    const report = reports.find(r => r.id === reportId)
    if (report) {
      addNotification('bk-01', 'eskalasi_masuk', 'Eskalasi dari Wali Kelas',
        `Kasus ${report.code} dieskalasi untuk penanganan lanjutan.`, report.code)

      // Notifikasi ke siswa
      addNotification(report.studentId, 'eskalasi_bk', 'Kasusmu ditangani Guru BK',
        'Laporanmu kini ditangani oleh Guru BK untuk penanganan lebih lanjut.', report.code)
    }
  }, [reports, setReports])

  // Tambah sesi konseling
  const addCounselingSession = useCallback((reportId) => {
    setReports(prev => prev.map(r => {
      if (r.id !== reportId) return r
      return { ...r, sessionCount: r.sessionCount + 1 }
    }))
  }, [setReports])

  // Tutup kasus
  const closeCase = useCallback((reportId, note) => {
    const now = new Date().toISOString()
    const report = reports.find(r => r.id === reportId)

    setReports(prev => prev.map(r => {
      if (r.id !== reportId) return r
      return {
        ...r,
        status: 'selesai',
        updatedAt: now,
        notes: [
          ...r.notes,
          {
            id: `note-${Date.now()}`,
            author: note.author,
            role: note.role,
            content: note.content,
            date: now,
            visibleToStudent: true,
          }
        ],
      }
    }))

    // Notifikasi ke siswa
    if (report) {
      addNotification(report.studentId, 'kasus_selesai',
        'Kasusmu telah ditangani! 🎉',
        `Laporan ${report.code} telah selesai. Semoga situasimu terus membaik!`,
        report.code
      )
    }
  }, [reports, setReports])

  // Eskalasi eksternal
  const escalateExternal = useCallback((reportId, note) => {
    const now = new Date().toISOString()

    setReports(prev => prev.map(r => {
      if (r.id !== reportId) return r
      return {
        ...r,
        status: 'eskalasi_eksternal',
        escalationTarget: note.target || null,
        updatedAt: now,
        notes: [
          ...r.notes,
          {
            id: `note-${Date.now()}`,
            author: note.author,
            role: 'guru_bk',
            content: note.content,
            date: now,
            visibleToStudent: true,
          }
        ],
      }
    }))

    const report = reports.find(r => r.id === reportId)
    if (report) {
      addNotification(report.studentId, 'eskalasi_bk',
        'Kasusmu ditangani pihak luar',
        'Untuk penanganan terbaik, kasusmu akan melibatkan pihak eksternal (kepala sekolah / dinas terkait).',
        report.code
      )
    }
  }, [reports, setReports])

  // === NOTIFIKASI ===

  const addNotification = useCallback((userId, type, title, message, reportCode = null) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId,
      type,
      title,
      message,
      reportCode,
      read: false,
      createdAt: new Date().toISOString(),
    }
    setNotifications(prev => [newNotif, ...prev])
  }, [setNotifications])

  const markNotificationRead = useCallback((notifId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    )
  }, [setNotifications])

  const markAllNotificationsRead = useCallback((userId) => {
    setNotifications(prev =>
      prev.map(n => n.userId === userId ? { ...n, read: true } : n)
    )
  }, [setNotifications])

  // === HELPERS ===

  // Ambil laporan milik user tertentu
  const getReportsForUser = useCallback((userId, role) => {
    switch (role) {
      case 'siswa':
        return reports.filter(r => r.studentId === userId)
      case 'wali_kelas': {
        const user = users.find(u => u.id === userId)
        return reports.filter(r =>
          r.assignedTo === userId ||
          (r.class === user?.class && r.source === 'deteksi')
        )
      }
      case 'guru_bk':
        return reports.filter(r =>
          r.assignedTo === userId || r.escalatedTo === userId || r.archivedTo === userId
        )
      default:
        return []
    }
  }, [reports])

  // Ambil notifikasi milik user
  const getNotificationsForUser = useCallback((userId) => {
    return notifications.filter(n => n.userId === userId)
  }, [notifications])

  // Hitung notifikasi belum dibaca
  const getUnreadCount = useCallback((userId) => {
    return notifications.filter(n => n.userId === userId && !n.read).length
  }, [notifications])

  // Cari laporan by kode
  const getReportByCode = useCallback((code) => {
    return reports.find(r => r.code === code) || null
  }, [reports])

  const jalankanDeteksiDini = useCallback((classTeacherId = null) => {
    let studentsToCheck = students
    if (classTeacherId) {
      const classTeacher = users.find(user => user.id === classTeacherId && user.role === 'wali_kelas')
      if (!classTeacher) {
        throw new Error(`Wali kelas dengan id "${classTeacherId}" tidak ditemukan`)
      }
      const studentIdsInClass = users
        .filter(user => user.role === 'siswa' && user.class === classTeacher.class)
        .map(user => user.id)
      studentsToCheck = students.filter(student => studentIdsInClass.includes(student.studentId))
    }

    const { newReports, newNotifications } = checkEarlyDetection(studentsToCheck, reports, users)
    if (newReports.length > 0) {
      setReports(prev => [...newReports, ...prev])
      setNotifications(prev => [...newNotifications, ...prev])
    }
    return newReports.length
  }, [students, reports, setReports, setNotifications])

  const importDataAkademik = useCallback((rows, classTeacherId) => {
    const classTeacher = users.find(user => user.id === classTeacherId && user.role === 'wali_kelas')
    if (!classTeacher) {
      throw new Error(`Wali kelas dengan id "${classTeacherId}" tidak ditemukan`)
    }

    let diperbarui = 0
    let ditambahkan = 0
    let dilewati = 0
    const updatedStudents = students.map(student => ({
      ...student,
      riwayatBulanan: [...(student.riwayatBulanan || [])],
    }))

    rows.forEach(row => {
      const studentUser = users.find(user => user.id === row.studentId)
      if (studentUser?.role !== 'siswa' || studentUser.class !== classTeacher.class) {
        dilewati += 1
        return
      }

      let student = updatedStudents.find(item => item.studentId === row.studentId)
      if (!student) {
        student = { studentId: row.studentId, riwayatBulanan: [] }
        updatedStudents.push(student)
      }

      const existingIndex = student.riwayatBulanan.findIndex(item => item.periode === row.periode)
      const [year, month] = row.periode.split('-')
      const entry = {
        periode: row.periode,
        bulan: `${BULAN_LABELS[Number(month) - 1]} ${year}`,
        nilaiRataRata: row.nilaiRataRata,
        kehadiranPersen: row.kehadiranPersen,
      }

      if (existingIndex >= 0) {
        student.riwayatBulanan[existingIndex] = entry
        diperbarui += 1
      } else {
        student.riwayatBulanan.push(entry)
        ditambahkan += 1
      }

      const legacyEntries = student.riwayatBulanan.filter(item => !item.periode)
      const periodEntries = student.riwayatBulanan
        .filter(item => item.periode)
        .sort((first, second) => first.periode.localeCompare(second.periode))
      student.riwayatBulanan = [...legacyEntries, ...periodEntries]
    })

    setStudents(updatedStudents)
    return { diperbarui, ditambahkan, dilewati }
  }, [students, setStudents])

  const getNamaTampilan = useCallback((report, viewerRole) => {
    if (!report.anonymous) return report.studentName || 'Siswa'
    if ((viewerRole === 'guru_bk' || viewerRole === 'bk') && report.urgency === 'mendesak') {
      return `${report.studentName || 'Siswa'} (dibuka demi keselamatan)`
    }
    return `${report.studentInitials || 'S'}. (${report.code})`
  }, [])

  const buatLaporan = useCallback(({
    studentId,
    kategori,
    cerita,
    urgensi,
    jalur,
    anonim,
    startDate = null,
    evidence = null,
  }) => {
    const student = users.find(user => user.id === studentId)
    if (!student) {
      throw new Error(`Siswa dengan id "${studentId}" tidak ditemukan`)
    }
    const code = createReport({
      studentId,
      studentName: student.name,
      studentInitials: student.initials,
      class: student.class,
      category: kategori,
      description: cerita,
      urgency: urgensi,
      channel: jalur === 'bk' ? 'guru_bk' : 'wali_kelas',
      anonymous: anonim,
      startDate,
      evidence,
    })
    return { code }
  }, [createReport])

  const walikelasTandaiTeratasi = useCallback((reportId, solusi) => {
    closeCase(reportId, {
      author: currentUser?.name || 'Wali Kelas',
      role: 'wali_kelas',
      content: `Kasus diselesaikan oleh Wali Kelas: ${solusi}`,
    })
    setReports(prev => prev.map(report => report.id === reportId
      ? { ...report, archivedTo: 'bk-01' }
      : report
    ))
    const report = reports.find(item => item.id === reportId)
    if (report) {
      addNotification(
        'bk-01',
        'kasus_selesai',
        'Kes selesai di kelas',
        `Kes ${report.code} telah diselesaikan oleh Wali Kelas dan diarkibkan untuk rujukan Guru BK.`,
        report.code,
      )
    }
  }, [addNotification, closeCase, currentUser, reports, setReports])

  const walikelasEskalasi = useCallback((reportId, alasan = 'Butuh pendampingan Guru BK') => {
    escalateToBK(reportId, {
      author: currentUser?.name || 'Wali Kelas',
      content: alasan,
    })
  }, [currentUser, escalateToBK])

  const bkAsesmen = useCallback((reportId, catatan, jenisMasalah, visibleToStudent = true) => {
    const followUpByCategory = {
      ekonomi: 'beasiswa/bantuan desa',
      bullying: 'pendampingan mental',
      motivasi: 'program belajar',
    }
    updateReportStatus(reportId, 'pendampingan', {
      author: currentUser?.name || 'Guru BK',
      role: 'guru_bk',
      content: catatan,
      visibleToStudent,
    }, {
      category: jenisMasalah,
      followUp: followUpByCategory[jenisMasalah] || 'pendampingan mental',
    })
  }, [currentUser, updateReportStatus])

  const bkEvaluasi = useCallback((reportId, positif, catatanEvaluasi = '') => {
    const note = {
      author: currentUser?.name || 'Guru BK',
      role: 'guru_bk',
      content: catatanEvaluasi || (positif
        ? 'Siswa menunjukkan perbaikan dan kasus dapat diselesaikan.'
        : 'Kondisi belum pulih; sesi konseling lanjutan dijadwalkan.'),
      visibleToStudent: true,
    }
    if (positif) {
      closeCase(reportId, note)
      return
    }
    addCounselingSession(reportId)
    updateReportStatus(reportId, 'pendampingan', note)
  }, [addCounselingSession, closeCase, currentUser, updateReportStatus])

  const bkEskalasiLanjutan = useCallback((reportId, tujuan, catatan = '') => {
    escalateExternal(reportId, {
      author: currentUser?.name || 'Guru BK',
      content: `Kasus dikoordinasikan ke pihak eksternal: ${tujuan}${catatan ? `. Catatan: ${catatan}` : ''}`,
      target: tujuan,
    })
  }, [currentUser, escalateExternal])

  // === GAME ===

  const getStreakHarian = useCallback((userId) => {
    const today = getTodayString()
    const toDayNumber = (dateString) => {
      const [year, month, day] = dateString.split('-').map(Number)
      return Date.UTC(year, month - 1, day) / 86400000
    }
    const todayNumber = toDayNumber(today)
    const playedDays = [...new Set(
      gameScores
        .filter(score => score.userId === userId && isValidDateString(score.tanggal))
        .map(score => score.tanggal)
        .filter(date => toDayNumber(date) <= todayNumber)
    )].sort((left, right) => toDayNumber(right) - toDayNumber(left))

    if (!playedDays.length || todayNumber - toDayNumber(playedDays[0]) > 1) return 0

    let streak = 1
    for (let index = 0; index < playedDays.length - 1; index += 1) {
      const difference = toDayNumber(playedDays[index]) - toDayNumber(playedDays[index + 1])
      if (difference !== 1) break
      streak += 1
    }

    return streak
  }, [gameScores])

  const getSkorHariIni = useCallback((userId, game) => {
    const today = getTodayString()
    return gameScores.find(score =>
      score.userId === userId && score.game === game && score.tanggal === today
    ) || null
  }, [gameScores])

  const simpanSkor = useCallback(({ userId, game, skor, tanggal = getTodayString(), langkah, waktu, detail }) => {
    const numericScore = Number(skor)
    if (!userId || !users.some(user => user.id === userId && user.role === 'siswa')) {
      return { success: false, message: 'Akun siswa tidak ditemukan.' }
    }
    if (!VALID_GAMES.includes(game)) {
      return { success: false, message: `Game "${game}" tidak valid.` }
    }
    if (
      skor === null ||
      typeof skor === 'boolean' ||
      (typeof skor === 'string' && !skor.trim()) ||
      !Number.isFinite(numericScore)
    ) {
      return { success: false, message: 'Skor harus berupa angka yang valid.' }
    }
    if (!isValidDateString(tanggal)) {
      return { success: false, message: 'Tanggal harus menggunakan format YYYY-MM-DD.' }
    }

    const duplicate = gameScores.some(score =>
      score.userId === userId && score.game === game && score.tanggal === tanggal
    )
    if (duplicate) {
      return {
        success: false,
        message: 'Kamu sudah menyelesaikan tantangan game ini untuk tanggal tersebut.',
      }
    }

    const newScore = {
      id: `score-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId,
      game,
      skor: Math.max(0, Math.min(100, numericScore)),
      tanggal,
      ...(Number.isInteger(langkah) && langkah >= 0 ? { langkah } : {}),
      ...(Number.isInteger(waktu) && waktu >= 0 ? { waktu } : {}),
      ...(Array.isArray(detail) ? { detail } : {}),
    }
    setGameScores(previousScores => [...previousScores, newScore])
    return { success: true, skor: newScore }
  }, [gameScores, setGameScores, users])

  const getTotalSkor = useCallback((userId) => {
    const totalRaw = gameScores
      .filter(score => score.userId === userId)
      .reduce((total, score) => total + (Number(score.skor) || 0), 0)
    const streak = getStreakHarian(userId)
    const bonusStreak = Math.min(streak * 5, 25)

    return { totalRaw, bonusStreak, total: totalRaw + bonusStreak, streak }
  }, [gameScores, getStreakHarian])

  const getStudentGameStats = useCallback((userId) => {
    const today = getTodayString()
    const totals = getTotalSkor(userId)
    const todayScores = Object.fromEntries(
      VALID_GAMES.map(game => [game, gameScores.find(score =>
        score.userId === userId && score.game === game && score.tanggal === today
      )?.skor ?? null]),
    )

    return {
      ...totals,
      totalScore: totals.total,
      todayScores,
    }
  }, [gameScores, getTotalSkor])

  const getLeaderboard = useCallback((scope = 'kelasku', timeFilter = 'all') => {
    if (scope !== 'kelasku' && scope !== 'sekolah') return []
    if (timeFilter !== 'week' && timeFilter !== 'all') return []

    const now = new Date()
    const today = getTodayString()
    const todayNumber = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000
    const weekStart = todayNumber - ((now.getDay() + 6) % 7)
    const studentUsers = users.filter(user =>
      user.role === 'siswa' &&
      (scope === 'sekolah' || user.class === currentUser?.class)
    )

    return studentUsers
      .map(student => {
        const scores = gameScores.filter(score => {
          if (score.userId !== student.id || !isValidDateString(score.tanggal)) return false
          if (timeFilter === 'all') return true
          const [year, month, day] = score.tanggal.split('-').map(Number)
          const scoreDay = Date.UTC(year, month - 1, day) / 86400000
          return scoreDay >= weekStart && scoreDay <= todayNumber
        })
        const score = scores.reduce((total, item) => total + (Number(item.skor) || 0), 0)

        return {
          studentId: student.id,
          id: student.id,
          name: student.name,
          class: student.class,
          score,
          totalScore: score,
        }
      })
      .sort((left, right) =>
        right.score - left.score || left.name.localeCompare(right.name, 'id')
      )
  }, [currentUser?.class, gameScores])

  const getLeaderboardKelas = useCallback((className) => users
    .filter(user => user.role === 'siswa' && user.class === className)
    .map(student => ({
      userId: student.id,
      nama: student.name,
      email: student.email,
      kelas: student.class,
      ...getTotalSkor(student.id),
    }))
    .sort((left, right) => right.total - left.total), [getTotalSkor, users])

  const getLeaderboardSekolah = useCallback(() => users
    .filter(user => user.role === 'siswa')
    .map(student => ({
      userId: student.id,
      nama: student.name,
      email: student.email,
      kelas: student.class,
      ...getTotalSkor(student.id),
    }))
    .sort((left, right) => right.total - left.total), [getTotalSkor, users])

  // Reset data ke default (untuk demo)
  const resetData = useCallback(() => {
    setReports(initialReports)
    setNotifications(initialNotifications)
    setStudents(initialStudents)
    setGameScores(initialGameScores)
  }, [setGameScores, setNotifications, setReports, setStudents])

  const value = {
    // Auth
    currentUser,
    setCurrentUser,
    login,
    logout,
    users,
    students,

    // Laporan
    reports,
    createReport,
    updateReportStatus,
    escalateToBK,
    addCounselingSession,
    closeCase,
    escalateExternal,
    getReportsForUser,
    getReportByCode,
    buatLaporan,
    getNamaTampilan,
    jalankanDeteksiDini,
    importDataAkademik,
    walikelasTandaiTeratasi,
    walikelasEskalasi,
    bkAsesmen,
    bkEvaluasi,
    bkEskalasiLanjutan,

    // Notifikasi
    notifications,
    addNotification,
    markNotificationRead,
    tandaiNotifDibaca: markNotificationRead,
    markAllNotificationsRead,
    getNotificationsForUser,
    getUnreadCount,

    // Game
    gameScores,
    simpanSkor,
    getSkorHariIni,
    getTotalSkor,
    getStudentGameStats,
    getLeaderboard,
    getStreakHarian,
    getLeaderboardKelas,
    getLeaderboardSekolah,

    // Reset
    resetData,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

/**
 * Hook untuk mengakses context.
 */
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp harus digunakan dalam AppProvider')
  }
  return context
}
