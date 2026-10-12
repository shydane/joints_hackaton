import React from 'react';
import { SunIllustration } from './illustrations/SunIllustration';

export interface EmptyStateProps {
  title: string;
  description: string;
  illustration?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  illustration,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-3xl bg-slate-50/60 border border-slate-200/70 ${className}`}
    >
      <div className="mb-4 flex items-center justify-center">
        {illustration || <SunIllustration size={110} />}
      </div>

      <h3 className="text-base md:text-lg font-bold text-slate-800 mb-1.5">{title}</h3>
      <p className="text-xs md:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          type="button"
          className="inline-flex items-center justify-center px-4 py-2.5 text-xs md:text-sm font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 active:translate-y-0.5 text-white shadow-xs transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
