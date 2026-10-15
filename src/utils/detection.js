import { generateReportCode } from './reportCode.js'

const ATTENDANCE_THRESHOLD = 80
const GRADE_DROP_THRESHOLD = 15

/**
 * Buat laporan deteksi untuk siswa berisiko yang belum memiliki kasus aktif.
 */
export function checkEarlyDetection(students, reports, users, targetBulan = null) {
  const newReports = []
  const newNotifications = []
  const now = new Date().toISOString()
  const studentsToProcess = targetBulan
    ? students.filter(student => !(student.riwayat || []).some(entry => entry.bulan === targetBulan))
    : students

  studentsToProcess.forEach((student) => {
    const history = student.riwayatBulanan
    if (!history || history.length < 2) return

    const latest = history[history.length - 1]
    const previous = history[history.length - 2]
    const attendanceIsCritical = latest.kehadiranPersen < ATTENDANCE_THRESHOLD
    const gradeDrop = previous.nilaiRataRata > 0
      ? ((previous.nilaiRataRata - latest.nilaiRataRata) / previous.nilaiRataRata) * 100
      : 0
    const gradeDroppedSharply = gradeDrop > GRADE_DROP_THRESHOLD

    if (!attendanceIsCritical && !gradeDroppedSharply) return

    const hasActiveReport = reports.some(
      (report) => report.studentId === (student.id || student.studentId)
        && report.status !== 'selesai'
        && report.status !== 'eskalasi_eksternal',
    )
    if (hasActiveReport) return

    const studentUser = users.find((user) => user.id === (student.id || student.studentId))
    if (!studentUser) return

    const classTeacher = users.find(
      (user) => (user.role === 'wali_kelas' || user.role === 'wali')
        && (user.class || user.kelasId) === (studentUser.class || studentUser.kelasId),
    )
    const assignedTo = classTeacher?.id || 'guru-01'
    const reasons = []
    if (attendanceIsCritical) {
      reasons.push(`kehadiran ${latest.kehadiranPersen}% (di bawah ${ATTENDANCE_THRESHOLD}%)`)
    }
    if (gradeDroppedSharply) {
      reasons.push(`nilai turun ${gradeDrop.toFixed(1)}%`)
    }

    const code = generateReportCode()
    const reportId = `rpt-auto-${Date.now()}-${student.id || student.studentId}`
    const initials = studentUser.initials
      || studentUser.name.split(/\s+/).map((part) => part[0]).join('')

    newReports.push({
      id: reportId,
      code,
      studentId: student.id || student.studentId,
      studentName: studentUser.name || studentUser.nama,
      studentInitials: initials,
      class: studentUser.class || studentUser.kelasId,
      category: 'motivasi',
      description: `[Deteksi dini] Perlu konfirmasi wali kelas: ${reasons.join(' dan ')}.`,
      urgency: 'penting',
      anonymous: false,
      source: 'deteksi',
      channel: 'wali_kelas',
      assignedTo,
      escalatedTo: null,
      status: 'dikirim',
      startDate: null,
      createdAt: now,
      updatedAt: now,
      sessionCount: 0,
      notes: [{
        id: `note-${reportId}`,
        author: 'Sistem',
        role: 'system',
        content: 'Laporan dibuat otomatis oleh sistem deteksi dini.',
        date: now,
        visibleToStudent: false,
      }],
      followUp: null,
      evidence: null,
      detectionReason: reasons.join(' dan '),
    })

    newNotifications.push({
      id: `notif-${reportId}`,
      userId: assignedTo,
      type: 'deteksi_dini',
      title: 'Peringatan deteksi dini',
      message: `${studentUser.name} memerlukan perhatian: ${reasons.join(' dan ')}.`,
      reportCode: code,
      read: false,
      createdAt: now,
    })
  })

  return { newReports, newNotifications }
}

export { ATTENDANCE_THRESHOLD, GRADE_DROP_THRESHOLD }
