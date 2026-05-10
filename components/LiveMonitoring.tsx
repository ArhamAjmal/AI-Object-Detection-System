'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import AppShell from '@/components/AppShell';

type AppState = 'camera-loading' | 'model-loading' | 'running' | 'error';

interface ActivityEntry {
  id: number;
  className: string;
  score: number;
  timestamp: string;
  level: 'critical' | 'normal' | 'system';
}

interface ClassCount {
  className: string;
  count: number;
  topScore: number;
}

interface Detection {
  objectCount: number;
  classes: ClassCount[];
  topConfidence: number;
  hasPerson: boolean;
  topClass: string | null;
}

const colorForClass = (cls: string): string => {
  let h = 0;
  for (let i = 0; i < cls.length; i++) h = (h * 31 + cls.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360}, 75%, 60%)`;
};

const formatTime = (date: Date): string =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;

const monoStyle: React.CSSProperties = { fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' };

export default function LiveMonitoring() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(false);
  const lastClassesRef = useRef<Set<string>>(new Set());
  const activityIdRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  const [appState, setAppState] = useState<AppState>('camera-loading');
  const [loadingMsg, setLoadingMsg] = useState('Initializing optical array...');
  const [errorMsg, setErrorMsg] = useState('');
  const [detection, setDetection] = useState<Detection>({
    objectCount: 0,
    classes: [],
    topConfidence: 0,
    hasPerson: false,
    topClass: null,
  });
  const [backend, setBackend] = useState('');
  const [paused, setPaused] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [uptime, setUptime] = useState('00:00:00');
  const [fps, setFps] = useState(0);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const t = setInterval(() => {
      const sec = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const h = String(Math.floor(sec / 3600)).padStart(2, '0');
      const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
      const s = String(sec % 60).padStart(2, '0');
      setUptime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const now = new Date();
    setActivity([
      { id: -1, className: 'OPTICAL ARRAY ONLINE', score: 1, timestamp: formatTime(now), level: 'system' },
    ]);
  }, []);

  const takeSnapshot = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const out = document.createElement('canvas');
    out.width = video.videoWidth;
    out.height = video.videoHeight;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    ctx.drawImage(canvas, 0, 0);
    setSnapshotUrl(out.toDataURL('image/png'));
  }, []);

  const downloadSnapshot = useCallback(() => {
    if (!snapshotUrl) return;
    const a = document.createElement('a');
    a.href = snapshotUrl;
    a.download = `argus-${Date.now()}.png`;
    a.click();
  }, [snapshotUrl]);

  useEffect(() => {
    let rafId = 0;
    let lastRun = 0;
    let mounted = true;
    let frameTimes: number[] = [];

    const drawCornerBox = (
      ctx: CanvasRenderingContext2D,
      x: number, y: number, w: number, h: number,
      color: string,
    ) => {
      const len = Math.min(w, h) * 0.18;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'square';
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y);
      ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len);
      ctx.moveTo(x + w, y + h - len); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - len, y + h);
      ctx.moveTo(x + len, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - len);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = color + 'aa';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
    };

    const drawBoxes = (
      predictions: cocoSsd.DetectedObject[],
      canvas: HTMLCanvasElement,
      video: HTMLVideoElement,
    ) => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      predictions.forEach((pred) => {
        const [x, y, w, h] = pred.bbox;
        const color = colorForClass(pred.class);
        drawCornerBox(ctx, x, y, w, h, color);
        const label = `${pred.class.toUpperCase()} ${(pred.score * 100).toFixed(0)}%`;
        ctx.font = 'bold 11px "JetBrains Mono", ui-monospace, monospace';
        const textW = ctx.measureText(label).width + 14;
        const labelY = y > 26 ? y - 22 : y + 4;
        ctx.fillStyle = color;
        ctx.fillRect(x, labelY, textW, 20);
        ctx.fillStyle = '#000';
        ctx.fillText(label, x + 7, labelY + 14);
      });
    };

    const runDetection = (model: cocoSsd.ObjectDetection) => {
      const loop = () => {
        if (!mounted) return;
        rafId = requestAnimationFrame(loop);
        if (pausedRef.current) return;

        const now = performance.now();
        if (now - lastRun < 200) return;

        frameTimes.push(now);
        frameTimes = frameTimes.filter(t => now - t < 1000);
        if (frameTimes.length > 1) setFps(frameTimes.length);

        lastRun = now;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2) return;

        model.detect(video).then((predictions) => {
          if (!mounted) return;
          drawBoxes(predictions, canvas, video);

          const map = new Map<string, ClassCount>();
          let topConf = 0;
          let topClass: string | null = null;
          let hasPerson = false;
          for (const p of predictions) {
            if (p.class === 'person') hasPerson = true;
            if (p.score > topConf) { topConf = p.score; topClass = p.class; }
            const e = map.get(p.class);
            if (e) {
              e.count++;
              if (p.score > e.topScore) e.topScore = p.score;
            } else {
              map.set(p.class, { className: p.class, count: 1, topScore: p.score });
            }
          }
          const classes = Array.from(map.values()).sort((a, b) => b.topScore - a.topScore);
          setDetection({ objectCount: predictions.length, classes, topConfidence: topConf, hasPerson, topClass });

          const currentClasses = new Set(classes.map(c => c.className));
          const newOnes = [...currentClasses].filter(c => !lastClassesRef.current.has(c));
          if (newOnes.length > 0) {
            const ts = formatTime(new Date());
            const entries: ActivityEntry[] = newOnes.map((cls) => {
              const found = classes.find(c => c.className === cls);
              return {
                id: ++activityIdRef.current,
                className: cls,
                score: found?.topScore ?? 0,
                timestamp: ts,
                level: cls === 'person' ? 'critical' : 'normal',
              };
            });
            setActivity(prev => [...entries, ...prev].slice(0, 30));
          }
          lastClassesRef.current = currentClasses;
        }).catch(() => {});
      };
      loop();
    };

    const startCamera = async () => {
      setAppState('camera-loading');
      setLoadingMsg('Initializing optical array...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        const video = videoRef.current;
        if (!video) { stream.getTracks().forEach(t => t.stop()); return; }
        if (!mounted) return;
        if (video.srcObject) {
          (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        }
        video.srcObject = stream;
        await new Promise<void>((resolve) => {
          video.onloadedmetadata = () => { video.play().then(resolve).catch(resolve); };
          setTimeout(resolve, 3000);
        });
      } catch (err) {
        if (!mounted) return;
        const code = (err as DOMException).name;
        const msg =
          code === 'NotAllowedError' ? 'Optical access denied. Authorize sensor and reload.' :
          code === 'NotFoundError' ? 'No optical sensor detected on this node.' :
          'Sensor fault: ' + (err instanceof Error ? err.message : String(err));
        setErrorMsg(msg);
        setAppState('error');
      }
    };

    const init = async () => {
      await startCamera();
      if (!mounted) return;
      setAppState('model-loading');
      setLoadingMsg('Calibrating neural core...');
      try {
        try { await tf.setBackend('webgl'); } catch { await tf.setBackend('cpu'); }
        await tf.ready();
        if (mounted) setBackend(tf.getBackend() ?? '');
        setLoadingMsg('Loading detection vectors...');
        const model = await cocoSsd.load();
        if (!mounted) return;
        setAppState('running');
        runDetection(model);
      } catch (err) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMsg('Neural core fault: ' + msg);
        setAppState('error');
      }
    };

    init();

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      const video = videoRef.current;
      if (video?.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
        video.srcObject = null;
      }
    };
  }, []);

  const isThreat = detection.hasPerson;

  // Right activity panel
  const activityPanel = (
    <>
      <div className="p-5 border-b border-[#45464d]">
        <h3 className="text-[11px] text-[#bec6e0] font-mono font-bold mb-1 uppercase tracking-widest" style={monoStyle}>
          RECENT ACTIVITY
        </h3>
        <p className="text-xs text-[#c6c6cd]">Live telemetry stream</p>
      </div>
      <div className="flex-1 overflow-y-auto argus-scroll p-3 space-y-2">
        {activity.length === 0 ? (
          <div className="text-[#909097] text-xs italic font-mono p-3 text-center" style={monoStyle}>
            ⟨ AWAITING SIGNAL ⟩
          </div>
        ) : (
          activity.map((a) => {
            const isCritical = a.level === 'critical';
            const isSystem = a.level === 'system';
            return (
              <div
                key={a.id}
                className={`p-3 rounded-r border-l-4 ${
                  isCritical ? 'bg-[#93000a]/15 border-[#ef4444]' :
                  isSystem ? 'bg-[#1b1b1d] border-[#909097]' :
                  'bg-[#1b1b1d] border-[#bec6e0]'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`font-bold text-[10px] uppercase tracking-widest font-mono ${
                      isCritical ? 'text-[#ffdad6]' : isSystem ? 'text-[#909097]' : 'text-[#bec6e0]'
                    }`}
                    style={monoStyle}
                  >
                    {isCritical ? 'PERSON DETECTED' : isSystem ? a.className : 'ENTITY ACQUIRED'}
                  </span>
                  <span className="text-[10px] text-[#909097] font-mono" style={monoStyle}>
                    {a.timestamp}
                  </span>
                </div>
                {!isSystem && (
                  <p className="text-xs text-[#e4e2e4] mb-1.5 capitalize">
                    {a.className} acquired in optical array
                  </p>
                )}
                {!isSystem && (
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-sm" style={{ background: colorForClass(a.className) }} />
                    <span className="text-[10px] bg-[#0e0e10] px-2 py-0.5 rounded text-[#c6c6cd] font-mono" style={monoStyle}>
                      OBJ: {a.className.toUpperCase().slice(0, 10)}_{Math.floor(a.score * 1000)}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <div className="p-4 bg-[#0e0e10] border-t border-[#45464d]">
        <div className="flex justify-between items-center text-[10px] font-mono text-[#c6c6cd] mb-2 uppercase tracking-widest" style={monoStyle}>
          <span>UPTIME: {uptime}</span>
          <span className="text-[#bec6e0]">SYNC: NOMINAL</span>
        </div>
        <div className="h-1 bg-[#353436] rounded-full overflow-hidden">
          <div className="h-full bg-[#bec6e0] w-2/3 shadow-[0_0_8px_rgba(190,198,224,0.4)]"></div>
        </div>
      </div>
    </>
  );

  return (
    <AppShell rightPanel={activityPanel}>
      {/* Snapshot Modal */}
      {snapshotUrl && (
        <div
          className="fixed inset-0 z-[100] glass-overlay flex items-center justify-center p-4"
          onClick={() => setSnapshotUrl(null)}
        >
          <div
            className="bg-[#1f1f21] border border-[#45464d] rounded-lg p-4 max-w-3xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#bec6e0]" style={{ fontSize: '20px' }}>capture</span>
                <h3 className="text-[#e4e2e4] font-semibold tracking-tight text-sm">EVIDENCE CAPTURE</h3>
              </div>
              <button onClick={() => setSnapshotUrl(null)} className="text-[#c6c6cd] hover:text-white material-symbols-outlined">close</button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={snapshotUrl} alt="Capture" className="w-full rounded border border-[#45464d]" />
            <div className="flex gap-2 mt-4">
              <button onClick={downloadSnapshot} className="flex-1 bg-[#bec6e0] hover:opacity-90 text-[#283044] font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-widest font-mono transition active:scale-[0.98]" style={monoStyle}>
                ⬇ Export PNG
              </button>
              <button onClick={() => setSnapshotUrl(null)} className="flex-1 bg-[#353436] hover:bg-[#45464d] text-[#e4e2e4] font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-widest font-mono transition active:scale-[0.98]" style={monoStyle}>
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#e4e2e4]">Live Monitoring Stage</h1>
          <p className="text-xs text-[#c6c6cd] font-mono mt-0.5" style={monoStyle}>
            NEURAL-DETECT v1.0 // COCO-SSD // {detection.objectCount.toString().padStart(2, '0')} OBJECTS DETECTED
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest" style={monoStyle}>
          <span className="text-[#c6c6cd]">FPS</span>
          <span className="text-[#bec6e0] font-bold">{fps.toString().padStart(2, '0')}</span>
          <span className="text-[#c6c6cd] mx-1">·</span>
          <span className="text-[#c6c6cd]">UPTIME</span>
          <span className="text-[#bec6e0] font-bold">{uptime}</span>
        </div>
      </div>

      <div
        className={`relative bg-[#1f1f21] border-2 ${isThreat ? 'border-[#ef4444] threat-pulse' : 'border-[#45464d]'} overflow-hidden rounded-lg transition`}
        style={{ aspectRatio: '16/9' }}
      >
        <video
          ref={videoRef}
          autoPlay muted playsInline
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'contrast(1.05) saturate(0.92)' }}
        />
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        />
        <div className="absolute inset-0 scanline opacity-25"></div>

        <div className="absolute top-3 left-3 flex gap-2 z-10">
          <span className="bg-[#0e0e10]/80 glass-overlay px-2 py-1 text-[10px] text-[#bec6e0] rounded font-mono font-bold tracking-widest" style={monoStyle}>
            CAM_PRIMARY_NODE
          </span>
          {appState === 'running' && !paused && !isThreat && (
            <span className="bg-green-500/20 text-green-400 px-2 py-0.5 text-[10px] font-bold rounded flex items-center gap-1 border border-green-500/30 font-mono uppercase tracking-widest" style={monoStyle}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              LIVE
            </span>
          )}
          {appState === 'running' && !paused && isThreat && (
            <span className="bg-[#ef4444] text-white px-2 py-0.5 text-[10px] font-bold rounded flex items-center gap-1 animate-pulse font-mono uppercase tracking-widest" style={monoStyle}>
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              TARGET DETECTED
            </span>
          )}
          {paused && (
            <span className="bg-[#dec29a] text-[#3e2d11] px-2 py-0.5 text-[10px] font-bold rounded flex items-center gap-1 font-mono uppercase tracking-widest" style={monoStyle}>
              <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>pause</span>
              PAUSED
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 flex flex-col items-end gap-1 z-10">
          <span className="bg-[#0e0e10]/80 glass-overlay px-2 py-1 text-[10px] text-[#c6c6cd] rounded font-mono tracking-widest" style={monoStyle}>
            {backend.toUpperCase() || 'BACKEND_PEND'} · {fps.toString().padStart(2, '0')}FPS
          </span>
          {detection.topClass && (
            <span className="bg-[#0e0e10]/80 glass-overlay px-2 py-1 text-[10px] text-[#bec6e0] rounded font-mono tracking-widest uppercase" style={monoStyle}>
              {detection.topClass} · {(detection.topConfidence * 100).toFixed(0)}%
            </span>
          )}
        </div>

        {appState === 'running' && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            <button
              onClick={() => setPaused(p => !p)}
              className="w-10 h-10 rounded-full bg-[#0e0e10]/80 glass-overlay border border-[#45464d] hover:bg-[#1f1f21] active:scale-90 transition flex items-center justify-center text-[#e4e2e4]"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{paused ? 'play_arrow' : 'pause'}</span>
            </button>
            {!paused && (
              <button
                onClick={takeSnapshot}
                className="w-12 h-12 rounded-full bg-[#bec6e0] text-[#283044] hover:scale-105 active:scale-95 transition flex items-center justify-center shadow-xl primary-glow"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>photo_camera</span>
              </button>
            )}
          </div>
        )}

        <div className="absolute bottom-3 left-3 z-10">
          <span className="bg-[#0e0e10]/80 glass-overlay px-2 py-1 text-[10px] text-[#909097] rounded font-mono tracking-widest" style={monoStyle}>
            FRAME_{Date.now().toString().slice(-6)}
          </span>
        </div>

        {(appState === 'camera-loading' || appState === 'model-loading') && (
          <div className="absolute inset-0 z-20 bg-[#0e0e10]/95 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 border-2 border-[#45464d] rounded-full"></div>
              <div className="absolute inset-0 w-14 h-14 border-2 border-[#bec6e0] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-[#bec6e0] font-bold text-sm tracking-tight uppercase mb-1 font-mono" style={monoStyle}>
                {appState === 'camera-loading' ? '⟨ OPTICAL HANDSHAKE ⟩' : '⟨ NEURAL CALIBRATION ⟩'}
              </p>
              <p className="text-[#c6c6cd] text-xs font-mono px-8" style={monoStyle}>{loadingMsg}</p>
            </div>
          </div>
        )}

        {appState === 'error' && (
          <div className="absolute inset-0 z-20 bg-[#0e0e10]/95 flex flex-col items-center justify-center gap-3 px-6">
            <div className="w-14 h-14 rounded-full bg-[#93000a]/30 border-2 border-[#ef4444] flex items-center justify-center threat-glow">
              <span className="material-symbols-outlined text-[#ef4444]" style={{ fontSize: '28px' }}>warning</span>
            </div>
            <p className="text-[#ffdad6] font-bold text-sm uppercase tracking-tight font-mono" style={monoStyle}>CRITICAL FAULT</p>
            <p className="text-[#c6c6cd] text-xs text-center font-mono max-w-md" style={monoStyle}>{errorMsg}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 bg-[#93000a] hover:opacity-90 text-[#ffdad6] text-xs font-bold px-5 py-2 rounded-lg uppercase tracking-widest font-mono active:scale-95 transition"
              style={monoStyle}
            >
              RECONNECT
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {[
          { label: 'OBJECTS', value: detection.objectCount.toString().padStart(2, '0'), tone: detection.objectCount > 0 ? 'primary' : 'muted' },
          { label: 'CLASSES', value: detection.classes.length.toString().padStart(2, '0'), tone: 'muted' },
          { label: 'TOP CONF', value: detection.topConfidence > 0 ? `${(detection.topConfidence * 100).toFixed(0)}%` : '——', tone: 'muted' },
          { label: 'STATUS', value: isThreat ? 'TARGET' : appState === 'running' ? 'CLEAR' : 'INIT', tone: isThreat ? 'error' : 'green' },
        ].map(({ label, value, tone }) => (
          <div key={label} className="bg-[#1f1f21] border border-[#45464d] rounded-lg p-3">
            <p className="text-[10px] text-[#909097] font-mono uppercase tracking-widest" style={monoStyle}>{label}</p>
            <p
              className={`font-mono font-bold text-lg mt-1 tracking-tight ${
                tone === 'error' ? 'text-[#ef4444]' :
                tone === 'green' ? 'text-green-400' :
                tone === 'primary' ? 'text-[#bec6e0]' :
                'text-[#e4e2e4]'
              }`}
              style={monoStyle}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-[#1f1f21] border border-[#45464d] rounded-lg p-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] text-[#bec6e0] font-mono font-bold uppercase tracking-widest" style={monoStyle}>
            DETECTION VECTORS
          </h3>
          <span className="text-[10px] text-[#909097] font-mono" style={monoStyle}>
            {detection.classes.length} ACTIVE
          </span>
        </div>
        {detection.classes.length === 0 ? (
          <p className="text-[#909097] text-xs italic font-mono py-3" style={monoStyle}>
            ⟨ NO ENTITIES IN ARRAY ⟩
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {detection.classes.map((c) => (
              <div key={c.className} className="bg-[#0e0e10] border border-[#45464d] rounded p-2.5 flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ background: colorForClass(c.className), boxShadow: `0 0 8px ${colorForClass(c.className)}80` }}
                />
                <span className="text-[#e4e2e4] text-sm uppercase flex-1 truncate font-mono tracking-tight" style={monoStyle}>
                  {c.className}
                </span>
                {c.count > 1 && (
                  <span className="text-[10px] font-mono text-[#bec6e0] bg-[#3c4a5e] px-1.5 py-0.5 rounded">×{c.count}</span>
                )}
                <span className="font-mono text-xs text-[#c6c6cd] font-bold" style={monoStyle}>
                  {(c.topScore * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
