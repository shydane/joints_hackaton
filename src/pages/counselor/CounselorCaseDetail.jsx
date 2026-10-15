import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle, ArrowLeft, CheckCircle, ClipboardCheck, HeartHandshake,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import AttendanceChart from '../../components/charts/AttendanceChart'
import GradeChart from '../../components/charts/GradeChart'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EconomicReferralWhatsApp from '../../components/counselor/EconomicReferralWhatsApp'
import FotoGallery from '../../components/ui/FotoGallery'
import Modal from '../../components/ui/Modal'
import TextArea from '../../components/ui/TextArea'
import Timeline from '../../components/ui/Timeline'

const CATEGORY_OPTIONS = [
  { id: 'ekonomi', label: 'Ekonomi', emoji: '💰' },
  { id: 'bullying', label: 'Bullying / Sosial', emoji: '🛡️' },
  { id: 'motivasi', label: 'Kurang Motivasi', emoji: '🌱' },
  { id: 'lainnya', label: 'Lainnya', emoji: '💬' },
]

const CATEGORY_LABELS = Object.fromEntries(CATEGORY_OPTIONS.map(({ id, label, emoji }) => [id, `${emoji} ${label}`]))
const EXTERNAL_TARGETS = ['Kepala Sekolah', 'Orang Tua', 'Psikolog Luar', 'Dinas Terkait']
const STATUS_LABELS = {
  dikirim: 'Baru',
  ditinjau: 'Ditinjau',
  pendampingan: 'Dalam Pendampingan',
  selesai: 'Selesai',
  eskalasi_eksternal: 'Eskalasi Eksternal',
}

