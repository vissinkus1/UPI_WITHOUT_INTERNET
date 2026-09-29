'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getEngineStatus, onEngineStatusChange } from '@/lib/api';

const NAV_ITEMS = [
  { href: '/', label: 'Overview' },
  { href: '/dashboard', label: 'Interactive Console' },
  { href: '/how-it-works', label: 'Architecture' },
  { href: '/api-explorer', label: 'API Reference' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [engineStatus, setEngineStatus] = useState(getEngineStatus());

  useEffect(() => {
    return onEngineStatusChange((status) => {
      setEngineStatus(status);
    });
  }, []);

  const isLive = engineStatus.effectiveMode === 'live';

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08]"
      style={{ 
        background: 'rgba(7, 8, 11, 0.85)', 
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2997ff] to-[#5e5ce6] flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              ₹
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
                UPI Mesh
              </span>
              <span className="text-[10px] text-[var(--text-muted)] tracking-wide font-mono">
                Offline Routing
              </span>
            </div>
          </Link>

          {/* Center Navigation Links — Generous Spacing */}
          <div className="hidden md:flex items-center gap-2">
            {NAV_ITEMS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                    ${active
                      ? 'bg-white/[0.12] text-white shadow-sm border border-white/[0.1]'
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.05]'
                    }
                  `}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right Status & Launch Button */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs font-mono">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? 'bg-[#30d158]' : 'bg-[#2997ff]'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-[#30d158]' : 'bg-[#2997ff]'}`}></span>
              </span>
              <span className="text-[var(--text-secondary)] text-[11px]">
                {isLive ? 'Live Spring Boot' : 'Simulated Engine'}
              </span>
            </div>

            <Link
              href="/dashboard"
              className="apple-button-primary text-xs py-2 px-4 font-medium"
            >
              Launch Console
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.06]"
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
          <div className="md:hidden py-4 border-t border-white/[0.06] space-y-1.5 animate-fade-in">
            {NAV_ITEMS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    block px-4 py-2.5 rounded-xl text-xs font-medium transition-all
                    ${active
                      ? 'bg-white/[0.1] text-white font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04]'
                    }
                  `}
                >
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
