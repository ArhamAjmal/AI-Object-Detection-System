'use client';

import AppShell from '@/components/AppShell';

const monoStyle: React.CSSProperties = { fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' };

interface CameraAsset {
  id: string;
  name: string;
  status: 'OPERATIONAL' | 'SIGNAL_LOSS' | 'MAINTENANCE' | 'DEGRADED';
  resolution: string;
  policy: string;
  lastSync: string;
}

const ASSETS: CameraAsset[] = [
  { id: 'CAM_70_NORTH_01',  name: 'NORTH ENTRANCE',     status: 'OPERATIONAL', resolution: '4K · 60FPS',  policy: 'CRITICAL_POLICY',   lastSync: '02s ago' },
  { id: 'CAM_70_DOOR_B',    name: 'SIDE DOOR B',         status: 'SIGNAL_LOSS', resolution: '1080p · 30FPS', policy: 'STANDARD',         lastSync: '14m ago' },
  { id: 'CAM_70_PERIM_5',   name: 'PERIMETER FENCE 5',   status: 'OPERATIONAL', resolution: '1080p · 30FPS', policy: 'DUAL_INPUT',       lastSync: '01s ago' },
  { id: 'CAM_70_LOBBY_A',   name: 'MAIN LOBBY A',        status: 'OPERATIONAL', resolution: '4K · 60FPS',  policy: 'FACIAL_RECOG',     lastSync: '03s ago' },
  { id: 'CAM_70_PARK_NORTH',name: 'NORTH PARKING',       status: 'DEGRADED',    resolution: '1080p · 15FPS', policy: 'STANDARD',         lastSync: '08s ago' },
  { id: 'CAM_70_SERVER_RM', name: 'SERVER ROOM',         status: 'OPERATIONAL', resolution: '1080p · 30FPS', policy: 'CRITICAL_POLICY',   lastSync: '01s ago' },
  { id: 'CAM_70_ROOFTOP',   name: 'ROOFTOP OBSERVE',     status: 'MAINTENANCE', resolution: 'OFFLINE',     policy: '—',                lastSync: '2h ago' },
  { id: 'CAM_70_CORRIDOR_3',name: 'CORRIDOR 3',          status: 'OPERATIONAL', resolution: '1080p · 30FPS', policy: 'STANDARD',         lastSync: '02s ago' },
];

const statusBadge = (s: CameraAsset['status']) => {
  switch (s) {
    case 'OPERATIONAL':  return { dot: 'bg-green-400', text: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', label: 'OPERATIONAL' };
    case 'SIGNAL_LOSS':  return { dot: 'bg-[#ef4444]', text: 'text-[#ef4444]', bg: 'bg-[#93000a]/15 border-[#ef4444]/40', label: 'SIGNAL LOSS' };
    case 'MAINTENANCE':  return { dot: 'bg-[#dec29a]', text: 'text-[#dec29a]', bg: 'bg-[#dec29a]/10 border-[#dec29a]/40', label: 'MAINTENANCE' };
    case 'DEGRADED':     return { dot: 'bg-[#bec6e0]', text: 'text-[#bec6e0]', bg: 'bg-[#bec6e0]/10 border-[#bec6e0]/30', label: 'DEGRADED' };
  }
};

export default function AssetsPage() {
  const totalAssets = ASSETS.length;
  const activeAssets = ASSETS.filter(a => a.status === 'OPERATIONAL').length;
  const faults = ASSETS.filter(a => a.status === 'SIGNAL_LOSS').length;

  return (
    <AppShell>
      <section className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#e4e2e4] mb-1">
            Asset Infrastructure Management
          </h1>
          <p className="text-sm text-[#c6c6cd] font-mono" style={monoStyle}>
            REGION_07 / SECTOR_G / TOPOLOGY-VIEW
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-[#353436] hover:bg-[#39393b] border border-[#45464d] text-[#e4e2e4] px-3 py-2 rounded text-[11px] font-bold uppercase tracking-widest font-mono flex items-center gap-1.5 transition" style={monoStyle}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>map</span>
            MAP LAYERS
          </button>
          <button className="bg-[#3c4a5e] hover:opacity-90 text-[#abb9d2] px-3 py-2 rounded text-[11px] font-bold uppercase tracking-widest font-mono flex items-center gap-1.5 transition" style={monoStyle}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>sync</span>
            RE-SYNC TOPOLOGY
          </button>
        </div>
      </section>

      {/* Topology / health row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Topology placeholder */}
        <div className="lg:col-span-2 bg-[#1f1f21] border border-[#45464d] rounded-lg p-4 relative overflow-hidden" style={{ minHeight: '280px' }}>
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `linear-gradient(rgba(190,198,224,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(190,198,224,0.08) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}></div>
          <h3 className="text-[11px] text-[#bec6e0] font-mono font-bold uppercase tracking-widest mb-3 relative" style={monoStyle}>
            ⟨ ASSET TOPOLOGY · SECTOR 7-G ⟩
          </h3>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-40">
              {/* Connecting lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 256 160" fill="none">
                <line x1="128" y1="80" x2="40"  y2="30"  stroke="#45464d" strokeDasharray="2 4" />
                <line x1="128" y1="80" x2="216" y2="30"  stroke="#45464d" strokeDasharray="2 4" />
                <line x1="128" y1="80" x2="40"  y2="130" stroke="#45464d" strokeDasharray="2 4" />
                <line x1="128" y1="80" x2="216" y2="130" stroke="#45464d" strokeDasharray="2 4" />
                <line x1="128" y1="80" x2="128" y2="20"  stroke="#bec6e0" />
                <line x1="128" y1="80" x2="128" y2="140" stroke="#bec6e0" />
              </svg>
              {/* Hub */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-lg bg-[#3c4a5e] border-2 border-[#bec6e0] flex items-center justify-center primary-glow">
                <span className="material-symbols-outlined text-[#bec6e0]" style={{ fontSize: '22px' }}>hub</span>
              </div>
              {/* Nodes */}
              {[
                { x: 'left-[10%]', y: 'top-[10%]', color: 'green-400', icon: 'videocam' },
                { x: 'right-[10%]', y: 'top-[10%]', color: 'green-400', icon: 'videocam' },
                { x: 'left-[10%]', y: 'bottom-[10%]', color: '#ef4444', icon: 'videocam_off' },
                { x: 'right-[10%]', y: 'bottom-[10%]', color: 'green-400', icon: 'videocam' },
                { x: 'left-1/2 -translate-x-1/2', y: 'top-0', color: 'green-400', icon: 'videocam' },
                { x: 'left-1/2 -translate-x-1/2', y: 'bottom-0', color: '#dec29a', icon: 'build' },
              ].map((n, i) => (
                <div key={i} className={`absolute ${n.x} ${n.y} w-7 h-7 rounded bg-[#1b1b1d] border border-[#45464d] flex items-center justify-center`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: n.color.startsWith('#') ? n.color : undefined }}>
                    {n.icon}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-2">
            <div className="bg-[#0e0e10]/80 glass-overlay border border-[#45464d] rounded p-2">
              <div className="text-[9px] font-mono text-[#909097] uppercase tracking-widest" style={monoStyle}>TOTAL ASSETS</div>
              <div className="text-xl font-mono text-[#e4e2e4] font-bold" style={monoStyle}>{totalAssets.toString().padStart(2, '0')}</div>
            </div>
            <div className="bg-[#0e0e10]/80 glass-overlay border border-[#45464d] rounded p-2">
              <div className="text-[9px] font-mono text-[#909097] uppercase tracking-widest" style={monoStyle}>ACTIVE</div>
              <div className="text-xl font-mono text-green-400 font-bold" style={monoStyle}>{activeAssets.toString().padStart(2, '0')}</div>
            </div>
            <div className="bg-[#0e0e10]/80 glass-overlay border border-[#45464d] rounded p-2">
              <div className="text-[9px] font-mono text-[#909097] uppercase tracking-widest" style={monoStyle}>FAULTS</div>
              <div className="text-xl font-mono text-[#ef4444] font-bold" style={monoStyle}>{faults.toString().padStart(2, '0')}</div>
            </div>
          </div>
        </div>

        {/* Health panel */}
        <div className="bg-[#1f1f21] border border-[#45464d] rounded-lg p-4 flex flex-col gap-3">
          <h3 className="text-[11px] text-[#bec6e0] font-mono font-bold uppercase tracking-widest" style={monoStyle}>
            SYSTEM HEALTH
          </h3>
          {[
            { label: 'NODE NETWORK LOAD', value: 64, color: 'bg-[#bec6e0]' },
            { label: 'STORAGE ARRAY (8 BAY)', value: 42, color: 'bg-green-400' },
            { label: 'POWER REDUNDANCY', value: 100, color: 'bg-green-400' },
          ].map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-[10px] font-mono mb-1" style={monoStyle}>
                <span className="text-[#c6c6cd] uppercase tracking-widest">{m.label}</span>
                <span className="text-[#e4e2e4] font-bold">{m.value}%</span>
              </div>
              <div className="h-1.5 bg-[#0e0e10] rounded-full overflow-hidden">
                <div className={`h-full ${m.color}`} style={{ width: `${m.value}%` }} />
              </div>
            </div>
          ))}
          <div className="mt-auto pt-3 border-t border-[#45464d]">
            <div className="text-[10px] font-mono text-[#909097] uppercase tracking-widest mb-1" style={monoStyle}>OVERALL STATUS</div>
            <div className="text-sm font-mono text-green-400 font-bold flex items-center gap-2" style={monoStyle}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              STABLE · NOMINAL
            </div>
          </div>
        </div>
      </div>

      {/* Asset registry */}
      <div className="bg-[#1f1f21] border border-[#45464d] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#45464d] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#e4e2e4]">Camera Asset Registry</h2>
          <div className="flex items-center gap-2 bg-[#0e0e10] border border-[#45464d] rounded px-3 py-1.5">
            <span className="material-symbols-outlined text-[#909097]" style={{ fontSize: '16px' }}>search</span>
            <input
              type="text"
              placeholder="Filter assets..."
              className="bg-transparent text-xs text-[#e4e2e4] placeholder-[#909097] outline-none w-40 font-mono"
              style={monoStyle}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#2a2a2b] border-b border-[#45464d]">
              <tr>
                {['ASSET IDENTITY', 'STATUS', 'TECHNICAL SPECS', 'ACTIVE POLICY', 'LAST SYNC'].map(h => (
                  <th key={h} className="px-4 sm:px-6 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-[#c6c6cd]" style={monoStyle}>
                    {h}
                  </th>
                ))}
                <th className="px-4 sm:px-6 py-3 text-right text-[10px] font-mono font-bold uppercase tracking-widest text-[#c6c6cd]" style={monoStyle}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#45464d]/30">
              {ASSETS.map((a) => {
                const sb = statusBadge(a.status);
                return (
                  <tr key={a.id} className="hover:bg-[#353436]/40 transition">
                    <td className="px-4 sm:px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#0e0e10] border border-[#45464d] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#bec6e0]" style={{ fontSize: '18px' }}>videocam</span>
                        </div>
                        <div>
                          <div className="text-[#e4e2e4] text-xs font-mono font-bold" style={monoStyle}>{a.id}</div>
                          <div className="text-[10px] text-[#909097]">{a.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono font-bold border ${sb.bg} ${sb.text}`} style={monoStyle}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sb.dot} ${a.status === 'SIGNAL_LOSS' ? 'animate-pulse' : ''}`} />
                        {sb.label}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <span className="text-xs text-[#c6c6cd] font-mono" style={monoStyle}>{a.resolution}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#0e0e10] border border-[#45464d] text-[#c6c6cd] font-mono uppercase" style={monoStyle}>
                        {a.policy}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <span className="text-[11px] text-[#909097] font-mono" style={monoStyle}>{a.lastSync}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="bg-[#0e0e10] border border-[#45464d] hover:border-[#bec6e0] text-[#c6c6cd] hover:text-[#bec6e0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest font-mono rounded transition" style={monoStyle}>
                          PROBE
                        </button>
                        <button className="bg-[#0e0e10] border border-[#45464d] hover:border-[#bec6e0] text-[#c6c6cd] hover:text-[#bec6e0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest font-mono rounded transition" style={monoStyle}>
                          CONFIG
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-[#45464d] text-[11px] font-mono text-[#c6c6cd]" style={monoStyle}>
          Showing {ASSETS.length} of {ASSETS.length} assets
        </div>
      </div>
    </AppShell>
  );
}
