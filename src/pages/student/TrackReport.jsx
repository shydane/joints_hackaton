import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ArrowRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Timeline from '../../components/ui/Timeline'
import EmptyState from '../../assets/illustrations/EmptyState'

/**
 * Halaman lacak laporan siswa.
 * Bisa input kode manual atau lihat riwayat.
 */

const statusLabels = {
  dikirim: 'Dikirim',
  ditinjau: 'Ditinjau',
  pendampingan: 'Pendampingan',
  selesai: 'Selesai',
  eskalasi_eksternal: 'Eskalasi Eksternal',
}

const categoryLabels = {
  ekonomi: '💰 Ekonomi',
  bullying: '😰 Bullying / Sosial',
  motivasi: '😔 Kurang Motivasi',
  lainnya: '💬 Lainnya',
}

export default function TrackReport() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { currentUser, getReportByCode, getReportsForUser } = useApp()

  const [searchCode, setSearchCode] = useState(searchParams.get('code') || '')
  const [selectedReport, setSelectedReport] = useState(null)
  const [searchError, setSearchError] = useState('')

  const myReports = currentUser ? getReportsForUser(currentUser.id, 'siswa') : []

  // Auto-search jika ada code di URL
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      const report = getReportByCode(code)
      if (report) {
        setSelectedReport(report)
        setSearchError('')
      }
    }
  }, [searchParams, getReportByCode])

  const handleSearch = () => {
    if (!searchCode.trim()) return
    const report = getReportByCode(searchCode.trim().toUpperCase())
    if (report) {
      setSelectedReport(report)
      setSearchError('')
    } else {
      setSelectedReport(null)
      setSearchError('Kode laporan tidak ditemukan')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold font-heading">Lacak Laporan</h1>
        <p className="text-xs text-ink/50 mt-1">Masukkan kode laporan atau pilih dari riwayat</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <Input
          placeholder="Masukkan kode (LS-XXXX-X)"
          value={searchCode}
          onChange={(e) => {
            setSearchCode(e.target.value.toUpperCase())
            setSearchError('')
          }}
          error={searchError}
          className="flex-1"
        />
        <Button variant="primary" onClick={handleSearch} icon={Search} className="!px-3">
          Cari
        </Button>
      </div>

      {/* Detail laporan terpilih */}
      {selectedReport && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold font-mono text-sunrise">{selectedReport.code}</span>
              <Badge variant={selectedReport.status}>{statusLabels[selectedReport.status]}</Badge>
            </div>

            <div className="mb-4 space-y-1.5">
              <p className="text-xs text-ink/50">
                Kategori: <strong className="text-ink">{categoryLabels[selectedReport.category]}</strong>
              </p>
              <p className="text-xs text-ink/50">
                Dilaporkan: <strong className="text-ink">{new Date(selectedReport.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              </p>
              {selectedReport.source === 'deteksi' && (
                <Badge variant="deteksi">🔍 Terdeteksi Otomatis</Badge>
              )}
            </div>

            {/* Timeline */}
            <h3 className="text-sm font-bold font-heading mb-3">Status Progress</h3>
            <Timeline
              currentStatus={selectedReport.status}
              notes={selectedReport.notes}
            />

            {/* Catatan dari guru */}
            {selectedReport.notes.filter(n => n.visibleToStudent).length > 0 && (
              <div className="mt-4 pt-4 border-t-2 border-ink/10">
                <h3 className="text-sm font-bold font-heading mb-3">Catatan dari Guru</h3>
                <div className="flex flex-col gap-2">
                  {selectedReport.notes.filter(n => n.visibleToStudent).map(note => (
                    <Card key={note.id} color="sky-light" className="!py-2.5 !px-3">
                      <p className="text-xs font-semibold text-ink">{note.author} <span className="text-ink/40">({note.role === 'wali_kelas' ? 'Wali Kelas' : 'Guru BK'})</span></p>
                      <p className="text-xs text-ink/60 mt-1">{note.content}</p>
                      <p className="text-[10px] text-ink/30 mt-1">
                        {new Date(note.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Riwayat laporan */}
      <div>
        <h2 className="text-sm font-bold font-heading mb-3">Riwayat Laporanmu</h2>

        {myReports.length === 0 ? (
          <EmptyState text="Belum ada laporan" />
        ) : (
          <div className="flex flex-col gap-2">
            {myReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  hoverable
                  onClick={() => {
                    setSelectedReport(report)
                    setSearchCode(report.code)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={`flex items-center gap-3 !py-3 ${selectedReport?.id === report.id ? 'ring-2 ring-sunrise' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-ink/40 font-mono">{report.code}</span>
                      <Badge variant={report.status}>{statusLabels[report.status]}</Badge>
                      {report.source === 'deteksi' && <Badge variant="deteksi">Auto</Badge>}
                    </div>
                    <p className="text-xs text-ink/50 mt-1 truncate">
                      {categoryLabels[report.category]}
                    </p>
                  </div>
                  <ArrowRight size={14} className="text-ink/20" />
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
