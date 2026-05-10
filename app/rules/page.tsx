'use client';

import AppShell from '@/components/AppShell';
import { useState } from 'react';

const monoStyle: React.CSSProperties = { fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' };

interface Rule {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const RULES: Rule[] = [
  { id: 'rule-person',  title: 'Person Detection',  description: 'Real-time detection of human entities for monitoring authorized personnel and intruders.', icon: 'person' },
  { id: 'rule-vehicle', title: 'Vehicle Detection', description: 'Identification of cars, motorcycles, trucks, and bicycles in restricted vehicle zones.',     icon: 'directions_car' },
  { id: 'rule-anim',    title: 'Animal Anomaly',    description: 'Detection of mammals and birds entering controlled facility perimeters.',                  icon: 'pets' },
  { id: 'rule-bag',     title: 'Bag / Package',     description: 'Recognition of backpacks, handbags, and suitcases for unattended item alerts.',           icon: 'work' },
];

export default function RulesPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    'rule-person': true,
    'rule-vehicle': true,
    'rule-anim': false,
    'rule-bag': true,
  });
  const [confThreshold, setConfThreshold] = useState(55);
  const [persistence, setPersistence] = useState(2);
  const [protocols, setProtocols] = useState({
    police: false,
    private: true,
    sms: true,
  });

  const toggleRule = (id: string) => setEnabled(e => ({ ...e, [id]: !e[id] }));
  const toggleProto = (k: keyof typeof protocols) => setProtocols(p => ({ ...p, [k]: !p[k] }));

  return (
    <AppShell>
      <section className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#e4e2e4] mb-1">
          Security Rules &amp; Logic
        </h1>
        <p className="text-sm text-[#c6c6cd]">
          Configure neural-net detection parameters and emergency response protocols for Sector 7-G.
        </p>
      </section>

      {/* Rule cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {RULES.map((r) => {
          const on = enabled[r.id];
          return (
            <div
              key={r.id}
              className={`p-4 rounded-lg border transition ${
                on ? 'bg-[#1f1f21] border-[#45464d]' : 'bg-[#1b1b1d] border-[#45464d] opacity-70'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded flex items-center justify-center ${
                  on ? 'bg-[#3c4a5e] text-[#bec6e0]' : 'bg-[#0e0e10] text-[#909097]'
                }`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{r.icon}</span>
                </div>
                <button
                  onClick={() => toggleRule(r.id)}
                  className={`relative w-10 h-5 rounded-full transition ${
                    on ? 'bg-[#bec6e0]' : 'bg-[#353436]'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                    on ? 'left-[22px]' : 'left-0.5'
                  }`} />
                </button>
              </div>
              <h3 className="text-base font-bold text-[#e4e2e4] mb-1">{r.title}</h3>
              <p className="text-xs text-[#c6c6cd] leading-relaxed mb-3">{r.description}</p>
              <div className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest ${
                on ? 'text-green-400' : 'text-[#909097]'
              }`} style={monoStyle}>
                <span className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-green-400 animate-pulse' : 'bg-[#909097]'}`} />
                {on ? 'ACTIVE MONITORING' : 'DISABLED'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Sensitivity */}
        <div className="lg:col-span-2 bg-[#1f1f21] border border-[#45464d] rounded-lg p-5">
          <h2 className="text-lg font-bold text-[#e4e2e4] mb-1">Alarm Sensitivity Threshold</h2>
          <p className="text-xs text-[#c6c6cd] mb-5">
            Adjust the confidence score required to trigger an automated alert. Lower values increase vigilance but may also trigger false positives.
          </p>

          <div className="mb-5">
            <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest mb-2" style={monoStyle}>
              <span className="text-[#c6c6cd]">AI Confidence Threshold</span>
              <span className="text-[#bec6e0] font-bold">{confThreshold}%</span>
            </div>
            <input
              type="range"
              min={10} max={99} value={confThreshold}
              onChange={(e) => setConfThreshold(parseInt(e.target.value))}
              className="w-full accent-[#bec6e0] h-1"
            />
            <div className="flex justify-between text-[9px] text-[#909097] font-mono mt-1" style={monoStyle}>
              <span>HIGH-SENSITIVITY</span>
              <span>BALANCED</span>
              <span>STRICT</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest mb-2" style={monoStyle}>
              <span className="text-[#c6c6cd]">Temporal Persistence (sec)</span>
              <span className="text-[#bec6e0] font-bold">{persistence}s</span>
            </div>
            <input
              type="range"
              min={1} max={10} value={persistence}
              onChange={(e) => setPersistence(parseInt(e.target.value))}
              className="w-full accent-[#bec6e0] h-1"
            />
            <p className="text-[10px] text-[#909097] font-mono mt-1" style={monoStyle}>
              Object must persist for {persistence}s before triggering alert
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-[#45464d]">
            <div className="bg-[#0e0e10] border border-[#45464d] rounded p-3">
              <div className="text-[10px] font-mono text-[#909097] uppercase tracking-widest mb-1" style={monoStyle}>PROJECTED EFFICIENCY</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono text-[#bec6e0] font-bold" style={monoStyle}>99.2%</span>
                <span className="text-[10px] text-green-400 font-mono" style={monoStyle}>OPTIMAL</span>
              </div>
            </div>
            <div className="bg-[#0e0e10] border border-[#45464d] rounded p-3">
              <div className="text-[10px] font-mono text-[#909097] uppercase tracking-widest mb-1" style={monoStyle}>FALSE POSITIVE RATE</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono text-[#dec29a] font-bold" style={monoStyle}>0.8%</span>
                <span className="text-[10px] text-[#c6c6cd] font-mono" style={monoStyle}>LOW</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification protocols */}
        <div className="bg-[#1f1f21] border border-[#45464d] rounded-lg p-5">
          <h3 className="text-[11px] text-[#bec6e0] font-mono font-bold uppercase tracking-widest mb-4" style={monoStyle}>
            NOTIFICATION PROTOCOLS
          </h3>
          <div className="space-y-3">
            {[
              { key: 'police', icon: 'local_police', label: 'Police Dispatch' },
              { key: 'private', icon: 'shield', label: 'Private Security' },
              { key: 'sms', icon: 'sms', label: 'SMS Alert Chain' },
            ].map(({ key, icon, label }) => {
              const k = key as keyof typeof protocols;
              return (
                <div key={key} className="flex items-center justify-between bg-[#0e0e10] border border-[#45464d] rounded p-3">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#bec6e0]" style={{ fontSize: '18px' }}>{icon}</span>
                    <span className="text-sm text-[#e4e2e4]">{label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={protocols[k]}
                    onChange={() => toggleProto(k)}
                    className="w-4 h-4 accent-[#bec6e0] cursor-pointer"
                  />
                </div>
              );
            })}
          </div>

          <button className="w-full mt-5 bg-[#93000a] hover:opacity-90 text-[#ffdad6] py-3 rounded-lg text-xs font-bold uppercase tracking-widest font-mono flex items-center justify-center gap-2 transition active:scale-[0.98]" style={monoStyle}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
            TRIGGER TEST ALARM
          </button>
          <p className="text-[10px] text-[#909097] font-mono mt-2 text-center" style={monoStyle}>
            Authorized Personnel Only · Logs will be created
          </p>
        </div>
      </div>

      {/* Bottom info row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        {[
          { icon: 'visibility_off', title: 'SMART MASKING',     desc: 'Privacy filters applied to 5 residential zones.', color: 'text-[#bec6e0]' },
          { icon: 'schedule',       title: 'CRITICAL HOURS',    desc: 'Increased sensitivity active 22:00 — 06:00.',     color: 'text-[#dec29a]' },
          { icon: 'fact_check',     title: 'LAST AUDIT',        desc: 'Rules verified by Operator #402, 12h ago.',       color: 'text-green-400' },
        ].map((c) => (
          <div key={c.title} className="bg-[#1f1f21] border border-[#45464d] rounded-lg p-4 flex gap-3">
            <span className={`material-symbols-outlined ${c.color}`} style={{ fontSize: '24px' }}>{c.icon}</span>
            <div>
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#e4e2e4] mb-1" style={monoStyle}>{c.title}</h4>
              <p className="text-xs text-[#c6c6cd]">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
