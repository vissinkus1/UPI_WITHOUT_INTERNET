import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] mt-32 bg-black/60">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#2997ff] to-[#5e5ce6] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                ₹
              </div>
              <span className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
                UPI Mesh Architecture
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md">
              Demonstrating zero-connectivity payment packet propagation through peer-to-peer Bluetooth mesh routing with TLS-grade hybrid encryption and atomic deduplication.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Navigation
            </h4>
            <div className="flex flex-col gap-2.5 text-xs">
              <Link href="/dashboard" className="text-[var(--text-muted)] hover:text-white transition-colors">Interactive Console</Link>
              <Link href="/how-it-works" className="text-[var(--text-muted)] hover:text-white transition-colors">Security Architecture</Link>
              <Link href="/api-explorer" className="text-[var(--text-muted)] hover:text-white transition-colors">API Reference</Link>
            </div>
          </div>

          {/* Tech Spec */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Cryptography
            </h4>
            <div className="flex flex-wrap gap-2">
              {['RSA-2048', 'AES-256-GCM', 'SHA-256 CAS', 'Spring Boot', 'Next.js 16'].map(tech => (
                <span 
                  key={tech} 
                  className="px-2.5 py-1 rounded-full bg-white/[0.04] text-[11px] text-[var(--text-secondary)] border border-white/[0.08] font-mono"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>
            Offline UPI Mesh — Deferred Settlement Protocol Demonstration.
          </p>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>RFC-Style Scheme</span>
            <span>•</span>
            <span>Zero Knowledge Relays</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
