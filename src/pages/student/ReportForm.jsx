import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, Users, Brain, HelpCircle,
  ArrowLeft, ArrowRight, Send, Eye, EyeOff,
  AlertTriangle, Clock, AlertCircle,
  ShieldCheck, CheckCircle2,
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
  {
    id: 'ekonomi',
    label: 'Ekonomi',
    icon: Wallet,
    color: 'sky-light',
    emoji: '💰',
    desc: 'Masalah biaya, harus bekerja, tidak punya uang jajan, dll',
  },
  {
    id: 'bullying',
    label: 'Bullying / Sosial',
    icon: Users,
    color: 'sunrise-light',
    emoji: '😰',
    desc: 'Perundungan, konflik pertemanan, dikucilkan, dll',
  },
  {
    id: 'motivasi',
    label: 'Kurang Motivasi',
    icon: Brain,
    color: 'lemon-light',
    emoji: '😔',
    desc: 'Tidak semangat belajar, stres akademik, bosan sekolah, dll',
  },
  {
    id: 'lainnya',
    label: 'Lainnya',
    icon: HelpCircle,
    color: 'mint-light',
    emoji: '💬',
    desc: 'Masalah lain yang mengganggu dan perlu dibantu',
  },
]

const URGENCY_OPTIONS = [
  {
    id: 'biasa',
    label: 'Biasa',
    desc: 'Tidak terlalu mendesak, bisa ditangani dalam beberapa hari',
    icon: Clock,
    color: 'sky-light',
    borderColor: 'border-sky',
    badgeVariant: 'sky',
  },
  {
    id: 'penting',
    label: 'Penting',
    desc: 'Perlu segera ditindaklanjuti dalam 1–2 hari ke depan',
    icon: AlertCircle,
    color: 'lemon-light',
    borderColor: 'border-lemon',
    badgeVariant: 'lemon',
  },
  {
    id: 'mendesak',
    label: 'Mendesak',
    desc: 'Butuh penanganan SEGERA — laporan otomatis ke Guru BK',
    icon: AlertTriangle,
    color: 'danger-light',
    borderColor: 'border-danger',
    badgeVariant: 'danger',
  },
]

const WHEN_OPTIONS = [
  'Baru saja (minggu ini)',
  '1–2 minggu lalu',
  'Sebulan yang lalu',
  'Sudah lama (lebih dari sebulan)',
]

// Varian animasi slide masuk/keluar
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0, scale: 0.97 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0, scale: 0.97 }),
}

export default function ReportForm() {
  const navigate = useNavigate()
  const { currentUser, buatLaporan } = useApp()

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = maju, -1 = mundur
  const [submitting, setSubmitting] = useState(false)
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
      case 5: return true // channel sudah punya default, atau auto BK jika mendesak
      case 6: return true // toggle anonim opsional
      case 7: return true // review
      default: return false
    }
  }, [step, formData])

  const goNext = () => {
    if (step < TOTAL_STEPS - 1 && canProceed()) {
      setDirection(1)
      setStep(s => s + 1)
    }
  }

  const goPrev = () => {
    if (step > 0) {
      setDirection(-1)
      setStep(s => s - 1)
    }
  }

  // Lewati step jalur jika mendesak (otomatis ke BK)
  const effectiveStep = step === 5 && formData.urgency === 'mendesak' ? 5 : step

  // Kirim laporan via buatLaporan()
  const handleSubmit = async () => {
    if (!currentUser || submitting) return
    setSubmitting(true)
    try {
      const jalur = formData.urgency === 'mendesak'
        ? 'bk'
        : formData.channel === 'guru_bk' ? 'bk' : 'wali_kelas'

      const laporan = buatLaporan({
        studentId: currentUser.id,
        kategori: formData.category,
        cerita: formData.description,
        urgensi: formData.urgency,
        jalur,
        anonim: formData.anonymous,
        // Field tambahan yang dibutuhkan createReport (via buatLaporan wrapper)
        startDate: formData.startDate,
        evidence: formData.evidence || null,
      })

      navigate(`/siswa/hasil/${laporan?.code || ''}`)
    } catch (err) {
      console.error('Gagal kirim laporan:', err)
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header halaman */}
      <div>
        <h1 className="text-xl font-bold font-heading">Buat Laporan</h1>
        <p className="text-xs text-ink/40 mt-0.5">Ceritakan masalahmu — kita cari solusi bersama</p>
      </div>

      {/* Progress Path */}
      <Card color="white" className="!py-3 !px-4">
        <ProgressPath currentStep={step} totalSteps={TOTAL_STEPS} />
      </Card>

      {/* Step Content dengan slide animasi */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          className="min-h-[320px] flex flex-col"
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
              onChange={(v) => {
                setFormData(d => ({
                  ...d,
                  urgency: v,
                  // Jika mendesak, paksa channel ke guru_bk
                  channel: v === 'mendesak' ? 'guru_bk' : d.channel,
                }))
              }}
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

      {/* Tombol Navigasi */}
      <div className="flex gap-3 mt-1">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={goPrev}
            icon={ArrowLeft}
            className="flex-1"
            id="btn-kembali"
          >
            Kembali
          </Button>
        )}
        {step < TOTAL_STEPS - 1 ? (
          <Button
            variant="primary"
            onClick={goNext}
            disabled={!canProceed()}
            icon={ArrowRight}
            className="flex-1"
            id="btn-lanjut"
          >
            Lanjut
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting}
            icon={Send}
            className="flex-1"
            id="btn-kirim-laporan"
          >
            {submitting ? 'Mengirim...' : 'Kirim Laporan'}
          </Button>
        )}
      </div>
    </div>
  )
}

