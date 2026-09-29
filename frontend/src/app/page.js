'use client';
import Link from 'next/link';
import MeshAnimation from '@/components/landing/MeshAnimation';

// Clean SVG Icons for professional aesthetic
const Icons = {
  Lock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Radio: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  Bank: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10zm4 4v4m4-4v4m4-4v4" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Bolt: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4 text-[#30d158]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
};

const PROTOCOL_STEPS = [
  {
    step: 'Phase 01',
    icon: Icons.Lock,
    title: 'Offline Encryption at Origin',
    summary: 'The sender phone in an isolated basement creates an immutable PaymentInstruction. It encrypts the payload using RSA-2048 and AES-256-GCM. Intermediary nodes cannot decipher amounts or PINs.',
    accent: '#2997ff',
  },
  {
    step: 'Phase 02',
    icon: Icons.Radio,
    title: 'Zero-Knowledge Peer Relay',
    summary: 'Packets hop phone-to-phone via Bluetooth Low Energy (BLE). Each transfer decrements a Time-To-Live (TTL) counter to prevent routing loops. Passersby silently relay ciphertexts with zero data cost.',
    accent: '#bf5af2',
  },
  {
    step: 'Phase 03',
    icon: Icons.Bank,
    title: 'Atomic Bridge Ingest & Settlement',
    summary: 'When any bridge phone walks outdoors and re-acquires 4G coverage, it automatically uploads held packets to the backend. An atomic SHA-256 compare-and-set claim prevents duplicate debits.',
    accent: '#30d158',
  },
];

const SECURITY_PILLARS = [
  {
    icon: Icons.Shield,
    title: 'Atomic Compare-And-Set Idempotency',
    description: 'Concurrent bridge deliveries are deduplicated via atomic SHA-256 ciphertext hash claims. Even if multiple bridge nodes upload simultaneously, exactly one debit settles and duplicate submissions are safely dropped.',
    badge: 'CAS Verified',
    accent: '#30d158',
  },
  {
    icon: Icons.Lock,
    title: 'Hybrid RSA-2048 + AES-256-GCM',
    description: 'Employs standard TLS-grade authenticated envelope encryption. The sender generates an ephemeral AES-256 session key, encrypts the instruction, and seals the key with the bank’s public RSA key.',
    badge: 'Authenticated Cipher',
    accent: '#2997ff',
  },
  {
    icon: Icons.Clock,
    title: 'Replay Protection & Freshness Windows',
    description: 'Each payment carries a unique UUID nonce and timestamp signed inside the authenticated ciphertext. Stale packets outside the 24-hour validity window are rejected before ledger access.',
    badge: 'Nonce Validated',
    accent: '#ff9f0a',
  },
  {
    icon: Icons.Bolt,
    title: 'Transactional Ledger Consistency',
    description: 'Spring Boot handles atomic debits and credits wrapped in a single @Transactional boundary with optimistic locking. Zero balance leakage or partial debit states can ever occur.',
    badge: 'ACID Guaranteed',
    accent: '#bf5af2',
  },
];

const STATS = [
  { value: 'RSA-2048', label: 'Asymmetric Envelope' },
  { value: 'AES-256-GCM', label: 'Authenticated Payload' },
  { value: '0 ms', label: 'Internet Needed at Origin' },
  { value: '100%', label: 'Duplicate Settlement Protection' },
];

