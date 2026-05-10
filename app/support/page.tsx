'use client';

import AppShell from '@/components/AppShell';

const monoStyle: React.CSSProperties = { fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' };

export default function SupportPage() {
  return (
    <AppShell>
      <section className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#e4e2e4] mb-1">Support Center</h1>
        <p className="text-sm text-[#c6c6cd]">Open a ticket, browse documentation, or reach the on-call response team.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { icon: 'menu_book',    title: 'DOCUMENTATION', desc: 'API reference, deployment guides, troubleshooting playbooks.', cta: 'OPEN DOCS' },
          { icon: 'forum',        title: 'COMMUNITY',     desc: 'Operator forums and threat-intelligence sharing channels.',   cta: 'JOIN FORUM' },
          { icon: 'support_agent',title: 'ON-CALL DESK',  desc: '24/7 critical-issue response for active incidents.',         cta: 'ESCALATE' },
        ].map((c) => (
          <div key={c.title} className="bg-[#1f1f21] border border-[#45464d] rounded-lg p-5 flex flex-col">
            <div className="w-10 h-10 rounded bg-[#3c4a5e] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[#bec6e0]" style={{ fontSize: '22px' }}>{c.icon}</span>
            </div>
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#bec6e0] mb-2" style={monoStyle}>{c.title}</h3>
            <p className="text-sm text-[#c6c6cd] mb-4 flex-1">{c.desc}</p>
            <button className="bg-[#353436] hover:bg-[#39393b] border border-[#45464d] text-[#e4e2e4] py-2 rounded text-[11px] font-bold uppercase tracking-widest font-mono transition active:scale-[0.98]" style={monoStyle}>
              {c.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-[#1f1f21] border border-[#45464d] rounded-lg p-5">
        <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#bec6e0] mb-4" style={monoStyle}>SYSTEM STATUS</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'API ENDPOINTS', value: 'OPERATIONAL', color: 'green-400' },
            { label: 'NEURAL CORE',   value: 'OPERATIONAL', color: 'green-400' },
            { label: 'MEDIA STORE',   value: 'DEGRADED',    color: '#dec29a' },
            { label: 'TELEMETRY BUS', value: 'OPERATIONAL', color: 'green-400' },
          ].map((s) => (
            <div key={s.label} className="bg-[#0e0e10] border border-[#45464d] rounded p-3">
              <div className="text-[10px] font-mono text-[#909097] uppercase tracking-widest" style={monoStyle}>{s.label}</div>
              <div className="text-sm font-mono font-bold mt-1 flex items-center gap-1.5" style={{ ...monoStyle, color: s.color.startsWith('#') ? s.color : undefined }}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.color === 'green-400' ? 'bg-green-400 animate-pulse' : ''}`} style={s.color.startsWith('#') ? { background: s.color } : undefined} />
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
