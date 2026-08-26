import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 
                              flex items-center justify-center text-white font-bold text-sm">
                ₹
              </div>
              <span className="text-base font-bold text-[var(--text-primary)]">UPI Mesh</span>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Offline UPI payments via encrypted mesh network routing. 
              A demonstration of deferred settlement using RSA+AES-GCM hybrid encryption.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Navigate</h4>
            <div className="flex flex-col gap-2">
              <Link href="/dashboard" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Dashboard</Link>
              <Link href="/how-it-works" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">How It Works</Link>
              <Link href="/api-explorer" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">API Explorer</Link>
            </div>
          </div>

          {/* Tech */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Technology</h4>
            <div className="flex flex-wrap gap-2">
              {['Spring Boot', 'Next.js', 'RSA-2048', 'AES-GCM', 'H2 DB', 'Java 17'].map(tech => (
                <span key={tech} className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] text-xs text-[var(--text-muted)] border border-[var(--border-subtle)]">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border-subtle)] mt-8 pt-6 text-center">
          <p className="text-xs text-[var(--text-muted)]">
            Demo Project — Mesh-routed Deferred Settlement · Built with ♥ and Java
          </p>
        </div>
      </div>
    </footer>
  );
}
