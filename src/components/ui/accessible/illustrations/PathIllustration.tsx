import React from 'react';

interface IllustrationProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

export const PathIllustration: React.FC<IllustrationProps> = ({
  className = '',
  size = 140,
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
      {/* Langit Latar */}
      <rect width="160" height="160" rx="36" fill="#F0F9FF" />

      {/* Bukit Belakang */}
      <path d="M-10 120 Q 40 85 90 115 T 180 100 L 180 160 L -10 160 Z" fill="#BAE6FD" />
      {/* Bukit Depan */}
      <path d="M-20 135 Q 50 110 110 130 T 180 120 L 180 160 L -20 160 Z" fill="#7DD3FC" />

      {/* Jalan Setapak Menuju Cahaya */}
      <path
        d="M 68 105 C 72 118, 76 132, 55 160 H 105 C 88 135, 84 118, 76 105 Z"
        fill="url(#path-glow-gradient)"
      />

      {/* Garis Pembimbing Langkah (Dotted Path) */}
      <path
        d="M 72 112 Q 74 125 78 142"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="4 6"
      />

      {/* Bunga-bunga Tepi Jalan */}
      <circle cx="48" cy="138" r="4" fill="#FDBA74" />
      <circle cx="112" cy="142" r="4.5" fill="#F472B6" />
      <circle cx="124" cy="132" r="3.5" fill="#FDE047" />

      {/* Cahaya di Ujung Jalan */}
      <circle cx="72" cy="100" r="14" fill="#FEF08A" fillOpacity="0.75" />
      <circle cx="72" cy="100" r="6" fill="#F59E0B" />

      <defs>
        <linearGradient id="path-glow-gradient" x1="72" y1="105" x2="80" y2="160" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" />
          <stop offset="1" stopColor="#FED7AA" />
        </linearGradient>
      </defs>
    </svg>
  );
};
