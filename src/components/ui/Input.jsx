/**
 * Input field dengan gaya neobrutalism.
 */
export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-ink">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          w-full px-4 py-2.5 text-sm bg-white rounded-xl
          border-2 border-ink
          focus:outline-none focus:ring-2 focus:ring-sunrise focus:border-sunrise
          placeholder:text-ink/30
          transition-all
          ${error ? 'border-danger ring-1 ring-danger' : ''}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs text-danger font-medium">{error}</span>
      )}
    </div>
  )
}
