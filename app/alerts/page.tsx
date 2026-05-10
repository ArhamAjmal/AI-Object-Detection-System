'use client';

import AppShell from '@/components/AppShell';
import { useMemo, useState } from 'react';

const monoStyle: React.CSSProperties = { fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' };

type ThreatLevel = 'CRITICAL' | 'ELEVATED' | 'ROUTINE' | 'DISMISSED';

interface Incident {
  id: string;
  timestamp: string;
  date: string;
  cameraId: string;
  objectType: string;
  level: ThreatLevel;
  confidence: number;
  action: string;
}

const SAMPLE: Incident[] = [
  { id: 'INC-7842', timestamp: '14:22:08', date: '25 OCT 2023', cameraId: 'CAM-09-ENTRANCE',  objectType: 'PERSON',         level: 'CRITICAL', confidence: 98.4, action: 'ALARM TRIGGERED' },
  { id: 'INC-7841', timestamp: '13:45:12', date: '25 OCT 2023', cameraId: 'CAM-04-SERVER-RM', objectType: 'FORCED ENTRY',   level: 'ELEVATED', confidence: 82.1, action: 'OFFICER DISPATCH' },
  { id: 'INC-7840', timestamp: '12:18:55', date: '25 OCT 2023', cameraId: 'CAM-12-LOADING',   objectType: 'UNAUTHORIZED ID', level: 'ELEVATED', confidence: 76.9, action: 'PERIMETER LOCKED' },
  { id: 'INC-7839', timestamp: '11:58:41', date: '25 OCT 2023', cameraId: 'CAM-01-LOBBY',     objectType: 'BACKPACK',        level: 'ROUTINE',  confidence: 65.4, action: 'LOGGED' },
  { id: 'INC-7838', timestamp: '11:32:09', date: '25 OCT 2023', cameraId: 'CAM-07-PARKING',   objectType: 'CAR',             level: 'ROUTINE',  confidence: 91.2, action: 'LOGGED' },
  { id: 'INC-7837', timestamp: '10:45:27', date: '25 OCT 2023', cameraId: 'CAM-03-CORRIDOR',  objectType: 'LOITERING',       level: 'DISMISSED',confidence: 54.1, action: 'AUTO-CLEARED' },
  { id: 'INC-7836', timestamp: '10:12:55', date: '25 OCT 2023', cameraId: 'CAM-05-PERIM-A',   objectType: 'MOTION ANOMALY',  level: 'ROUTINE',  confidence: 71.8, action: 'LOGGED' },
  { id: 'INC-7835', timestamp: '09:28:14', date: '25 OCT 2023', cameraId: 'CAM-09-ENTRANCE',  objectType: 'CELL PHONE',      level: 'ROUTINE',  confidence: 88.7, action: 'LOGGED' },
  { id: 'INC-7834', timestamp: '08:55:02', date: '25 OCT 2023', cameraId: 'CAM-02-ROOFTOP',   objectType: 'BIRD',            level: 'DISMISSED',confidence: 42.3, action: 'AUTO-CLEARED' },
  { id: 'INC-7833', timestamp: '08:14:30', date: '25 OCT 2023', cameraId: 'CAM-11-EXIT-B',    objectType: 'FORCED ENTRY',    level: 'ELEVATED', confidence: 79.5, action: 'OFFICER DISPATCH' },
];

const levelColor = (l: ThreatLevel) => {
  switch (l) {
    case 'CRITICAL':  return { dot: 'bg-[#ef4444]', text: 'text-[#ef4444]', bg: 'bg-[#93000a]/15 border-[#ef4444]/40' };
    case 'ELEVATED':  return { dot: 'bg-[#dec29a]', text: 'text-[#dec29a]', bg: 'bg-[#dec29a]/10 border-[#dec29a]/40' };
    case 'ROUTINE':   return { dot: 'bg-[#bec6e0]', text: 'text-[#bec6e0]', bg: 'bg-[#bec6e0]/10 border-[#bec6e0]/30' };
    case 'DISMISSED': return { dot: 'bg-[#909097]', text: 'text-[#909097]', bg: 'bg-[#353436]/40 border-[#45464d]' };
  }
};

const actionColor = (action: string) => {
  if (action === 'ALARM TRIGGERED') return 'bg-[#93000a] text-[#ffdad6] border-[#ef4444]/30';
  if (action === 'OFFICER DISPATCH') return 'bg-[#3c4a5e] text-[#abb9d2] border-[#bec6e0]/30';
  if (action === 'PERIMETER LOCKED') return 'bg-[#dec29a]/20 text-[#dec29a] border-[#dec29a]/30';
  if (action === 'AUTO-CLEARED') return 'bg-[#1b1b1d] text-[#909097] border-[#45464d]';
  return 'bg-[#1b1b1d] text-[#c6c6cd] border-[#45464d]';
};

export default function AlertsPage() {
  const [filter, setFilter] = useState<ThreatLevel | 'ALL'>('ALL');

  const filtered = useMemo(
    () => filter === 'ALL' ? SAMPLE : SAMPLE.filter(i => i.level === filter),
    [filter]
  );

  return (
    <AppShell>
      {/* Header */}
      <section className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#e4e2e4] mb-1">
            INCIDENT ALERTS &amp; HISTORY
          </h1>
          <p className="text-sm text-[#c6c6cd]">Real-time threat detection and historical forensic audit logs.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-[#2a2a2b] px-4 py-2 border border-[#45464d] rounded flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ef4444]">priority_high</span>
            <div>
              <div className="text-[10px] font-mono text-[#c6c6cd] uppercase tracking-widest" style={monoStyle}>ACTIVE THREATS</div>
              <div className="text-xl font-mono text-[#ef4444] font-bold" style={monoStyle}>04</div>
            </div>
          </div>
          <div className="bg-[#2a2a2b] px-4 py-2 border border-[#45464d] rounded flex items-center gap-3">
            <span className="material-symbols-outlined text-[#dec29a]">query_stats</span>
            <div>
              <div className="text-[10px] font-mono text-[#c6c6cd] uppercase tracking-widest" style={monoStyle}>24H RESOLVED</div>
              <div className="text-xl font-mono text-[#dec29a] font-bold" style={monoStyle}>128</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mb-4 flex flex-wrap items-center justify-between gap-4 p-4 bg-[#1b1b1d] border border-[#45464d] rounded-lg">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#798098] uppercase tracking-widest" style={monoStyle}>DATE RANGE</span>
            <div className="flex items-center gap-2 bg-[#0e0e10] border border-[#45464d] px-3 py-1.5 rounded">
              <span className="material-symbols-outlined text-[#c6c6cd]" style={{ fontSize: '16px' }}>calendar_today</span>
              <span className="text-xs font-mono text-[#e4e2e4]" style={monoStyle}>2023-10-24 → 2023-10-25</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#798098] uppercase tracking-widest" style={monoStyle}>THREAT LEVEL</span>
            <div className="flex items-center gap-2 flex-wrap">
              {(['ALL', 'CRITICAL', 'ELEVATED', 'ROUTINE', 'DISMISSED'] as const).map((l) => {
                const active = filter === l;
                return (
                  <button
                    key={l}
                    onClick={() => setFilter(l)}
                    className={`px-3 py-1 border rounded text-[11px] font-bold uppercase tracking-widest font-mono transition ${
                      active
                        ? 'bg-[#bec6e0] border-[#bec6e0] text-[#283044]'
                        : 'bg-[#0e0e10] border-[#45464d] text-[#c6c6cd] hover:text-[#e4e2e4]'
                    }`}
                    style={monoStyle}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#353436] hover:bg-[#39393b] text-[#e4e2e4] text-[11px] font-bold uppercase tracking-widest font-mono border border-[#45464d] rounded transition" style={monoStyle}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>filter_list</span>
            ADV. FILTERS
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#bec6e0] hover:opacity-90 text-[#283044] text-[11px] font-bold uppercase tracking-widest font-mono rounded transition" style={monoStyle}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
            EXPORT CSV
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="bg-[#1f1f21] border border-[#45464d] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#2a2a2b] text-[#c6c6cd] border-b border-[#45464d]">
              <tr>
                {['TIMESTAMP', 'CAMERA ID', 'OBJECT TYPE', 'CONFIDENCE', 'ACTION TAKEN'].map(h => (
                  <th key={h} className="px-4 sm:px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest font-mono" style={monoStyle}>
                    {h}
                  </th>
                ))}
                <th className="px-4 sm:px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest font-mono" style={monoStyle}>
                  FORENSICS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#45464d]/30">
              {filtered.map((inc) => {
                const lc = levelColor(inc.level);
                return (
                  <tr key={inc.id} className="hover:bg-[#353436]/40 transition">
                    <td className="px-4 sm:px-6 py-3.5">
                      <div className="text-[#e4e2e4] text-sm font-mono" style={monoStyle}>{inc.timestamp}</div>
                      <div className="text-[10px] text-[#909097] font-mono" style={monoStyle}>{inc.date}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <span className="text-[#e4e2e4] text-xs font-mono" style={monoStyle}>{inc.cameraId}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${lc.dot} ${inc.level === 'CRITICAL' ? 'threat-pulse' : ''}`}></div>
                        <span className={`${lc.text} font-bold text-xs font-mono uppercase tracking-wider`} style={monoStyle}>
                          {inc.objectType}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 min-w-[120px]">
                      <div className="w-full bg-[#0e0e10] h-1 rounded-full mb-1 max-w-[100px] overflow-hidden">
                        <div className={`h-full ${lc.dot}`} style={{ width: `${inc.confidence}%` }} />
                      </div>
                      <span className="text-[11px] text-[#c6c6cd] font-mono" style={monoStyle}>{inc.confidence.toFixed(1)}%</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <span className={`px-2.5 py-1 text-[10px] font-mono font-bold border rounded ${actionColor(inc.action)}`} style={monoStyle}>
                        {inc.action}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-right">
                      <button className="bg-[#0e0e10] border border-[#45464d] text-[#c6c6cd] hover:text-[#bec6e0] hover:border-[#bec6e0] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest font-mono rounded transition flex items-center gap-1.5 ml-auto" style={monoStyle}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>videocam</span>
                        VIEW
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-[#45464d] flex items-center justify-between text-[11px] font-mono text-[#c6c6cd]" style={monoStyle}>
          <span>Showing {filtered.length} of {SAMPLE.length} incidents</span>
          <div className="flex items-center gap-2">
            <button className="w-7 h-7 rounded border border-[#45464d] hover:bg-[#353436] transition flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span>
            </button>
            <span className="px-3 py-1 bg-[#3c4a5e] text-[#abb9d2] rounded">1</span>
            <button className="w-7 h-7 rounded border border-[#45464d] hover:bg-[#353436] transition flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
