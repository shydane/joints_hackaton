import { useRef, useState } from 'react'
import { compressImage } from '../../utils/imageCompress'

const MAX_PHOTOS = 3

export default function FotoBukti({ value = [], onChange }) {
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const photosRef = useRef(value)
  const pendingCountRef = useRef(0)

  const updatePhotos = (nextPhotos) => {
    photosRef.current = nextPhotos
    onChange(nextPhotos.map(photo => photo.url))
  }

  const handleFiles = async (fileList) => {
    const availableSlots = MAX_PHOTOS - photosRef.current.length - pendingCountRef.current
    const selectedFiles = Array.from(fileList || []).slice(0, Math.max(0, availableSlots))
    if (selectedFiles.length === 0) {
      if (availableSlots <= 0) setError('Kamu hanya dapat mengunggah maksimal 3 foto.')
      return
    }

    pendingCountRef.current += selectedFiles.length
    setError('')
    const newPhotos = []

    try {
      for (const file of selectedFiles) {
        try {
          const url = await compressImage(file, { maxSize: 1024, quality: 0.65 })
          newPhotos.push({
            url,
            name: file.name,
            size: Math.round((url.length * 3 / 4) / 1024),
          })
        } catch (uploadError) {
          console.error('Gagal memproses foto bukti:', uploadError)
          setError('Sebagian foto tidak dapat diproses. Pastikan file yang dipilih adalah gambar.')
        }
      }

      if (newPhotos.length > 0) {
        updatePhotos([...photosRef.current, ...newPhotos])
      }
    } finally {
      pendingCountRef.current -= selectedFiles.length
    }
  }

  const removePhoto = (index) => {
    updatePhotos(photosRef.current.filter((_, photoIndex) => photoIndex !== index))
    setError('')
  }

  const onCapture = async (event) => {
    await handleFiles(event.target.files)
    event.target.value = ''
  }

  return (
    <div className="foto-bukti flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="neo-button bg-sunrise-light px-4 py-2 text-sm font-bold"
        >
          Ambil Foto
        </button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onCapture}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="neo-button bg-white px-4 py-2 text-sm font-bold"
        >
          Pilih dari Galeri
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onCapture}
        />
      </div>

      <p className="text-xs text-ink/50">{value.length}/{MAX_PHOTOS} foto</p>
      {error && <p role="alert" className="text-xs font-semibold text-danger">{error}</p>}

      {value.length > 0 && (
        <div className="thumbs flex flex-wrap gap-3">
          {value.map((photo, index) => (
            <div key={`${photo.name}-${index}`} className="thumb neo-border-sm relative flex flex-col gap-1 bg-white p-2">
              <img src={photo.url} alt={photo.name} width={80} height={80} className="h-20 w-20 object-cover" />
              <span className="text-xs text-ink/60">{photo.size} KB</span>
              <button
                type="button"
                onClick={() => removePhoto(index)}
                aria-label={`Hapus foto ${photo.name}`}
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-white font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
