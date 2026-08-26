'use client';
import Card, { CardHeader } from '@/components/ui/Card';

const ACCOUNT_COLORS = {
  'alice@demo': { gradient: 'from-blue-500 to-indigo-600', emoji: '👩' },
  'bob@demo': { gradient: 'from-purple-500 to-violet-600', emoji: '👨' },
  'carol@demo': { gradient: 'from-emerald-500 to-teal-600', emoji: '👩‍💻' },
  'dave@demo': { gradient: 'from-amber-500 to-orange-600', emoji: '🧑‍💼' },
};

export default function AccountBalances({ accounts }) {
  if (!accounts || accounts.length === 0) {
    return (
      <Card glow="emerald">
        <CardHeader icon="🏦">Account Balances</CardHeader>
        <div className="text-center text-[var(--text-muted)] py-8 text-sm">Loading accounts...</div>
      </Card>
    );
  }

  return (
    <Card glow="emerald">
      <CardHeader icon="🏦">Account Balances</CardHeader>
      <div className="space-y-3">
        {accounts.map(account => {
          const config = ACCOUNT_COLORS[account.vpa] || { gradient: 'from-gray-500 to-gray-600', emoji: '👤' };
          return (
            <div
              key={account.vpa}
              className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-deep)] 
                         border border-[var(--border-subtle)] hover:border-[var(--border-default)]
                         transition-all duration-200"
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} 
                              flex items-center justify-center text-lg flex-shrink-0
                              shadow-sm`}>
                {config.emoji}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--text-primary)]">{account.holderName}</div>
                <div className="text-xs text-[var(--text-muted)] font-mono">{account.vpa}</div>
              </div>

              {/* Balance */}
              <div className="text-right">
                <div className="text-base font-bold font-mono text-emerald-400">
                  ₹{parseFloat(account.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
