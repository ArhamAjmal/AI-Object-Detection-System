'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

type AppState = 'camera-loading' | 'model-loading' | 'running' | 'error';
type DetectionState = 'waiting' | 'helmet' | 'violation';

interface Detection {
  state: DetectionState;
  confidence: number;
  objectCount: number;
}

export default function HelmetDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(false);

  const [appState, setAppState] = useState<AppState>('camera-loading');
  const [loadingMsg, setLoadingMsg] = useState('Requesting camera access...');
  const [errorMsg, setErrorMsg] = useState('');
  const [detection, setDetection] = useState<Detection>({
    state: 'waiting',
    confidence: 0,
    objectCount: 0,
  });
  const [backend, setBackend] = useState('');
  const [paused, setPaused] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

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
    a.download = `helmet-detection-${Date.now()}.png`;
    a.click();
  }, [snapshotUrl]);

  useEffect(() => {
    let rafId = 0;
    let lastRun = 0;
    let mounted = true;

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
        const isPerson = pred.class === 'person';
        const isHelmet = pred.class.toLowerCase().includes('helmet');
        const color = isHelmet ? '#22c55e' : isPerson ? '#f59e0b' : '#818cf8';

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);

        const label = `${pred.class} ${(pred.score * 100).toFixed(0)}%`;
        ctx.font = 'bold 14px Arial';
        const textW = ctx.measureText(label).width + 12;
        const labelY = y > 30 ? y - 28 : y + 4;

        ctx.fillStyle = color;
        ctx.fillRect(x, labelY, textW, 24);
        ctx.fillStyle = '#000';
        ctx.fillText(label, x + 6, labelY + 16);
      });
    };

    const runDetection = (model: cocoSsd.ObjectDetection) => {
      const loop = () => {
        if (!mounted) return;
        rafId = requestAnimationFrame(loop);

        if (pausedRef.current) return;

        const now = Date.now();
        if (now - lastRun < 200) return; // ~5 FPS
        lastRun = now;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2) return;

        model.detect(video).then((predictions) => {
          if (!mounted) return;
          drawBoxes(predictions, canvas, video);

          const person = predictions.find((p) => p.class === 'person');
          const helmet = predictions.find((p) =>
            p.class.toLowerCase().includes('helmet'),
          );

          if (!person) {
            setDetection({ state: 'waiting', confidence: 0, objectCount: predictions.length });
          } else if (helmet) {
            setDetection({ state: 'helmet', confidence: helmet.score, objectCount: predictions.length });
          } else {
            setDetection({ state: 'violation', confidence: person.score, objectCount: predictions.length });
          }
        }).catch(() => {});
      };

      loop();
    };

    const startCamera = async () => {
      setAppState('camera-loading');
      setLoadingMsg('Requesting camera access...');

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
          video.onloadedmetadata = () => {
            video.play().then(resolve).catch(resolve);
          };
          setTimeout(resolve, 3000);
        });
      } catch (err) {
        if (!mounted) return;
        const code = (err as DOMException).name;
        const msg =
          code === 'NotAllowedError' ? 'Camera permission denied. Please allow camera access and refresh.' :
          code === 'NotFoundError' ? 'No camera found. Please connect a camera and refresh.' :
          'Camera error: ' + (err instanceof Error ? err.message : String(err));
        setErrorMsg(msg);
        setAppState('error');
      }
    };

    const init = async () => {
      await startCamera();
      if (!mounted) return;

      // ── Model ────────────────────────────────────────────────────────────
      setAppState('model-loading');
      setLoadingMsg('Setting up TensorFlow backend...');

      try {
        try { await tf.setBackend('webgl'); } catch { await tf.setBackend('cpu'); }
        await tf.ready();
        if (mounted) setBackend(tf.getBackend() ?? '');

        setLoadingMsg('Downloading AI model (first load may take ~10 seconds)...');
        const model = await cocoSsd.load();

        if (!mounted) return;
        setAppState('running');
        runDetection(model);
      } catch (err) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMsg('Failed to load AI model: ' + msg);
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

  const statusMap = {
    waiting: {
      icon: '👀',
      headline: 'Waiting for Detection',
      sub: 'Stand in front of the camera',
      headlineColor: 'text-slate-300',
      cardBg: 'bg-slate-800/60',
      cardBorder: 'border-slate-600',
      barColor: 'bg-slate-500',
    },
    helmet: {
      icon: '✅',
      headline: 'Helmet Detected ✓',
      sub: 'Rider is wearing a helmet — Safe',
      headlineColor: 'text-green-400',
      cardBg: 'bg-green-950/50',
      cardBorder: 'border-green-500',
      barColor: 'bg-green-500',
    },
    violation: {
      icon: '❌',
      headline: 'No Helmet — Violation ✗',
      sub: 'Rider is NOT wearing a helmet',
      headlineColor: 'text-red-400',
      cardBg: 'bg-red-950/50',
      cardBorder: 'border-red-500',
      barColor: 'bg-red-500',
    },
  } as const;

  const s = statusMap[detection.state];

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">

      {/* Snapshot Modal */}
      {snapshotUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSnapshotUrl(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl p-4 max-w-3xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">📸 Snapshot Captured</h3>
              <button
                onClick={() => setSnapshotUrl(null)}
                className="text-slate-400 hover:text-white text-2xl leading-none"
              >×</button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={snapshotUrl} alt="Snapshot" className="w-full rounded-lg border border-slate-700" />
            <div className="flex gap-2 mt-4">
              <button
                onClick={downloadSnapshot}
                className="flex-1 bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all text-white font-semibold py-2.5 px-4 rounded-lg"
              >
                ⬇ Download PNG
              </button>
              <button
                onClick={() => setSnapshotUrl(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all text-white font-semibold py-2.5 px-4 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav className="bg-[#0d1424] border-b border-slate-800 px-6 py-3 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h1 className="text-base font-bold leading-tight">Helmet Detection System</h1>
              <p className="text-[11px] text-slate-500">AI-Powered Traffic Safety Monitor</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span
              className={`w-2 h-2 rounded-full ${
                appState === 'running' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
              }`}
            />
            {appState === 'running' ? 'Live' : 'Starting...'}
          </div>
        </div>
      </nav>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex flex-col gap-6">

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Camera View ──────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Padding-bottom trick: reliable 16:9 aspect ratio in all browsers */}
            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', borderRadius: '1rem', overflow: 'hidden', background: '#000', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)' }}>

              {/* Video feed — inline styles only, no Tailwind */}
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />

              {/* Canvas overlay for bounding boxes */}
              <canvas
                ref={canvasRef}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', background: 'transparent' }}
              />

              {/* Loading overlay */}
              {(appState === 'camera-loading' || appState === 'model-loading') && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: '#020817', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                  <div className="w-10 h-10 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-400 text-sm text-center px-8">{loadingMsg}</p>
                </div>
              )}

              {/* Error overlay */}
              {appState === 'error' && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: '#020817', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                  <span className="text-4xl">⚠️</span>
                  <p className="text-red-400 text-sm text-center px-8">{errorMsg}</p>
                </div>
              )}

              {/* LIVE badge */}
              {appState === 'running' && !paused && (
                <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', zIndex: 10 }} className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-widest">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  LIVE
                </div>
              )}

              {/* PAUSED badge */}
              {appState === 'running' && paused && (
                <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', zIndex: 10 }} className="flex items-center gap-1.5 bg-amber-500/90 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-widest text-black">
                  <span>⏸</span>
                  PAUSED
                </div>
              )}

              {/* Bottom action bar */}
              {appState === 'running' && (
                <div style={{ position: 'absolute', bottom: '0.75rem', left: '50%', transform: 'translateX(-50%)', zIndex: 30 }} className="flex items-center gap-2">
                  <button
                    onClick={() => setPaused(p => !p)}
                    title={paused ? 'Resume' : 'Pause'}
                    className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 hover:bg-black/90 active:scale-90 transition-all flex items-center justify-center text-white"
                  >
                    {paused ? '▶' : '⏸'}
                  </button>
                  <button
                    onClick={takeSnapshot}
                    title="Take Snapshot"
                    className="w-12 h-12 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-xl shadow-xl"
                  >
                    📸
                  </button>
                </div>
              )}

            </div>

            {/* Info strip */}
            <div className="mt-3 bg-blue-950/30 border border-blue-900/40 rounded-xl px-4 py-2.5 text-xs text-blue-300 flex items-center gap-2">
              <span>ℹ️</span>
              <span>All processing runs locally in your browser via TensorFlow.js — no video data is sent to any server.</span>
            </div>
          </div>

          {/* ── Right Panel ──────────────────────────────────────────────── */}
          <div className="lg:w-72 flex flex-col gap-4 flex-shrink-0">

            {/* Status card */}
            <div className={`rounded-2xl border p-6 flex flex-col items-center text-center gap-3 ${s.cardBg} ${s.cardBorder}`}>
              <span className="text-5xl">{s.icon}</span>
              <h2 className={`text-lg font-bold leading-snug ${s.headlineColor}`}>
                {s.headline}
              </h2>
              <p className="text-slate-400 text-xs">{s.sub}</p>

              {detection.confidence > 0 && (
                <div className="w-full mt-1">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Confidence</span>
                    <span className="font-mono">{(detection.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${s.barColor}`}
                      style={{ width: `${(detection.confidence * 100).toFixed(1)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Detection Info</p>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Objects in frame</span>
                  <span className="font-mono text-white">{detection.objectCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">AI Backend</span>
                  <span className="font-mono text-blue-400">{backend.toUpperCase() || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Model</span>
                  <span className="font-mono text-violet-400">COCO-SSD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Frame rate</span>
                  <span className="font-mono text-slate-300">~5 FPS</span>
                </div>
              </div>
            </div>

            {/* Box legend */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Bounding Box Legend</p>
              <div className="space-y-2">
                {[
                  { color: 'bg-green-500', label: 'Helmet detected' },
                  { color: 'bg-amber-500', label: 'Person detected' },
                  { color: 'bg-indigo-400', label: 'Other object' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-sm">
                    <span className={`w-3 h-3 rounded-sm flex-shrink-0 ${color}`} />
                    <span className="text-slate-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#0d1424] border-t border-slate-800 py-4 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1 text-xs text-slate-500">
          <span>Helmet Wearing &amp; Violation Detection System</span>
          <span>React.js · TensorFlow.js · COCO-SSD · WebRTC</span>
        </div>
      </footer>

    </div>
  );
}
