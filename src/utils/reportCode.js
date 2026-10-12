/**
 * Menghasilkan kode laporan unik berformat LS-XXXX-X.
 */
export function generateReportCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let middle = ''

  for (let i = 0; i < 4; i += 1) {
    middle += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  const last = Math.floor(1 + Math.random() * 9)
  return `LS-${middle}-${last}`
}
