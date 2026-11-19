import React, { useState, useRef, useMemo } from 'react';
import { sounds } from '../../utils/audio';
import { CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Eye, Sliders, RotateCcw, Layers, Image as ImageIcon } from 'lucide-react';
import { ZoneTelemetry } from '../../types';

interface PixelHarborZoneProps {
  telemetry: ZoneTelemetry;
  onComplete: (score: number, timeSpentSec: number) => void;
  onAdvance: () => void;
}

export const PixelHarborZone: React.FC<PixelHarborZoneProps> = ({
  telemetry,
  onComplete,
  onAdvance
}) => {
  const [activeTab, setActiveTab] = useState<'teach' | 'test'>('teach');

  // Teach Sandbox State
  const [channels, setChannels] = useState<{ r: boolean; g: boolean; b: boolean }>({
    r: true,
    g: true,
    b: true
  });
  const [brightness, setBrightness] = useState<number>(0); // -50 to +50
  const [noise, setNoise] = useState<number>(0); // 0 to 50%
  const [flipped, setFlipped] = useState<boolean>(false);
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number; y: number; r: number; g: number; b: number }>({
    x: 120,
    y: 80,
    r: 56,
    g: 189,
    b: 248
  });

  // Test Gate State
  const [testAnswers, setTestAnswers] = useState<{
    q1: string | null;
    q2: string | null;
    q3: string | null;
  }>({ q1: null, q2: null, q3: null });
  const [testSubmitted, setTestSubmitted] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const [attempts, setAttempts] = useState<number>(telemetry.attempts || 0);

  // Calculate live modified RGB based on channels and brightness
  const activeColor = useMemo(() => {
    let r = channels.r ? hoveredPixel.r : 0;
    let g = channels.g ? hoveredPixel.g : 0;
    let b = channels.b ? hoveredPixel.b : 0;

    r = Math.min(255, Math.max(0, r + brightness));
    g = Math.min(255, Math.max(0, g + brightness));
    b = Math.min(255, Math.max(0, b + brightness));

    return {
      r,
      g,
      b,
      normR: (r / 255).toFixed(3),
      normG: (g / 255).toFixed(3),
      normB: (b / 255).toFixed(3)
    };
  }, [channels, brightness, hoveredPixel]);

  // Handle canvas hover to read pixel coordinates
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 400);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 240);

    // Approximate synthetic color map for harbor scene
    let r = 56, g = 189, b = 248; // sky
    if (y > 150) {
      r = 15; g = 30; b = 60; // deep ocean
    } else if (x > 220 && x < 300 && y > 80 && y < 170) {
      r = 245; g = 158; b = 11; // golden lighthouse
    } else if (y > 110 && y <= 150) {
      r = 30; g = 70; b = 110; // reef / horizon
    }

    setHoveredPixel({ x, y, r, g, b });
  };

  // Test Evaluation
  const testResults = useMemo(() => {
    const q1Pass = testAnswers.q1 === 'opt_night';
    const q2Pass = testAnswers.q2 === 'opt_orientation';
    const q3Pass = testAnswers.q3 === 'opt_crop';
    const passedCount = [q1Pass, q2Pass, q3Pass].filter(Boolean).length;
    return { q1Pass, q2Pass, q3Pass, passedCount, allPassed: passedCount === 3 };
  }, [testAnswers]);

  const handleValidateTest = () => {
    const elapsedSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    setAttempts((prev) => prev + 1);
    setTestSubmitted(true);

    if (testResults.allPassed) {
      sounds.playSuccess();
      const score = Math.max(75, 100 - (attempts * 8));
      onComplete(score, elapsedSec);
    } else {
      sounds.playError();
    }
  };

  const handleResetFilters = () => {
    sounds.playClick();
    setChannels({ r: true, g: true, b: true });
    setBrightness(0);
    setNoise(0);
    setFlipped(false);
  };

  return (
    <div className="space-y-6">
      {/* Zone Header */}
      <div className="glass-panel p-6 rounded-2xl border-amber-500/30 glow-amber space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900/30 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                Zone 01 • Image Tensor Foundations
              </span>
              {telemetry.completed && (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED GATE CLEARED
                </span>
              )}
            </div>
            <h2 className="font-cinzel text-2xl font-bold text-white mt-1 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-amber-400" />
              <span>Pixel Harbor: Image Tensors, RGB Channels &amp; Augmentations</span>
            </h2>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => { sounds.playClick(); setActiveTab('teach'); }}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'teach'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>1. Teach Sandbox</span>
            </button>
            <button
              onClick={() => { sounds.playClick(); setActiveTab('test'); }}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'test'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>2. Gate Challenge</span>
              {telemetry.completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
            </button>
          </div>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
          Digital images are represented as 3D numerical tensors $[C, H, W]$ where $C=3$ encodes Red, Green, and Blue color intensities. Before feeding images into neural networks, <strong>Data Augmentation</strong> injects synthetic variations (brightness jitter, noise, flips) to prevent overfitting and teach networks invariance to real-world environmental shifts.
        </p>
      </div>

      {/* TAB 1: TEACH SANDBOX */}
      {activeTab === 'teach' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Tensor &amp; Channel Modulators</span>
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
                title="Reset to raw tensor"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* RGB Channel Isolator */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                1. RGB Channel Activation
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'r', label: 'Red (Channel 0)', color: 'text-rose-400 border-rose-500/50 bg-rose-950/40' },
                  { key: 'g', label: 'Green (Channel 1)', color: 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40' },
                  { key: 'b', label: 'Blue (Channel 2)', color: 'text-sky-400 border-sky-500/50 bg-sky-950/40' }
                ].map((ch) => {
                  const active = channels[ch.key as 'r' | 'g' | 'b'];
                  return (
                    <button
                      key={ch.key}
                      onClick={() => {
                        sounds.playClick();
                        setChannels((prev) => ({ ...prev, [ch.key]: !prev[ch.key as 'r' | 'g' | 'b'] }));
                      }}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        active
                          ? ch.color + ' font-bold shadow-md'
                          : 'bg-slate-950/50 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="text-[10px] font-mono">{ch.key.toUpperCase()}</div>
                      <div className="text-xs font-mono">{active ? 'ENABLED' : 'MUTED'}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brightness Jitter */}
            <div className="space-y-2 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Brightness Jitter:</span>
                <span className="font-bold text-amber-300">{brightness > 0 ? `+${brightness}` : brightness}</span>
              </div>
              <input
                type="range"
                min="-60"
                max="60"
                step="5"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-60 (Night simulation)</span>
                <span>0</span>
                <span>+60 (Glare simulation)</span>
              </div>
            </div>

            {/* Gaussian Noise Injection */}
            <div className="space-y-2 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Gaussian Sensor Noise:</span>
                <span className="font-bold text-amber-300">{noise}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={noise}
                onChange={(e) => setNoise(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0% (Clean sensor)</span>
                <span>20%</span>
                <span>40% (Severe static)</span>
              </div>
            </div>

            {/* Horizontal Flip Augmentation */}
            <div className="pt-1">
              <button
                onClick={() => {
                  sounds.playClick();
                  setFlipped((prev) => !prev);
                }}
                className={`w-full py-3 rounded-xl border text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 ${
                  flipped
                    ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-600/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>Horizontal Inversion / Mirror Flip: {flipped ? 'ACTIVE' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Visual Canvas & Tensor Inspector */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border-slate-800 space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-cinzel text-base font-bold text-white">
                  Live Viewport &amp; Pixel Tensor Inspector
                </h3>
                <span className="text-xs font-mono text-amber-400">
                  Hover to inspect [R, G, B] values
                </span>
              </div>

              {/* Synthetic Visual Harbor Canvas */}
              <div
                onMouseMove={handleMouseMove}
                className="w-full h-64 bg-slate-950 rounded-2xl border border-slate-800 mt-4 relative overflow-hidden cursor-crosshair select-none"
              >
                <svg
                  viewBox="0 0 400 240"
                  className={`w-full h-full transition-transform duration-300 ${flipped ? '-scale-x-100' : ''}`}
                >
                  <defs>
                    {/* Channel Filtering Matrix */}
                    <filter id="channelFilter">
                      <feColorMatrix
                        type="matrix"
                        values={`
                          ${channels.r ? 1 : 0} 0 0 0 ${(brightness) / 255}
                          0 ${channels.g ? 1 : 0} 0 0 ${(brightness) / 255}
                          0 0 ${channels.b ? 1 : 0} 0 ${(brightness) / 255}
                          0 0 0 1 0
                        `}
                      />
                    </filter>
                  </defs>

                  <g filter="url(#channelFilter)">
                    {/* Sky */}
                    <rect x="0" y="0" width="400" height="150" fill="#38bdf8" />
                    {/* Sun/Moon */}
                    <circle cx="80" cy="50" r="24" fill="#fef08a" />
                    {/* Ocean */}
                    <rect x="0" y="150" width="400" height="90" fill="#0f172a" />
                    {/* Reef Rocks */}
                    <polygon points="20,180 80,140 140,180" fill="#334155" />
                    {/* Lighthouse */}
                    <polygon points="240,60 260,60 270,160 230,160" fill="#f59e0b" />
                    <rect x="238" y="45" width="24" height="15" fill="#fef08a" />
                    <polygon points="234,45 250,30 266,45" fill="#ef4444" />
                    {/* Beacon Light Beam */}
                    <polygon points="250,52 380,20 400,90" fill="#fef08a" fillOpacity="0.4" />
                  </g>

                  {/* Noise Overlay */}
                  {noise > 0 && (
                    <rect
                      x="0"
                      y="0"
                      width="400"
                      height="240"
                      fill="#ffffff"
                      fillOpacity={noise / 150}
                      className="pointer-events-none"
                    />
                  )}
                </svg>

                {/* Crosshair Cursor Marker */}
                <div
                  className="absolute pointer-events-none w-4 h-4 border border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  style={{
                    left: `${(hoveredPixel.x / 400) * 100}%`,
                    top: `${(hoveredPixel.y / 240) * 100}%`
                  }}
                />
              </div>

              {/* Live Tensor Values HUD */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400">Coordinates [X, Y]</div>
                  <div className="font-mono text-sm font-bold text-white">[{hoveredPixel.x}, {hoveredPixel.y}]</div>
                </div>

                <div className="p-3 bg-rose-950/30 rounded-xl border border-rose-500/30 space-y-1">
                  <div className="text-[10px] font-mono text-rose-300">Red Tensor Channel</div>
                  <div className="font-mono text-sm font-bold text-rose-200">
                    {activeColor.r} <span className="text-[10px] opacity-75 font-normal">({activeColor.normR})</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/30 space-y-1">
                  <div className="text-[10px] font-mono text-emerald-300">Green Tensor Channel</div>
                  <div className="font-mono text-sm font-bold text-emerald-200">
                    {activeColor.g} <span className="text-[10px] opacity-75 font-normal">({activeColor.normG})</span>
                  </div>
                </div>

                <div className="p-3 bg-sky-950/30 rounded-xl border border-sky-500/30 space-y-1">
                  <div className="text-[10px] font-mono text-sky-300">Blue Tensor Channel</div>
                  <div className="font-mono text-sm font-bold text-sky-200">
                    {activeColor.b} <span className="text-[10px] opacity-75 font-normal">({activeColor.normB})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Advance to Test Callout */}
            <div className="pt-2">
              <button
                onClick={() => { sounds.playClick(); setActiveTab('test'); }}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30"
              >
                <span>Proceed to Zone 1 Gate Challenge</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEST GATE (DATA AUGMENTATION STRATEGY) */}
      {activeTab === 'test' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border-amber-500/30 glow-amber space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-900/30 pb-4">
            <div>
              <div className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                Unlock Gate Challenge
              </div>
              <h3 className="font-cinzel text-xl font-bold text-white mt-0.5">
                Data Augmentation &amp; Tensor Domain Strategy
              </h3>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Verification Metric</div>
              <div className="font-mono text-sm font-bold text-amber-300">
                {testResults.passedCount} / 3 Augmentation Scenarios Solved
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Scenario 1 */}
            <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-xs font-mono text-amber-400 uppercase">Scenario 1 • Low-Light Nighttime Operations</div>
              <p className="text-sm text-slate-200">
                An aerial surveillance drone model trained exclusively on clear, daytime harbor photos fails completely when deployed during nighttime voyages or heavy fog. What training augmentation pipeline prevents this domain failure?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { id: 'opt_night', title: 'Brightness Jitter + Gaussian Noise', desc: 'Random brightness attenuation (-60% to -20%) and sensor noise injection during training to simulate low-light CMOS sensors.' },
                  { id: 'opt_flip_only', title: 'Horizontal Flips Only', desc: 'Mirroring daytime sunny images along the horizontal axis.' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { sounds.playClick(); setTestAnswers((prev) => ({ ...prev, q1: opt.id })); }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      testAnswers.q1 === opt.id
                        ? 'bg-amber-600/30 border-amber-500 text-amber-200 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold">{opt.title}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Scenario 2 */}
            <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-xs font-mono text-amber-400 uppercase">Scenario 2 • Directional Maritime Signage</div>
              <p className="text-sm text-slate-200">
                You are training an OCR vision system to read nautical compass direction arrows (e.g., "WEST", "EAST") and buoy numerical markers. Why is random <strong>Horizontal Flip</strong> catastrophic for this task?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { id: 'opt_orientation', title: 'Semantic Inversion Hazard', desc: 'Flipping alters the ground-truth semantic orientation: rightward "EAST" arrows flip into leftward "WEST" arrows, introducing corrupted label noise.' },
                  { id: 'opt_memory', title: 'GPU Memory Inefficiency', desc: 'Horizontal flips require doubling GPU VRAM during backward pass.' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { sounds.playClick(); setTestAnswers((prev) => ({ ...prev, q2: opt.id })); }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      testAnswers.q2 === opt.id
                        ? 'bg-amber-600/30 border-amber-500 text-amber-200 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold">{opt.title}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Scenario 3 */}
            <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-xs font-mono text-amber-400 uppercase">Scenario 3 • Scale & Altitude Invariance</div>
              <p className="text-sm text-slate-200">
                Vessels in satellite reconnaissance appear at widely differing zoom levels depending on orbital altitude. What augmentation technique forces the convolutional backbone to detect targets across different scales?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { id: 'opt_crop', title: 'Random Resized Crop & Multi-Scale Jitter', desc: 'Cropping random bounding subregions and resizing them to uniform input resolution forces the model to recognize objects at small, medium, and large scales.' },
                  { id: 'opt_color', title: 'Hue Shifting Only', desc: 'Varying the hue angle across the color wheel.' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { sounds.playClick(); setTestAnswers((prev) => ({ ...prev, q3: opt.id })); }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      testAnswers.q3 === opt.id
                        ? 'bg-amber-600/30 border-amber-500 text-amber-200 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold">{opt.title}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Validation & Advance */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="text-xs font-mono text-slate-400">
              Attempts: <span className="text-white font-bold">{attempts}</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!testResults.allPassed ? (
                <button
                  onClick={handleValidateTest}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2"
                >
                  <span>Verify Augmentation Strategy</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleValidateTest();
                    onAdvance();
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 animate-pulse"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Gate Cleared! Unlock Zone 2: Segmentation Reef</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
