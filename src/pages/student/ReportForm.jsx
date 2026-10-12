import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, Users, Brain, HelpCircle,
  ArrowLeft, ArrowRight, Send, Eye, EyeOff,
  AlertTriangle, Clock, AlertCircle,
  ChevronRight
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import TextArea from '../../components/ui/TextArea'
import Toggle from '../../components/ui/Toggle'
import Badge from '../../components/ui/Badge'
import ProgressPath from '../../components/ui/ProgressPath'

/**
 * Form lapor percakapan: satu pertanyaan per layar.
 * Urutan: kategori → kapan → ceritakan → urgensi → bukti → jalur → anonim → review → kirim
 */
const TOTAL_STEPS = 8

const CATEGORIES = [
  { id: 'ekonomi', label: 'Ekonomi', icon: Wallet, color: 'bg-sky-light', emoji: '💰', desc: 'Masalah biaya, harus bekerja, dll' },
  { id: 'bullying', label: 'Bullying / Sosial', icon: Users, color: 'bg-sunrise-light', emoji: '😰', desc: 'Perundungan, konflik teman, dll' },
  { id: 'motivasi', label: 'Kurang Motivasi', icon: Brain, color: 'bg-lemon-light', emoji: '😔', desc: 'Tidak semangat, bosan, dll' },
  { id: 'lainnya', label: 'Lainnya', icon: HelpCircle, color: 'bg-mint-light', emoji: '💬', desc: 'Masalah lain yang mengganggu' },
]

const URGENCY = [
  { id: 'biasa', label: 'Biasa', desc: 'Tidak terlalu mendesak', icon: Clock, color: 'bg-sky-light' },
  { id: 'penting', label: 'Penting', desc: 'Perlu segera ditindaklanjuti', icon: AlertCircle, color: 'bg-lemon-light' },
  { id: 'mendesak', label: 'Mendesak', desc: 'Butuh penanganan segera!', icon: AlertTriangle, color: 'bg-danger-light' },
]

export default function ReportForm() {
  const navigate = useNavigate()
  const { currentUser, createReport } = useApp()

  // Form state
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    category: '',
    startDate: '',
    description: '',
    urgency: '',
    evidence: '',
    channel: 'wali_kelas',
    anonymous: false,
  })

  // Validasi per step
  const canProceed = useCallback(() => {
    switch (step) {
      case 0: return !!formData.category
      case 1: return !!formData.startDate
      case 2: return formData.description.trim().length >= 10
      case 3: return !!formData.urgency
      case 4: return true // bukti opsional
      case 5: return !!formData.channel
      case 6: return true // toggle anonim
      case 7: return true // review
      default: return false
    }
  }, [step, formData])

  const nextStep = () => {
    if (step < TOTAL_STEPS - 1 && canProceed()) setStep(s => s + 1)
  }
  const prevStep = () => {
    if (step > 0) setStep(s => s - 1)
  }

  // Kirim laporan
  const handleSubmit = () => {
    if (!currentUser) return

    const code = createReport({
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentInitials: currentUser.initials,
      class: currentUser.class,
      category: formData.category,
      description: formData.description,
      urgency: formData.urgency,
      anonymous: formData.anonymous,
      channel: formData.channel,
      startDate: formData.startDate,
      evidence: formData.evidence || null,
    })

    // Navigate ke hasil dengan kode
    navigate(`/siswa/hasil/${code}`)
  }

  // Render step
  const renderStep = () => {
    const slideVariants = {
      enter: { x: 50, opacity: 0 },
      center: { x: 0, opacity: 1 },
      exit: { x: -50, opacity: 0 },
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25 }}
          className="min-h-[300px] flex flex-col"
        >
          {step === 0 && (
            <StepCategory
              value={formData.category}
              onChange={(v) => setFormData(d => ({ ...d, category: v }))}
            />
          )}
          {step === 1 && (
            <StepWhen
              value={formData.startDate}
              onChange={(v) => setFormData(d => ({ ...d, startDate: v }))}
            />
          )}
          {step === 2 && (
            <StepDescribe
              value={formData.description}
              onChange={(v) => setFormData(d => ({ ...d, description: v }))}
            />
          )}
          {step === 3 && (
            <StepUrgency
              value={formData.urgency}
              onChange={(v) => setFormData(d => ({ ...d, urgency: v }))}
            />
          )}
          {step === 4 && (
            <StepEvidence
              value={formData.evidence}
              onChange={(v) => setFormData(d => ({ ...d, evidence: v }))}
            />
          )}
          {step === 5 && (
            <StepChannel
              value={formData.channel}
              onChange={(v) => setFormData(d => ({ ...d, channel: v }))}
              urgency={formData.urgency}
            />
          )}
          {step === 6 && (
            <StepAnonymous
              value={formData.anonymous}
              onChange={(v) => setFormData(d => ({ ...d, anonymous: v }))}
            />
          )}
          {step === 7 && (
            <StepReview formData={formData} />
          )}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress Path */}
      <ProgressPath currentStep={step} totalSteps={TOTAL_STEPS} />

      {/* Step Content */}
      {renderStep()}

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-2">
        {step > 0 && (
          <Button variant="outline" onClick={prevStep} icon={ArrowLeft} className="flex-1">
            Kembali
          </Button>
        )}
        {step < TOTAL_STEPS - 1 ? (
          <Button
            variant="primary"
            onClick={nextStep}
            disabled={!canProceed()}
            icon={ArrowRight}
            className="flex-1"
          >
            Lanjut
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSubmit}
            icon={Send}
            className="flex-1"
          >
            Kirim Laporan
          </Button>
        )}
      </div>
    </div>
  )
}