export default function LandingPage() {
  return (
    <div className="relative text-[var(--text-primary)]">
      {/* 1. Hero Section — Spacious, Clean, Beautifully Balanced */}
      <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 text-center overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Category Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-[var(--text-secondary)] mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#30d158]"></span>
            <span>Mesh-Routed Deferred Settlement Protocol</span>
          </div>

          {/* Main Title with Refined Spacing */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.12] mb-6 max-w-4xl mx-auto">
            Send money where there <br className="hidden sm:inline" />
            is <span className="text-[#2997ff]">no internet</span>.
          </h1>

          {/* Clear Subtitle */}
          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto mb-10 font-normal">
            A zero-connectivity UPI framework. Your device encrypts transactions into sealed packets that hop peer-to-peer via Bluetooth until any phone reaches cellular coverage and settles with the bank.
          </p>

          {/* Call-to-action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
            <Link
              href="/dashboard"
              className="apple-button-primary text-sm py-3 px-8 font-medium flex items-center gap-2 shadow-lg"
            >
              <span>Launch Interactive Console</span>
              <span>→</span>
            </Link>
            <Link
              href="/how-it-works"
              className="apple-button-secondary text-sm py-3 px-6 font-medium"
            >
              Security Architecture
            </Link>
          </div>

          {/* Full-Width Panoramic Mesh Simulation Frame */}
          <div className="apple-card p-5 sm:p-7 text-left relative overflow-hidden shadow-2xl border border-white/[0.1]">
            {/* macOS Style Header Bar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 mr-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/80"></span>
                </div>
                <span className="text-xs font-semibold text-[var(--text-primary)] tracking-tight">
                  Bluetooth Mesh Network Simulator
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse"></span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  6 Peer Nodes Active
                </span>
              </div>
            </div>

            {/* Canvas */}
            <MeshAnimation />

            {/* Bottom Legend */}
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] gap-3">
              <div className="flex items-center gap-3">
                <span className="text-[var(--text-primary)] font-medium">Alice (Basement)</span>
                <span className="text-[#2997ff] font-mono">▸ Relayed via Strangers ▸</span>
                <span className="text-[#30d158] font-medium">Bridge Node (4G)</span>
              </div>
              <div className="font-mono text-[11px] text-[var(--text-secondary)]">
                Zero plaintext revealed to intermediary devices
              </div>
            </div>
          </div>

          {/* Metrics Ribbon — Spacious & Clean */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 mt-12 border-y border-white/[0.08] text-left">
            {STATS.map((s, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
                  {s.value}
                </div>
                <div className="text-xs text-[var(--text-muted)] font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. End-To-End Protocol Lifecycle Section */}
      <section className="py-24 sm:py-32 border-t border-white/[0.08] bg-black/40">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="max-w-2xl mb-16 space-y-3">
            <div className="inline-block text-xs font-semibold uppercase tracking-wider text-[#2997ff]">
              End-To-End Lifecycle
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              How money moves with zero cellular signal
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Three coordinated phases that guarantee funds arrive securely at the banking core without relying on continuous connectivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PROTOCOL_STEPS.map((step, idx) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={idx}
                  className="apple-card p-8 sm:p-9 flex flex-col justify-between hover:border-white/[0.18] transition-all relative group"
                >
                  <div>
                    {/* Header: Icon + Phase Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <div 
                        className="w-11 h-11 rounded-xl flex items-center justify-center border"
                        style={{ 
                          background: `${step.accent}12`, 
                          borderColor: `${step.accent}25`,
                          color: step.accent 
                        }}
                      >
                        <IconComponent />
                      </div>
                      <span className="text-xs font-mono font-semibold text-[var(--text-muted)] group-hover:text-white transition-colors">
                        {step.step}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-3 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {step.summary}
                    </p>
                  </div>

                  <div className="mt-8 pt-5 border-t border-white/[0.06] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: step.accent }} />
                    <span className="text-xs text-[var(--text-muted)] font-medium">
                      Zero manual configuration
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Mathematical Safety Guarantees Section */}
      <section className="py-24 sm:py-32 border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="max-w-2xl mb-16 space-y-3">
            <div className="inline-block text-xs font-semibold uppercase tracking-wider text-[#30d158]">
              Mathematical Safety
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Four mathematical guarantees for offline payments
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Cryptographic integrity checks and atomic idempotency prevent tampering, replay attacks, and duplicate deductions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SECURITY_PILLARS.map((pillar, idx) => {
              const IconComponent = pillar.icon;
              return (
                <div 
                  key={idx}
                  className="apple-card p-8 sm:p-10 flex flex-col justify-between hover:border-white/[0.18] transition-all"
                >
                  <div>
                    {/* Header: Icon + Badge Pill */}
                    <div className="flex items-center justify-between mb-6">
                      <div 
                        className="w-11 h-11 rounded-xl flex items-center justify-center border"
                        style={{ 
                          background: `${pillar.accent}12`, 
                          borderColor: `${pillar.accent}25`,
                          color: pillar.accent 
                        }}
                      >
                        <IconComponent />
                      </div>
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium border"
                        style={{ 
                          color: pillar.accent, 
                          borderColor: `${pillar.accent}33`, 
                          background: `${pillar.accent}12` 
                        }}
                      >
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-3 tracking-tight">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="mt-8 pt-5 border-t border-white/[0.06] flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span className="font-medium">Unit & Concurrency Verified</span>
                    <span className="flex items-center gap-1.5 text-white font-medium">
                      <Icons.Check />
                      <span>Active</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Focused Call-To-Action Section */}
      <section className="py-28 sm:py-36 border-t border-white/[0.08] bg-black/50 text-center">
        <div className="max-w-3xl mx-auto px-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-[var(--text-muted)]">
            Ready to test end-to-end
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Experience the simulation live.
          </h2>
          <p className="text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            Drag nodes on the interactive canvas, trigger multi-hop Bluetooth gossip rounds, inspect raw packet ciphertexts, and execute live adversary attacks.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="apple-button-primary text-sm py-3 px-8 font-medium shadow-xl"
            >
              Open Interactive Console
            </Link>
            <Link
              href="/api-explorer"
              className="apple-button-secondary text-sm py-3 px-6 font-medium"
            >
              Browse API Endpoints
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
