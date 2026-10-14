import { useRef, useState } from 'react'
import { Download, Eye, FileUp, RotateCcw, Sparkles, Trash2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../assets/illustrations/EmptyState'
import { parseAcademicCsv, parseAcademicCsvPreview } from '../../utils/parseAcademicCsv'

function escapeCsv(value) {
  const text = String(value)
  return /[;"\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export default function TeacherAcademicData() {
  const inputRef = useRef(null)
  const {
    currentUser,
    users,
    importDataAkademik,
    jalankanDeteksiDini,
    getUploadedFilesForClass,
    deleteUploadedFile,
    reimportUploadedFile,
  } = useApp()
  const [validRows, setValidRows] = useState([])
  const [errors, setErrors] = useState([])
  const [fileName, setFileName] = useState('')
  const [summary, setSummary] = useState(null)
  const [message, setMessage] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [rawCsv, setRawCsv] = useState('')
  const [previewFile, setPreviewFile] = useState(null)
  const [fileToDelete, setFileToDelete] = useState(null)

  const classStudents = users.filter(user => (
    user.role === 'siswa' && user.class === currentUser?.class
  ))
  const uploadedFiles = getUploadedFilesForClass(currentUser?.class)

  const handleFile = async file => {
    setValidRows([])
    setErrors([])
    setSummary(null)
    setMessage('')
    setFileName(file?.name || '')
    setRawCsv('')

    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setMessage('Pilih file dengan format .csv.')
      return
    }
    if (file.size > 500 * 1024) {
      setMessage('Ukuran file CSV melebihi batas 500 KB. Pilih file yang lebih kecil.')
      return
    }

    try {
      const csvText = await file.text()
      if (new Blob([csvText]).size > 500 * 1024) {
        setMessage('Ukuran file CSV melebihi batas 500 KB. Pilih file yang lebih kecil.')
        return
      }
      const result = parseAcademicCsv(csvText, users, currentUser?.id)
      setRawCsv(csvText)
      setValidRows(result.validRows)
      setErrors(result.errors)
      if (result.validRows.length === 0 && result.errors.length === 0) {
        setMessage('Tidak ada data yang dapat dibaca dari file CSV.')
      }
    } catch (error) {
      console.error('Gagal membaca file CSV:', error)
      setMessage('File CSV gagal dibaca. Periksa file lalu coba lagi.')
    }
  }

  const handleDownloadTemplate = () => {
    const period = new Date().toISOString().slice(0, 7)
    const lines = [
      ['student_id', 'periode', 'nilai', 'kehadiran', 'nama'].join(';'),
      ...classStudents.map(student => [
        student.id,
        period,
        '80',
        '95',
        escapeCsv(student.name),
      ].join(';')),
    ]
    const blob = new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'templat-data-akademik.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleSave = () => {
    try {
      const result = importDataAkademik(validRows, currentUser.id, {
        fileName,
        size: new Blob([rawCsv]).size,
        rawCsv,
        rowCount: validRows.length + errors.length,
        skippedRows: errors.length,
      })
      setSummary(result)
      setMessage('Data akademik berhasil disimpan.')
    } catch (error) {
      console.error('Gagal menyimpan data akademik:', error)
      setMessage(error.message || 'Data akademik gagal disimpan. Coba lagi.')
    }
  }

  const handleReimport = file => {
    try {
      reimportUploadedFile(file.id, currentUser.id)
      setMessage(`File ${file.fileName} berhasil diimpor ulang.`)
    } catch (error) {
      console.error('Gagal mengimpor ulang data akademik:', error)
      setMessage(error.message || 'File gagal diimpor ulang. Coba lagi.')
    }
  }

  const handleDelete = () => {
    try {
      deleteUploadedFile(fileToDelete.id, currentUser.id)
      setMessage(`File ${fileToDelete.fileName} dan data yang berasal darinya berhasil dihapus.`)
      setFileToDelete(null)
    } catch (error) {
      console.error('Gagal menghapus unggahan data akademik:', error)
      setMessage(error.message || 'File gagal dihapus. Coba lagi.')
    }
  }

  const handleDownload = file => {
    const blob = new Blob([file.rawCsv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.fileName
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDetection = () => {
    try {
      const count = jalankanDeteksiDini(currentUser.id)
      setMessage(`Deteksi dini selesai. ${count} laporan baru dibuat.`)
    } catch (error) {
      console.error('Gagal menjalankan deteksi dini:', error)
      setMessage('Deteksi dini gagal dijalankan. Silakan coba lagi.')
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold font-heading">Data Akademik</h1>
        <p className="mt-1 text-xs text-ink/60">
          Unggah nilai dan kehadiran siswa kelas {currentUser?.class}.
        </p>
      </div>

      <Card color="sky-light">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold">Templat CSV</h2>
            <p className="mt-1 text-xs text-ink/60">
              Templat berisi siswa kelas Anda dan contoh data untuk periode berjalan.
            </p>
          </div>
          <Button variant="outline" icon={Download} onClick={handleDownloadTemplate}>
            Unduh templat CSV
          </Button>
        </div>
      </Card>

      <Card>
        <div
          onDragOver={event => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={event => {
            event.preventDefault()
            setIsDragging(false)
            handleFile(event.dataTransfer.files[0])
          }}
          className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            isDragging ? 'border-sunrise bg-sunrise-light' : 'border-ink/30 bg-bg'
          }`}
        >
          <FileUp size={28} className="mx-auto mb-2" />
          <p className="text-sm font-bold">Pilih atau seret file CSV ke sini</p>
          <p className="mt-1 text-xs text-ink/60">Kolom wajib: student_id, periode, nilai, kehadiran.</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={event => {
              handleFile(event.target.files[0])
              event.target.value = ''
            }}
          />
          <Button variant="secondary" className="mt-3" onClick={() => inputRef.current?.click()}>
            Pilih file
          </Button>
          {fileName && <p className="mt-2 text-xs text-ink/60">{fileName}</p>}
        </div>
      </Card>

      {message && (
        <p role="status" aria-live="polite" className="text-sm font-semibold text-ink/80">
          {message}
        </p>
      )}

      {validRows.length > 0 && (
        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-bold">Pratinjau data</h2>
            <Badge variant="mint">{validRows.length} baris valid</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead>
                <tr className="border-b-2 border-ink/20">
                  <th className="p-2">ID siswa</th>
                  <th className="p-2">Nama</th>
                  <th className="p-2">Periode</th>
                  <th className="p-2">Nilai</th>
                  <th className="p-2">Kehadiran</th>
                </tr>
              </thead>
              <tbody>
                {validRows.map((row, index) => (
                  <tr key={`${row.studentId}-${row.periode}-${index}`} className="border-b border-ink/10">
                    <td className="p-2">{row.studentId}</td>
                    <td className="p-2">{row.nama}</td>
                    <td className="p-2">{row.periode}</td>
                    <td className="p-2">{row.nilaiRataRata}</td>
                    <td className="p-2">{row.kehadiranPersen}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {errors.length > 0 && (
        <Card color="danger-light">
          <h2 className="mb-2 font-bold">Baris yang perlu diperbaiki</h2>
          <ul className="space-y-1 text-xs">
            {errors.map((error, index) => (
              <li key={`${error.row}-${index}`}>Baris {error.row}: {error.reason}</li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={validRows.length === 0} onClick={handleSave}>
          Simpan ke sistem
        </Button>
      </div>

      {summary && (
        <Card color="mint-light">
          <h2 className="font-bold">Ringkasan penyimpanan</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="mint">Ditambahkan: {summary.ditambahkan}</Badge>
            <Badge variant="sky">Diperbarui: {summary.diperbarui}</Badge>
            <Badge variant="lemon">Dilewati: {summary.dilewati}</Badge>
          </div>
          <Button variant="secondary" icon={Sparkles} className="mt-4" onClick={handleDetection}>
            Jalankan Deteksi Dini
          </Button>
        </Card>
      )}

      <section aria-label="Riwayat unggahan">
        <h2 className="mb-3 text-lg font-bold font-heading">Riwayat Unggahan</h2>
        {uploadedFiles.length === 0 ? (
          <Card>
            <EmptyState text="Belum ada file CSV yang diunggah" />
          </Card>
        ) : (
          <div className="space-y-3">
            {uploadedFiles.map(file => (
              <Card key={file.id} className="!p-4">
                <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold">{file.fileName}</h3>
                    <p className="mt-1 text-xs text-ink/60">
                      {new Date(file.uploadedAt).toLocaleString('id-ID')} · {file.rowCount} baris
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="mint">Ditambahkan: {file.summary.ditambahkan}</Badge>
                      <Badge variant="sky">Diperbarui: {file.summary.diperbarui}</Badge>
                      <Badge variant="lemon">Dilewati: {file.summary.dilewati}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" icon={Eye} onClick={() => setPreviewFile(file)}>
                      Lihat
                    </Button>
                    <Button size="sm" variant="outline" icon={Download} onClick={() => handleDownload(file)}>
                      Unduh
                    </Button>
                    <Button size="sm" variant="secondary" icon={RotateCcw} onClick={() => handleReimport(file)}>
                      Impor ulang
                    </Button>
                    <Button size="sm" variant="danger" icon={Trash2} onClick={() => setFileToDelete(file)}>
                      Hapus
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Modal
        isOpen={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        title={`Pratinjau: ${previewFile?.fileName || ''}`}
        className="max-w-4xl"
      >
        {previewFile && (() => {
          const { headers, rows } = parseAcademicCsvPreview(previewFile.rawCsv)
          return (
            <div className="overflow-x-auto">
              {rows.length === 0 ? (
                <p className="text-sm text-ink/60">File tidak memiliki baris data.</p>
              ) : (
                <table className="w-full min-w-[500px] text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-ink/20">
                      {headers.map((header, index) => <th key={`${header}-${index}`} className="p-2">{header}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-ink/10">
                        {headers.map((header, columnIndex) => (
                          <td key={`${header}-${columnIndex}`} className="p-2">{row[columnIndex] || ''}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )
        })()}
      </Modal>

      <Modal
        isOpen={Boolean(fileToDelete)}
        onClose={() => setFileToDelete(null)}
        title="Hapus unggahan?"
      >
        <p className="text-sm leading-relaxed text-ink/70">
          Menghapus <strong>{fileToDelete?.fileName}</strong> juga akan menghapus data nilai dan kehadiran
          dari file ini pada riwayat siswa.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setFileToDelete(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Hapus file</Button>
        </div>
      </Modal>
    </div>
  )
}