export default function CounselorCaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    reports,
    students,
    getNamaTampilan,
    bkAsesmen,
    bkEvaluasi,
    bkEskalasiLanjutan,
    addNotification,
  } = useApp()
  const report = reports.find(item => item.id === id)
  const studentHistory = report
    ? students.find(student => student.studentId === report.studentId)?.riwayatBulanan?.slice(-6) || []
    : []
  const gradeData = studentHistory.map(item => ({ month: item.bulan, value: item.nilaiRataRata }))
  const attendanceData = studentHistory.map(item => ({ month: item.bulan, value: item.kehadiranPersen }))
  const latestAcademicPeriod = [...studentHistory].reverse().find(item => item.periode)

  const [assessmentNote, setAssessmentNote] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(report?.category || 'lainnya')
  const [assessmentVisible, setAssessmentVisible] = useState(false)
  const [sessionNote, setSessionNote] = useState('')
  const [sessionSchedule, setSessionSchedule] = useState('')
  const [closeNote, setCloseNote] = useState('')
  const [externalNote, setExternalNote] = useState('')
  const [externalTarget, setExternalTarget] = useState(EXTERNAL_TARGETS[0])
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false)
  const [aidRecommendation, setAidRecommendation] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [actionFeedback, setActionFeedback] = useState('')
  const confettiPieces = useMemo(() => createConfettiPieces(), [])

  useEffect(() => {
    if (!showConfetti) return undefined
    const timer = window.setTimeout(() => setShowConfetti(false), 3500)
    return () => window.clearTimeout(timer)
  }, [showConfetti])

  useEffect(() => {
    if (!actionFeedback) return undefined
    const timer = window.setTimeout(() => setActionFeedback(''), 4000)
    return () => window.clearTimeout(timer)
  }, [actionFeedback])

  useEffect(() => {
    if (report) setSelectedCategory(report.category || 'lainnya')
  }, [report?.id, report?.category])

  if (!report) {
    return (
      <div className="py-12 text-center">
        <p className="text-ink/50">Kes tidak ditemukan.</p>
        <Button variant="outline" onClick={() => navigate('/bk')} className="mt-3">Kembali ke Dashboard</Button>
      </div>
    )
  }

  const notes = report.notes || []
  const isClosed = ['selesai', 'eskalasi_eksternal'].includes(report.status)
  const mayEvaluate = report.status === 'pendampingan' && !isClosed
  const needsExternalEscalation = report.sessionCount >= 3 && mayEvaluate
  const currentCategory = report.followUp
    ? CATEGORY_OPTIONS.find(option => option.id === report.category)?.id || report.category
    : report.category

  const handleAssessment = () => {
    const note = assessmentNote.trim()
    if (!note) return

    bkAsesmen(report.id, `Asesmen: ${note}`, selectedCategory, assessmentVisible)
    addNotification(
      report.studentId,
      'laporan_dibaca',
      'Laporanmu sedang didampingi',
      'Guru BK telah meninjau laporanmu dan memulai pendampingan.',
      report.code,
    )
    setAssessmentNote('')
    setAssessmentVisible(false)
    setActionFeedback('Asesmen disimpan dan status kes dikemas kini kepada pendampingan.')
  }

  const handlePositiveEvaluation = () => {
    if (!closeNote.trim()) return
    bkEvaluasi(report.id, true, closeNote.trim())
    setIsCloseModalOpen(false)
    setCloseNote('')
    setShowConfetti(true)
    setActionFeedback('Kes selesai. Siswa telah menerima notifikasi.')
  }

  const handleScheduleSession = () => {
    if (!sessionNote.trim() || !sessionSchedule) return
    const formattedSchedule = new Date(sessionSchedule).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    const note = `Sesi konseling lanjutan dijadwalkan pada ${formattedSchedule}. ${sessionNote.trim()}`

    bkEvaluasi(report.id, false, note)
    addNotification(
      report.studentId,
      'konseling_dijadwalkan',
      'Jadwal konseling disiapkan',
      `Sesi konseling lanjutan dijadwalkan pada ${formattedSchedule}.`,
      report.code,
    )
    setIsSessionModalOpen(false)
    setSessionNote('')
    setSessionSchedule('')
    setActionFeedback('Sesi lanjutan dijadualkan dan notifikasi dihantar kepada siswa.')
  }

  const handleExternalEscalation = () => {
    bkEskalasiLanjutan(report.id, externalTarget, externalNote.trim())
    setIsEscalationModalOpen(false)
    setExternalNote('')
    setActionFeedback(`Kes dieskalasi kepada ${externalTarget}. Siswa telah dimaklumkan.`)
  }

  const generateAidRecommendation = () => {
    setAidRecommendation(
      `Sahkan kelayakan keluarga dalam DTKS bersama pihak desa/kelurahan, sediakan dokumen identiti dan bukti keadaan ekonomi, kemudian rujuk keluarga kepada bantuan sosial atau biasiswa pendidikan yang sedang dibuka. Guru BK boleh membantu menyemak dokumen dan menjejaki permohonan.`,
    )
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      {showConfetti && <Confetti pieces={confettiPieces} />}
      {actionFeedback && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          aria-live="polite"
          className="rounded-2xl border-2 border-ink bg-mint-light p-3 text-xs font-semibold shadow-[2px_2px_0_#14213D]"
        >
          {actionFeedback}
        </motion.p>
      )}

      <button
        type="button"
        onClick={() => navigate('/bk')}
        className="flex w-fit items-center gap-1 text-sm text-ink/50 transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} /> Kembali ke Dashboard
      </button>

      <header className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold font-heading">{report.code}</h1>
            <Badge variant={report.status}>{STATUS_LABELS[report.status] || report.status}</Badge>
            {report.urgency === 'mendesak' && <Badge variant="danger">🚨 Mendesak</Badge>}
            {report.source === 'deteksi' && <Badge variant="deteksi">Terdeteksi Otomatis</Badge>}
          </div>
          <p className="mt-1 text-xs text-ink/50">
            {getNamaTampilan(report, 'guru_bk')} · {report.class}
            {report.escalatedTo && ' · Diserahkan Wali Kelas'}
          </p>
          <p className="mt-1 text-xs font-semibold text-ink/60">
            {report.sessionCount || 0} sesi konseling direkodkan
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-bold font-heading">Butiran Aduan</h2>
          <div className="space-y-2 text-xs">
            <DetailRow label="Kategori" value={CATEGORY_LABELS[report.category] || CATEGORY_LABELS.lainnya} />
            <DetailRow label="Status" value={STATUS_LABELS[report.status] || report.status} />
            <DetailRow label="Tarikh mula" value={report.startDate || 'Tidak dinyatakan'} />
            <DetailRow label="Sumber" value={report.escalatedTo ? 'Eskalasi Wali Kelas' : report.source === 'deteksi' ? 'Deteksi Dini' : 'Laporan Siswa'} />
            {report.escalationTarget && <DetailRow label="Eskalasi kepada" value={report.escalationTarget} />}
          </div>
          {report.description && (
            <div className="mt-3 border-t-2 border-ink/10 pt-3">
              <h3 className="mb-1 text-xs font-bold text-ink/60">Cerita Siswa</h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{report.description}</p>
            </div>
          )}
          {report.detectionReason && (
            <div className="mt-3 border-t-2 border-ink/10 pt-3">
              <h3 className="mb-1 text-xs font-bold text-ink/60">Sebab dikesan</h3>
              <p className="text-sm leading-relaxed">{report.detectionReason}</p>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-bold font-heading">Garis Masa Status</h2>
          <Timeline currentStatus={report.status} notes={notes} />
        </Card>
      </section>

      {(report.category === 'bullying' || (Array.isArray(report.category) && report.category.includes('bullying'))) && (
        <FotoGallery photos={report.bukti} anonymous={report.anonymous} />
      )}

      {studentHistory.length > 0 ? (
        <section aria-label="Prestasi akademik dan kehadiran" className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <GradeChart data={gradeData} />
          <AttendanceChart data={attendanceData} />
          {latestAcademicPeriod && (
            <p className="text-xs text-ink/60 md:col-span-2">
              Sumber: CSV wali kelas, periode terakhir: {latestAcademicPeriod.bulan}
            </p>
          )}
        </section>
      ) : (
        <Card color="sky-light">
          <p className="text-sm font-bold">Data prestasi belum tersedia</p>
          <p className="mt-1 text-xs text-ink/60">Rekod nilai dan kehadiran enam bulan pelajar belum tersedia.</p>
        </Card>
      )}

      {!isClosed && (
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold font-heading">
            <ClipboardCheck size={17} /> Form Asesmen Guru BK
          </h2>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 text-xs font-semibold">
              Kategori masalah utama
              <select
                value={selectedCategory}
                onChange={event => setSelectedCategory(event.target.value)}
                className="rounded-xl border-2 border-ink bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sunrise"
              >
                {CATEGORY_OPTIONS.map(option => (
                  <option key={option.id} value={option.id}>{option.emoji} {option.label}</option>
                ))}
              </select>
            </label>
            <TextArea
              label="Hasil konseling / pemanggilan orang tua"
              placeholder="Catat hasil konseling, pemanggilan orang tua, atau pemerhatian awal..."
              value={assessmentNote}
              onChange={event => setAssessmentNote(event.target.value)}
              rows={3}
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-ink/70">
              <input
                type="checkbox"
                checked={assessmentVisible}
                onChange={event => setAssessmentVisible(event.target.checked)}
                className="h-4 w-4 accent-sunrise"
              />
              Tampilkan catatan ke siswa
            </label>
            <Button
              variant="secondary"
              onClick={handleAssessment}
              disabled={!assessmentNote.trim()}
              className="self-start"
            >
              Simpan Asesmen & Mulai Pendampingan
            </Button>
          </div>
        </Card>
      )}

      {report.status === 'pendampingan' && (
        <FollowUpPanel
          category={currentCategory}
          recommendation={aidRecommendation}
          onGenerateAidRecommendation={generateAidRecommendation}
        />
      )}

      {(report.category === 'ekonomi' || selectedCategory === 'ekonomi') && (
        <EconomicReferralWhatsApp
          key={report.id}
          studentName={report.anonymous ? '' : report.studentName || ''}
          caseCode={report.code}
        />
      )}

      {mayEvaluate && (
        <Card color="lemon-light">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-bold font-heading">
            <HeartHandshake size={17} /> Perkembangan Positif?
          </h2>
          <p className="mb-3 text-xs text-ink/60">
            Pilih tindakan berdasarkan perkembangan pelajar. Jika belum positif, tetapkan jadual sesi seterusnya.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="mint"
              icon={CheckCircle}
              onClick={() => { setCloseNote(''); setIsCloseModalOpen(true) }}
            >
              Ya, Selesai
            </Button>
            <Button
              variant="outline"
              onClick={() => { setSessionNote(''); setIsSessionModalOpen(true) }}
            >
              Belum, Jadwalkan Sesi Lanjutan
            </Button>
          </div>
        </Card>
      )}

      {needsExternalEscalation && (
        <Card color="danger-light">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-danger" />
            <div className="flex-1">
              <h2 className="text-sm font-bold text-danger">Had 3 sesi tercapai tanpa kemajuan</h2>
              <p className="mt-1 text-xs text-ink/60">
                Pertimbangkan bantuan lanjut daripada pihak berkaitan. Rekod kes akan kekal untuk rujukan.
              </p>
              <Button
                variant="danger"
                className="mt-3"
                onClick={() => { setExternalTarget(EXTERNAL_TARGETS[0]); setIsEscalationModalOpen(true) }}
              >
                Eskalasi Lanjutan
              </Button>
            </div>
          </div>
        </Card>
      )}

      {notes.length > 0 && (
        <Card>
          <h2 className="mb-3 text-sm font-bold font-heading">Arkib Catatan</h2>
          <div className="flex flex-col gap-2">
            {[...notes].sort((a, b) => new Date(b.date) - new Date(a.date)).map(note => (
              <article key={note.id} className="rounded-xl border-2 border-ink/10 bg-bg p-3">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold">{note.author || 'Catatan sistem'}</span>
                  <Badge variant="default">{note.role === 'wali_kelas' ? 'Wali Kelas' : note.role === 'guru_bk' ? 'Guru BK' : 'Sistem'}</Badge>
                  <Badge variant={note.visibleToStudent ? 'mint' : 'sky'}>
                    {note.visibleToStudent ? 'Terlihat siswa' : 'Catatan internal'}
                  </Badge>
                </div>
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-ink/70">{note.content}</p>
                {note.date && (
                  <p className="mt-1 text-[10px] text-ink/40">
                    {new Date(note.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                )}
              </article>
            ))}
          </div>
        </Card>
      )}

      <Modal isOpen={isCloseModalOpen} onClose={() => setIsCloseModalOpen(false)} title="Sahkan kes selesai">
        <p className="mb-3 text-xs text-ink/60">
          Catatan penutupan akan disimpan, status ditukar kepada selesai, dan siswa akan menerima notifikasi.
        </p>
        <TextArea
          placeholder="Catat perkembangan positif atau rumusan penyelesaian..."
          value={closeNote}
          onChange={event => setCloseNote(event.target.value)}
          rows={4}
        />
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => setIsCloseModalOpen(false)} className="flex-1">Batal</Button>
          <Button variant="mint" onClick={handlePositiveEvaluation} disabled={!closeNote.trim()} className="flex-1">
            Sahkan Selesai
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isSessionModalOpen} onClose={() => setIsSessionModalOpen(false)} title="Jadual Sesi Konseling Lanjutan">
        <p className="mb-3 text-xs text-ink/60">
          Sesi seterusnya ialah sesi ke-{(report.sessionCount || 0) + 1}. Jadual akan dihantar kepada siswa.
        </p>
        <label className="mb-3 flex flex-col gap-1.5 text-xs font-semibold">
          Tarikh dan masa sesi
          <input
            type="datetime-local"
            value={sessionSchedule}
            onChange={event => setSessionSchedule(event.target.value)}
            className="rounded-xl border-2 border-ink bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sunrise"
          />
        </label>
        <TextArea
          label="Catatan / persediaan"
          placeholder="Tulis fokus sesi lanjutan atau perkara yang perlu disediakan..."
          value={sessionNote}
          onChange={event => setSessionNote(event.target.value)}
          rows={3}
        />
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => setIsSessionModalOpen(false)} className="flex-1">Batal</Button>
          <Button variant="lemon" onClick={handleScheduleSession} disabled={!sessionNote.trim() || !sessionSchedule} className="flex-1">
            Jadwalkan & Maklumkan
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isEscalationModalOpen} onClose={() => setIsEscalationModalOpen(false)} title="Eskalasi Lanjutan">
        <p className="mb-3 text-xs text-ink/60">
          Pilih pihak yang akan dilibatkan selepas tiga sesi tanpa kemajuan.
        </p>
        <label className="mb-3 flex flex-col gap-1.5 text-xs font-semibold">
          Tujuan eskalasi
          <select
            value={externalTarget}
            onChange={event => setExternalTarget(event.target.value)}
            className="rounded-xl border-2 border-ink bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sunrise"
          >
            {EXTERNAL_TARGETS.map(target => <option key={target} value={target}>{target}</option>)}
          </select>
        </label>
        <TextArea
          label="Catatan tambahan (pilihan)"
          placeholder="Ringkasan alasan atau maklumat yang perlu diketahui..."
          value={externalNote}
          onChange={event => setExternalNote(event.target.value)}
          rows={3}
        />
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => setIsEscalationModalOpen(false)} className="flex-1">Batal</Button>
          <Button variant="danger" onClick={handleExternalEscalation} className="flex-1">Sahkan Eskalasi</Button>
        </div>
      </Modal>
    </div>
  )
}

