'use client';
import { useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { simulateReplayAttack, simulateTamperAttack } from '@/lib/api';

export default function PacketInspectorModal({ packet, onClose }) {
  const [attackResult, setAttackResult] = useState(null);
  const [runningAttack, setRunningAttack] = useState(false);

  if (!packet) return null;

  const handleReplayAttack = () => {
    setRunningAttack(true);
    try {
      const res = simulateReplayAttack(packet.packetId);
      setAttackResult(res);
    } catch (err) {
      setAttackResult({ outcome: 'ERROR', reason: err.message });
    } finally {
      setRunningAttack(false);
    }
  };

  const handleTamperAttack = () => {
    setRunningAttack(true);
    try {
      const res = simulateTamperAttack(packet.packetId);
      setAttackResult(res);
    } catch (err) {
      setAttackResult({ outcome: 'ERROR', reason: err.message });
    } finally {
      setRunningAttack(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div 
        className="apple-card-elevated w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative border border-white/[0.12]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[rgba(41,151,255,0.15)] text-[#2997ff] flex items-center justify-center text-sm font-bold">
              🔐
            </span>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Cryptographic Packet Dissector
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-mono">
                ID: {packet.packetId}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[var(--text-secondary)] hover:text-white flex items-center justify-center text-xs transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Packet Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="text-[10px] uppercase text-[var(--text-muted)] font-medium">TTL Hops</div>
            <div className="text-sm font-semibold font-mono text-[var(--text-primary)] mt-0.5">
              {packet.ttl} / {packet.originalTtl || 5}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Origin Node</div>
            <div className="text-sm font-semibold font-mono text-[var(--text-primary)] mt-0.5">
              {packet.injectedAt || 'phone-alice'}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Amount</div>
            <div className="text-sm font-semibold font-mono text-[#30d158] mt-0.5">
              ₹{packet.amount?.toLocaleString('en-IN') || '500.00'}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="text-[10px] uppercase text-[var(--text-muted)] font-medium">SHA-256 Claim</div>
            <div className="text-xs font-mono text-[var(--text-secondary)] mt-0.5 truncate">
              {packet.hash?.slice(0, 14)}...
            </div>
          </div>
        </div>

        {/* 3-Layer Cryptographic Wire Breakdown */}
        <div className="space-y-3 mb-6">
          <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Wire Format Anatomy (TLS-Style Hybrid Scheme)
          </div>

          {/* Block 1: RSA Envelope */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] relative group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[#2997ff] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2997ff]" />
                Layer 1: RSA-2048 Asymmetric Session Key (256 Bytes)
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">OAEP-SHA256</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-2">
              Contains the ephemeral AES-256 key encrypted with the banking server’s public key. Intermediary nodes cannot decode this without the server's private HSM key.
            </p>
            <div className="p-2 rounded bg-black/40 font-mono text-[11px] text-[var(--text-muted)] break-all border border-white/[0.04]">
              {packet.ciphertext?.split(':')[0] || 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3fJ+qC9fX7w...'}
            </div>
          </div>

          {/* Block 2: AES IV */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[#ff9f0a] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff9f0a]" />
                Layer 2: AES-GCM Initialization Vector (12 Bytes / 96-bit Nonce)
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">Unique per packet</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-2">
              Guarantees the cipher stream is fresh and unpredictable, even for identical transactions.
            </p>
            <div className="p-2 rounded bg-black/40 font-mono text-[11px] text-[var(--text-muted)] break-all border border-white/[0.04]">
              {packet.ciphertext?.split(':')[1] || 'R0NNX0lWXzEyQl80OGExYzg='}
            </div>
          </div>

          {/* Block 3: AES-256-GCM Ciphertext + MAC Tag */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[#30d158] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#30d158]" />
                Layer 3: Authenticated Payload & MAC Tag (16-byte Poly1305/GHASH)
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">Confidentiality + Integrity</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-2">
              Encrypted JSON containing UPI VPA, ₹ amount, timestamp, and PIN hash. Any modification of a single bit triggers tag rejection.
            </p>
            <div className="p-2 rounded bg-black/40 font-mono text-[11px] text-[var(--text-muted)] break-all border border-white/[0.04]">
              {packet.ciphertext?.split(':')[2] || 'eyJzZW5kZXJWcGEiOiJhbGljZUBkZW1vIiwicmVjZWl2ZXJWcGEiOi...'}
            </div>
          </div>
        </div>

        {/* Live Attack Simulator Testing Section */}
        <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-white/[0.08] mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                🛡️ Live Security & Chaos Lab
              </span>
              <p className="text-[11px] text-[var(--text-muted)]">
                Execute live adversarial attacks against this exact packet
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={handleReplayAttack}
                loading={runningAttack}
              >
                🔁 Test Replay Attack
              </Button>
              <Button 
                size="sm" 
                variant="danger" 
                onClick={handleTamperAttack}
                loading={runningAttack}
              >
                ⚡ Test Bit-Flip Tamper
              </Button>
            </div>
          </div>

          {attackResult && (
            <div className={`p-3 rounded-lg text-xs font-mono animate-fade-in ${
              attackResult.outcome === 'SETTLED' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
            }`}>
              <div className="flex items-center justify-between font-bold mb-1">
                <span>Outcome: {attackResult.outcome}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-normal">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              <p className="font-sans text-[11px] text-[var(--text-secondary)]">
                {attackResult.reason}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button size="sm" variant="secondary" onClick={onClose}>
            Close Dissector
          </Button>
        </div>
      </div>
    </div>
  );
}
