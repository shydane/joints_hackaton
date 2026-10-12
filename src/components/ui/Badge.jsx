/**
 * Badge / stiker status berwarna.
 */
export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-bg text-ink border-ink',
    sunrise: 'bg-sunrise-light text-sunrise border-sunrise',
    sky: 'bg-sky-light text-ink border-sky',
    lemon: 'bg-lemon-light text-ink border-lemon',
    mint: 'bg-mint-light text-ink border-mint',
    danger: 'badge-mendesak',
    deteksi: 'badge-deteksi',
    // Status kasus
    dikirim: 'bg-sky-light text-ink border-sky',
    ditinjau: 'bg-lemon-light text-ink border-lemon',
    pendampingan: 'bg-sunrise-light text-ink border-sunrise',
    selesai: 'bg-mint-light text-ink border-mint',
    eskalasi_eksternal: 'bg-danger-light text-danger border-danger',
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full
        border-2
        ${variants[variant] || variants.default}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
