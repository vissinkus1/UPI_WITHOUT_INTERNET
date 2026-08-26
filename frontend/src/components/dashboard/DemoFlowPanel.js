'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { DEMO_ACCOUNTS } from '@/lib/constants';

export default function DemoFlowPanel({ onSendPayment, onGossip, onFlushBridges, onReset }) {
  const [sender, setSender] = useState('alice@demo');
  const [receiver, setReceiver] = useState('bob@demo');
  const [amount, setAmount] = useState('500');
  const [pin, setPin] = useState('1234');
  const [loading, setLoading] = useState({});

  const wrap = (key, fn) => async () => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try { await fn(); }
    finally { setLoading(prev => ({ ...prev, [key]: false })); }
  };

  const handleSend = wrap('send', () => onSendPayment({ senderVpa: sender, receiverVpa: receiver, amount, pin }));

  const selectClass = `
    bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-default)]
    rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500
    focus:ring-1 focus:ring-blue-500 transition-all
  `;

  const inputClass = `
    bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-default)]
    rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500
    focus:ring-1 focus:ring-blue-500 transition-all font-mono
  `;

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-5 flex items-center gap-2">
        🎬 <span>Demo Flow</span>
      </h3>

      {/* Step 1: Compose Payment */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 
                          flex items-center justify-center text-white text-xs font-bold shadow-md">1</span>
          <span className="text-sm font-medium text-[var(--text-primary)]">Compose Payment</span>
          <span className="text-xs text-[var(--text-muted)]">(simulates sender phone)</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 ml-9">
          <select value={sender} onChange={e => setSender(e.target.value)} className={selectClass}>
            {DEMO_ACCOUNTS.map(a => (
              <option key={a.vpa} value={a.vpa}>{a.emoji} {a.name}</option>
            ))}
          </select>
          <span className="text-[var(--text-muted)] text-lg">→</span>
          <select value={receiver} onChange={e => setReceiver(e.target.value)} className={selectClass}>
            {DEMO_ACCOUNTS.filter(a => a.vpa !== sender).map(a => (
              <option key={a.vpa} value={a.vpa}>{a.emoji} {a.name}</option>
            ))}
          </select>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">₹</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className={`${inputClass} w-24 pl-7`}
              min="1"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs">PIN</span>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              className={`${inputClass} w-20 pl-10`}
              maxLength={4}
            />
          </div>
          <Button onClick={handleSend} loading={loading.send} icon="📤" size="md">
            Inject
          </Button>
        </div>
      </div>

      {/* Step 2: Gossip */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 
                          flex items-center justify-center text-white text-xs font-bold shadow-md">2</span>
          <span className="text-sm font-medium text-[var(--text-primary)]">Gossip Round</span>
          <span className="text-xs text-[var(--text-muted)]">— packets hop device-to-device</span>
        </div>
        <div className="ml-9">
          <Button onClick={wrap('gossip', onGossip)} loading={loading.gossip} variant="secondary" icon="🔄">
            Run Gossip
          </Button>
        </div>
      </div>

      {/* Step 3: Bridge Upload */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-7 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 
                          flex items-center justify-center text-white text-xs font-bold shadow-md">3</span>
          <span className="text-sm font-medium text-[var(--text-primary)]">Bridge Upload</span>
          <span className="text-xs text-[var(--text-muted)]">— bridge walks outside, hits 4G</span>
        </div>
        <div className="ml-9">
          <Button onClick={wrap('flush', onFlushBridges)} loading={loading.flush} variant="success" icon="📡">
            Bridges Upload
          </Button>
        </div>
      </div>

      {/* Reset */}
      <div className="border-t border-[var(--border-subtle)] pt-4 mt-4">
        <Button onClick={wrap('reset', onReset)} loading={loading.reset} variant="danger" icon="🗑" size="sm">
          Reset Mesh + Cache
        </Button>
      </div>
    </div>
  );
}
