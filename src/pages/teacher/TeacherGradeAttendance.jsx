import { useEffect, useState } from 'react'
import { ClipboardCheck, Download, GraduationCap, Sparkles } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { trainAcademicTrendModel } from '../../utils/academicTrendModel'

const ATTENDANCE_OPTIONS = [
  { value: 'hadir', label: 'Hadir' },
  { value: 'izin', label: 'Izin' },
  { value: 'sakit', label: 'Sakit' },
  { value: 'alpa', label: 'Alpa' },
]

function getToday() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createAttendanceId(className, date) {
  return `${className}|${date}`
}

function createGradeId(className, date, subject, assessment) {
  return `${className}|${date}|${subject.trim().toLocaleLowerCase()}|${assessment.trim().toLocaleLowerCase()}`
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function escapeCsv(value) {
  let text = String(value ?? '')
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[;"\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function formatCsvNumber(value) {
  return Number(value).toLocaleString('id-ID', { maximumFractionDigits: 2 })
}

function StatusBadge({ status }) {
  const variants = { hadir: 'mint', izin: 'sky', sakit: 'lemon', alpa: 'danger' }
  const label = ATTENDANCE_OPTIONS.find(option => option.value === status)?.label || 'Belum diisi'
  return <Badge variant={variants[status] || 'lemon'}>{label}</Badge>
}

export default function TeacherGradeAttendance() {
  const { currentUser, users, students } = useApp()
  const [savedGrades, setSavedGrades] = useLocalStorage('ls_manual_grade_records', [])
  const [savedAttendance, setSavedAttendance] = useLocalStorage('ls_manual_attendance_records', [])
  const [activeTab, setActiveTab] = useState('grades')
  const [gradeDate, setGradeDate] = useState(getToday)
  const [subject, setSubject] = useState('')
  const [assessment, setAssessment] = useState('')
  const [scores, setScores] = useState({})
  const [gradeMessage, setGradeMessage] = useState('')
  const [attendanceDate, setAttendanceDate] = useState(getToday)
  const [attendanceStatuses, setAttendanceStatuses] = useState({})
  const [attendanceMessage, setAttendanceMessage] = useState('')
  const [trainedModel, setTrainedModel] = useState(null)
  const [trainingMessage, setTrainingMessage] = useState('')

  const gradeRecords = Array.isArray(savedGrades) ? savedGrades : []
  const attendanceRecords = Array.isArray(savedAttendance) ? savedAttendance : []
  const classStudents = users
    .filter(user => user.role === 'siswa' && user.class === currentUser?.class)
    .sort((first, second) => first.name.localeCompare(second.name, 'id'))
  const attendanceId = createAttendanceId(currentUser?.class || '', attendanceDate)
  const selectedAttendance = attendanceRecords.find(record => record.id === attendanceId)
  const classGradeRecords = gradeRecords
    .filter(record => record.class === currentUser?.class)
    .sort((first, second) => second.date.localeCompare(first.date) || second.updatedAt.localeCompare(first.updatedAt))
  const classAttendanceRecords = attendanceRecords
    .filter(record => record.class === currentUser?.class)
    .sort((first, second) => second.date.localeCompare(first.date))
  const subjectSummaries = classGradeRecords.reduce((summaries, record) => {
    const subjectKey = record.subject.trim().toLocaleLowerCase()
    if (!summaries[subjectKey]) {
      summaries[subjectKey] = {
        subject: record.subject,
        assessmentCount: 0,
        totalScore: 0,
        scoreCount: 0,
        students: {},
      }
    }

    const summary = summaries[subjectKey]
    summary.assessmentCount += 1
    Object.entries(record.scores || {}).forEach(([studentId, score]) => {
      const numericScore = Number(score)
      if (!classStudents.some(student => student.id === studentId) || !Number.isFinite(numericScore)) return
      summary.totalScore += numericScore
      summary.scoreCount += 1
      if (!summary.students[studentId]) summary.students[studentId] = { total: 0, count: 0 }
      summary.students[studentId].total += numericScore
      summary.students[studentId].count += 1
    })
    return summaries
  }, {})

  useEffect(() => {
    setAttendanceStatuses(selectedAttendance?.attendance || {})
  }, [attendanceDate, selectedAttendance])

  const handleGradeSubmit = event => {
    event.preventDefault()
    setGradeMessage('')

    if (!subject.trim() || !assessment.trim()) {
      setGradeMessage('Mata pelajaran dan jenis penilaian wajib diisi.')
      return
    }

    const enteredScores = Object.entries(scores)
      .filter(([, value]) => value !== '' && value !== undefined)
      .map(([studentId, value]) => ({ studentId, score: Number(value) }))

    if (enteredScores.length === 0) {
      setGradeMessage('Masukkan nilai untuk setidaknya satu siswa.')
      return
    }
    if (enteredScores.some(({ score }) => !Number.isFinite(score) || score < 0 || score > 100)) {
      setGradeMessage('Nilai harus berupa angka antara 0 dan 100.')
      return
    }
    if (enteredScores.some(({ studentId }) => !classStudents.some(student => student.id === studentId))) {
      setGradeMessage('Daftar siswa berubah. Muat ulang halaman lalu coba kembali.')
      return
    }

    const id = createGradeId(currentUser.class, gradeDate, subject, assessment)
    const previousRecord = gradeRecords.find(record => record.id === id)
    const record = {
      id,
      class: currentUser.class,
      teacherId: currentUser.id,
      date: gradeDate,
      subject: subject.trim(),
      assessment: assessment.trim(),
      scores: {
        ...(previousRecord?.scores || {}),
        ...Object.fromEntries(enteredScores.map(({ studentId, score }) => [studentId, score])),
      },
      updatedAt: new Date().toISOString(),
    }
    setSavedGrades(previous => {
      const records = Array.isArray(previous) ? previous : []
      return [record, ...records.filter(item => item.id !== id)]
    })
    setTrainedModel(null)
    setGradeMessage('Nilai berhasil disimpan.')
  }

  const handleTrainModel = () => {
    try {
      const model = trainAcademicTrendModel({
        students,
        users,
        gradeRecords,
        attendanceRecords,
        className: currentUser.class,
      })
      setTrainedModel(model)
      setTrainingMessage(model.trainedStudents > 0
        ? 'Pelatihan selesai. Prediksi dihitung dari data bulanan kelas yang tersedia.'
        : 'Belum ada siswa dengan minimal 3 periode bulanan untuk melatih prediksi.')
    } catch (error) {
      console.error('Gagal melatih model tren akademik:', error)
      setTrainedModel(null)
      setTrainingMessage('Model tren gagal dilatih. Periksa data akademik lalu coba lagi.')
    }
  }

  const handleDownloadGradeSummary = () => {
    const records = [...classGradeRecords].sort((first, second) => (
      first.date.localeCompare(second.date) ||
      first.subject.localeCompare(second.subject, 'id') ||
      first.assessment.localeCompare(second.assessment, 'id')
    ))
    const subjects = [...new Map(records.map(record => [
      record.subject.trim().toLocaleLowerCase(),
      record.subject,
    ]))]
    const headers = [
      'ID siswa',
      'Nama siswa',
      'Kelas',
      ...subjects.flatMap(([subjectKey, subjectName]) => [
        `Rata-rata ${subjectName}`,
        ...records
          .filter(record => record.subject.trim().toLocaleLowerCase() === subjectKey)
          .map(record => `${record.assessment} (${record.date})`),
      ]),
    ]
    const rows = classStudents.map(student => [
      student.id,
      student.name,
      currentUser.class,
      ...subjects.flatMap(([subjectKey]) => {
        const subjectRecords = records.filter(record => (
          record.subject.trim().toLocaleLowerCase() === subjectKey &&
          Object.hasOwn(record.scores || {}, student.id)
        ))
        const average = subjectRecords.length
          ? formatCsvNumber(subjectRecords.reduce((sum, record) => sum + Number(record.scores[student.id]), 0) / subjectRecords.length)
          : ''
        return [
          average,
          ...records
            .filter(record => record.subject.trim().toLocaleLowerCase() === subjectKey)
            .map(record => Object.hasOwn(record.scores || {}, student.id)
              ? formatCsvNumber(record.scores[student.id])
              : ''),
        ]
      }),
    ])
    const csv = [headers, ...rows]
      .map(row => row.map(escapeCsv).join(';'))
      .join('\r\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rekap-nilai-${currentUser.class.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleAttendanceSubmit = event => {
    event.preventDefault()
    setAttendanceMessage('')

    const incompleteStudent = classStudents.find(student => !attendanceStatuses[student.id])
    if (classStudents.length === 0) {
      setAttendanceMessage('Belum ada siswa pada kelas ini.')
      return
    }
    if (incompleteStudent) {
      setAttendanceMessage(`Pilih status kehadiran untuk ${incompleteStudent.name}.`)
      return
    }

    const record = {
      id: attendanceId,
      class: currentUser.class,
      teacherId: currentUser.id,
      date: attendanceDate,
      attendance: Object.fromEntries(classStudents.map(student => [
        student.id,
        attendanceStatuses[student.id],
      ])),
      updatedAt: new Date().toISOString(),
    }
    setSavedAttendance(previous => {
      const records = Array.isArray(previous) ? previous : []
      return [record, ...records.filter(item => item.id !== attendanceId)]
    })
    setTrainedModel(null)
    setAttendanceMessage('Daftar kehadiran berhasil disimpan.')
  }

  const handleAttendanceDateChange = event => {
    setAttendanceDate(event.target.value)
    setAttendanceMessage('')
  }

  const updateAttendance = (studentId, status) => {
    setAttendanceStatuses(previous => ({ ...previous, [studentId]: status }))
    setAttendanceMessage('')
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold font-heading">Nilai &amp; Absensi</h1>
        <p className="mt-1 text-xs text-ink/60">
          Kelola nilai dan kehadiran siswa kelas {currentUser?.class}.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Data siswa">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'grades'}
          onClick={() => setActiveTab('grades')}
          className={`inline-flex items-center gap-2 rounded-xl border-2 border-ink px-4 py-2 text-sm font-bold shadow-neo-sm ${
            activeTab === 'grades' ? 'bg-sunrise text-white' : 'bg-white hover:bg-sunrise-light'
          }`}
        >
          <GraduationCap size={18} />
          Input Nilai
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'attendance'}
          onClick={() => setActiveTab('attendance')}
          className={`inline-flex items-center gap-2 rounded-xl border-2 border-ink px-4 py-2 text-sm font-bold shadow-neo-sm ${
            activeTab === 'attendance' ? 'bg-sunrise text-white' : 'bg-white hover:bg-sunrise-light'
          }`}
        >
          <ClipboardCheck size={18} />
          Absensi Harian
        </button>
      </div>

      {activeTab === 'grades' ? (
        <>
          <Card color="sky-light">
            <h2 className="font-bold">Input nilai siswa</h2>
            <p className="mt-1 text-xs text-ink/60">
              Nilai yang dikosongkan tidak akan mengubah data siswa pada penilaian ini.
            </p>
          </Card>

          <form onSubmit={handleGradeSubmit} className="flex flex-col gap-4">
            <Card>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="flex flex-col gap-1.5 text-sm font-semibold">
                  Tanggal penilaian
                  <input
                    type="date"
                    required
                    value={gradeDate}
                    onChange={event => setGradeDate(event.target.value)}
                    className="rounded-xl border-2 border-ink bg-white px-3 py-2.5 focus:border-sunrise focus:outline-none focus:ring-2 focus:ring-sunrise"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-semibold">
                  Mata pelajaran
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={subject}
                    onChange={event => setSubject(event.target.value)}
                    placeholder="Contoh: Matematika"
                    className="rounded-xl border-2 border-ink bg-white px-3 py-2.5 focus:border-sunrise focus:outline-none focus:ring-2 focus:ring-sunrise"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-semibold">
                  Jenis penilaian
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={assessment}
                    onChange={event => setAssessment(event.target.value)}
                    placeholder="Contoh: Ulangan harian 1"
                    className="rounded-xl border-2 border-ink bg-white px-3 py-2.5 focus:border-sunrise focus:outline-none focus:ring-2 focus:ring-sunrise"
                  />
                </label>
              </div>

              <div className="mt-5 overflow-x-auto">
                {classStudents.length === 0 ? (
                  <p className="text-sm text-ink/60">Belum ada siswa pada kelas ini.</p>
                ) : (
                  <table className="w-full min-w-[420px] text-left text-sm">
                    <thead>
                      <tr className="border-b-2 border-ink/20">
                        <th scope="col" className="p-2">Nama siswa</th>
                        <th scope="col" className="p-2">ID</th>
                        <th scope="col" className="w-36 p-2">Nilai (0–100)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classStudents.map(student => (
                        <tr key={student.id} className="border-b border-ink/10">
                          <th scope="row" className="p-2 font-semibold">{student.name}</th>
                          <td className="p-2 text-xs text-ink/60">{student.id}</td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              inputMode="decimal"
                              aria-label={`Nilai ${student.name}`}
                              value={scores[student.id] ?? ''}
                              onChange={event => setScores(previous => ({
                                ...previous,
                                [student.id]: event.target.value,
                              }))}
                              className="w-full rounded-lg border-2 border-ink bg-white px-3 py-2 focus:border-sunrise focus:outline-none focus:ring-2 focus:ring-sunrise"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {gradeMessage && (
                <p className="mt-3 text-sm font-semibold text-ink/80" role="status" aria-live="polite">
                  {gradeMessage}
                </p>
              )}
              <Button type="submit" className="mt-4" disabled={classStudents.length === 0}>
                Simpan nilai
              </Button>
            </Card>
          </form>

          <Card color="lemon-light">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <h2 className="flex items-center gap-2 font-bold">
                  <Sparkles size={18} />
                  Prediksi tren nilai &amp; kehadiran
                </h2>
                <p className="mt-1 max-w-3xl text-xs leading-relaxed text-ink/70">
                  Latih model tren linear sederhana dari riwayat bulanan tersimpan dan data input nilai
                  serta absensi. Prediksi bulan berikutnya adalah estimasi, bukan kepastian; tiap metrik
                  membutuhkan minimal 3 periode bulanan.
                </p>
              </div>
              <Button
                variant="secondary"
                icon={Sparkles}
                onClick={handleTrainModel}
                disabled={!currentUser?.class}
              >
                Latih model tren
              </Button>
            </div>
            {trainingMessage && (
              <p role="status" aria-live="polite" className="mt-3 text-xs font-semibold text-ink/80">
                {trainingMessage}
              </p>
            )}
            {trainedModel && trainedModel.trainedStudents > 0 && (
              <div className="mt-4">
                <p className="mb-3 text-[11px] text-ink/60">
                  Dilatih: {new Date(trainedModel.trainedAt).toLocaleString('id-ID')} ·{' '}
                  {trainedModel.gradeModels} prediksi nilai · {trainedModel.attendanceModels} prediksi kehadiran
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {trainedModel.predictions
                    .filter(result => result.grade || result.attendance)
                    .map(result => (
                      <article key={result.studentId} className="rounded-xl border-2 border-ink/15 bg-white p-3">
                        <h3 className="mb-2 text-sm font-bold">{result.name}</h3>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {[
                            { label: 'Nilai', prediction: result.grade },
                            { label: 'Kehadiran', prediction: result.attendance },
                          ].map(({ label, prediction }) => (
                            <div key={label} className="rounded-lg bg-bg p-2">
                              <p className="text-[10px] font-semibold text-ink/55">{label}</p>
                              {prediction ? (
                                <>
                                  <p className="mt-0.5 text-sm font-extrabold">
                                    {prediction.value}{label === 'Kehadiran' ? '%' : ''}
                                  </p>
                                  <div className="mt-1 flex flex-wrap items-center gap-1">
                                    <Badge variant={{
                                      naik: 'mint',
                                      turun: 'sunrise',
                                      stabil: 'sky',
                                    }[prediction.trend]}>
                                      Tren {prediction.trend}
                                    </Badge>
                                    <span className="text-[9px] text-ink/50">
                                      {prediction.periods} bulan · {prediction.nextPeriod}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <p className="mt-1 text-[10px] text-ink/55">
                                  Data bulanan belum cukup
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            )}
          </Card>

          <section aria-labelledby="grade-summary-title">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 id="grade-summary-title" className="text-lg font-bold font-heading">Rekap nilai per mata pelajaran</h2>
              <Button
                size="sm"
                variant="outline"
                icon={Download}
                onClick={handleDownloadGradeSummary}
                disabled={classStudents.length === 0 || classGradeRecords.length === 0}
              >
                Unduh rekap Excel (CSV)
              </Button>
            </div>
            {Object.keys(subjectSummaries).length === 0 ? (
              <Card><p className="text-sm text-ink/60">Rekap akan muncul setelah nilai disimpan.</p></Card>
            ) : (
              <div className="space-y-3">
                {Object.values(subjectSummaries).map(summary => (
                  <Card key={summary.subject.toLocaleLowerCase()} className="!p-4">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold">{summary.subject}</h3>
                        <p className="mt-1 text-xs text-ink/60">
                          {summary.assessmentCount} penilaian · {summary.scoreCount} nilai tercatat
                        </p>
                      </div>
                      <Badge variant="mint">
                        Rata-rata kelas: {summary.scoreCount > 0
                          ? (summary.totalScore / summary.scoreCount).toFixed(1)
                          : '—'}
                      </Badge>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[360px] text-left text-xs">
                        <thead>
                          <tr className="border-b-2 border-ink/20">
                            <th scope="col" className="p-2">Nama siswa</th>
                            <th scope="col" className="p-2">Jumlah nilai</th>
                            <th scope="col" className="p-2">Rata-rata</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classStudents.map(student => {
                            const studentSummary = summary.students[student.id]
                            return (
                              <tr key={student.id} className="border-b border-ink/10">
                                <th scope="row" className="p-2 font-medium">{student.name}</th>
                                <td className="p-2">{studentSummary?.count || 0}</td>
                                <td className="p-2">
                                  {studentSummary
                                    ? (studentSummary.total / studentSummary.count).toFixed(1)
                                    : '—'}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="grade-history-title">
            <h2 id="grade-history-title" className="mb-3 text-lg font-bold font-heading">Riwayat nilai</h2>
            {classGradeRecords.length === 0 ? (
              <Card><p className="text-sm text-ink/60">Belum ada nilai yang disimpan.</p></Card>
            ) : (
              <div className="space-y-3">
                {classGradeRecords.map(record => (
                  <Card key={record.id} className="!p-4">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold">{record.subject} — {record.assessment}</h3>
                        <p className="mt-1 text-xs text-ink/60">{formatDate(record.date)}</p>
                      </div>
                      <Badge variant="sky">{Object.keys(record.scores).length} siswa dinilai</Badge>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[320px] text-left text-xs">
                        <thead>
                          <tr className="border-b-2 border-ink/20">
                            <th scope="col" className="p-2">Nama siswa</th>
                            <th scope="col" className="p-2">Nilai</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classStudents
                            .filter(student => Object.hasOwn(record.scores, student.id))
                            .map(student => (
                              <tr key={student.id} className="border-b border-ink/10">
                                <th scope="row" className="p-2 font-medium">{student.name}</th>
                                <td className="p-2">{record.scores[student.id]}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <>
          <Card color="mint-light">
            <h2 className="font-bold">Absensi harian siswa</h2>
            <p className="mt-1 text-xs text-ink/60">
              Pilih tanggal dan tentukan status setiap siswa. Data pada tanggal yang sama dapat diperbarui.
            </p>
          </Card>

          <form onSubmit={handleAttendanceSubmit}>
            <Card>
              <label className="flex max-w-sm flex-col gap-1.5 text-sm font-semibold">
                Tanggal absensi
                <input
                  type="date"
                  required
                  value={attendanceDate}
                  onChange={handleAttendanceDateChange}
                  className="rounded-xl border-2 border-ink bg-white px-3 py-2.5 focus:border-sunrise focus:outline-none focus:ring-2 focus:ring-sunrise"
                />
              </label>
              <div className="mt-5 overflow-x-auto">
                {classStudents.length === 0 ? (
                  <p className="text-sm text-ink/60">Belum ada siswa pada kelas ini.</p>
                ) : (
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead>
                      <tr className="border-b-2 border-ink/20">
                        <th scope="col" className="p-2">Nama siswa</th>
                        <th scope="col" className="p-2">ID</th>
                        <th scope="col" className="min-w-40 p-2">Status kehadiran</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classStudents.map(student => (
                        <tr key={student.id} className="border-b border-ink/10">
                          <th scope="row" className="p-2 font-semibold">{student.name}</th>
                          <td className="p-2 text-xs text-ink/60">{student.id}</td>
                          <td className="p-2">
                            <select
                              aria-label={`Status kehadiran ${student.name}`}
                              value={attendanceStatuses[student.id] || ''}
                              onChange={event => updateAttendance(student.id, event.target.value)}
                              className="w-full rounded-lg border-2 border-ink bg-white px-3 py-2 focus:border-sunrise focus:outline-none focus:ring-2 focus:ring-sunrise"
                            >
                              <option value="">Pilih status</option>
                              {ATTENDANCE_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {attendanceMessage && (
                <p className="mt-3 text-sm font-semibold text-ink/80" role="status" aria-live="polite">
                  {attendanceMessage}
                </p>
              )}
              <Button type="submit" className="mt-4" disabled={classStudents.length === 0}>
                Simpan absensi
              </Button>
            </Card>
          </form>

          <section aria-labelledby="attendance-history-title">
            <h2 id="attendance-history-title" className="mb-3 text-lg font-bold font-heading">Riwayat absensi</h2>
            {classAttendanceRecords.length === 0 ? (
              <Card><p className="text-sm text-ink/60">Belum ada absensi yang disimpan.</p></Card>
            ) : (
              <div className="space-y-3">
                {classAttendanceRecords.map(record => {
                  const counts = ATTENDANCE_OPTIONS.map(option => ({
                    ...option,
                    count: Object.values(record.attendance).filter(status => status === option.value).length,
                  }))
                  return (
                    <Card key={record.id} className="!p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-bold">{formatDate(record.date)}</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {counts.map(item => (
                            <Badge key={item.value} variant={{ hadir: 'mint', izin: 'sky', sakit: 'lemon', alpa: 'danger' }[item.value]}>
                              {item.label}: {item.count}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[320px] text-left text-xs">
                          <thead>
                            <tr className="border-b-2 border-ink/20">
                              <th scope="col" className="p-2">Nama siswa</th>
                              <th scope="col" className="p-2">Kehadiran</th>
                            </tr>
                          </thead>
                          <tbody>
                            {classStudents.map(student => (
                              <tr key={student.id} className="border-b border-ink/10">
                                <th scope="row" className="p-2 font-medium">{student.name}</th>
                                <td className="p-2">
                                  <StatusBadge status={record.attendance[student.id]} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
