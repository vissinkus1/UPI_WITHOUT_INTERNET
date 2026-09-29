'use client';
import { useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { DEVICE_METADATA } from '@/lib/constants';

export default function NodeInspectorDrawer({ node, packets = [], onClose, onToggleInternet, onInspectPacket, onBroadcastPing }) {
  if (!node) return null;

  const meta = DEVICE_METADATA[node.deviceId] || {
    id: node.deviceId,
    label: node.name || node.deviceId,
    role: node.hasInternet ? 'Internet Gateway' : 'Mesh Relay Node',
    icon: node.hasInternet ? '📡' : '📱',
    desc: 'Simulated mesh node.',
  };

  return (
    <div className="apple-card-elevated p-5 border border-white/[0.12] animate-fade-in relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-lg">
            {meta.icon}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {meta.label}
              </h3>
              {node.hasInternet ? (
                <Badge variant="emerald">4G LTE Active</Badge>
              ) : (
                <Badge variant="gray">Offline Mesh Only</Badge>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-mono">
              {node.deviceId}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[var(--text-secondary)] hover:text-white flex items-center justify-center text-xs transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
        {meta.desc}
      </p>

      {/* Hardware Telemetry */}
      <div className="grid grid-cols-3 gap-2.5 my-3.5">
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Battery</div>
          <div className="text-xs font-semibold font-mono text-[var(--text-primary)] mt-0.5 flex items-center gap-1.5">
            <span>🔋</span>
            <span>{node.battery ?? 89}%</span>
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="text-[10px] uppercase text-[var(--text-muted)] font-medium">BLE Signal</div>
          <div className="text-xs font-semibold font-mono text-[var(--text-primary)] mt-0.5">
            {node.rssi ?? -45} dBm
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Held Packets</div>
          <div className="text-xs font-semibold font-mono text-[#2997ff] mt-0.5">
            {node.packetCount ?? packets.length} pkts
          </div>
        </div>
      </div>

      {/* Connectivity & Uplink Controls */}
      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-medium text-[var(--text-primary)]">
            4G Internet Uplink
          </span>
          <p className="text-[10px] text-[var(--text-muted)]">
            {node.hasInternet 
              ? 'Can flush packets to backend' 
              : 'Isolated from cloud — relays only via BLE'
            }
          </p>
        </div>
        <button
          onClick={() => onToggleInternet && onToggleInternet(node.deviceId, !node.hasInternet)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
            node.hasInternet ? 'bg-[#30d158]' : 'bg-white/[0.15]'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              node.hasInternet ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Held Packets List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Memory Buffer ({packets.length})
          </span>
          {packets.length > 0 && (
            <span className="text-[10px] text-[var(--text-muted)]">
              Flash RAM Encrypted
            </span>
          )}
        </div>

        {packets.length === 0 ? (
          <div className="p-4 rounded-xl bg-white/[0.01] border border-dashed border-white/[0.08] text-center text-xs text-[var(--text-muted)]">
            Buffer is clear. No active payment packets in local store.
          </div>
        ) : (
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {packets.map((pkt, idx) => (
              <div
                key={pkt.packetId || idx}
                className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-medium text-[var(--text-primary)] truncate">
                      {pkt.packetId?.slice(0, 10)}...
                    </span>
                    <Badge variant="blue">TTL {pkt.ttl}</Badge>
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5 font-mono">
                    ₹{pkt.amount ?? 500} • Hops: {pkt.hops ?? 0}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-[10px] py-1 px-2.5"
                  onClick={() => onInspectPacket && onInspectPacket(pkt)}
                >
                  Inspect
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onBroadcastPing && onBroadcastPing(node.deviceId)}
          icon="📡"
        >
          Ping Neighbors
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
        >
          Done
        </Button>
      </div>
    </div>
  );
}
