'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/how-it-works', label: 'How It Works', icon: '🔬' },
  { href: '/api-explorer', label: 'API Explorer', icon: '🔌' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-subtle)]"
         style={{ background: 'rgba(5, 8, 22, 0.85)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 
                            flex items-center justify-center text-white font-bold text-sm
                            shadow-[0_0_20px_rgba(59,130,246,0.3)]
                            group-hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]
                            transition-all duration-300">
              ₹
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold text-[var(--text-primary)]">UPI Mesh</span>
              <span className="text-xs text-[var(--text-muted)] block -mt-0.5">Offline Payments</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2
                    ${active
                      ? 'bg-blue-500/15 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                    }
                  `}
                >
                  <span>{icon}</span>
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Live indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Backend Live
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            {NAV_ITEMS.map(({ href, label, icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${active
                      ? 'bg-blue-500/15 text-blue-400'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                    }
                  `}
                >
                  <span className="mr-2">{icon}</span>
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
