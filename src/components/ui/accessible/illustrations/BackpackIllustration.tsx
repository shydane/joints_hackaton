import React from 'react';

interface IllustrationProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

export const BackpackIllustration: React.FC<IllustrationProps> = ({
  className = '',
  size = 130,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Pegangan Tas Atas */}
      <path
        d="M62 48 C 62 30, 98 30, 98 48"
        stroke="#0284C7"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Badan Tas Utama */}
      <rect x="42" y="44" width="76" height="84" rx="24" fill="#38BDF8" />
      
      {/* Tutup Atas Tas */}
      <path
        d="M42 66 C 42 50, 118 50, 118 66 L 114 82 C 114 88, 46 88, 46 82 Z"
        fill="#0284C7"
      />

      {/* Kantong Depan Tas */}
      <rect x="52" y="86" width="56" height="36" rx="14" fill="#BAE6FD" />
      {/* Resleting Kantong */}
      <line x1="58" y1="86" x2="102" y2="86" stroke="#0369A1" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="80" cy="98" r="4" fill="#F97316" />

      {/* Gantungan Kunci Gantungan Hati / Pelindung */}
      <circle cx="118" cy="78" r="3" fill="#64748B" />
      <path
        d="M 118 80 C 118 83, 114 86, 114 88 C 114 91, 118 93, 120 91 C 122 93, 126 91, 126 88 C 126 86, 122 83, 122 80 Z"
        fill="#F43F5E"
      />

      {/* Bayangan Bawah Tas */}
      <ellipse cx="80" cy="136" rx="42" ry="7" fill="#CBD5E1" fillOpacity="0.5" />
    </svg>
  );
};
