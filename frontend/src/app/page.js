'use client';
import Link from 'next/link';
import MeshAnimation from '@/components/landing/MeshAnimation';

const FEATURES = [
  {
    icon: '🔐',
    title: 'Hybrid Encryption',
    description: 'RSA-2048 + AES-256-GCM — the same scheme TLS uses. Intermediates carry opaque ciphertext they cannot read or tamper with.',
    color: 'from-blue-500 to-indigo-600',
    glow: 'rgba(59, 130, 246, 0.15)',
  },
  {
    icon: '📡',
    title: 'Mesh Gossip Protocol',
    description: 'Packets hop device-to-device via Bluetooth until a bridge node with internet uploads them. TTL prevents infinite loops.',
    color: 'from-purple-500 to-violet-600',
    glow: 'rgba(139, 92, 246, 0.15)',
  },
  {
    icon: '🛡️',
    title: 'Atomic Idempotency',
    description: 'SHA-256 hash + ConcurrentHashMap.putIfAbsent. Even if 100 bridges deliver simultaneously, exactly one settles.',
    color: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16, 185, 129, 0.15)',
  },
  {
    icon: '⏱️',
    title: 'Replay Protection',
    description: 'Freshness window (signedAt) + unique nonce per payment. Stale packets and replays are rejected before touching the ledger.',
    color: 'from-amber-500 to-orange-600',
    glow: 'rgba(245, 158, 11, 0.15)',
  },
  {
    icon: '🏦',
    title: 'Transactional Settlement',
    description: '@Transactional debit + credit in a single DB operation. @Version optimistic locking as defense-in-depth.',
    color: 'from-cyan-500 to-blue-600',
    glow: 'rgba(6, 182, 212, 0.15)',
  },
  {
    icon: '🧪',
    title: 'Concurrency Tested',
    description: '3 threads, 1 packet, simultaneous delivery. Asserts exactly one SETTLED, two DUPLICATE_DROPPED.',
    color: 'from-rose-500 to-pink-600',
    glow: 'rgba(244, 63, 94, 0.15)',
  },
];

const STATS = [
  { value: 'RSA-2048', label: 'Key Encryption' },
  { value: 'AES-256', label: 'Payload Cipher' },
  { value: '< 1ms', label: 'Idempotency Check' },
  { value: '5 Hops', label: 'Max TTL' },
];

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Mesh-Routed Deferred Settlement
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="text-[var(--text-primary)]">Send Money</span>
                <br />
                <span className="gradient-text">Where There Is</span>
                <br />
                <span className="gradient-text">No Internet</span>
              </h1>

              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8 max-w-lg">
                You&apos;re in a basement with zero connectivity. You send ₹500. Your phone encrypts the payment, 
                broadcasts it to nearby phones, and the packet hops device-to-device until <em>some</em> phone 
                walks outside, gets 4G, and silently uploads it to the backend.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl
                             bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold
                             shadow-[0_0_30px_rgba(59,130,246,0.4)]
                             hover:shadow-[0_0_50px_rgba(59,130,246,0.6)]
                             hover:from-blue-400 hover:to-blue-500
                             transition-all duration-300 active:scale-[0.97]"
                >
                  🚀 Launch Dashboard
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl
                             bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold
                             border border-[var(--border-default)]
                             hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface)]
                             transition-all duration-300"
                >
                  🔬 How It Works
                </Link>
              </div>
            </div>

            {/* Right: Mesh Animation */}
            <div className="animate-fade-in delay-300 hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-[var(--border-subtle)]" />
                <MeshAnimation />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 border-y border-[var(--border-subtle)] bg-[var(--bg-deep)]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
              Three Hard Problems, <span className="gradient-text">Solved</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Untrusted intermediates, duplicate-storm idempotency, and replay attacks — 
              each handled with production-grade cryptography and atomic operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="glass-card p-6 group animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} 
                              flex items-center justify-center text-xl mb-4
                              group-hover:scale-110 transition-transform duration-300`}
                  style={{ boxShadow: `0 0 20px ${feature.glow}` }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="glass-card p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                Ready to See It in Action?
              </h2>
              <p className="text-[var(--text-secondary)] mb-6">
                Walk through the complete demo: compose a payment, run gossip rounds, 
                and watch a bridge node settle it on the backend.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl
                           bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg
                           shadow-[0_0_40px_rgba(59,130,246,0.4)]
                           hover:shadow-[0_0_60px_rgba(59,130,246,0.6)]
                           transition-all duration-300 active:scale-[0.97]"
              >
                📊 Open Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
