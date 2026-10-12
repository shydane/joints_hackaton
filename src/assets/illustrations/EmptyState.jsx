/**
 * Ilustrasi SVG untuk empty state.
 */
export default function EmptyState({ className = '', size = 160, text = 'Belum ada data' }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Awan */}
        <ellipse cx="80" cy="50" rx="40" ry="20" fill="white" stroke="#14213D" strokeWidth="2" />
        <ellipse cx="65" cy="45" rx="20" ry="15" fill="white" stroke="#14213D" strokeWidth="2" />
        <ellipse cx="95" cy="45" rx="20" ry="15" fill="white" stroke="#14213D" strokeWidth="2" />
        <rect x="45" y="45" width="70" height="10" fill="white" />

        {/* Matahari mengintip */}
        <circle cx="130" cy="35" r="15" fill="#FFD966" stroke="#14213D" strokeWidth="2" />
        <line x1="130" y1="15" x2="130" y2="10" stroke="#FF7A3D" strokeWidth="2" strokeLinecap="round" />
        <line x1="145" y1="25" x2="150" y2="20" stroke="#FF7A3D" strokeWidth="2" strokeLinecap="round" />

        {/* Kotak kosong */}
        <rect x="50" y="80" width="60" height="50" rx="8" fill="#F3F7FA" stroke="#14213D" strokeWidth="2" strokeDasharray="6 3" />
        <text x="80" y="110" fontSize="20" textAnchor="middle">📭</text>
      </svg>
      <p className="text-sm text-ink/50 font-medium">{text}</p>
    </div>
  )
}
