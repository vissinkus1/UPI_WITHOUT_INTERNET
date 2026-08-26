'use client';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className = '',
  ...props
}) {
  const baseStyles = `
    inline-flex items-center justify-center font-semibold
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-deep)]
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.97]
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-500 to-blue-600 text-white
      hover:from-blue-400 hover:to-blue-500
      focus:ring-blue-500
      shadow-[0_0_20px_rgba(59,130,246,0.3)]
      hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]
    `,
    success: `
      bg-gradient-to-r from-emerald-500 to-teal-500 text-white
      hover:from-emerald-400 hover:to-teal-400
      focus:ring-emerald-500
      shadow-[0_0_20px_rgba(16,185,129,0.3)]
      hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600 text-white
      hover:from-red-400 hover:to-red-500
      focus:ring-red-500
      shadow-[0_0_20px_rgba(239,68,68,0.3)]
      hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]
    `,
    secondary: `
      bg-[var(--bg-elevated)] text-[var(--text-primary)]
      border border-[var(--border-default)]
      hover:bg-[var(--bg-surface)] hover:border-[var(--border-strong)]
      focus:ring-blue-500
    `,
    ghost: `
      bg-transparent text-[var(--text-secondary)]
      hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]
      focus:ring-blue-500
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {icon && !loading && <span className="text-lg">{icon}</span>}
      {children}
    </button>
  );
}
