import React from 'react';

interface IllustrationProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

export const SunIllustration: React.FC<IllustrationProps> = ({
  className = '',
  size = 120,
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
      {/* Sinar Matahari Luar Lembut */}
      <circle cx="80" cy="80" r="68" fill="#FDE047" fillOpacity="0.18" />
      <circle cx="80" cy="80" r="54" fill="#FDBA74" fillOpacity="0.25" />
      
      {/* Sinar Matahari Bertahap */}
      <g stroke="#FB923C" strokeWidth="4.5" strokeLinecap="round" opacity="0.85">
        <line x1="80" y1="12" x2="80" y2="24" />
        <line x1="80" y1="136" x2="80" y2="148" />
        <line x1="12" y1="80" x2="24" y2="80" />
        <line x1="136" y1="80" x2="148" y2="80" />
        <line x1="32" y1="32" x2="41" y2="41" />
        <line x1="119" y1="119" x2="128" y2="128" />
        <line x1="32" y1="128" x2="41" y2="119" />
        <line x1="119" y1="41" x2="128" y2="32" />
      </g>

      {/* Inti Matahari Hangat */}
      <circle cx="80" cy="80" r="38" fill="url(#sun-warm-gradient)" />
      
      {/* Senyuman Halus (Ramah dan Lembut) */}
      <circle cx="68" cy="74" r="3.5" fill="#C2410C" />
      <circle cx="92" cy="74" r="3.5" fill="#C2410C" />
      <path
        d="M69 86C72 90 77 92 80 92C83 92 88 90 91 86"
        stroke="#C2410C"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Pipi Merah Lembut */}
      <ellipse cx="61" cy="80" rx="4.5" ry="2.5" fill="#F87171" fillOpacity="0.45" />
      <ellipse cx="99" cy="80" rx="4.5" ry="2.5" fill="#F87171" fillOpacity="0.45" />

      <defs>
        <linearGradient id="sun-warm-gradient" x1="50" y1="50" x2="110" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#F97316" />
        </linearGradient>
      </defs>
    </svg>
  );
};
