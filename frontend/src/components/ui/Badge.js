import { STATUS_CONFIG } from '@/lib/constants';

export default function Badge({ status, children, variant, className = '' }) {
  if (status && STATUS_CONFIG[status]) {
    const config = STATUS_CONFIG[status];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide ${className}`}
        style={{ color: config.color, background: config.bg, border: `1px solid ${config.border || 'transparent'}` }}
      >
        <span className="text-[10px] leading-none font-bold">{config.icon}</span>
        {children || config.label}
      </span>
    );
  }

  const variants = {
    blue: 'bg-[rgba(41,151,255,0.12)] text-[#2997ff] border border-[rgba(41,151,255,0.25)]',
    emerald: 'bg-[rgba(48,209,88,0.12)] text-[#30d158] border border-[rgba(48,209,88,0.25)]',
    amber: 'bg-[rgba(255,159,10,0.12)] text-[#ff9f0a] border border-[rgba(255,159,10,0.25)]',
    red: 'bg-[rgba(255,69,58,0.12)] text-[#ff453a] border border-[rgba(255,69,58,0.25)]',
    purple: 'bg-[rgba(191,90,242,0.12)] text-[#bf5af2] border border-[rgba(191,90,242,0.25)]',
    gray: 'bg-white/[0.06] text-[var(--text-secondary)] border border-white/[0.08]',
    cyan: 'bg-[rgba(100,210,255,0.12)] text-[#64d2ff] border border-[rgba(100,210,255,0.25)]',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide
        ${variants[variant] || variants.gray}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
