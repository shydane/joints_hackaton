/**
 * Ilustrasi SVG: tas sekolah.
 */
export default function SchoolBag({ className = '', size = 120 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Badan tas */}
      <rect x="25" y="35" width="70" height="65" rx="12" fill="#7CC6FE" stroke="#14213D" strokeWidth="2.5" />

      {/* Penutup atas */}
      <path
        d="M30 50 Q60 25 90 50"
        stroke="#14213D"
        strokeWidth="2.5"
        fill="#FF7A3D"
      />

      {/* Tali tas */}
      <path d="M35 35 Q35 15 60 15 Q85 15 85 35" stroke="#14213D" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Kantong depan */}
      <rect x="38" y="60" width="44" height="25" rx="6" fill="white" stroke="#14213D" strokeWidth="2" />

      {/* Resleting */}
      <line x1="50" y1="72" x2="70" y2="72" stroke="#14213D" strokeWidth="2" strokeLinecap="round" />
      <circle cx="70" cy="72" r="2.5" fill="#FFD966" stroke="#14213D" strokeWidth="1.5" />

      {/* Bintang kecil di tas */}
      <text x="55" y="55" fontSize="12" textAnchor="middle">⭐</text>
    </svg>
  )
}
