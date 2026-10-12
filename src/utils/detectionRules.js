/**
 * Aturan deteksi dini otomatis.
 * Dipanggil oleh dashboard wali kelas untuk menampilkan peringatan.
 */

// Ambang batas kehadiran (persen)
const ATTENDANCE_THRESHOLD = 80

// Ambang batas penurunan nilai (persen) dalam sebulan
const GRADE_DROP_THRESHOLD = 15

/**
 * Cek apakah siswa berisiko berdasarkan data metrik.
 * @param {Object} metrics - Data grades & attendance siswa
 * @returns {{ isAtRisk: boolean, reasons: string[] }}
 */
export function checkStudentRisk(metrics) {
  const reasons = []

  if (!metrics) return { isAtRisk: false, reasons }

  // Cek kehadiran bulan terakhir
  const latestAttendance = metrics.attendance[metrics.attendance.length - 1]
  if (latestAttendance && latestAttendance.value < ATTENDANCE_THRESHOLD) {
    reasons.push(`Kehadiran ${latestAttendance.value}% (di bawah ${ATTENDANCE_THRESHOLD}%)`)
  }

  // Cek penurunan nilai
  const grades = metrics.grades
  if (grades.length >= 2) {
    const prev = grades[grades.length - 2].value
    const curr = grades[grades.length - 1].value
    const dropPercent = ((prev - curr) / prev) * 100
    if (dropPercent > GRADE_DROP_THRESHOLD) {
      reasons.push(`Nilai turun ${dropPercent.toFixed(0)}% dalam sebulan terakhir`)
    }
  }

  return {
    isAtRisk: reasons.length > 0,
    reasons,
  }
}

export { ATTENDANCE_THRESHOLD, GRADE_DROP_THRESHOLD }
