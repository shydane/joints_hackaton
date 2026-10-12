import React from 'react';
import { Badge, type BadgeStatusVariant } from './Badge';
import { Check } from 'lucide-react';

export interface TimelineStep {
  title: string;
  date?: string;
  description?: string;
  status?: BadgeStatusVariant;
  isCompleted?: boolean;
  isCurrent?: boolean;
}

export interface TimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ steps, className = '' }) => {
  return (
    <div className={`relative flex flex-col gap-6 pl-2 ${className}`}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="relative flex items-start gap-4">
            {/* Garis Vertikal */}
            {!isLast && (
              <div
                className={`absolute left-[15px] top-8 bottom-[-24px] w-0.5 transition-colors ${
                  step.isCompleted ? 'bg-sky-400' : 'bg-slate-200'
                }`}
                aria-hidden="true"
              />
            )}

            {/* Titik / Indikator Bulat */}
            <div
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                step.isCompleted
                  ? 'border-sky-500 bg-sky-500 text-white shadow-xs'
                  : step.isCurrent
                  ? 'border-orange-500 bg-orange-50 text-orange-600 ring-4 ring-orange-100 animate-pulse'
                  : 'border-slate-300 bg-white text-slate-400'
              }`}
            >
              {step.isCompleted ? (
                <Check className="h-4 w-4 stroke-[3]" />
              ) : (
                <span className="text-xs font-bold">{index + 1}</span>
              )}
            </div>

            {/* Konten Keterangan */}
            <div className="flex flex-col flex-1 pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`text-sm font-bold ${step.isCurrent ? 'text-orange-700' : 'text-slate-800'}`}>
                  {step.title}
                </span>

                <div className="flex items-center gap-2">
                  {step.status && <Badge status={step.status} size="sm" />}
                  {step.date && <span className="text-xs text-slate-400">{step.date}</span>}
                </div>
              </div>

              {step.description && (
                <p className="mt-1 text-xs md:text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
