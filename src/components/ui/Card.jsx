import { motion } from 'framer-motion'

/**
 * Card reusable dengan gaya neobrutalism.
 */
export default function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
  color = 'white', // white, sunrise-light, sky-light, lemon-light, mint-light
  ...props
}) {
  const bgColors = {
    white: 'bg-white',
    'sunrise-light': 'bg-sunrise-light',
    'sky-light': 'bg-sky-light',
    'lemon-light': 'bg-lemon-light',
    'mint-light': 'bg-mint-light',
    'danger-light': 'bg-danger-light',
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={hoverable ? { y: -2, boxShadow: '6px 6px 0 #14213D' } : {}}
      className={`
        neo-card ${bgColors[color] || bgColors.white}
        ${hoverable ? 'cursor-pointer transition-shadow' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}
