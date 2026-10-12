import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
}) => {
  const generatedId = React.useId();
  const toggleId = id || generatedId;

  return (
    <div className="flex items-center justify-between gap-4 select-none">
      {(label || description) && (
        <div className="flex flex-col text-left">
          {label && (
            <label
              htmlFor={toggleId}
              className={`text-sm font-semibold cursor-pointer ${
                disabled ? 'text-slate-400' : 'text-slate-800'
              }`}
            >
              {label}
            </label>
          )}
          {description && (
            <span className="text-xs text-slate-500 mt-0.5">{description}</span>
          )}
        </div>
      )}

      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-200 ${
          checked ? 'bg-sky-500' : 'bg-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
