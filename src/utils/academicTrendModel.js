const MINIMUM_MONTHS = 3

function monthIndex(period) {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(period || '')
  if (!match) return null
  return Number(match[1]) * 12 + Number(match[2]) - 1
}

function periodFromIndex(index) {
  const year = Math.floor(index / 12)
  const month = (index % 12) + 1
  return `${year}-${String(month).padStart(2, '0')}`
}

function fitLinearTrend(points) {
  const validPoints = points
    .filter(point => Number.isFinite(point.x) && Number.isFinite(point.y))
    .sort((first, second) => first.x - second.x)
  if (validPoints.length < MINIMUM_MONTHS) return null

  const meanX = validPoints.reduce((sum, point) => sum + point.x, 0) / validPoints.length
  const meanY = validPoints.reduce((sum, point) => sum + point.y, 0) / validPoints.length
  const denominator = validPoints.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0)
  if (denominator === 0) return null

  const slope = validPoints.reduce(
    (sum, point) => sum + (point.x - meanX) * (point.y - meanY),
    0,
  ) / denominator
  const intercept = meanY - slope * meanX
  const nextMonthIndex = validPoints[validPoints.length - 1].x + 1
  const prediction = Math.max(0, Math.min(100, intercept + slope * nextMonthIndex))

  return {
    value: Number(prediction.toFixed(1)),
    slope: Number(slope.toFixed(2)),
    periods: validPoints.length,
    nextPeriod: periodFromIndex(nextMonthIndex),
    trend: slope > 0.5 ? 'naik' : slope < -0.5 ? 'turun' : 'stabil',
  }
}

function addMonthlyValue(monthsByStudent, studentId, period, field, value) {
  const index = monthIndex(period)
  if (index === null || !Number.isFinite(value) || value < 0 || value > 100) return

  if (!monthsByStudent.has(studentId)) monthsByStudent.set(studentId, new Map())
  const studentMonths = monthsByStudent.get(studentId)
  if (!studentMonths.has(period)) studentMonths.set(period, { x: index, period })
  studentMonths.get(period)[field] = value
}

export function trainAcademicTrendModel({
  students,
  users,
  gradeRecords,
  attendanceRecords,
  className,
}) {
  const classStudents = users.filter(user => user.role === 'siswa' && user.class === className)
  const classStudentIds = new Set(classStudents.map(user => user.id))
  const monthsByStudent = new Map()

  students.forEach(student => {
    if (!classStudentIds.has(student.studentId)) return
    ;(student.riwayatBulanan || []).forEach(entry => {
      if (!entry.periode) return
      addMonthlyValue(
        monthsByStudent,
        student.studentId,
        entry.periode,
        'grade',
        Number(entry.nilaiRataRata),
      )
      addMonthlyValue(
        monthsByStudent,
        student.studentId,
        entry.periode,
        'attendance',
        Number(entry.kehadiranPersen),
      )
    })
  })

  const gradeBuckets = new Map()
  gradeRecords
    .filter(record => record.class === className)
    .forEach(record => {
      const index = monthIndex(record.date?.slice(0, 7))
      if (index === null) return
      Object.entries(record.scores || {}).forEach(([studentId, score]) => {
        if (!classStudentIds.has(studentId)) return
        const numericScore = Number(score)
        if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 100) return
        const key = `${studentId}|${record.date.slice(0, 7)}`
        const bucket = gradeBuckets.get(key) || { total: 0, count: 0, studentId, period: record.date.slice(0, 7) }
        bucket.total += numericScore
        bucket.count += 1
        gradeBuckets.set(key, bucket)
      })
    })

  gradeBuckets.forEach(bucket => {
    addMonthlyValue(monthsByStudent, bucket.studentId, bucket.period, 'grade', bucket.total / bucket.count)
  })

  const attendanceBuckets = new Map()
  attendanceRecords
    .filter(record => record.class === className)
    .forEach(record => {
      const period = record.date?.slice(0, 7)
      if (monthIndex(period) === null) return
      Object.entries(record.attendance || {}).forEach(([studentId, status]) => {
        if (!classStudentIds.has(studentId) || !['hadir', 'izin', 'sakit', 'alpa'].includes(status)) return
        const key = `${studentId}|${period}`
        const bucket = attendanceBuckets.get(key) || { present: 0, total: 0, studentId, period }
        bucket.total += 1
        if (status === 'hadir') bucket.present += 1
        attendanceBuckets.set(key, bucket)
      })
    })

  attendanceBuckets.forEach(bucket => {
    addMonthlyValue(
      monthsByStudent,
      bucket.studentId,
      bucket.period,
      'attendance',
      (bucket.present / bucket.total) * 100,
    )
  })

  const predictions = classStudents.map(student => {
    const monthlyHistory = [...(monthsByStudent.get(student.id)?.values() || [])]
      .sort((first, second) => first.x - second.x)
    return {
      studentId: student.id,
      name: student.name,
      grade: fitLinearTrend(monthlyHistory
        .filter(point => Number.isFinite(point.grade))
        .map(point => ({ x: point.x, y: point.grade }))),
      attendance: fitLinearTrend(monthlyHistory
        .filter(point => Number.isFinite(point.attendance))
        .map(point => ({ x: point.x, y: point.attendance }))),
    }
  })

  return {
    trainedAt: new Date().toISOString(),
    className,
    minimumMonths: MINIMUM_MONTHS,
    trainedStudents: predictions.filter(item => item.grade || item.attendance).length,
    gradeModels: predictions.filter(item => item.grade).length,
    attendanceModels: predictions.filter(item => item.attendance).length,
    predictions,
  }
}
