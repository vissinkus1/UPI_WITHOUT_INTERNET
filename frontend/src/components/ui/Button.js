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
    inline-flex items-center justify-center font-medium tracking-tight
    transition-all duration-200 ease-out select-none
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-canvas)]
    disabled:opacity-40 disabled:cursor-not-allowed
    active:scale-[0.97]
  `;

  const variants = {
    primary: `
      bg-[#2997ff] hover:bg-[#147ce5] text-white
      focus:ring-[#2997ff]
      shadow-[0_2px_12px_rgba(41,151,255,0.28)]
      hover:shadow-[0_4px_20px_rgba(41,151,255,0.4)]
    `,
    success: `
      bg-[#30d158] hover:bg-[#28b84d] text-white
      focus:ring-[#30d158]
      shadow-[0_2px_12px_rgba(48,209,88,0.28)]
      hover:shadow-[0_4px_20px_rgba(48,209,88,0.4)]
    `,
    danger: `
      bg-[#ff453a] hover:bg-[#e0382e] text-white
      focus:ring-[#ff453a]
      shadow-[0_2px_12px_rgba(255,69,58,0.28)]
      hover:shadow-[0_4px_20px_rgba(255,69,58,0.4)]
    `,
    secondary: `
      bg-white/[0.06] hover:bg-white/[0.1] text-[var(--text-primary)]
      border border-[var(--border-hairline)] hover:border-[var(--border-medium)]
      focus:ring-[#2997ff]
    `,
    ghost: `
      bg-transparent text-[var(--text-secondary)]
      hover:bg-white/[0.06] hover:text-[var(--text-primary)]
      focus:ring-[#2997ff]
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-full gap-1.5',
    md: 'px-4 py-2 text-sm rounded-full gap-2',
    lg: 'px-6 py-2.5 text-base rounded-full gap-2.5',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-0.5 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {!loading && icon && <span className="leading-none">{icon}</span>}
      {children}
    </button>
  );
}
