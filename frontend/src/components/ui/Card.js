export default function Card({ children, className = '', glow, hover = true, ...props }) {
  const glowStyles = {
    blue: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
    emerald: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    purple: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]',
    amber: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]',
  };

  return (
    <div
      className={`
        glass-card p-5
        ${hover ? 'hover:border-[var(--border-strong)]' : ''}
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
      <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        {children}
      </h3>
      {action && <div>{action}</div>}
    </div>
  );
}
