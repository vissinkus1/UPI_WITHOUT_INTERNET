'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { DEMO_ACCOUNTS } from '@/lib/constants';

export default function DemoFlowPanel({ onSendPayment, onGossip, onFlushBridges, onReset, isAutoRunning = false }) {
  const [sender, setSender] = useState('alice@demo');
  const [receiver, setReceiver] = useState('bob@demo');
  const [amount, setAmount] = useState('500');
  const [pin, setPin] = useState('1234');
  const [loading, setLoading] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [autoRunActive, setAutoRunActive] = useState(false);

  const wrap = (key, fn) => async () => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try { 
      await fn(); 
    } finally { 
      setLoading(prev => ({ ...prev, [key]: false })); 
    }
  };

  const handleSend = async () => {
    setLoading(prev => ({ ...prev, send: true }));
    try {
      await onSendPayment({ senderVpa: sender, receiverVpa: receiver, amount, pin });
      setCurrentStep(2);
    } finally {
      setLoading(prev => ({ ...prev, send: false }));
    }
  };

  const handleGossipStep = async () => {
    setLoading(prev => ({ ...prev, gossip: true }));
    try {
      await onGossip();
      setCurrentStep(3);
    } finally {
      setLoading(prev => ({ ...prev, gossip: false }));
    }
  };

  const handleFlushStep = async () => {
    setLoading(prev => ({ ...prev, flush: true }));
    try {
      await onFlushBridges();
      setCurrentStep(1);
    } finally {
      setLoading(prev => ({ ...prev, flush: false }));
    }
  };

  // 1-Click End-to-End Walkthrough
  const handleAutoRun = async () => {
    if (autoRunActive) return;
    setAutoRunActive(true);
    try {
      setCurrentStep(1);
      await onSendPayment({ senderVpa: sender, receiverVpa: receiver, amount, pin });
      await new Promise(r => setTimeout(r, 900));
      setCurrentStep(2);
      await onGossip();
      await new Promise(r => setTimeout(r, 900));
      setCurrentStep(3);
      await onFlushBridges();
      await new Promise(r => setTimeout(r, 700));
      setCurrentStep(1);
    } finally {
      setAutoRunActive(false);
    }
  };

  const selectClass = `
    bg-white/[0.05] text-[var(--text-primary)] border border-white/[0.1]
    rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2997ff]
    focus:ring-2 focus:ring-[#2997ff]/20 transition-all font-sans
  `;

  const inputClass = `
    bg-white/[0.05] text-[var(--text-primary)] border border-white/[0.1]
    rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2997ff]
    focus:ring-2 focus:ring-[#2997ff]/20 transition-all font-mono
  `;

  return (
    <div className="apple-card p-6 relative">
      {/* Header with 1-Click Auto Run */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.08]">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <span>⚡</span> Payment Pipeline Controller
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Simulate offline encryption, multi-hop mesh, and backend bridge settlement
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleAutoRun}
          loading={autoRunActive}
          icon="▶"
          className="border-[#2997ff]/30 text-[#2997ff]"
        >
          Auto Demo
        </Button>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-3 gap-2 mb-6 text-center">
        <div className={`p-2 rounded-xl border transition-all ${
          currentStep === 1 
            ? 'bg-[#2997ff]/10 border-[#2997ff]/40 text-[#2997ff]' 
            : 'bg-white/[0.02] border-white/[0.06] text-[var(--text-muted)]'
        }`}>
          <div className="text-[10px] uppercase font-bold tracking-wider">Step 1</div>
          <div className="text-xs font-medium truncate mt-0.5">1. Offline Sign</div>
        </div>
        <div className={`p-2 rounded-xl border transition-all ${
          currentStep === 2 
            ? 'bg-[#bf5af2]/10 border-[#bf5af2]/40 text-[#bf5af2]' 
            : 'bg-white/[0.02] border-white/[0.06] text-[var(--text-muted)]'
        }`}>
          <div className="text-[10px] uppercase font-bold tracking-wider">Step 2</div>
          <div className="text-xs font-medium truncate mt-0.5">2. BLE Gossip</div>
        </div>
        <div className={`p-2 rounded-xl border transition-all ${
          currentStep === 3 
            ? 'bg-[#30d158]/10 border-[#30d158]/40 text-[#30d158]' 
            : 'bg-white/[0.02] border-white/[0.06] text-[var(--text-muted)]'
        }`}>
          <div className="text-[10px] uppercase font-bold tracking-wider">Step 3</div>
          <div className="text-xs font-medium truncate mt-0.5">3. 4G Settle</div>
        </div>
      </div>

      {/* Step 1: Compose Payment */}
      <div className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#2997ff] text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              Compose & Encrypt Offline Payment
            </span>
          </div>
          <Badge variant="blue">RSA-2048 + AES-GCM</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-1 font-medium">Sender</label>
            <select value={sender} onChange={e => setSender(e.target.value)} className={`${selectClass} w-full`}>
              {DEMO_ACCOUNTS.map(a => (
                <option key={a.vpa} value={a.vpa}>{a.emoji} {a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-1 font-medium">Receiver</label>
            <select value={receiver} onChange={e => setReceiver(e.target.value)} className={`${selectClass} w-full`}>
              {DEMO_ACCOUNTS.filter(a => a.vpa !== sender).map(a => (
                <option key={a.vpa} value={a.vpa}>{a.emoji} {a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-1 font-medium">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className={`${inputClass} w-full`}
              min="1"
            />
          </div>

          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-1 font-medium">UPI PIN</label>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              className={`${inputClass} w-full`}
              maxLength={4}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-[var(--text-muted)]">
            Injects into <code className="text-[#2997ff]">phone-alice</code> local memory
          </span>
          <Button onClick={handleSend} loading={loading.send} size="sm" icon="📤">
            Encrypt & Broadcast
          </Button>
        </div>
      </div>

      {/* Step 2: Gossip */}
      <div className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#bf5af2] text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              Multi-Hop Gossip Round
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)]">TTL Decrements Each Hop</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
          Nearby phones discover each other via Bluetooth beacons. Packets propagate device-to-device through stranger phones without exposing plaintext.
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[var(--text-muted)] font-mono">
            Round-trip BLE Relay
          </span>
          <Button onClick={handleGossipStep} loading={loading.gossip} variant="secondary" size="sm" icon="🔄">
            Execute Gossip Hop
          </Button>
        </div>
      </div>

      {/* Step 3: Bridge Upload */}
      <div className="mb-5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#30d158] text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              4G Bridge Uplink & Settlement
            </span>
          </div>
          <span className="text-[11px] text-[#30d158] font-mono">Idempotent Delivery</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
          Bridge device steps outdoors into cellular coverage and uploads packet to backend ledger. Duplicate uploads are dropped atomically via SHA-256 CAS lock.
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[var(--text-muted)]">
            POST <code className="text-[#30d158]">/api/bridge/ingest</code>
          </span>
          <Button onClick={handleFlushStep} loading={loading.flush} variant="success" size="sm" icon="📡">
            Upload & Settle
          </Button>
        </div>
      </div>

      {/* Reset & Maintenance */}
      <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
        <span className="text-[11px] text-[var(--text-muted)]">
          Need a fresh start?
        </span>
        <Button onClick={wrap('reset', onReset)} loading={loading.reset} variant="ghost" size="sm" icon="🗑">
          Reset Mesh & Cache
        </Button>
      </div>
    </div>
  );
}
