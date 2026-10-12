import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'flat' | 'outline' | 'warm' | 'calm';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'elevated', padding = 'md', className = '', ...props }, ref) => {
    const variantClasses = {
      elevated: 'bg-white shadow-sm hover:shadow-md border border-slate-100 transition-shadow duration-200',
      flat: 'bg-slate-50/80 border border-slate-200/60',
      outline: 'bg-white border-2 border-slate-200',
      warm: 'bg-orange-50/70 border border-orange-100 text-orange-950',
      calm: 'bg-sky-50/70 border border-sky-100 text-sky-950',
    };

    const paddingClasses = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={`rounded-2xl transition-all ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
