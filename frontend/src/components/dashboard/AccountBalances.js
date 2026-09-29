'use client';
import Card, { CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { DEMO_ACCOUNTS } from '@/lib/constants';

export default function AccountBalances({ accounts, onSelectAccount }) {
  const accountMetaMap = Object.fromEntries(DEMO_ACCOUNTS.map(a => [a.vpa, a]));

  if (!accounts || accounts.length === 0) {
    return (
      <Card glow="emerald">
        <CardHeader icon="🏦">Demo Ledger Accounts</CardHeader>
        <div className="text-center text-[var(--text-muted)] py-8 text-xs font-mono">
          Synchronizing balances with backend...
        </div>
      </Card>
    );
  }

  return (
    <Card glow="emerald">
      <CardHeader 
        icon="🏦" 
        action={<Badge variant="emerald">Live Ledger</Badge>}
      >
        <span className="font-semibold text-base tracking-tight">Virtual Bank Accounts</span>
      </CardHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {accounts.map(account => {
          const meta = accountMetaMap[account.vpa] || { emoji: '👤', role: 'User', gradient: 'from-zinc-500 to-zinc-600' };
          const isSender = account.vpa === 'alice@demo';
          const isReceiver = account.vpa === 'bob@demo';

          return (
            <div
              key={account.vpa}
              onClick={() => onSelectAccount && onSelectAccount(account.vpa)}
              className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04] transition-all cursor-pointer group relative"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-base">
                    {meta.emoji}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-white">
                      {account.holderName}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono">
                      {account.vpa}
                    </div>
                  </div>
                </div>

                {isSender && <Badge variant="blue">Sender</Badge>}
                {isReceiver && <Badge variant="emerald">Merchant</Badge>}
              </div>

              <div className="mt-2 flex items-baseline justify-between pt-2 border-t border-white/[0.04]">
                <span className="text-[10px] text-[var(--text-muted)] font-medium">Available Balance</span>
                <span className="text-sm font-bold font-mono text-[#30d158]">
                  ₹{parseFloat(account.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
