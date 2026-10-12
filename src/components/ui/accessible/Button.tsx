import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Ukuran Padding & Font
    const sizeClasses = {
      sm: 'py-2 px-3.5 text-xs rounded-xl font-medium min-h-[38px]',
      md: 'py-3 px-5 text-sm rounded-2xl font-semibold min-h-[46px]',
      lg: 'py-3.5 px-6 text-base rounded-2xl font-bold min-h-[54px]',
    };

    // Varian Tampilan + Efek Tekanan Fisik 3D Taktil
    const variantClasses = {
      primary:
        'bg-orange-500 text-white border-b-4 border-orange-600 hover:bg-orange-600 ' +
        'active:border-b-0 active:translate-y-1 focus:ring-4 focus:ring-orange-200 shadow-sm shadow-orange-500/20',
      secondary:
        'bg-sky-400 text-white border-b-4 border-sky-600 hover:bg-sky-500 ' +
        'active:border-b-0 active:translate-y-1 focus:ring-4 focus:ring-sky-200 shadow-sm shadow-sky-400/20',
      ghost:
        'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 ' +
        'active:translate-y-0.5 border border-transparent hover:border-slate-200 focus:ring-2 focus:ring-slate-300',
      danger:
        'bg-rose-500 text-white border-b-4 border-rose-700 hover:bg-rose-600 ' +
        'active:border-b-0 active:translate-y-1 focus:ring-4 focus:ring-rose-200 shadow-sm shadow-rose-500/20',
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center gap-2 select-none transition-all duration-100 outline-none ${
          sizeClasses[size]
        } ${variantClasses[variant]} ${
          fullWidth ? 'w-full' : ''
        } ${
          isDisabled
            ? 'opacity-55 cursor-not-allowed pointer-events-none filter grayscale-20'
            : 'cursor-pointer active:outline-none'
        } ${className}`}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : leftIcon ? (
          <span className="shrink-0 flex items-center">{leftIcon}</span>
        ) : null}

        <span>{children}</span>

        {!isLoading && rightIcon && <span className="shrink-0 flex items-center">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
