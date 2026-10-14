import { useState } from 'react'
import OpenAI from 'openai'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Copy, Check, Trash2, AlertTriangle, Bot } from 'lucide-react'
import Button from './components/ui/Button'
import Card from './components/ui/Card'
import TextArea from './components/ui/TextArea'
import Badge from './components/ui/Badge'

const client = new OpenAI({
  baseURL: 'http://localhost:20128/v1',
  apiKey: '', // pindahkan key ke file .env
  dangerouslyAllowBrowser: true,
})

export default function App() {
  const [count, setCount] = useState(0)
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [studentForm, setStudentForm] = useState({
    name: '',
    nilai: '',
    status: 'Hadir',
  })
  const [students, setStudents] = useState([
    { id: 1, name: 'Ayu', nilai: 92, status: 'Hadir' },
    { id: 2, name: 'Budi', nilai: 88, status: 'Sakit' },
    { id: 3, name: 'Citra', nilai: 95, status: 'Hadir' },
  ])

  const totalNilai = students.reduce((sum, student) => sum + Number(student.nilai || 0), 0)
  const rataRataNilai = students.length ? (totalNilai / students.length).toFixed(1) : '0'
  const hadirCount = students.filter((student) => student.status === 'Hadir').length
  const alphaCount = students.filter((student) => student.status === 'Alpha').length

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setResponse('')
    setError('')

    try {
      const completion = await client.chat.completions.create({
        model: 'hackathon',
        messages: [{ role: 'user', content: prompt }],
      })

      const reply = completion.choices[0]?.message?.content
      if (reply && reply.trim() !== '') {
        setResponse(reply)
      } else {
        setError('AI memberikan respon kosong. Coba klik Kirim sekali lagi.')
      }
    } catch (err) {
      console.error('Error memanggil AI:', err)
      setError('Gagal mengambil respon dari AI: ' + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard tidak tersedia */
    }
  }

  const handleClear = () => {
    setPrompt('')
    setResponse('')
    setError('')
  }

  const handleStudentChange = (field, value) => {
    setStudentForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddStudent = () => {
    const name = studentForm.name.trim()
    const nilai = Number(studentForm.nilai)

    if (!name || Number.isNaN(nilai)) {
      setError('Nama siswa dan nilai harus diisi dengan benar.')
      return
    }

    setStudents((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        nilai,
        status: studentForm.status,
      },
    ])
    setStudentForm({ name: '', nilai: '', status: 'Hadir' })
    setError('')
  }

  return (
    <div className="min-h-screen bg-bg text-ink px-4 py-8">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold font-heading">Project JOIN + 9Router AI</h1>
            <p className="text-xs text-ink/40 mt-0.5">Tanya apa saja — kita cari jawabannya bersama</p>
          </div>
          <Badge variant="sky">hackathon</Badge>
        </div>

        {/* Counter demo */}
        <Card color="lemon-light" className="!py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-ink/60">Tes interaksi cepat</p>
            <motion.button
              onClick={() => setCount((c) => c + 1)}
              whileHover={{ y: -2, boxShadow: '6px 6px 0 #14213D' }}
              whileTap={{ scale: 0.98, boxShadow: '2px 2px 0 #14213D', x: 2, y: 2 }}
              className="neo-card bg-white !py-1.5 !px-3 text-xs font-bold"
              id="btn-counter"
            >
              Count is {count}
            </motion.button>
          </div>
        </Card>

        <Card color="sky-light" className="!py-4">
          <div className="mb-3">
            <h2 className="text-lg font-bold font-heading">Input Nilai & Absensi</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/70">Nama siswa</label>
              <input
                value={studentForm.name}
                onChange={(e) => handleStudentChange('name', e.target.value)}
                placeholder="Masukkan nama"
                className="rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sky"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/70">Nilai</label>
              <input
                type="number"
                min="0"
                max="100"
                value={studentForm.nilai}
                onChange={(e) => handleStudentChange('nilai', e.target.value)}
                placeholder="0-100"
                className="rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sky"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/70">Kehadiran</label>
              <select
                value={studentForm.status}
                onChange={(e) => handleStudentChange('status', e.target.value)}
                className="rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sky"
              >
                <option value="Hadir">Hadir</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
                <option value="Alpha">Alpha</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex gap-2 text-[11px] text-ink/60">
              <span className="rounded-full bg-white px-2 py-1">Rata-rata: {rataRataNilai}</span>
              <span className="rounded-full bg-white px-2 py-1">Hadir: {hadirCount}</span>
              <span className="rounded-full bg-white px-2 py-1">Alpha: {alphaCount}</span>
            </div>
            <Button variant="primary" onClick={handleAddStudent} className="!py-2 !px-4" id="btn-tambah-siswa">
              Tambah Siswa
            </Button>
          </div>
        </Card>

        <Card color="mint-light" className="!py-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold font-heading">Daftar Kehadiran Siswa</h2>
            <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-ink/60">
              {students.length} siswa
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-ink/10 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-ink/5 text-ink/70">
                <tr>
                  <th className="px-3 py-2 font-semibold">Nama</th>
                  <th className="px-3 py-2 font-semibold">Nilai</th>
                  <th className="px-3 py-2 font-semibold">Kehadiran</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-t border-ink/10">
                    <td className="px-3 py-2">{student.name}</td>
                    <td className="px-3 py-2">{student.nilai}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-sky/10 px-2 py-1 text-[11px] font-semibold text-ink/70">
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Input */}
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-lg font-bold font-heading">Tanya AI</h2>
            <p className="text-xs text-ink/50 mt-0.5">
              Ketik pertanyaan atau instruksi koding, atau pilih contoh di bawah
            </p>
          </div>

          <TextArea
            placeholder="Ketik pertanyaan atau instruksi koding di sini..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            id="input-prompt"
          />

          <div className="flex gap-3">
            {(prompt || response || error) && (
              <Button variant="outline" onClick={handleClear} icon={Trash2} id="btn-hapus">
                Hapus
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              icon={Send}
              className="flex-1"
              id="btn-kirim-ai"
            >
              {loading ? 'Sedang Diproses...' : 'Kirim ke AI'}
            </Button>
          </div>
        </div>

        {/* Respon */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-heading">Respon AI</h2>
            {response && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-semibold text-ink/50 hover:text-ink transition-colors"
                id="btn-salin"
              >
                {copied ? <Check size={14} className="text-mint" /> : <Copy size={14} />}
                {copied ? 'Tersalin' : 'Salin'}
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <Card color="sky-light" className="!py-5">
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-ink/60">
                    <motion.span
                      animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    >
                      <Sparkles size={16} className="text-sky" />
                    </motion.span>
                    AI sedang berpikir...
                  </div>
                </Card>
              </motion.div>
            )}

            {!loading && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <Card color="danger-light" className="!py-3 border-danger">
                  <div role="alert" className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-danger flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-danger">{error}</p>
                  </div>
                </Card>
              </motion.div>
            )}

            {!loading && !error && response && (
              <motion.div
                key="response"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <Card color="mint-light" className="!py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 flex-shrink-0 rounded-xl border-2 border-ink bg-white flex items-center justify-center">
                      <Bot size={18} />
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap flex-1 min-w-0 break-words">
                      {response}
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}

            {!loading && !error && !response && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card color="white" className="!py-6 text-center">
                  <p className="text-xs text-ink/30">Belum ada respon. Kirim pertanyaan dulu ya 👆</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}