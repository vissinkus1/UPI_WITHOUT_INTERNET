'use client';
import Card, { CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function TransactionLedger({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <Card glow="purple">
        <CardHeader icon="📜">Transaction Ledger</CardHeader>
        <div className="text-center text-[var(--text-muted)] py-10 text-sm">
          No transactions yet. Send a payment to get started!
        </div>
      </Card>
    );
  }

  return (
    <Card glow="purple">
      <CardHeader icon="📜">
        Transaction Ledger
        <Badge variant="purple" className="ml-2">{transactions.length}</Badge>
      </CardHeader>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="text-left py-3 px-2 text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">ID</th>
              <th className="text-left py-3 px-2 text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">From</th>
              <th className="text-left py-3 px-2 text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">To</th>
              <th className="text-right py-3 px-2 text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Amount</th>
              <th className="text-center py-3 px-2 text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Status</th>
              <th className="text-left py-3 px-2 text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Bridge</th>
              <th className="text-center py-3 px-2 text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Hops</th>
              <th className="text-right py-3 px-2 text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Settled</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-deep)] transition-colors">
                <td className="py-3 px-2 font-mono text-[var(--text-muted)]">#{tx.id}</td>
                <td className="py-3 px-2">
                  <span className="font-medium text-[var(--text-primary)]">{tx.senderVpa?.split('@')[0]}</span>
                  <span className="text-[var(--text-muted)]">@demo</span>
                </td>
                <td className="py-3 px-2">
                  <span className="font-medium text-[var(--text-primary)]">{tx.receiverVpa?.split('@')[0]}</span>
                  <span className="text-[var(--text-muted)]">@demo</span>
                </td>
                <td className="py-3 px-2 text-right font-mono font-semibold text-emerald-400">
                  ₹{parseFloat(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-2 text-center">
                  <Badge status={tx.status} />
                </td>
                <td className="py-3 px-2 text-xs text-[var(--text-muted)] font-mono">
                  {tx.bridgeNodeId?.replace('phone-', '')}
                </td>
                <td className="py-3 px-2 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">
                    {tx.hopCount}
                  </span>
                </td>
                <td className="py-3 px-2 text-right text-xs text-[var(--text-muted)]">
                  {tx.settledAt ? new Date(tx.settledAt).toLocaleTimeString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
