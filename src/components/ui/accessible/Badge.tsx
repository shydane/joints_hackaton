import React from 'react';
import { 
  SendHorizontal, 
  Search, 
  HeartHandshake, 
  CheckCircle2, 
  AlertCircle, 
  Bot, 
  ShieldAlert 
} from 'lucide-react';

export type BadgeStatusVariant =
  | 'dikirim'
  | 'ditinjau'
  | 'pendampingan'
  | 'selesai'
  | 'mendesak'
  | 'terdeteksi_otomatis'
  | 'eskalasi_eksternal'
  | 'default';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: BadgeStatusVariant;
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: React.ReactElement<{ className?: string }>;
}

const statusMap: Record<BadgeStatusVariant, StatusConfig> = {
  dikirim: {
    label: 'Terkirim',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-300',
    icon: <SendHorizontal className="w-3.5 h-3.5" />,
  },
  ditinjau: {
    label: 'Sedang Ditinjau',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-300',
    icon: <Search className="w-3.5 h-3.5" />,
  },
  pendampingan: {
    label: 'Dalam Pendampingan',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-300',
    icon: <HeartHandshake className="w-3.5 h-3.5" />,
  },
  selesai: {
    label: 'Selesai Teratasi',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  mendesak: {
    label: 'Butuh Respon Cepat',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-400',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  terdeteksi_otomatis: {
    label: 'Analisis AI Proteksi',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-300',
    icon: <Bot className="w-3.5 h-3.5" />,
  },
  eskalasi_eksternal: {
    label: 'Eskalasi Ahli / PKM',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-400',
    icon: <ShieldAlert className="w-3.5 h-3.5" />,
  },
  default: {
    label: 'Info',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
};

export const Badge: React.FC<BadgeProps> = ({
  status = 'default',
  label,
  showIcon = true,
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const config = statusMap[status] || statusMap.default;
  const displayText = label || children || config.label;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-xs md:text-sm px-3 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-2xs select-none ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {showIcon && React.cloneElement(config.icon, { className: size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5' })}
      <span>{displayText}</span>
    </span>
  );
};
