import { useState } from 'react'
import Modal from './Modal'

export default function FotoGallery({ photos, anonymous }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const validPhotos = Array.isArray(photos) ? photos.filter(photo => typeof photo === 'string') : []

  if (validPhotos.length === 0) return null

  return (
    <section className="neo-card flex flex-col gap-3 bg-white">
      <h3 className="text-sm font-bold font-heading">Foto Bukti</h3>
      <div className="gallery flex flex-wrap gap-3">
        {validPhotos.map((url, index) => (
          <button
            key={`${index}-${url.slice(0, 24)}`}
            type="button"
            onClick={() => !anonymous && setSelectedPhoto(url)}
            disabled={anonymous}
            aria-label={anonymous ? 'Foto bukti laporan anonim' : `Perbesar foto bukti ${index + 1}`}
            className={`overflow-hidden rounded-lg border-2 border-ink ${anonymous ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <img src={url} alt="" width={100} height={100} className="h-24 w-24 object-cover" />
          </button>
        ))}
      </div>
      <Modal
        isOpen={Boolean(selectedPhoto)}
        onClose={() => setSelectedPhoto(null)}
        title="Foto Bukti"
      >
        {selectedPhoto && (
          <img src={selectedPhoto} alt="" className="mx-auto max-h-[65vh] max-w-full object-contain" />
        )}
      </Modal>
    </section>
  )
}
