import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import Button from '../ui/Button'
import Card from '../ui/Card'
import TextArea from '../ui/TextArea'

function normalizePhoneNumber(value) {
  return value.replace(/\D/g, '')
}

export default function EconomicReferralWhatsApp({ studentName = '', caseCode }) {
  const { currentUser } = useApp()
  const [savedNumbers, setSavedNumbers] = useLocalStorage('ls_district_whatsapp_by_school', {})
  const schoolKey = currentUser?.schoolId || currentUser?.school || 'demo-school'
  const configuredNumbers = savedNumbers && typeof savedNumbers === 'object' ? savedNumbers : {}
  const configuredPhone = typeof configuredNumbers[schoolKey] === 'string'
    ? configuredNumbers[schoolKey]
    : ''
  const [name, setName] = useState(studentName)
  const [nik, setNik] = useState('')
  const [reason, setReason] = useState('')
  const [phoneDraft, setPhoneDraft] = useState(configuredPhone)
  const [hasSharingConsent, setHasSharingConsent] = useState(false)
  const [whatsAppUrl, setWhatsAppUrl] = useState('')
  const [message, setMessage] = useState('')

  const handleSaveDistrictPhone = event => {
    event.preventDefault()
    setWhatsAppUrl('')
    setMessage('')

    const normalizedPhone = normalizePhoneNumber(phoneDraft)
    if (normalizedPhone.length < 8 || normalizedPhone.length > 15) {
      setMessage('Masukkan nomor WhatsApp Kecamatan dengan kode negara, 8–15 digit.')
      return
    }

    setSavedNumbers(previous => ({
      ...(previous && typeof previous === 'object' ? previous : {}),
      [schoolKey]: normalizedPhone,
    }))
    setPhoneDraft(normalizedPhone)
    setMessage('Nomor WhatsApp Kecamatan tersimpan untuk konfigurasi sekolah ini di browser.')
  }

  const handleRemoveDistrictPhone = () => {
    setSavedNumbers(previous => {
      const nextNumbers = { ...(previous && typeof previous === 'object' ? previous : {}) }
      delete nextNumbers[schoolKey]
      return nextNumbers
    })
    setPhoneDraft('')
    setWhatsAppUrl('')
    setMessage('Nomor WhatsApp Kecamatan dihapus dari konfigurasi browser ini.')
  }

  const handlePrepareMessage = event => {
    event.preventDefault()
    setWhatsAppUrl('')
    setMessage('')

    const normalizedNik = nik.replace(/\D/g, '')
    const normalizedPhone = normalizePhoneNumber(configuredPhone)
    if (!name.trim() || !reason.trim()) {
      setMessage('Nama siswa dan alasan pengaduan wajib diisi.')
      return
    }
    if (!/^\d{16}$/.test(normalizedNik)) {
      setMessage('NIK harus terdiri dari 16 digit angka.')
      return
    }
    if (normalizedPhone.length < 8 || normalizedPhone.length > 15) {
      setMessage('Atur nomor WhatsApp resmi Kecamatan pada konfigurasi tujuan terlebih dahulu.')
      return
    }
    if (!hasSharingConsent) {
      setMessage('Konfirmasi kewenangan dan persetujuan berbagi data terlebih dahulu.')
      return
    }

    const text = [
      'Pengaduan bantuan ekonomi siswa',
      `Kode kasus sekolah: ${caseCode}`,
      `Nama siswa: ${name.trim()}`,
      `NIK siswa: ${normalizedNik}`,
      `Alasan pengaduan: ${reason.trim()}`,
    ].join('\n')
    setWhatsAppUrl(`https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`)
  }

  return (
    <Card color="mint-light">
      <h2 className="flex items-center gap-2 text-sm font-bold font-heading">
        <MessageCircle size={18} />
        Rujukan bantuan ekonomi ke Kecamatan
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-ink/70">
        Isi data seperlunya. Data NIK tidak disimpan di aplikasi. Setelah tautan dibuka,
        WhatsApp akan menampilkan pesan untuk ditinjau; pesan baru terkirim setelah Anda menekan
        tombol kirim di WhatsApp.
      </p>

      <form onSubmit={handleSaveDistrictPhone} className="mt-4 rounded-xl border-2 border-ink/15 bg-white p-3">
        <label className="flex flex-col gap-1.5 text-xs font-semibold">
          Nomor WhatsApp resmi Kecamatan untuk sekolah ini
          <input
            type="tel"
            inputMode="tel"
            autoComplete="off"
            required
            maxLength={24}
            value={phoneDraft}
            onChange={event => {
              setPhoneDraft(event.target.value)
              setWhatsAppUrl('')
            }}
            placeholder="Contoh: 6281234567890"
            aria-describedby="district-phone-help"
            className="rounded-xl border-2 border-ink bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sunrise"
          />
          <span id="district-phone-help" className="font-normal text-ink/55">
            Gunakan kode negara tanpa tanda +. Nomor ini disimpan di browser ini, tidak diminta ulang saat membuat pengaduan.
          </span>
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button type="submit" size="sm" variant="outline">
            {configuredPhone ? 'Simpan perubahan nomor' : 'Simpan nomor Kecamatan'}
          </Button>
          {configuredPhone && (
            <>
              <span className="text-xs text-ink/60">
                Tujuan aktif: +{configuredPhone}
              </span>
              <Button type="button" size="sm" variant="ghost" onClick={handleRemoveDistrictPhone}>
                Hapus nomor
              </Button>
            </>
          )}
        </div>
      </form>

      <form onSubmit={handlePrepareMessage} className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-xs font-semibold">
          Nama siswa
          <input
            type="text"
            autoComplete="off"
            required
            maxLength={120}
            value={name}
            onChange={event => {
              setName(event.target.value)
              setWhatsAppUrl('')
            }}
            className="rounded-xl border-2 border-ink bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sunrise"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-semibold">
          NIK siswa
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            required
            maxLength={19}
            value={nik}
            onChange={event => {
              setNik(event.target.value)
              setWhatsAppUrl('')
            }}
            placeholder="Masukkan 16 digit NIK"
            aria-describedby="nik-help"
            className="rounded-xl border-2 border-ink bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sunrise"
          />
          <span id="nik-help" className="font-normal text-ink/55">
            NIK bersifat rahasia dan akan dimasukkan ke pesan WhatsApp setelah Anda menyetujui.
          </span>
        </label>

        <TextArea
          label="Alasan pengaduan"
          placeholder="Jelaskan kebutuhan bantuan ekonomi siswa secara singkat dan seperlunya..."
          value={reason}
          onChange={event => {
            setReason(event.target.value)
            setWhatsAppUrl('')
          }}
          rows={4}
          maxLength={1000}
          required
        />

        <label className="flex items-start gap-2 rounded-xl border-2 border-ink/10 bg-white p-3 text-xs leading-relaxed">
          <input
            type="checkbox"
            checked={hasSharingConsent}
            onChange={event => {
              setHasSharingConsent(event.target.checked)
              setWhatsAppUrl('')
            }}
            className="mt-0.5 h-4 w-4 shrink-0 accent-sunrise"
          />
          <span>
            Saya berwenang mengirim data ini dan telah memperoleh persetujuan siswa atau orang tua/wali
            untuk membagikan nama serta NIK kepada pihak Kecamatan melalui WhatsApp.
          </span>
        </label>

        {message && (
          <p role="status" aria-live="polite" className="text-xs font-semibold text-danger">
            {message}
          </p>
        )}

        <Button type="submit" variant="secondary" className="self-start">
          {configuredPhone ? 'Siapkan pesan WhatsApp' : 'Atur nomor tujuan terlebih dahulu'}
        </Button>
      </form>

      {whatsAppUrl && (
        <div className="mt-4 rounded-xl border-2 border-ink bg-white p-3">
          <p className="text-xs leading-relaxed text-ink/70">
            Tautan siap. WhatsApp akan terbuka dengan pesan terisi. Periksa penerima dan isi pesan
            sebelum mengirim.
          </p>
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="neo-button mt-3 inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-mint px-4 py-2.5 text-sm font-bold text-ink shadow-neo-sm transition hover:-translate-y-px"
          >
            <MessageCircle size={18} />
            Buka WhatsApp
          </a>
        </div>
      )}
    </Card>
  )
}
