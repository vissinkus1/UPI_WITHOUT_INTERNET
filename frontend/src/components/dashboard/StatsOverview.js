'use client';

export default function StatsOverview({ meshState, accounts, transactions }) {
  const totalPackets = meshState?.devices?.reduce((s, d) => s + (d.packetCount || 0), 0) || 0;
  const bridgeDevices = meshState?.devices?.filter(d => d.hasInternet)?.length || 0;
  const settledList = transactions?.filter(t => t.status === 'SETTLED') || [];
  const settledCount = settledList.length;
  const duplicateDropped = transactions?.filter(t => t.status === 'DUPLICATE_DROPPED')?.length || 0;
  const totalVolume = settledList.reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const cacheSize = meshState?.idempotencyCacheSize ?? settledCount;

  const stats = [
    {
      label: 'Packets in Mesh Buffer',
      value: `${totalPackets} pkts`,
      subtext: totalPackets > 0 ? 'Travelling hop-to-hop' : 'All buffers flushed',
      icon: '📦',
      accent: '#2997ff',
    },
    {
      label: '4G Bridge Gateways',
      value: `${bridgeDevices} Online`,
      subtext: 'Outdoors with cellular data',
      icon: '📡',
      accent: '#30d158',
    },
    {
      label: 'Settled Transactions',
      value: settledCount,
      subtext: duplicateDropped > 0 ? `${duplicateDropped} dups dropped` : 'Zero collision',
      icon: '✓',
      accent: '#bf5af2',
    },
    {
      label: 'Volume Settled',
      value: `₹${totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      subtext: `Idempotency claims: ${cacheSize}`,
      icon: '₹',
      accent: '#ff9f0a',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="apple-card p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[var(--text-muted)] font-medium">
              {stat.label}
            </span>
            <span 
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: `${stat.accent}15`, color: stat.accent }}
            >
              {stat.icon}
            </span>
          </div>

          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[var(--text-primary)]">
              {stat.value}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: stat.accent }} />
              <span>{stat.subtext}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
