import { createContext, useContext, useCallback, useEffect, useMemo, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { initialReports } from '../data/reports'
import { initialNotifications } from '../data/notifications'
import { seedUsers } from '../data/users'
import { classes } from '../data/classes'
import { generateReportCode } from '../utils/generateCode'
import { seedStudents } from '../data/students'
import { checkEarlyDetection } from '../utils/detection'
import { parseAcademicCsv } from '../utils/parseAcademicCsv'
import { initialGameScores } from '../data/gameScores'
import { getTodayString } from '../utils/dailySeed'
import { DEMO_MODE } from '../config'

const BULAN_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const MAX_CSV_BYTES = 500 * 1024
const MAX_XLSX_BYTES = 2 * 1024 * 1024
const isClassTeacher = user => user?.role === 'wali_kelas' || user?.role === 'wali'

async function hashPassword(password) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}

function getAuthenticatedUser(user) {
  const { password, ...safeUser } = user
  return {
    ...safeUser,
    name: safeUser.name || safeUser.nama,
    role: safeUser.role === 'wali' ? 'wali_kelas' : safeUser.role,
    class: safeUser.class || safeUser.kelasId,
  }
}

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

function persistAcademicData(nextStudents, nextFiles) {
  let previousStudents
  let previousFiles
  try {
    previousStudents = window.localStorage.getItem('ls_students')
    previousFiles = window.localStorage.getItem('ls_uploaded_files')
  } catch (error) {
    console.warn('Gagal membaca penyimpanan data akademik:', error)
    throw new Error('Penyimpanan browser tidak dapat diakses. Periksa pengaturan penyimpanan lalu coba lagi.')
  }

  try {
    window.localStorage.setItem('ls_students', JSON.stringify(nextStudents))
    window.localStorage.setItem('ls_uploaded_files', JSON.stringify(nextFiles))
  } catch (error) {
    try {
      if (previousStudents === null) window.localStorage.removeItem('ls_students')
      else window.localStorage.setItem('ls_students', previousStudents)
      if (previousFiles === null) window.localStorage.removeItem('ls_uploaded_files')
      else window.localStorage.setItem('ls_uploaded_files', previousFiles)
    } catch (rollbackError) {
      console.error('Gagal memulihkan penyimpanan data akademik:', rollbackError)
    }
    console.warn('Gagal menyimpan data akademik ke localStorage:', error)
    throw new Error('Penyimpanan browser penuh. Hapus unggahan lama atau gunakan file CSV yang lebih kecil.')
  }
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
  const [users, setUsers] = useLocalStorage('users', [...seedUsers])
  const usersRef = useRef(users)
  const [students, setStudents] = useLocalStorage('ls_students', seedStudents)
  const [uploadedFiles, setUploadedFiles] = useLocalStorage('ls_uploaded_files', [])
  const [gameScores, setGameScores] = useLocalStorage('ls_game_scores', initialGameScores)
  const [registeredStudents, setRegisteredStudents] = useLocalStorage('ls_registered_students', [])
  const allUsers = useMemo(() => [
    ...users,
    ...(Array.isArray(registeredStudents)
      ? registeredStudents.filter(user => (
        user?.role === 'siswa' && !users.some(existing => existing.id === user.id)
      ))
      : []),
  ], [registeredStudents, users])

  useEffect(() => {
    usersRef.current = users
  }, [users])

  // Otomatis hapus laporan uji coba dengan kata tidak pantas atau kode dummy LS-BLKH-4
  useEffect(() => {
    setReports(prev => {
      if (!Array.isArray(prev)) return prev
      const filtered = prev.filter(r => {
        if (!r) return false
        if (r.code === 'LS-BLKH-4') return false
        const text = `${r.description || ''} ${r.studentName || ''}`.toLowerCase()
        if (text.includes('kontol') || text.includes('jancok')) return false
        return true
      })
      return filtered.length !== prev.length ? filtered : prev
    })
  }, [setReports])

  // === AUTH ===
  const login = useCallback((usernameOrId, password) => {
    if (password === undefined) {
      if (!DEMO_MODE) return null
      const user = seedUsers.find(candidate => candidate.id === usernameOrId)
      if (!user) return null
      const authenticatedUser = getAuthenticatedUser(user)
      setCurrentUser(authenticatedUser)
      return authenticatedUser
    }

    return (async () => {
      const passwordHash = /^[\da-f]{64}$/i.test(password)
        ? password.toLowerCase()
        : await hashPassword(password)
      const user = usersRef.current.find(candidate =>
        candidate.username === usernameOrId && candidate.password === passwordHash,
      )
      if (!user) return null

      const authenticatedUser = getAuthenticatedUser(user)
      setCurrentUser(authenticatedUser)
      return { token: crypto.randomUUID(), user: authenticatedUser }
    })()
  }, [setCurrentUser])

  const createStudentAccount = useCallback(({ name, className }) => {
    const normalizedName = typeof name === 'string' ? name.trim().replace(/\s+/g, ' ') : ''
    if (normalizedName.length < 2 || normalizedName.length > 120) {
      throw new Error('Nama siswa harus terdiri dari 2 sampai 120 karakter.')
    }

    const matchingTeachers = allUsers.filter(user => (
      isClassTeacher(user) && (user.class || user.kelasId) === className
    ))
    if (matchingTeachers.length !== 1) {
      throw new Error('Kelas tidak tersedia atau belum memiliki tepat satu wali kelas.')
    }

    const initials = normalizedName
      .split(' ')
      .slice(0, 2)
      .map(part => part[0].toLocaleUpperCase('id-ID'))
      .join('')
    const idSuffix = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    const newStudent = {
      id: `siswa-baru-${idSuffix}`,
      name: normalizedName,
      initials,
      role: 'siswa',
      class: className,
      classId: className,
      kelasId: className,
      avatar: '🎓',
      homeroomTeacherId: matchingTeachers[0].id,
    }

    setRegisteredStudents(previous => [
      ...(Array.isArray(previous) ? previous : []),
      newStudent,
    ])
    setStudents(previous => [...previous, {
      id: newStudent.id,
      studentId: newStudent.id,
      kelasId: className,
      riwayat: [],
      kehadiran: [],
      riwayatBulanan: [],
    }])
    setCurrentUser(newStudent)
    return newStudent
  }, [allUsers, setCurrentUser, setRegisteredStudents, setStudents])

  const loginDemo = useCallback((roleOrUserId) => {
    if (!DEMO_MODE) return null
    const user = seedUsers.find(candidate => candidate.id === roleOrUserId)
      || seedUsers.find(candidate => candidate.role === roleOrUserId)
      || (roleOrUserId === 'wali_kelas' && seedUsers.find(candidate => candidate.role === 'wali'))
    if (!user) return null
    const authenticatedUser = getAuthenticatedUser(user)
    setCurrentUser(authenticatedUser)
    return authenticatedUser
  }, [setCurrentUser])

  const daftarSiswa = useCallback(async ({ nama, kelasId, username, password, role = 'siswa' }) => {
    if (role !== 'siswa') {
      throw new Error('Pendaftaran hanya tersedia untuk peran Siswa.')
    }
    if (usersRef.current.find(user => user.username === username)) {
      throw new Error('Username sudah dipakai')
    }
    if (typeof nama !== 'string' || !nama.trim()) throw new Error('Nama tidak boleh kosong')
    if (typeof password !== 'string' || password.length < 6) {
      throw new Error('Password minimal 6 karakter')
    }
    if (!classes.some(kelas => kelas.id === kelasId)) {
      throw new Error(`Kelas dengan id "${kelasId}" tidak ditemukan`)
    }

    const newUser = {
      id: crypto.randomUUID(),
      nama: nama.trim(),
      name: nama.trim(),
      username,
      password: await hashPassword(password),
      role: 'siswa',
      kelasId,
      classId: kelasId,
      class: kelasId,
      initials: nama.trim().split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(),
    }
    const newEntry = {
      id: newUser.id,
      studentId: newUser.id,
      kelasId,
      riwayat: [],
      kehadiran: [],
      riwayatBulanan: [],
    }

    const nextUsers = [...usersRef.current, newUser]
    usersRef.current = nextUsers
    setUsers(nextUsers)
    setStudents(previousStudents => [...previousStudents, newEntry])
    return newUser
  }, [setUsers, setStudents])

  const getSiswaByKelas = useCallback((kelasId) => students.filter(student => (
    allUsers.find(user =>
      user.id === (student.id || student.studentId)
      && (user.kelasId || user.classId) === kelasId,
    )
  )), [students, allUsers])

  const getKelasById = useCallback((id) => classes.find(kelas => kelas.id === id), [])

  const simpanDataBulanan = useCallback(({ studentId, bulan, nilai, kehadiran }) => {
    if (!Number.isFinite(nilai) || nilai < 0 || nilai > 100) {
      throw new Error('Nilai harus berada di antara 0 dan 100')
    }
    if (!Number.isFinite(kehadiran) || kehadiran < 0 || kehadiran > 100) {
      throw new Error('Kehadiran harus berada di antara 0 dan 100')
    }

    if (!students.some(student => (student.id || student.studentId) === studentId)) {
      throw new Error(`Data siswa dengan id "${studentId}" tidak ditemukan`)
    }

    setStudents(previousStudents => previousStudents.map(student => {
      if ((student.id || student.studentId) !== studentId) return student

      const riwayat = [...(student.riwayat || [])]
      const historyIndex = riwayat.findIndex(entry => entry.bulan === bulan)
      const historyEntry = { ...(historyIndex >= 0 ? riwayat[historyIndex] : {}), bulan, nilai, kehadiran }
      if (historyIndex >= 0) riwayat[historyIndex] = historyEntry
      else riwayat.push(historyEntry)

      const attendance = [...(student.kehadiran || [])]
      const attendanceIndex = attendance.findIndex(entry => entry.bulan === bulan)
      const attendanceEntry = { ...(attendanceIndex >= 0 ? attendance[attendanceIndex] : {}), bulan, kehadiran }
      if (attendanceIndex >= 0) attendance[attendanceIndex] = attendanceEntry
      else attendance.push(attendanceEntry)

      const riwayatBulanan = [...(student.riwayatBulanan || [])]
      const legacyIndex = riwayatBulanan.findIndex(entry => entry.bulan === bulan)
      const legacyEntry = {
        ...(legacyIndex >= 0 ? riwayatBulanan[legacyIndex] : {}),
        bulan,
        nilaiRataRata: nilai,
        kehadiranPersen: kehadiran,
      }
      if (legacyIndex >= 0) riwayatBulanan[legacyIndex] = legacyEntry
      else riwayatBulanan.push(legacyEntry)

      return { ...student, riwayat, kehadiran: attendance, riwayatBulanan }
    }))
    return true
  }, [students, setStudents])

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
      allUsers.find(u => isClassTeacher(u) && (u.class || u.kelasId) === reportData.class)?.id || 'guru-01'
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
      bukti: reportData.bukti || [],
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
  }, [allUsers, setReports, setNotifications])

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

  // Hapus laporan (berdasarkan ID atau Kode laporan)
  const deleteReport = useCallback((reportIdOrCode) => {
    setReports(prev => prev.filter(r => r.id !== reportIdOrCode && r.code !== reportIdOrCode))
    setNotifications(prev => prev.filter(n => n.reportCode !== reportIdOrCode))
  }, [setReports, setNotifications])

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
        const user = allUsers.find(u => u.id === userId)
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
  }, [allUsers, reports])

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

  const jalankanDeteksiDini = useCallback((classTeacherId = null, targetBulan = null) => {
    let studentsToCheck = students
    if (classTeacherId) {
      const classTeacher = allUsers.find(user => user.id === classTeacherId && isClassTeacher(user))
      if (!classTeacher) {
        throw new Error(`Wali kelas dengan id "${classTeacherId}" tidak ditemukan`)
      }
      const studentIdsInClass = allUsers
        .filter(user => user.role === 'siswa' && (user.class || user.kelasId) === (classTeacher.class || classTeacher.kelasId))
        .map(user => user.id)
      studentsToCheck = students.filter(student => studentIdsInClass.includes(student.id || student.studentId))
    }

    const { newReports, newNotifications } = checkEarlyDetection(studentsToCheck, reports, allUsers, targetBulan)
    if (newReports.length > 0) {
      setReports(prev => [...newReports, ...prev])
      setNotifications(prev => [...newNotifications, ...prev])
    }
    return newReports.length
  }, [students, reports, setReports, setNotifications, allUsers])

  const importDataAkademik = useCallback((rows, classTeacherId, fileMeta = null) => {
    const classTeacher = allUsers.find(user => user.id === classTeacherId && isClassTeacher(user))
    if (!classTeacher) {
      throw new Error(`Wali kelas dengan id "${classTeacherId}" tidak ditemukan`)
    }
    const className = classTeacher.class || classTeacher.kelasId

    const rawCsv = fileMeta?.rawCsv
    const rawCsvSize = typeof rawCsv === 'string' ? new Blob([rawCsv]).size : 0
    if (fileMeta && (
      typeof rawCsv !== 'string'
      || (fileMeta.sourceType !== 'xlsx' && rawCsvSize > MAX_CSV_BYTES)
      || (fileMeta.sourceType === 'xlsx' && fileMeta.size > MAX_XLSX_BYTES)
    )) {
      throw new Error('Ukuran file melebihi batas atau data tidak dapat dibaca.')
    }

    let diperbarui = 0
    let ditambahkan = 0
    let dilewati = fileMeta?.skippedRows || 0
    const updatedStudents = students.map(student => ({
      ...student,
      riwayatBulanan: [...(student.riwayatBulanan || [])],
    }))
    let fileId = null
    if (fileMeta) {
      let timestamp = Date.now()
      while (uploadedFiles.some(file => file.id === `file-${timestamp}`)) timestamp += 1
      fileId = `file-${timestamp}`
    }

    rows.forEach(row => {
      const studentUser = allUsers.find(user => user.id === row.studentId)
      if (
        studentUser?.role !== 'siswa'
        || (studentUser.class || studentUser.kelasId) !== className
      ) {
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
        ...(fileId ? { fileId } : {}),
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

    let nextUploadedFiles = uploadedFiles
    if (fileMeta) {
      const summary = { ditambahkan, diperbarui, dilewati }
      const uploadedAt = new Date().toISOString()
      nextUploadedFiles = [
        {
          id: fileId,
          fileName: fileMeta.fileName,
          originalFileName: fileMeta.originalFileName || fileMeta.fileName,
          sourceType: fileMeta.sourceType || 'csv',
          uploadedBy: classTeacherId,
          class: className,
          uploadedAt,
          size: fileMeta.size ?? rawCsvSize,
          rawCsv,
          rowCount: fileMeta.rowCount ?? rows.length + (fileMeta.skippedRows || 0),
          summary,
        },
        ...uploadedFiles,
      ]
      persistAcademicData(updatedStudents, nextUploadedFiles)
    }

    setStudents(updatedStudents)
    if (fileMeta) setUploadedFiles(nextUploadedFiles)
    return { diperbarui, ditambahkan, dilewati, fileId }
  }, [students, uploadedFiles, setStudents, setUploadedFiles, allUsers])

  const getUploadedFilesForClass = useCallback((className) => (
    uploadedFiles
      .filter(file => file.class === className)
      .sort((first, second) => new Date(second.uploadedAt) - new Date(first.uploadedAt))
  ), [uploadedFiles])

  const deleteUploadedFile = useCallback((fileId, teacherId) => {
    const teacher = allUsers.find(user => user.id === teacherId && isClassTeacher(user))
    const file = uploadedFiles.find(item => item.id === fileId)
    if (!teacher || !file || file.class !== (teacher.class || teacher.kelasId)) {
      throw new Error('Unggahan tidak ditemukan atau Anda tidak berhak menghapusnya.')
    }

    const nextUploadedFiles = uploadedFiles.filter(item => item.id !== fileId)
    const nextStudents = students.map(student => ({
      ...student,
      riwayatBulanan: (student.riwayatBulanan || []).filter(entry => entry.fileId !== fileId),
    }))
    persistAcademicData(nextStudents, nextUploadedFiles)
    setStudents(nextStudents)
    setUploadedFiles(nextUploadedFiles)
  }, [students, uploadedFiles, setStudents, setUploadedFiles, allUsers])

  const reimportUploadedFile = useCallback((fileId, teacherId) => {
    const teacher = allUsers.find(user => user.id === teacherId && isClassTeacher(user))
    const file = uploadedFiles.find(item => item.id === fileId)
    if (!teacher || !file || file.class !== (teacher.class || teacher.kelasId)) {
      throw new Error('Unggahan tidak ditemukan atau Anda tidak berhak mengimpornya.')
    }

    const { validRows, errors } = parseAcademicCsv(file.rawCsv, allUsers, teacherId)
    return importDataAkademik(validRows, teacherId, {
      fileName: file.fileName,
      originalFileName: file.originalFileName,
      sourceType: file.sourceType,
      size: file.size,
      rawCsv: file.rawCsv,
      rowCount: validRows.length + errors.length,
      skippedRows: errors.length,
    })
  }, [uploadedFiles, importDataAkademik, allUsers])

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
    bukti = [],
  }) => {
    const student = allUsers.find(user => user.id === studentId)
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
      bukti,
    })
    return { code }
  }, [allUsers, createReport])

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
    const category = typeof jenisMasalah === 'string' ? jenisMasalah.trim().toLowerCase() : ''
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
      category,
      tindakLanjut: category,
      followUp: followUpByCategory[category] || 'pendampingan mental',
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
    if (!userId || !allUsers.some(user => user.id === userId && user.role === 'siswa')) {
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
  }, [gameScores, setGameScores, allUsers])

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
    const studentUsers = allUsers.filter(user =>
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
  }, [currentUser?.class, gameScores, allUsers])

  const getLeaderboardKelas = useCallback((className) => allUsers
    .filter(user => user.role === 'siswa' && user.class === className)
    .map(student => ({
      userId: student.id,
      nama: student.name,
      email: student.email,
      kelas: student.class,
      ...getTotalSkor(student.id),
    }))
    .sort((left, right) => right.total - left.total), [getTotalSkor, allUsers])

  const getLeaderboardSekolah = useCallback(() => allUsers
    .filter(user => user.role === 'siswa')
    .map(student => ({
      userId: student.id,
      nama: student.name,
      email: student.email,
      kelas: student.class,
      ...getTotalSkor(student.id),
    }))
    .sort((left, right) => right.total - left.total), [getTotalSkor, allUsers])

  // Reset data ke default (untuk demo)
    const resetData = useCallback(() => {
    setReports(initialReports)
    setNotifications(initialNotifications)
    usersRef.current = [...seedUsers]
    setUsers([...seedUsers])
    setStudents(seedStudents)
    setUploadedFiles([])
    setGameScores(initialGameScores)
    setRegisteredStudents([])
  }, [setReports, setNotifications, setUsers, setStudents, setUploadedFiles, setGameScores, setRegisteredStudents])

  const value = {
    // Auth
    currentUser,
    setCurrentUser,
    login,
    loginDemo,
    daftarSiswa,
    logout,
    users: allUsers,
    demoUsers: seedUsers,
    createStudentAccount,
    students,
    classes,
    getSiswaByKelas,
    getKelasById,
    simpanDataBulanan,

    // Laporan
    reports,
    createReport,
    deleteReport,
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
    uploadedFiles,
    getUploadedFilesForClass,
    deleteUploadedFile,
    reimportUploadedFile,
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