// ===================================================================
// SUB-STEPS
// ===================================================================

function StepCategory({ value, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-bold font-heading">Apa yang sedang kamu alami?</h2>
        <p className="text-xs text-ink/50 mt-0.5">Pilih kategori yang paling sesuai dengan situasimu</p>
      </div>

      <div className="flex flex-col gap-2.5">
        {CATEGORIES.map((cat) => {
          const isSelected = value === cat.id
          return (
            <motion.button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              whileHover={{ y: -2, boxShadow: '6px 6px 0 #14213D' }}
              whileTap={{ scale: 0.98, boxShadow: '2px 2px 0 #14213D', x: 2, y: 2 }}
              className={`
                w-full text-left neo-card flex items-center gap-3 !py-3.5 transition-all duration-150
                ${isSelected
                  ? `bg-${cat.color} ring-2 ring-sunrise`
                  : 'bg-white hover:bg-bg'
                }
              `}
              id={`cat-${cat.id}`}
            >
              <span className="text-2xl flex-shrink-0">{cat.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{cat.label}</p>
                <p className="text-xs text-ink/50 mt-0.5 leading-snug">{cat.desc}</p>
              </div>
              <div className={`
                w-5 h-5 rounded-full border-2 border-ink flex-shrink-0 flex items-center justify-center
                ${isSelected ? 'bg-sunrise' : 'bg-white'}
              `}>
                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function StepWhen({ value, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-bold font-heading">Kapan ini mulai terjadi?</h2>
        <p className="text-xs text-ink/50 mt-0.5">Ini membantu guru memahami seberapa lama situasi ini berlangsung</p>
      </div>

      <div className="flex flex-col gap-2.5">
        {WHEN_OPTIONS.map((opt) => {
          const isSelected = value === opt
          return (
            <motion.button
              key={opt}
              onClick={() => onChange(opt)}
              whileHover={{ y: -2, boxShadow: '6px 6px 0 #14213D' }}
              whileTap={{ scale: 0.98, boxShadow: '2px 2px 0 #14213D', x: 2, y: 2 }}
              className={`
                w-full text-left neo-card flex items-center gap-3 !py-3 transition-all duration-150
                ${isSelected ? 'bg-sky-light ring-2 ring-sky' : 'bg-white hover:bg-bg'}
              `}
              id={`when-${opt.replace(/\s+/g, '-')}`}
            >
              <div className={`
                w-5 h-5 rounded-full border-2 border-ink flex items-center justify-center flex-shrink-0
                ${isSelected ? 'bg-sunrise' : 'bg-white'}
              `}>
                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <span className="text-sm font-medium">{opt}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function StepDescribe({ value, onChange }) {
  const charCount = value.trim().length
  const isValid = charCount >= 10

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-bold font-heading">Ceritakan masalahmu</h2>
        <p className="text-xs text-ink/50 mt-0.5">
          Tulis dengan bahasamu sendiri. Tidak perlu formal — yang penting jujur.
        </p>
      </div>

      <Card color="sky-light" className="!py-2.5">
        <p className="text-xs text-ink/60 flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-sky flex-shrink-0" />
          Ceritamu dijaga kerahasiaannya dan hanya dibaca oleh guru yang ditunjuk.
        </p>
      </Card>

      <TextArea
        placeholder="Contoh: Saya sering terlambat karena harus bantu ibu di pasar dulu sebelum berangkat sekolah. Uang jajan pun sudah habis sejak awal minggu..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        id="input-deskripsi"
      />

      <motion.p
        className={`text-xs font-medium ${isValid ? 'text-mint' : 'text-ink/30'}`}
        animate={{ opacity: 1 }}
      >
        {isValid
          ? `✓ ${charCount} karakter — cukup!`
          : `Minimal 10 karakter (${charCount}/10)`}
      </motion.p>
    </div>
  )
}

function StepUrgency({ value, onChange }) {
  const selected = URGENCY_OPTIONS.find(u => u.id === value)

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-bold font-heading">Seberapa mendesak ini?</h2>
        <p className="text-xs text-ink/50 mt-0.5">Pilih sesuai kondisimu sekarang</p>
      </div>

      <div className="flex flex-col gap-2.5">
        {URGENCY_OPTIONS.map((urg) => {
          const isSelected = value === urg.id
          const Icon = urg.icon
          return (
            <motion.button
              key={urg.id}
              onClick={() => onChange(urg.id)}
              whileHover={{ y: -2, boxShadow: '6px 6px 0 #14213D' }}
              whileTap={{ scale: 0.98, boxShadow: '2px 2px 0 #14213D', x: 2, y: 2 }}
              className={`
                w-full text-left neo-card flex items-center gap-3 !py-3.5 transition-all duration-150
                ${isSelected
                  ? `bg-${urg.color} ring-2 ${urg.borderColor}`
                  : 'bg-white hover:bg-bg'
                }
              `}
              id={`urgency-${urg.id}`}
            >
              <div className={`
                w-10 h-10 flex-shrink-0 rounded-xl border-2 border-ink flex items-center justify-center
                bg-${urg.color}
              `}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{urg.label}</p>
                <p className="text-xs text-ink/50 mt-0.5 leading-snug">{urg.desc}</p>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 bg-sunrise rounded-full border-2 border-ink flex items-center justify-center flex-shrink-0"
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Info tambahan saat memilih "mendesak" */}
      <AnimatePresence>
        {value === 'mendesak' && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <Card color="danger-light" className="!py-3 border-danger">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-danger flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-danger">Laporan langsung ke Guru BK</p>
                  <p className="text-xs text-ink/60 mt-0.5">
                    Karena kamu memilih <strong>Mendesak</strong>, laporanmu akan langsung
                    ditangani oleh Guru BK tanpa perlu memilih jalur secara manual.
                    Guru BK akan segera menghubungimu.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StepEvidence({ value, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-bold font-heading">
          Ada bukti tambahan?{' '}
          <span className="text-ink/30 text-base font-normal">(opsional)</span>
        </h2>
        <p className="text-xs text-ink/50 mt-0.5">
          Tidak wajib — tapi kalau ada, ini membantu guru memahami situasimu lebih baik.
        </p>
      </div>

      <TextArea
        placeholder="Contoh: Ada pesan chat dari teman yang mengejek saya, nama saksi yang melihat kejadian, atau nomor halaman buku yang hilang..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        id="input-bukti"
      />

      <Card color="sky-light" className="!py-2.5">
        <p className="text-xs text-ink/50">
          💡 Di versi ini, bukti berupa teks. Di aplikasi nyata, kamu bisa upload foto atau file.
        </p>
      </Card>
    </div>
  )
}

function StepChannel({ value, onChange, urgency }) {
  const isUrgent = urgency === 'mendesak'

  if (isUrgent) {
    return (
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-bold font-heading">Jalur penanganan</h2>
          <p className="text-xs text-ink/50 mt-0.5">Karena laporanmu mendesak, jalur ini otomatis</p>
        </div>

        <Card color="danger-light" className="!py-5 text-center border-danger">
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">👩‍⚕️</span>
            <p className="text-base font-bold text-danger">Otomatis → Guru BK</p>
            <p className="text-xs text-ink/50 max-w-xs">
              Laporan <strong>Mendesak</strong> selalu langsung ke Guru BK agar penanganan
              bisa dilakukan secepat mungkin. Guru BK akan segera menghubungimu.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-bold font-heading">Kirim ke siapa?</h2>
        <p className="text-xs text-ink/50 mt-0.5">Pilih siapa yang pertama menangani laporanmu</p>
      </div>

      <div className="flex flex-col gap-2.5">
        {[
          {
            id: 'wali_kelas',
            label: 'Wali Kelas',
            desc: 'Guru yang paling mengenal keseharianmu di kelas',
            emoji: '👩‍🏫',
            selectedBg: 'bg-lemon-light ring-2 ring-lemon',
          },
          {
            id: 'guru_bk',
            label: 'Guru BK',
            desc: 'Konselor profesional yang terlatih menangani masalah siswa',
            emoji: '👩‍⚕️',
            selectedBg: 'bg-mint-light ring-2 ring-mint',
          },
        ].map((ch) => {
          const isSelected = value === ch.id
          return (
            <motion.button
              key={ch.id}
              onClick={() => onChange(ch.id)}
              whileHover={{ y: -2, boxShadow: '6px 6px 0 #14213D' }}
              whileTap={{ scale: 0.98, boxShadow: '2px 2px 0 #14213D', x: 2, y: 2 }}
              className={`
                w-full text-left neo-card flex items-center gap-3 !py-3.5 transition-all duration-150
                ${isSelected ? ch.selectedBg : 'bg-white hover:bg-bg'}
              `}
              id={`channel-${ch.id}`}
            >
              <span className="text-2xl flex-shrink-0">{ch.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{ch.label}</p>
                <p className="text-xs text-ink/50 mt-0.5">{ch.desc}</p>
              </div>
              <div className={`
                w-5 h-5 rounded-full border-2 border-ink flex-shrink-0 flex items-center justify-center
                ${isSelected ? 'bg-sunrise' : 'bg-white'}
              `}>
                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </motion.button>
          )
        })}
      </div>

      <Card color="sky-light" className="!py-2.5">
        <p className="text-xs text-ink/50">
          ℹ️ Kamu bisa minta eskalasi ke Guru BK nanti jika penanganan Wali Kelas dirasa kurang.
        </p>
      </Card>
    </div>
  )
}

function StepAnonymous({ value, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-bold font-heading">Privasi identitasmu</h2>
        <p className="text-xs text-ink/50 mt-0.5">
          Kamu bisa menyembunyikan namamu dari guru yang menangani
        </p>
      </div>

      <Card className="!py-4">
        <Toggle
          label="Sembunyikan identitasku dari guru"
          description="Guru hanya melihat kode laporan dan inisialmu. Identitas asli hanya terbuka untuk BK jika kasus mendesak."
          checked={value}
          onChange={onChange}
        />
      </Card>

      <AnimatePresence mode="wait">
        <motion.div
          key={value ? 'hidden' : 'visible'}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
        >
          <Card color={value ? 'sunrise-light' : 'mint-light'} className="!py-3">
            <p className="text-xs text-ink/70 flex items-center gap-2">
              {value ? (
                <>
                  <EyeOff size={14} className="flex-shrink-0" />
                  <span>Guru akan melihat: <strong>Kode laporan + Inisialmu saja</strong></span>
                </>
              ) : (
                <>
                  <Eye size={14} className="flex-shrink-0" />
                  <span>Guru akan melihat: <strong>Nama lengkap + Kelasmu</strong></span>
                </>
              )}
            </p>
          </Card>
        </motion.div>
      </AnimatePresence>

      <Card color="lemon-light" className="!py-2.5">
        <p className="text-xs text-ink/60">
          🔐 Meski anonim, Guru BK tetap bisa melihat identitasmu jika laporan berstatus <strong>Mendesak</strong> demi keselamatanmu.
        </p>
      </Card>
    </div>
  )
}

function StepReview({ formData }) {
  const cat = CATEGORIES.find(c => c.id === formData.category)
  const urg = URGENCY_OPTIONS.find(u => u.id === formData.urgency)
  const isUrgent = formData.urgency === 'mendesak'
  const channelLabel = isUrgent
    ? 'Guru BK (otomatis karena Mendesak)'
    : formData.channel === 'guru_bk' ? 'Guru BK' : 'Wali Kelas'

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-bold font-heading">Review laporanmu</h2>
        <p className="text-xs text-ink/50 mt-0.5">Pastikan semuanya sudah benar sebelum dikirim</p>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="divide-y-2 divide-ink/10">
          <ReviewRow label="Kategori" value={<span className="flex items-center gap-1.5">{cat?.emoji} {cat?.label}</span>} />
          <ReviewRow label="Kapan mulai" value={formData.startDate} />
          <ReviewRow label="Cerita" value={formData.description} truncate />
          <ReviewRow
            label="Urgensi"
            value={
              <Badge variant={formData.urgency === 'mendesak' ? 'danger' : formData.urgency === 'penting' ? 'lemon' : 'sky'}>
                {urg?.label}
              </Badge>
            }
          />
          {formData.evidence ? (
            <ReviewRow label="Bukti" value={formData.evidence} truncate />
          ) : (
            <ReviewRow label="Bukti" value={<span className="text-ink/30 italic">Tidak ada</span>} />
          )}
          <ReviewRow label="Dikirim ke" value={channelLabel} />
          <ReviewRow
            label="Identitas"
            value={formData.anonymous ? '🔒 Disembunyikan' : '👁️ Terlihat guru'}
          />
        </div>
      </Card>

      <Card color="mint-light" className="!py-2.5">
        <p className="text-xs text-ink/60 flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-mint flex-shrink-0" />
          Setelah dikirim, kamu akan mendapat <strong>kode unik</strong> untuk lacak statusnya kapan saja.
        </p>
      </Card>
    </div>
  )
}

function ReviewRow({ label, value, truncate = false }) {
  return (
    <div className="flex gap-3 px-4 py-3">
      <span className="text-xs text-ink/40 font-medium w-24 flex-shrink-0 mt-0.5">{label}</span>
      <span className={`text-xs font-semibold text-ink flex-1 ${truncate ? 'line-clamp-2' : ''}`}>
        {value}
      </span>
    </div>
  )
}
