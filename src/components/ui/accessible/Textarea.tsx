import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, id, rows = 4, className = '', disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-semibold text-slate-700 block">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-help` : undefined}
          className={`w-full text-sm rounded-2xl border bg-white p-3.5 text-slate-900 transition-all outline-none placeholder:text-slate-400 leading-relaxed ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100 bg-rose-50/20'
              : 'border-slate-200 hover:border-slate-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100'
          } ${disabled ? 'bg-slate-100 cursor-not-allowed opacity-60 text-slate-500' : ''} ${className}`}
          {...props}
        />

        {error && (
          <p id={`${textareaId}-error`} className="text-xs text-rose-600 font-medium mt-0.5">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${textareaId}-help`} className="text-xs text-slate-500 mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
