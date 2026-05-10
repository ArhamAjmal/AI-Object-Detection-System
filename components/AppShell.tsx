'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

const NAV: NavItem[] = [
  { href: '/', icon: 'videocam', label: 'Live Monitoring' },
  { href: '/alerts', icon: 'warning', label: 'Incident Alerts' },
  { href: '/assets', icon: 'router', label: 'Camera Assets' },
  { href: '/rules', icon: 'policy', label: 'Security Rules' },
];

const FOOTER: NavItem[] = [
  { href: '/logs', icon: 'terminal', label: 'System Logs' },
  { href: '/support', icon: 'help_center', label: 'Support' },
];

const monoStyle: React.CSSProperties = { fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' };

export default function AppShell({ children, rightPanel }: { children: React.ReactNode; rightPanel?: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-[#131315] text-[#e4e2e4] flex flex-col" style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}>

      {/* ─── TOP APP BAR ─── */}
      <header className="bg-[#1f1f21] border-b border-[#45464d] flex justify-between items-center w-full px-4 sm:px-8 h-16 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-[#bec6e0] to-[#3c4a5e] flex items-center justify-center shadow-[0_0_12px_rgba(190,198,224,0.4)] group-hover:scale-105 transition">
              <span className="material-symbols-outlined text-[#0e0e10]" style={{ fontSize: '18px' }}>visibility</span>
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-[#bec6e0]" style={{ letterSpacing: '0.02em' }}>
              ARGUS SENTRY
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`text-xs px-2 py-1 font-mono uppercase tracking-widest font-bold transition ${
                pathname === '/' ? 'text-[#bec6e0] border-b-2 border-[#bec6e0] pb-1' : 'text-[#c6c6cd] hover:bg-[#39393b] rounded'
              }`}
              style={monoStyle}
            >
              MONITORING
            </Link>
            <Link
              href="/alerts"
              className={`text-xs px-2 py-1 font-mono uppercase tracking-widest font-bold transition ${
                pathname.startsWith('/alerts') ? 'text-[#bec6e0] border-b-2 border-[#bec6e0] pb-1' : 'text-[#c6c6cd] hover:bg-[#39393b] rounded'
              }`}
              style={monoStyle}
            >
              ALERTS
            </Link>
            <Link
              href="/assets"
              className={`text-xs px-2 py-1 font-mono uppercase tracking-widest font-bold transition ${
                pathname.startsWith('/assets') ? 'text-[#bec6e0] border-b-2 border-[#bec6e0] pb-1' : 'text-[#c6c6cd] hover:bg-[#39393b] rounded'
              }`}
              style={monoStyle}
            >
              ASSETS
            </Link>
            <Link
              href="/rules"
              className={`text-xs px-2 py-1 font-mono uppercase tracking-widest font-bold transition ${
                pathname.startsWith('/rules') ? 'text-[#bec6e0] border-b-2 border-[#bec6e0] pb-1' : 'text-[#c6c6cd] hover:bg-[#39393b] rounded'
              }`}
              style={monoStyle}
            >
              RULES
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            className="px-3 py-2 text-[11px] font-bold rounded-lg uppercase tracking-widest font-mono flex items-center gap-1.5 bg-[#93000a] text-[#ffdad6] hover:opacity-90 transition active:scale-95"
            style={monoStyle}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
            <span className="hidden sm:inline">ALARM OVERRIDE</span>
          </button>
          <div className="hidden sm:flex items-center gap-1 border-l border-[#45464d] pl-3">
            <span className="material-symbols-outlined text-[#c6c6cd] p-2 hover:bg-[#39393b] rounded-full transition cursor-pointer" style={{ fontSize: '20px' }}>health_and_safety</span>
            <span className="material-symbols-outlined text-[#c6c6cd] p-2 hover:bg-[#39393b] rounded-full transition cursor-pointer relative" style={{ fontSize: '20px' }}>notifications</span>
            <span className="material-symbols-outlined text-[#c6c6cd] p-2 hover:bg-[#39393b] rounded-full transition cursor-pointer" style={{ fontSize: '20px' }}>settings</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#3c4a5e] flex items-center justify-center border border-[#909097]">
            <span className="material-symbols-outlined text-[#bec6e0]" style={{ fontSize: '20px' }}>person</span>
          </div>
        </div>
      </header>

      {/* ─── BODY ─── */}
      <div className="flex pt-16">

        {/* ─── LEFT SIDEBAR ─── */}
        <aside className="hidden lg:flex fixed left-0 top-16 h-[calc(100vh-64px)] w-[260px] bg-[#1b1b1d] border-r border-[#45464d] flex-col py-6 z-40">
          <div className="px-6 mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#bec6e0] shadow-[0_0_8px_rgba(190,198,224,0.6)]"></div>
              <span className="text-[11px] font-black text-[#bec6e0] tracking-widest font-mono uppercase" style={monoStyle}>
                OPERATIONS
              </span>
            </div>
            <span className="text-[12px] text-[#c6c6cd] opacity-70 font-mono" style={monoStyle}>
              Sector 7-G Active
            </span>
          </div>
          <nav className="flex-1 px-3 space-y-1">
            {NAV.map(({ href, icon, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition ${
                    active
                      ? 'bg-[#3c4a5e] text-[#abb9d2] primary-glow'
                      : 'text-[#c6c6cd] hover:text-[#e4e2e4] hover:bg-[#353436]'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                    {icon}
                  </span>
                  <span className="text-[12px] font-mono uppercase tracking-wider font-semibold" style={monoStyle}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="px-3 mt-auto space-y-1">
            <button className="w-full bg-[#bec6e0] text-[#283044] py-3 rounded-lg text-xs font-bold mb-6 hover:opacity-90 active:scale-[0.98] transition uppercase tracking-widest font-mono" style={monoStyle}>
              DEPLOY NEW NODE
            </button>
            {FOOTER.map(({ href, icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-4 text-[#c6c6cd] hover:text-[#e4e2e4] hover:bg-[#353436] px-4 py-3 rounded-lg cursor-pointer transition"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{icon}</span>
                <span className="text-[12px] font-mono uppercase tracking-wider font-semibold" style={monoStyle}>
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </aside>

        {/* ─── MAIN ─── */}
        <main className={`flex-1 lg:ml-[260px] ${rightPanel ? 'xl:mr-[320px]' : ''} p-4 sm:p-6 w-full min-h-[calc(100vh-64px)] overflow-x-hidden`}>
          {children}
        </main>

        {/* ─── RIGHT PANEL (optional) ─── */}
        {rightPanel && (
          <aside className="hidden xl:flex fixed right-0 top-16 h-[calc(100vh-64px)] w-[320px] bg-[#1f1f21] border-l border-[#45464d] flex-col z-40">
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
}
