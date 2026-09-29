export default function Card({ children, className = '', glow, hover = true, ...props }) {
  const glowStyles = {
    blue: 'hover:border-[rgba(41,151,255,0.4)] hover:shadow-[0_0_24px_rgba(41,151,255,0.12)]',
    emerald: 'hover:border-[rgba(48,209,88,0.4)] hover:shadow-[0_0_24px_rgba(48,209,88,0.12)]',
    purple: 'hover:border-[rgba(191,90,242,0.4)] hover:shadow-[0_0_24px_rgba(191,90,242,0.12)]',
    amber: 'hover:border-[rgba(255,159,10,0.4)] hover:shadow-[0_0_24px_rgba(255,159,10,0.12)]',
  };

  return (
    <div
      className={`
        apple-card p-5 sm:p-6
        ${hover ? 'hover:border-[var(--border-medium)]' : ''}
        ${glow ? glowStyles[glow] : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, icon, action, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
        {icon && <span className="text-base leading-none">{icon}</span>}
        {children}
      </h3>
      {action && <div>{action}</div>}
    </div>
  );
}
