/**
 * Ilustrasi SVG: jalan setapak menuju matahari terbit.
 * Dipakai di landing page dan progress form.
 */
export default function SunrisePath({ className = '', size = 200 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Langit */}
      <rect width="200" height="200" rx="20" fill="#E8F4FF" />

      {/* Matahari */}
      <circle cx="100" cy="60" r="30" fill="#FFD966" />
      {/* Sinar matahari */}
      <line x1="100" y1="20" x2="100" y2="10" stroke="#FF7A3D" strokeWidth="3" strokeLinecap="round" />
      <line x1="130" y1="35" x2="138" y2="28" stroke="#FF7A3D" strokeWidth="3" strokeLinecap="round" />
      <line x1="140" y1="60" x2="150" y2="60" stroke="#FF7A3D" strokeWidth="3" strokeLinecap="round" />
      <line x1="70" y1="35" x2="62" y2="28" stroke="#FF7A3D" strokeWidth="3" strokeLinecap="round" />
      <line x1="60" y1="60" x2="50" y2="60" stroke="#FF7A3D" strokeWidth="3" strokeLinecap="round" />

      {/* Bukit */}
      <ellipse cx="100" cy="150" rx="120" ry="40" fill="#8EE3C2" />

      {/* Jalan setapak */}
      <path
        d="M80 190 Q85 170 90 155 Q95 140 100 130 Q105 120 100 110"
        stroke="#14213D"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="8 4"
        fill="none"
      />
      <path
        d="M120 190 Q115 170 110 155 Q105 140 100 130 Q95 120 100 110"
        stroke="#14213D"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="8 4"
        fill="none"
      />

      {/* Rumah sekolah kecil */}
      <rect x="88" y="95" width="24" height="18" rx="2" fill="white" stroke="#14213D" strokeWidth="2" />
      <polygon points="86,97 100,85 114,97" fill="#FF7A3D" stroke="#14213D" strokeWidth="2" />
      <rect x="96" y="103" width="8" height="10" rx="1" fill="#7CC6FE" stroke="#14213D" strokeWidth="1.5" />
    </svg>
  )
}