// === SUB-STEPS ===

function StepCategory({ value, onChange }) {
  return (
    <div>
      <h2 className="text-lg font-bold font-heading mb-1">Apa yang sedang kamu alami?</h2>
      <p className="text-xs text-ink/50 mb-4">Pilih kategori yang paling sesuai</p>

      <div className="flex flex-col gap-2.5">
        {CATEGORIES.map(cat => (
          <Card
            key={cat.id}
            hoverable
            onClick={() => onChange(cat.id)}
            color={value === cat.id ? cat.color.replace('bg-', '') : 'white'}
            className={`flex items-center gap-3 !py-3 ${value === cat.id ? 'ring-2 ring-sunrise' : ''}`}
          >
            <span className="text-2xl">{cat.emoji}</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold">{cat.label}</h3>
              <p className="text-xs text-ink/50">{cat.desc}</p>
            </div>
            {value === cat.id && (
              <div className="w-5 h-5 bg-sunrise rounded-full border-2 border-ink flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

function StepWhen({ value, onChange }) {
  const options = [
    'Baru saja (minggu ini)',
    '1-2 minggu lalu',
    'Sebulan yang lalu',
    'Sudah lama (lebih dari sebulan)',
  ]
  return (
    <div>
      <h2 className="text-lg font-bold font-heading mb-1">Kapan ini mulai terjadi?</h2>
      <p className="text-xs text-ink/50 mb-4">Ini membantu guru memahami situasimu</p>

      <div className="flex flex-col gap-2.5">
        {options.map(opt => (
          <Card
            key={opt}
            hoverable
            onClick={() => onChange(opt)}
            className={`!py-3 ${value === opt ? 'ring-2 ring-sunrise bg-sunrise-light' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 border-ink flex items-center justify-center ${value === opt ? 'bg-sunrise' : 'bg-white'}`}>
                {value === opt && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <span className="text-sm font-medium">{opt}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function StepDescribe({ value, onChange }) {
  return (
    <div>
      <h2 className="text-lg font-bold font-heading mb-1">Ceritakan masalahmu</h2>
      <p className="text-xs text-ink/50 mb-4">
        Tulis dengan bahasamu sendiri. Tidak perlu formal — yang penting jujur dan nyaman.
      </p>

      <TextArea
        placeholder="Contoh: Saya sering terlambat karena harus bantu ibu di pasar dulu sebelum berangkat sekolah..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
      />

      <p className="text-xs text-ink/30 mt-2">
        {value.length < 10
          ? `Minimal 10 karakter (${value.length}/10)`
          : `✓ ${value.length} karakter`
        }
      </p>
    </div>
  )
}

function StepUrgency({ value, onChange }) {
  return (
    <div>
      <h2 className="text-lg font-bold font-heading mb-1">Seberapa mendesak ini?</h2>
      <p className="text-xs text-ink/50 mb-4">Pilih tingkat urgensi yang sesuai</p>

      <div className="flex flex-col gap-2.5">
        {URGENCY.map(urg => (
          <Card
            key={urg.id}
            hoverable
            onClick={() => onChange(urg.id)}
            color={value === urg.id ? urg.color.replace('bg-', '') : 'white'}
            className={`flex items-center gap-3 !py-3 ${value === urg.id ? 'ring-2 ring-sunrise' : ''}`}
          >
            <div className={`w-10 h-10 ${urg.color} rounded-xl border-2 border-ink flex items-center justify-center`}>
              <urg.icon size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold">{urg.label}</h3>
              <p className="text-xs text-ink/50">{urg.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      {value === 'mendesak' && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-danger-light rounded-xl border-2 border-danger"
        >
          <p className="text-xs text-danger font-semibold flex items-center gap-1.5">
            <AlertTriangle size={14} />
            Laporan mendesak akan langsung dikirim ke Guru BK
          </p>
        </motion.div>
      )}
    </div>
  )
}

function StepEvidence({ value, onChange }) {
  return (
    <div>
      <h2 className="text-lg font-bold font-heading mb-1">Ada bukti tambahan? <span className="text-ink/30 text-sm">(opsional)</span></h2>
      <p className="text-xs text-ink/50 mb-4">
        Jika ada, ceritakan bukti yang kamu punya (screenshot, foto, nama saksi, dll).
        Ini opsional — tidak ada pun tidak apa-apa.
      </p>

      <TextArea
        placeholder="Contoh: Ada chat WhatsApp di mana teman mengejek saya..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
      />

      <Card color="sky-light" className="mt-3 !py-2.5">
        <p className="text-xs text-ink/60">
          💡 Dalam prototype ini, bukti hanya berupa teks. Di versi nyata, bisa upload foto/file.
        </p>
      </Card>
    </div>
  )
}

function StepChannel({ value, onChange, urgency }) {
  const isUrgent = urgency === 'mendesak'

  return (
    <div>
      <h2 className="text-lg font-bold font-heading mb-1">Kirim ke siapa?</h2>
      <p className="text-xs text-ink/50 mb-4">Pilih siapa yang pertama kali menangani laporanmu</p>

      {isUrgent ? (
        <Card color="danger-light" className="!py-4 text-center">
          <AlertTriangle size={24} className="mx-auto mb-2 text-danger" />
          <p className="text-sm font-bold text-danger">Dikirim langsung ke Guru BK</p>
          <p className="text-xs text-ink/50 mt-1">
            Karena kamu memilih "Mendesak", laporan akan langsung ditangani Guru BK.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2.5">
          <Card
            hoverable
            onClick={() => onChange('wali_kelas')}
            className={`flex items-center gap-3 !py-3 ${value === 'wali_kelas' ? 'ring-2 ring-sunrise bg-lemon-light' : ''}`}
          >
            <span className="text-2xl">👩‍🏫</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold">Wali Kelas</h3>
              <p className="text-xs text-ink/50">Guru yang paling dekat denganmu</p>
            </div>
          </Card>

          <Card
            hoverable
            onClick={() => onChange('guru_bk')}
            className={`flex items-center gap-3 !py-3 ${value === 'guru_bk' ? 'ring-2 ring-sunrise bg-mint-light' : ''}`}
          >
            <span className="text-2xl">👩‍⚕️</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold">Guru BK</h3>
              <p className="text-xs text-ink/50">Konselor profesional di sekolah</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function StepAnonymous({ value, onChange }) {
  return (
    <div>
      <h2 className="text-lg font-bold font-heading mb-1">Privasi identitasmu</h2>
      <p className="text-xs text-ink/50 mb-4">Kamu bisa menyembunyikan identitas dari guru yang menangani</p>

      <Card className="!py-4">
        <Toggle
          label="Sembunyikan identitasku dari guru"
          description="Guru hanya melihat kode laporan dan inisialmu. Identitas asli hanya terbuka untuk BK jika kasus mendesak."
          checked={value}
          onChange={onChange}
        />
      </Card>

      <div className="mt-3 flex flex-col gap-2">
        <Card color={value ? 'sunrise-light' : 'mint-light'} className="!py-2.5">
          <p className="text-xs text-ink/60 flex items-center gap-1.5">
            {value ? (
              <><EyeOff size={14} /> Guru akan melihat: <strong>Kode + Inisial saja</strong></>
            ) : (
              <><Eye size={14} /> Guru akan melihat: <strong>Nama lengkap + Kelas</strong></>
            )}
          </p>
        </Card>
      </div>
    </div>
  )
}

function StepReview({ formData }) {
  const categoryLabel = CATEGORIES.find(c => c.id === formData.category)?.label
  const urgencyLabel = URGENCY.find(u => u.id === formData.urgency)?.label
  const isUrgent = formData.urgency === 'mendesak'

  return (
    <div>
      <h2 className="text-lg font-bold font-heading mb-1">Review laporanmu</h2>
      <p className="text-xs text-ink/50 mb-4">Pastikan semuanya sudah benar sebelum dikirim</p>

      <Card className="!p-0 overflow-hidden">
        <div className="divide-y-2 divide-ink/10">
          <ReviewRow label="Kategori" value={categoryLabel} />
          <ReviewRow label="Kapan mulai" value={formData.startDate} />
          <ReviewRow label="Cerita" value={formData.description} truncate />
          <ReviewRow
            label="Urgensi"
            value={
              <Badge variant={formData.urgency === 'mendesak' ? 'danger' : formData.urgency === 'penting' ? 'sunrise' : 'sky'}>
                {urgencyLabel}
              </Badge>
            }
          />
          <ReviewRow label="Bukti" value={formData.evidence || 'Tidak ada'} />
          <ReviewRow
            label="Dikirim ke"
            value={isUrgent ? 'Guru BK (otomatis)' : formData.channel === 'guru_bk' ? 'Guru BK' : 'Wali Kelas'}
          />
          <ReviewRow
            label="Identitas"
            value={formData.anonymous ? '🔒 Disembunyikan' : '👁️ Terlihat oleh guru'}
          />
        </div>
      </Card>
    </div>
  )
}

function ReviewRow({ label, value, truncate }) {
  return (
    <div className="flex gap-3 px-4 py-3">
      <span className="text-xs text-ink/40 font-medium w-20 flex-shrink-0">{label}</span>
      <span className={`text-xs font-semibold text-ink flex-1 ${truncate ? 'line-clamp-2' : ''}`}>
        {value}
      </span>
    </div>
  )
}
