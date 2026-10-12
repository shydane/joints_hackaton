import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, CheckCircle, AlertTriangle, MessageCircle,
  User, Calendar, Tag, ArrowUpRight, ClipboardList, RefreshCw
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { studentMetrics } from '../../data/studentMetrics'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import TextArea from '../../components/ui/TextArea'
import Modal from '../../components/ui/Modal'
import Timeline from '../../components/ui/Timeline'
import GradeChart from '../../components/charts/GradeChart'
import AttendanceChart from '../../components/charts/AttendanceChart'

/**
 * Detail kasus untuk Guru BK.
 * Fitur tambahan: asesmen, pilih tindak lanjut, monitoring, eskalasi eksternal.
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
  pendampingan: 'Pendampingan',
  selesai: 'Selesai',
  eskalasi_eksternal: 'Eskalasi Eksternal',
}

const FOLLOW_UP_OPTIONS = [
  {
    id: 'ekonomi',
    label: 'Ekonomi — Beasiswa & Bantuan',
    desc: 'Bantu proses apply beasiswa, bantuan desa, atau bantuan eksternal',
    icon: '💰',
  },
  {
    id: 'bullying',
    label: 'Bullying — Pendampingan & Penindakan',
    desc: 'Pendampingan mental korban + penindakan perilaku pelaku',
    icon: '🛡️',
  },
  {
    id: 'motivasi',
    label: 'Kurang Motivasi — Program Belajar',
    desc: 'Pendampingan siswa + program belajar & motivasi',
    icon: '🌱',
  },
  {
    id: 'lingkungan',
    label: 'Lingkungan — Koordinasi Eksternal',
    desc: 'Koordinasi dengan desa/keluarga untuk lingkungan mendukung',
    icon: '🏘️',
  },
]

export default function CounselorCaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    reports, currentUser, updateReportStatus,
    closeCase, escalateExternal, addCounselingSession, addNotification
  } = useApp()

  const report = reports.find(r => r.id === id)
  const metrics = report ? studentMetrics[report.studentId] : null

  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showEscalateModal, setShowEscalateModal] = useState(false)
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [assessmentNote, setAssessmentNote] = useState('')
  const [selectedFollowUp, setSelectedFollowUp] = useState(null)

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-ink/50">Kasus tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate('/bk')} className="mt-3">Kembali</Button>
      </div>
    )
  }

  const isActive = !['selesai', 'eskalasi_eksternal'].includes(report.status)
  const showEscalateExternal = report.sessionCount >= 3 && isActive

  // Catat asesmen
  const handleAssessment = () => {
    if (!assessmentNote.trim()) return
    updateReportStatus(report.id, report.status === 'dikirim' ? 'ditinjau' : 'pendampingan', {
      author: currentUser.name,
      role: 'guru_bk',
      content: `Asesmen: ${assessmentNote}`,
      visibleToStudent: true,
    })
    setAssessmentNote('')
  }

  // Pilih tindak lanjut
  const handleFollowUp = () => {
    if (!selectedFollowUp) return
    updateReportStatus(report.id, 'pendampingan', {
      author: currentUser.name,
      role: 'guru_bk',
      content: `Tindak lanjut: ${FOLLOW_UP_OPTIONS.find(f => f.id === selectedFollowUp)?.label}`,
      visibleToStudent: true,
    }, { followUp: selectedFollowUp })

    addNotification(report.studentId, 'konseling_dijadwalkan',
      'Tindak lanjut disiapkan',
      `Guru BK telah menyiapkan rencana tindak lanjut untuk kasusmu.`,
      report.code
    )

    setShowFollowUpModal(false)
    setSelectedFollowUp(null)
  }

  // Tambah sesi konseling
  const handleAddSession = () => {
    if (!noteText.trim()) return
    addCounselingSession(report.id)
    updateReportStatus(report.id, 'pendampingan', {
      author: currentUser.name,
      role: 'guru_bk',
      content: `Sesi konseling #${report.sessionCount + 1}: ${noteText}`,
      visibleToStudent: true,
    })

    addNotification(report.studentId, 'konseling_dijadwalkan',
      'Sesi konseling dicatat',
      `Sesi konseling ke-${report.sessionCount + 1} telah dilakukan.`,
      report.code
    )

    setShowSessionModal(false)
    setNoteText('')
  }

  // Tutup kasus (positif)
  const handleClose = () => {
    if (!noteText.trim()) return
    closeCase(report.id, {
      author: currentUser.name,
      role: 'guru_bk',
      content: `Perkembangan positif. ${noteText}`,
    })
    setShowCloseModal(false)
    setNoteText('')
  }

  // Eskalasi eksternal
  const handleEscalateExternal = () => {
    if (!noteText.trim()) return
    escalateExternal(report.id, {
      author: currentUser.name,
      content: `Eskalasi Eksternal setelah ${report.sessionCount} sesi. ${noteText}`,
    })
    setShowEscalateModal(false)
    setNoteText('')
  }

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      {/* Back */}
      <button
        onClick={() => navigate('/bk')}
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
            {report.urgency === 'mendesak' && <Badge variant="danger">🚨 Mendesak</Badge>}
            {report.escalatedTo && <Badge variant="sunrise">⬆️ Dari Wali Kelas</Badge>}
            {report.source === 'deteksi' && <Badge variant="deteksi">🔍 Deteksi Otomatis</Badge>}
          </div>
          <p className="text-xs text-ink/50 mt-1">
            {report.anonymous ? `🔒 ${report.studentInitials} (Anonim)` : `${report.studentName} — ${report.class}`}
            {report.sessionCount > 0 && ` • ${report.sessionCount} sesi konseling`}
          </p>
        </div>

        {/* Actions */}
        {isActive && (
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" size="sm" onClick={() => setShowFollowUpModal(true)} icon={ClipboardList}>
              Tindak Lanjut
            </Button>
            <Button variant="lemon" size="sm" onClick={() => { setNoteText(''); setShowSessionModal(true) }} icon={RefreshCw}>
              Sesi Konseling
            </Button>
            <Button variant="mint" size="sm" onClick={() => { setNoteText(''); setShowCloseModal(true) }} icon={CheckCircle}>
              Tutup Kasus
            </Button>
            {showEscalateExternal && (
              <Button variant="danger" size="sm" onClick={() => { setNoteText(''); setShowEscalateModal(true) }} icon={AlertTriangle}>
                Eskalasi Lanjutan
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Warning: 3 sesi tanpa kemajuan */}
      {showEscalateExternal && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card color="danger-light" className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-danger">Perhatian: {report.sessionCount} sesi tanpa kemajuan signifikan</p>
              <p className="text-xs text-ink/60 mt-1">
                Pertimbangkan eskalasi ke pihak eksternal (kepala sekolah, orang tua, psikolog, atau dinas terkait).
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Info + Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-bold font-heading mb-3">Detail Kasus</h3>
          <div className="space-y-2.5">
            <InfoRow label="Kategori" value={categoryLabels[report.category]} />
            <InfoRow label="Mulai terjadi" value={report.startDate || '-'} />
            <InfoRow label="Sumber" value={
              report.escalatedTo ? 'Eskalasi dari Wali Kelas' :
              report.source === 'deteksi' ? 'Deteksi Dini Sistem' : 'Laporan Langsung Siswa'
            } />
            <InfoRow label="Tindak lanjut" value={
              report.followUp
                ? FOLLOW_UP_OPTIONS.find(f => f.id === report.followUp)?.label || '-'
                : 'Belum ditentukan'
            } />
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

        <Card>
          <h3 className="text-sm font-bold font-heading mb-3">Status Progress</h3>
          <Timeline currentStatus={report.status} notes={report.notes} />
        </Card>
      </div>

      {/* Grafik */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GradeChart data={metrics.grades} />
          <AttendanceChart data={metrics.attendance} />
        </div>
      )}

      {/* Catat asesmen */}
      {isActive && (
        <Card>
          <h3 className="text-sm font-bold font-heading mb-3 flex items-center gap-2">
            <MessageCircle size={16} /> Catat Asesmen / Observasi
          </h3>
          <div className="flex gap-2">
            <TextArea
              placeholder="Catat hasil konseling, pemanggilan orang tua, atau observasi lainnya..."
              value={assessmentNote}
              onChange={(e) => setAssessmentNote(e.target.value)}
              rows={2}
              className="flex-1"
            />
            <Button variant="secondary" onClick={handleAssessment} disabled={!assessmentNote.trim()} className="self-end">
              Simpan
            </Button>
          </div>
        </Card>
      )}

      {/* Riwayat Catatan */}
      {report.notes.length > 0 && (
        <Card>
          <h3 className="text-sm font-bold font-heading mb-3">Riwayat Catatan</h3>
          <div className="flex flex-col gap-2">
            {report.notes.map(note => (
              <div key={note.id} className="p-3 rounded-xl bg-bg border border-ink/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold">{note.author}</span>
                  <Badge variant="default">{note.role === 'wali_kelas' ? 'Wali Kelas' : 'Guru BK'}</Badge>
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

      {/* Modal: Pilih Tindak Lanjut */}
      <Modal isOpen={showFollowUpModal} onClose={() => setShowFollowUpModal(false)} title="📋 Pilih Tindak Lanjut">
        <p className="text-xs text-ink/50 mb-3">Tentukan jenis tindak lanjut berdasarkan asesmen</p>
        <div className="flex flex-col gap-2 mb-4">
          {FOLLOW_UP_OPTIONS.map(opt => (
            <Card
              key={opt.id}
              hoverable
              onClick={() => setSelectedFollowUp(opt.id)}
              className={`flex items-center gap-3 !py-3 ${selectedFollowUp === opt.id ? 'ring-2 ring-sunrise bg-sunrise-light' : ''}`}
            >
              <span className="text-xl">{opt.icon}</span>
              <div>
                <p className="text-xs font-bold">{opt.label}</p>
                <p className="text-[10px] text-ink/50">{opt.desc}</p>
              </div>
            </Card>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFollowUpModal(false)} className="flex-1">Batal</Button>
          <Button variant="primary" onClick={handleFollowUp} disabled={!selectedFollowUp} className="flex-1">Terapkan</Button>
        </div>
      </Modal>

      {/* Modal: Sesi Konseling */}
      <Modal isOpen={showSessionModal} onClose={() => setShowSessionModal(false)} title="🗓️ Catat Sesi Konseling">
        <p className="text-xs text-ink/50 mb-3">Sesi ke-{report.sessionCount + 1}. Tuliskan hasil sesi konseling.</p>
        <TextArea
          placeholder="Catatan sesi konseling..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={4}
        />
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={() => setShowSessionModal(false)} className="flex-1">Batal</Button>
          <Button variant="lemon" onClick={handleAddSession} disabled={!noteText.trim()} className="flex-1">Simpan Sesi</Button>
        </div>
      </Modal>

      {/* Modal: Tutup Kasus */}
      <Modal isOpen={showCloseModal} onClose={() => setShowCloseModal(false)} title="✅ Perkembangan Positif — Tutup Kasus">
        <p className="text-xs text-ink/50 mb-3">Tuliskan catatan penutupan. Siswa akan menerima notifikasi bahwa kasusnya selesai.</p>
        <TextArea
          placeholder="Contoh: Siswa menunjukkan perkembangan positif, nilai dan kehadiran membaik..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={4}
        />
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={() => setShowCloseModal(false)} className="flex-1">Batal</Button>
          <Button variant="mint" onClick={handleClose} disabled={!noteText.trim()} icon={CheckCircle} className="flex-1">Tutup Kasus</Button>
        </div>
      </Modal>

      {/* Modal: Eskalasi Eksternal */}
      <Modal isOpen={showEscalateModal} onClose={() => setShowEscalateModal(false)} title="⚠️ Eskalasi Lanjutan (Eksternal)">
        <p className="text-xs text-ink/50 mb-3">
          Setelah {report.sessionCount} sesi tanpa kemajuan signifikan, kasus ini bisa dieskalasi ke:
          kepala sekolah, orang tua, psikolog, atau dinas terkait.
        </p>
        <TextArea
          placeholder="Jelaskan alasan eskalasi dan pihak tujuan..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={4}
        />
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={() => setShowEscalateModal(false)} className="flex-1">Batal</Button>
          <Button variant="danger" onClick={handleEscalateExternal} disabled={!noteText.trim()} icon={AlertTriangle} className="flex-1">Eskalasi</Button>
        </div>
      </Modal>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-ink/50 w-28 flex-shrink-0">{label}</span>
      <span className="text-xs font-semibold text-ink">{value}</span>
    </div>
  )
}
