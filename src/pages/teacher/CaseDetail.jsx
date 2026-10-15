import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, CheckCircle, ArrowUpRight, MessageCircle,
  User, Calendar, Tag
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import TextArea from '../../components/ui/TextArea'
import Modal from '../../components/ui/Modal'
import Timeline from '../../components/ui/Timeline'
import GradeChart from '../../components/charts/GradeChart'
import AttendanceChart from '../../components/charts/AttendanceChart'
import FotoGallery from '../../components/ui/FotoGallery'

/**
 * Detail kasus untuk wali kelas.
 * Menampilkan info kasus, grafik, dan aksi (selesai / eskalasi).
 */
const categoryLabels = {
  ekonomi: '💰 Ekonomi',
  bullying: '😰 Bullying / Sosial',
  motivasi: '😔 Kurang Motivasi',
  lainnya: '💬 Lainnya',
}

const statusLabels = {
  dikirim: 'Dikirim',
  ditinjau: 'Ditinjau',
  pendampingan: 'Dalam Pendampingan',
  selesai: 'Selesai',
  eskalasi_eksternal: 'Eskalasi Eksternal',
}

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    reports,
    currentUser,
    students,
    getNamaTampilan,
    updateReportStatus,
    walikelasTandaiTeratasi,
    walikelasEskalasi,
  } = useApp()

  const report = reports.find(r => r.id === id)
  const studentMetrics = report
    ? students.find(student => student.studentId === report.studentId)?.riwayatBulanan?.slice(-6) || []
    : []
  const gradeData = studentMetrics.map(item => ({ month: item.bulan, value: item.nilaiRataRata }))
  const attendanceData = studentMetrics.map(item => ({ month: item.bulan, value: item.kehadiranPersen }))

  const [showResolveModal, setShowResolveModal] = useState(false)
  const [showEscalateModal, setShowEscalateModal] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [approachNote, setApproachNote] = useState('')
  const [approachVisible, setApproachVisible] = useState(false)
  const [resolvedFeedback, setResolvedFeedback] = useState(false)
  const [actionFeedback, setActionFeedback] = useState('')

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-ink/50">Kasus tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate('/guru')} className="mt-3">Kembali</Button>
      </div>
    )
  }

  // Catat pendekatan personal
  const handleAddNote = () => {
    if (!approachNote.trim()) return
    updateReportStatus(report.id, report.status === 'dikirim' ? 'ditinjau' : report.status, {
      author: currentUser.name,
      role: 'wali_kelas',
      content: approachNote,
      visibleToStudent: approachVisible,
    })
    setApproachNote('')
    setApproachVisible(false)
    setActionFeedback('Catatan pendekatan berjaya disimpan.')
  }

  // Kasus teratasi → selesai
  const handleResolve = () => {
    if (!noteText.trim()) return
    walikelasTandaiTeratasi(report.id, noteText.trim())
    setShowResolveModal(false)
    setNoteText('')
    setResolvedFeedback(true)
    window.setTimeout(() => setResolvedFeedback(false), 3500)
  }

  // Eskalasi ke BK
  const handleEscalate = () => {
    if (!noteText.trim()) return
    walikelasEskalasi(report.id, noteText.trim())
    setShowEscalateModal(false)
    setNoteText('')
    setActionFeedback('Kes telah diserahkan kepada Guru BK dan siswa telah dimaklumkan.')
  }

  const isActive = !['selesai', 'eskalasi_eksternal'].includes(report.status)
    && !report.escalatedTo
    && report.assignedTo === currentUser?.id
  const notes = report.notes || []

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      {resolvedFeedback && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          role="status"
          className="rounded-2xl border-2 border-ink bg-mint-light p-4 text-sm font-bold text-ink shadow-[3px_3px_0_#14213D]"
        >
          🎉 Kes ditandai selesai. Pelajar telah dimaklumkan dan nota kes diarkibkan kepada Guru BK.
        </motion.div>
      )}
      {actionFeedback && !resolvedFeedback && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          aria-live="polite"
          className="rounded-2xl border-2 border-ink bg-sky-light p-3 text-xs font-semibold shadow-[2px_2px_0_#14213D]"
        >
          {actionFeedback}
        </motion.p>
      )}
      {/* Back button */}
      <button
        onClick={() => navigate('/guru')}
        className="flex items-center gap-1 text-sm text-ink/50 hover:text-ink transition-colors w-fit"
      >
        <ArrowLeft size={16} /> Kembali ke Dashboard
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold font-heading">{report.code}</h1>
            <Badge variant={report.status}>{statusLabels[report.status]}</Badge>
            {report.source === 'deteksi' && <Badge variant="deteksi">🔍 Terdeteksi Otomatis</Badge>}
            {report.urgency === 'mendesak' && <Badge variant="danger">🚨 Mendesak</Badge>}
          </div>
          <p className="text-xs text-ink/50 mt-1">
            {getNamaTampilan(report, 'wali_kelas')} — {report.class}
          </p>
        </div>

        {/* Action buttons */}
        {isActive && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-ink/70">Adakah kes selesai di kelas?</p>
            <div className="flex flex-wrap gap-2">
            <Button
              variant="mint"
              size="sm"
              onClick={() => setShowResolveModal(true)}
              icon={CheckCircle}
            >
              Ya, Selesaikan
            </Button>
            <Button
              variant="sunrise"
              size="sm"
              onClick={() => setShowEscalateModal(true)}
              icon={ArrowUpRight}
            >
              Tidak, Eskalasi ke BK
            </Button>
            </div>
          </div>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Detail Kasus */}
        <Card>
          <h3 className="text-sm font-bold font-heading mb-3">Detail Kasus</h3>
          <div className="space-y-2.5">
            <InfoRow icon={Tag} label="Kategori" value={categoryLabels[report.category]} />
            <InfoRow icon={Calendar} label="Mulai terjadi" value={report.startDate || '-'} />
            <InfoRow icon={User} label="Sumber" value={report.source === 'deteksi' ? 'Deteksi Dini Sistem' : 'Laporan Siswa'} />
          </div>

          {report.description && (
            <div className="mt-3 pt-3 border-t border-ink/10">
              <p className="text-xs text-ink/50 mb-1 font-medium">Cerita Siswa:</p>
              <p className="text-sm text-ink leading-relaxed">{report.description}</p>
            </div>
          )}

          {report.detectionReason && (
            <div className="mt-3 pt-3 border-t border-ink/10">
              <p className="text-xs text-ink/50 mb-1 font-medium">Alasan Deteksi:</p>
              <p className="text-sm text-ink leading-relaxed">{report.detectionReason}</p>
            </div>
          )}
        </Card>

        {/* Timeline Status */}
        <Card>
          <h3 className="text-sm font-bold font-heading mb-3">Status Progress</h3>
          <Timeline currentStatus={report.status} notes={notes} />
        </Card>
      </div>

      {(report.category === 'bullying' || (Array.isArray(report.category) && report.category.includes('bullying'))) && (
        <FotoGallery photos={report.bukti} anonymous={report.anonymous} />
      )}

      {/* Grafik */}
      {studentMetrics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GradeChart data={gradeData} />
          <AttendanceChart data={attendanceData} />
        </div>
      ) : (
        <Card color="sky-light">
          <p className="text-sm font-bold">Grafik prestasi belum tersedia</p>
          <p className="mt-1 text-xs text-ink/60">Data nilai dan kehadiran pelajar belum direkodkan.</p>
        </Card>
      )}

      {/* Catat pendekatan */}
      {isActive && (
        <Card>
          <h3 className="text-sm font-bold font-heading mb-3 flex items-center gap-2">
            <MessageCircle size={16} /> Catat Pendekatan Personal
          </h3>
          <div className="flex flex-col gap-3">
            <TextArea
              placeholder="Tulis catatan konsultasi / pendekatan dengan siswa..."
              value={approachNote}
              onChange={(e) => setApproachNote(e.target.value)}
              rows={2}
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-ink/70">
              <input
                type="checkbox"
                checked={approachVisible}
                onChange={(event) => setApproachVisible(event.target.checked)}
                className="h-4 w-4 accent-sunrise"
              />
              Tampilkan ke siswa
            </label>
            <Button variant="secondary" onClick={handleAddNote} disabled={!approachNote.trim()} className="self-end">
              Simpan
            </Button>
          </div>
        </Card>
      )}

      {/* Riwayat Catatan */}
      {notes.length > 0 && (
        <Card>
          <h3 className="text-sm font-bold font-heading mb-3">Riwayat Catatan</h3>
          <div className="flex flex-col gap-2">
            {notes.map(note => (
              <div key={note.id} className="p-3 rounded-xl bg-bg border border-ink/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold">{note.author}</span>
                  <Badge variant="default">{note.role === 'wali_kelas' ? 'Wali Kelas' : note.role === 'guru_bk' ? 'Guru BK' : 'Sistem'}</Badge>
                  <Badge variant={note.visibleToStudent ? 'mint' : 'default'}>
                    {note.visibleToStudent ? 'Dilihat siswa' : 'Arsip internal'}
                  </Badge>
                </div>
                <p className="text-xs text-ink/70">{note.content}</p>
                <p className="text-[10px] text-ink/30 mt-1">
                  {new Date(note.date).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modal Kasus Teratasi */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title="✅ Kasus Teratasi"
      >
        <p className="text-xs text-ink/50 mb-3">
          Tuliskan solusi / catatan penyelesaian kasus. Catatan ini akan diarsipkan ke BK dan siswa akan menerima notifikasi.
        </p>
        <TextArea
          placeholder="Contoh: Sudah diberikan bantuan dana pendidikan dari sekolah..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={4}
        />
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={() => setShowResolveModal(false)} className="flex-1">Batal</Button>
          <Button variant="mint" onClick={handleResolve} disabled={!noteText.trim()} icon={CheckCircle} className="flex-1">
            Selesaikan Kasus
          </Button>
        </div>
      </Modal>

      {/* Modal Eskalasi */}
      <Modal
        isOpen={showEscalateModal}
        onClose={() => setShowEscalateModal(false)}
        title="⬆️ Eskalasi ke Guru BK"
      >
        <p className="text-xs text-ink/50 mb-3">
          Jelaskan mengapa kasus ini perlu ditangani Guru BK. Siswa akan diberitahu bahwa kasusnya ditangani BK.
        </p>
        <TextArea
          placeholder="Contoh: Kasus ini memerlukan konseling mendalam dan mungkin perlu pelibatan orang tua..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={4}
        />
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={() => setShowEscalateModal(false)} className="flex-1">Batal</Button>
          <Button variant="sunrise" onClick={handleEscalate} disabled={!noteText.trim()} icon={ArrowUpRight} className="flex-1">
            Eskalasi
          </Button>
        </div>
      </Modal>
    </div>
  )
}

// Helper komponen
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-ink/30 flex-shrink-0" />
      <span className="text-xs text-ink/50 w-24">{label}</span>
      <span className="text-xs font-semibold text-ink">{value}</span>
    </div>
  )
}
