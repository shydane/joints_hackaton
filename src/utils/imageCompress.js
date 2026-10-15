export async function compressImage(file, { maxSize = 1024, quality = 0.65 } = {}) {
  if (!file.type.startsWith('image/')) throw new Error('File bukan gambar')

  const image = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error || new Error('Gagal membaca file gambar'))
    reader.onabort = () => reject(new Error('Pembacaan file gambar dibatalkan'))
    reader.onload = () => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Gagal memuat file gambar'))
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })

  const canvas = document.createElement('canvas')
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
  canvas.width = Math.round(image.width * scale)
  canvas.height = Math.round(image.height * scale)

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Browser tidak mendukung pemrosesan gambar')

  context.fillStyle = '#fff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', quality)
}
