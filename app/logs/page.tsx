'use client';

import AppShell from '@/components/AppShell';

const monoStyle: React.CSSProperties = { fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' };

const LOGS = [
  { ts: '14:22:08', tag: 'INFO',  msg: 'cocoSsd model loaded · webgl backend · 80 classes registered' },
  { ts: '14:22:04', tag: 'WARN',  msg: 'CRITICAL_THREAT raised: person detected in Sector 4 lobby' },
  { ts: '14:18:55', tag: 'INFO',  msg: 'Authorized clearance ID-9928 (Sarah Miller) at Point A-12' },
  { ts: '14:15:30', tag: 'INFO',  msg: 'Auto-calibration complete for Sector 2 optical arrays' },
  { ts: '14:10:12', tag: 'INFO',  msg: 'New monitoring node synchronized: NODE_WEST_FLANK_04' },
  { ts: '14:05:48', tag: 'WARN',  msg: 'Thermal fluctuation detected in Server Room B-1. Fan speed adjusted.' },
  { ts: '13:55:00', tag: 'DEBUG', msg: 'Frame queue depth: 1, drop count: 0, avg inference: 84ms' },
  { ts: '13:45:12', tag: 'WARN',  msg: 'Forced entry pattern matched at CAM-04-SERVER-RM' },
  { ts: '13:30:01', tag: 'INFO',  msg: 'WebSocket telemetry channel reconnected after 1.2s drop' },
  { ts: '13:12:55', tag: 'ERROR', msg: 'CAM_70_ROOFTOP signal lost · last keepalive 142s ago' },
  { ts: '13:10:00', tag: 'INFO',  msg: 'Operator session opened by user@argus-sentry' },
];

const tagColor = (t: string) => {
  if (t === 'ERROR') return 'bg-[#93000a] text-[#ffdad6]';
  if (t === 'WARN') return 'bg-[#dec29a]/20 text-[#dec29a] border border-[#dec29a]/30';
  if (t === 'DEBUG') return 'bg-[#3c4a5e] text-[#abb9d2]';
  return 'bg-[#1b1b1d] text-[#bec6e0] border border-[#45464d]';
};

export default function LogsPage() {
  return (
    <AppShell>
      <section className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#e4e2e4] mb-1">System Logs</h1>
        <p className="text-sm text-[#c6c6cd] font-mono" style={monoStyle}>
          STREAMING / TAIL_MODE / NODE_07-G
        </p>
      </section>

      <div className="bg-[#0e0e10] border border-[#45464d] rounded-lg overflow-hidden">
        <div className="px-4 py-2 border-b border-[#45464d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#c6c6cd]" style={monoStyle}>
              tail · /var/log/argus/sentry.log
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#909097]" style={monoStyle}>{LOGS.length} entries</span>
        </div>
        <div className="argus-scroll max-h-[70vh] overflow-y-auto p-3 space-y-1.5 font-mono text-xs" style={monoStyle}>
          {LOGS.map((l, i) => (
            <div key={i} className="flex items-start gap-3 hover:bg-[#1b1b1d] px-2 py-1 rounded">
              <span className="text-[#909097] flex-shrink-0">{l.ts}</span>
              <span className={`flex-shrink-0 px-1.5 rounded text-[10px] font-bold ${tagColor(l.tag)}`} style={{ minWidth: '50px', textAlign: 'center' }}>
                {l.tag}
              </span>
              <span className="text-[#e4e2e4] break-all">{l.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
