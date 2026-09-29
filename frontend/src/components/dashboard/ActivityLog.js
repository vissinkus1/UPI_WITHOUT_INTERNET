'use client';
import { useRef, useEffect } from 'react';
import Card, { CardHeader } from '@/components/ui/Card';

export default function ActivityLog({ logs = [], onClear }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs.length]);

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'inject': return { color: '#2997ff', bg: 'rgba(41,151,255,0.12)', label: 'INJECT' };
      case 'gossip': return { color: '#bf5af2', bg: 'rgba(191,90,242,0.12)', label: 'GOSSIP' };
      case 'bridge': return { color: '#30d158', bg: 'rgba(48,209,88,0.12)', label: 'BRIDGE' };
      case 'settled': return { color: '#30d158', bg: 'rgba(48,209,88,0.15)', label: 'SETTLED' };
      case 'duplicate': return { color: '#ff9f0a', bg: 'rgba(255,159,10,0.12)', label: 'IDEMP_DROP' };
      case 'error': return { color: '#ff453a', bg: 'rgba(255,69,58,0.12)', label: 'ERROR' };
      case 'reset': return { color: '#a1a1a6', bg: 'rgba(255,255,255,0.08)', label: 'RESET' };
      default: return { color: '#a1a1a6', bg: 'rgba(255,255,255,0.06)', label: 'LOG' };
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader 
        icon="⚡"
        action={
          logs.length > 0 && onClear && (
            <button 
              onClick={onClear}
              className="text-[10px] text-[var(--text-muted)] hover:text-white transition-colors"
            >
              Clear
            </button>
          )
        }
      >
        <span className="font-semibold text-base tracking-tight">Real-Time Event Stream</span>
      </CardHeader>

      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto max-h-[380px] p-3 rounded-xl bg-black/50 border border-white/[0.06] font-mono text-[11px] space-y-2 select-text"
      >
        {logs.length === 0 ? (
          <div className="text-[var(--text-muted)] text-center py-10 font-sans text-xs">
            Mesh is listening for Bluetooth gossip and settlement events...
          </div>
        ) : (
          logs.map((log, i) => {
            const badge = getBadgeStyle(log.type);
            return (
              <div key={i} className="flex items-start gap-2 leading-relaxed animate-fade-in">
                <span className="text-[var(--text-muted)] shrink-0 select-none">
                  [{log.time}]
                </span>
                <span 
                  className="px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wider shrink-0 select-none uppercase"
                  style={{ color: badge.color, background: badge.bg }}
                >
                  {badge.label}
                </span>
                <span className="text-[var(--text-secondary)] break-all font-mono">
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
