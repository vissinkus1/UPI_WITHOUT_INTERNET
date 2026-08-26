'use client';

export default function StatsOverview({ meshState, accounts, transactions }) {
  const totalPackets = meshState?.devices?.reduce((s, d) => s + d.packetCount, 0) || 0;
  const bridgeDevices = meshState?.devices?.filter(d => d.hasInternet)?.length || 0;
  const settledCount = transactions?.filter(t => t.status === 'SETTLED')?.length || 0;
  const totalVolume = transactions
    ?.filter(t => t.status === 'SETTLED')
    ?.reduce((s, t) => s + parseFloat(t.amount), 0) || 0;

  const stats = [
    {
      label: 'Packets in Mesh',
      value: totalPackets,
      icon: '📦',
      color: 'from-blue-500 to-indigo-600',
      glow: 'rgba(59, 130, 246, 0.2)',
    },
    {
      label: 'Bridge Nodes',
      value: bridgeDevices,
      icon: '📡',
      color: 'from-emerald-500 to-teal-600',
      glow: 'rgba(16, 185, 129, 0.2)',
    },
    {
      label: 'Settled Txns',
      value: settledCount,
      icon: '✅',
      color: 'from-purple-500 to-violet-600',
      glow: 'rgba(139, 92, 246, 0.2)',
    },
    {
      label: 'Total Volume',
      value: `₹${totalVolume.toLocaleString('en-IN')}`,
      icon: '💰',
      color: 'from-amber-500 to-orange-600',
      glow: 'rgba(245, 158, 11, 0.2)',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="glass-card p-4 flex items-center gap-3 group"
        >
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} 
                        flex items-center justify-center text-lg flex-shrink-0
                        group-hover:scale-110 transition-transform duration-300`}
            style={{ boxShadow: `0 0 20px ${stat.glow}` }}
          >
            {stat.icon}
          </div>
          <div>
            <div className="text-lg font-bold text-[var(--text-primary)] font-mono">{stat.value}</div>
            <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
