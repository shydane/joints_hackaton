import { motion } from 'framer-motion'

/**
 * Tombol reusable dengan gaya neobrutalism.
 * Variant: primary (sunrise), secondary (sky), outline, danger
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon: Icon,
  ...props
}) {
  // Mapping warna per variant
  const variants = {
    primary: 'bg-sunrise text-white hover:bg-sunrise/90',
    secondary: 'bg-sky text-ink hover:bg-sky/90',
    outline: 'bg-white text-ink hover:bg-bg',
    danger: 'bg-danger text-white hover:bg-danger/90',
    mint: 'bg-mint text-ink hover:bg-mint/90',
    lemon: 'bg-lemon text-ink hover:bg-lemon/90',
    ghost: 'bg-transparent text-ink hover:bg-bg border-transparent shadow-none',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={!disabled ? { scale: 0.97, boxShadow: '0px 0px 0 #14213D', x: 4, y: 4 } : {}}
      className={`
        neo-button font-semibold inline-flex items-center justify-center gap-2
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed !shadow-none' : ''}
        ${variant === 'ghost' ? '!border-transparent !shadow-none' : ''}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : 18} />}
      {children}
    </motion.button>
  )
}
