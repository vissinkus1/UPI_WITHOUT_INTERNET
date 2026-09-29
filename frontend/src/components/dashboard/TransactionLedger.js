'use client';
import { useState } from 'react';
import Card, { CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function TransactionLedger({ transactions }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);

  const txList = Array.isArray(transactions) ? transactions : [];

  const filtered = txList.filter(tx => {
    if (filter !== 'ALL' && tx.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchVpa = tx.senderVpa?.toLowerCase().includes(q) || tx.receiverVpa?.toLowerCase().includes(q);
      const matchId = String(tx.id).includes(q);
      return matchVpa || matchId;
    }
    return true;
  });

  return (
    <>
      <Card glow="purple">
        <CardHeader 
          icon="📜" 
          action={
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search VPA or ID..."
                className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#2997ff] w-36 sm:w-44 font-sans"
              />
              <Badge variant="purple">{txList.length} Total</Badge>
            </div>
          }
        >
          <span className="font-semibold text-base tracking-tight">Settlement Ledger</span>
        </CardHeader>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 text-xs">
          {['ALL', 'SETTLED', 'DUPLICATE_DROPPED', 'REJECTED'].map(st => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                filter === st
                  ? 'bg-white/[0.12] text-white border border-white/[0.18]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/[0.04]'
              }`}
            >
              {st === 'ALL' ? 'All Transactions' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center text-[var(--text-muted)] py-10 text-xs font-mono">
            {txList.length === 0 
              ? 'No transactions settled yet. Use the controller above to send an offline payment!' 
              : 'No transactions match this filter.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-[var(--text-muted)]">
                  <th className="text-left py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Tx ID</th>
                  <th className="text-left py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Transfer Route</th>
                  <th className="text-right py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Amount</th>
                  <th className="text-center py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="text-left py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Bridge Uplink</th>
                  <th className="text-center py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Mesh Hops</th>
                  <th className="text-right py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Settled Time</th>
                  <th className="text-center py-2.5 px-2 font-semibold uppercase tracking-wider text-[10px]">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map(tx => (
                  <tr 
                    key={tx.id} 
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-mono text-[var(--text-muted)]">
                      #{tx.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                        <span>{tx.senderVpa?.split('@')[0]}</span>
                        <span className="text-[var(--text-muted)]">→</span>
                        <span>{tx.receiverVpa?.split('@')[0]}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#30d158]">
                      ₹{parseFloat(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge status={tx.status} />
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[var(--text-secondary)]">
                      {tx.bridgeNodeId?.replace('phone-', '') || 'bridge'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/[0.06] text-[#2997ff] text-[10px] font-bold">
                        {tx.hopCount ?? 2}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-[11px] text-[var(--text-muted)] font-mono">
                      {tx.settledAt ? new Date(tx.settledAt).toLocaleTimeString() : '—'}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="text-xs text-[var(--text-muted)] group-hover:text-white">
                        🧾
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Digital UPI Receipt Modal */}
      {selectedTx && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedTx(null)}
        >
          <div 
            className="apple-card-elevated w-full max-w-sm p-6 relative border border-white/[0.12]"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center pb-4 border-b border-white/[0.08]">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#30d158]/15 text-[#30d158] flex items-center justify-center text-xl mb-2 font-bold">
                ✓
              </div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                UPI Settlement Voucher
              </div>
              <div className="text-2xl font-bold font-mono text-[var(--text-primary)] mt-1">
                ₹{parseFloat(selectedTx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-1">
                <Badge status={selectedTx.status} />
              </div>
            </div>

            <div className="space-y-2.5 py-4 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Transaction Ref</span>
                <span className="font-mono text-[var(--text-primary)]">UPI-MESH-TX-{selectedTx.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">From VPA</span>
                <span className="font-mono text-[var(--text-primary)]">{selectedTx.senderVpa}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">To VPA</span>
                <span className="font-mono text-[var(--text-primary)]">{selectedTx.receiverVpa}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Bridge Ingest Gateway</span>
                <span className="font-mono text-[#2997ff]">{selectedTx.bridgeNodeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Offline Mesh Hops</span>
                <span className="font-mono text-[var(--text-primary)]">{selectedTx.hopCount ?? 2} Bluetooth Relays</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Timestamp</span>
                <span className="font-mono text-[var(--text-muted)]">
                  {selectedTx.settledAt ? new Date(selectedTx.settledAt).toLocaleString() : 'Just now'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => setSelectedTx(null)}>
                Close Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