function FollowUpPanel({ category, recommendation, onGenerateAidRecommendation }) {
  const content = {
    ekonomi: {
      title: 'Alur Bantuan Ekonomi & Pendidikan',
      description: 'Semak dokumen keluarga, bantu proses permohonan biasiswa, dan hubungkan keluarga dengan sokongan desa.',
    },
    bullying: {
      title: 'Panduan Pendampingan Mental & Penindakan',
      description: 'Utamakan keselamatan siswa, sediakan ruang konseling, dokumentasikan kejadian, dan koordinasikan penindakan yang adil.',
    },
    motivasi: {
      title: 'Program Penguatan Belajar & Motivasi',
      description: 'Bina sasaran belajar kecil bersama siswa, jadual bimbingan, dan semakan kemajuan secara berkala.',
    },
    lainnya: {
      title: 'Rencana Penanganan Kustom',
      description: 'Susun langkah dan pihak pendukung berdasarkan asesmen khusus untuk kasus ini.',
    },
  }[category] || {
    title: 'Rencana Penanganan Kustom',
    description: 'Susun langkah dan pihak pendukung berdasarkan asesmen khusus untuk kasus ini.',
  }

  return (
    <Card color="sky-light">
      <h2 className="mb-2 text-sm font-bold font-heading">Tindak Lanjut Spesifik</h2>
      <h3 className="text-sm font-bold">{content.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-ink/70">{content.description}</p>
      {category === 'ekonomi' && (
        <div className="mt-3">
          <Button variant="secondary" onClick={onGenerateAidRecommendation}>
            Jana Rekomendasi DTKS / Bansos Desa
          </Button>
          {recommendation && (
            <p role="status" className="mt-3 rounded-xl border-2 border-ink bg-white p-3 text-xs leading-relaxed">
              {recommendation}
            </p>
          )}
        </div>
      )}
    </Card>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-28 shrink-0 text-ink/50">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function createConfettiPieces() {
  const colors = ['#FF7A3D', '#7CC6FE', '#FFD966', '#8EE3C2']
  return Array.from({ length: 22 }, (_, id) => ({
    id,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 0.8,
    duration: 1.8 + Math.random() * 1.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
    radius: Math.random() > 0.5 ? '50%' : '2px',
  }))
}

function Confetti({ pieces }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map(piece => (
        <motion.div
          key={piece.id}
          initial={{ y: -20, opacity: 1 }}
          animate={{ y: '100vh', x: [0, 20, -15, 10], opacity: [1, 1, 0] }}
          transition={{ duration: piece.duration, delay: piece.delay, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: piece.left,
            top: -20,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: piece.radius,
            rotate: piece.rotation,
          }}
        />
      ))}
    </div>
  )
}
