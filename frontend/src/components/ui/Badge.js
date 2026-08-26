import { STATUS_CONFIG } from '@/lib/constants';

export default function Badge({ status, children, variant, className = '' }) {
  // If a known status is provided, use its config
  if (status && STATUS_CONFIG[status]) {
    const config = STATUS_CONFIG[status];
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}
        style={{ color: config.color, background: config.bg }}
      >
        <span>{config.icon}</span>
        {children || config.label}
      </span>
    );
  }

  // Custom variant badges
  const variants = {
    blue: 'bg-blue-500/15 text-blue-400',
    emerald: 'bg-emerald-500/15 text-emerald-400',
    amber: 'bg-amber-500/15 text-amber-400',
    red: 'bg-red-500/15 text-red-400',
    purple: 'bg-purple-500/15 text-purple-400',
    gray: 'bg-gray-500/15 text-gray-400',
    cyan: 'bg-cyan-500/15 text-cyan-400',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
        ${variants[variant] || variants.gray}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
