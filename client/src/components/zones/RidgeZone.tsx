import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/audio';
import { CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, TrendingUp, Sliders, Target, ShieldCheck } from 'lucide-react';
import { ZoneTelemetry } from '../../types';

interface RidgeZoneProps {
  telemetry: ZoneTelemetry;
  onComplete: (score: number, timeSpentSec: number) => void;
  onAdvance: () => void;
}

interface DataPoint {
  x: number; // e.g. Nautical Engine Throttle %
  y: number; // e.g. Vessel Speed in Knots
}

// 8 fixed expedition calibration data points
const DATA_POINTS: DataPoint[] = [
  { x: 10, y: 19 },
  { x: 20, y: 28 },
  { x: 30, y: 41 },
  { x: 40, y: 53 },
  { x: 50, y: 64 },
  { x: 60, y: 77 },
  { x: 70, y: 86 },
  { x: 80, y: 98 }
];

export const RidgeZone: React.FC<RidgeZoneProps> = ({ telemetry, onComplete, onAdvance }) => {
  // Model Parameters
  const [slope, setSlope] = useState<number>(0.55); // m
  const [intercept, setIntercept] = useState<number>(24); // b

  // Validation Check State
  const [checksRemaining, setChecksRemaining] = useState<number>(3);
  const [passed, setPassed] = useState<boolean>(telemetry.completed);
  const [attempts, setAttempts] = useState<number>(telemetry.attempts);
  const [lastCheckResult, setLastCheckResult] = useState<{
    success: boolean;
    mse: number;
    message: string;
  } | null>(null);

  // Time tracking
  const startTimeRef = useRef<number>(Date.now());
  const [elapsedSec, setElapsedSec] = useState<number>(telemetry.timeSpentSec || 0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live MSE
  const currentMSE = React.useMemo(() => {
    let sumSqErr = 0;
    DATA_POINTS.forEach((p) => {
      const yPred = slope * p.x + intercept;
      sumSqErr += Math.pow(p.y - yPred, 2);
    });
    return Math.round((sumSqErr / DATA_POINTS.length) * 10) / 10;
  }, [slope, intercept]);

  // Target MSE threshold for unlocking Zone 3
  const TARGET_MSE = 30.0;
  const OPTIMAL_MSE = 12.0;

  const handleVerifyFit = () => {
    if (passed) return;

    if (checksRemaining <= 0) {
      // Need reset
      sounds.playError();
      setLastCheckResult({
        success: false,
        mse: currentMSE,
        message: 'No validation checks remaining for this run. Reset parameters to try another attempt.'
      });
      return;
    }

    const newChecks = checksRemaining - 1;
    setChecksRemaining(newChecks);

    const isSuccessful = currentMSE <= TARGET_MSE;
    const timeSpent = Math.max(15, Math.round((Date.now() - startTimeRef.current) / 1000));

    if (isSuccessful) {
      sounds.playSuccess();
      setPassed(true);
      const currentAttempts = attempts + 1;
      setAttempts(currentAttempts);

      // Score: 100 if MSE <= 15, 90 if <= 22, 80 if <= 30
      const score = currentMSE <= OPTIMAL_MSE + 3 ? 100 : currentMSE <= 22 ? 90 : 80;
      setLastCheckResult({
        success: true,
        mse: currentMSE,
        message: `Convergence verified! MSE is ${currentMSE} (below target ${TARGET_MSE}). Model parameter gate unlocked (+${score} PTS).`
      });
      onComplete(score, timeSpent);
    } else {
      sounds.playError();
      const currentAttempts = attempts + (newChecks === 0 ? 1 : 0);
      if (newChecks === 0) setAttempts(currentAttempts);

      setLastCheckResult({
        success: false,
        mse: currentMSE,
        message: `MSE of ${currentMSE} exceeds threshold of ${TARGET_MSE}. Adjust slope and intercept to align with the residual vectors. (${newChecks} checks left)`
      });
    }
  };

  const handleResetRun = () => {
    sounds.playClick();
    setSlope(0.55);
    setIntercept(24);
    setChecksRemaining(3);
    setLastCheckResult(null);
  };

  // SVG coordinate transformation helpers
  // SVG plane: viewBox 0 0 440 260. X axis: 40 to 400. Y axis: 220 to 20.
  const toSvgX = (x: number) => 40 + (x / 90) * 360;
  const toSvgY = (y: number) => 220 - (y / 110) * 200;

  // Compute line start and end points for SVG
  const lineX1 = 0;
  const lineY1 = intercept;
  const lineX2 = 90;
  const lineY2 = slope * 90 + intercept;

  return (
    <div className="space-y-6">
      {/* Zone Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 glass-card rounded-xl border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">
              Zone 02 • The Ridge
            </div>
            <h2 className="font-cinzel text-lg font-bold text-white">
              Linear Regression & Loss Optimization (MSE)
            </h2>
          </div>
        </div>

        {/* Live Status HUD */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3 py-1.5 bg-slate-950/80 rounded-xl border border-slate-800 text-slate-300">
            Target MSE: <strong className="text-emerald-400">&lt; {TARGET_MSE}</strong>
          </div>
          <div className="px-3 py-1.5 bg-slate-950/80 rounded-xl border border-slate-800 text-slate-300">
            Checks Left: <strong className="text-cyan-300">{checksRemaining} / 3</strong>
          </div>
          <div className="px-3 py-1.5 bg-slate-950/80 rounded-xl border border-slate-800 text-slate-300">
            Time: <strong className="text-amber-300">{elapsedSec}s</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas & Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: SVG Scatter Plot & Residuals */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Residual Error Manifold</span>
            </span>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Line Equation:</span>
              <span className="text-cyan-300 font-bold">
                y = {slope.toFixed(2)}x + {intercept}
              </span>
            </div>
          </div>

          {/* SVG Plot */}
          <div className="relative w-full h-72 bg-slate-950/90 rounded-xl border border-slate-800/80 overflow-hidden radar-grid p-2">
            <svg className="w-full h-full" viewBox="0 0 440 260">
              {/* Axes */}
              <line x1="40" y1="220" x2="410" y2="220" stroke="#334155" strokeWidth="1.5" />
              <line x1="40" y1="20" x2="40" y2="220" stroke="#334155" strokeWidth="1.5" />

              {/* Grid Ticks */}
              {[20, 40, 60, 80].map((tick) => (
                <g key={tick}>
                  <line x1={toSvgX(tick)} y1="220" x2={toSvgX(tick)} y2="225" stroke="#475569" strokeWidth="1" />
                  <text x={toSvgX(tick)} y="238" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">
                    {tick}
                  </text>
                </g>
              ))}

              {[25, 50, 75, 100].map((tick) => (
                <g key={tick}>
                  <line x1="35" y1={toSvgY(tick)} x2="40" y2={toSvgY(tick)} stroke="#475569" strokeWidth="1" />
                  <text x="30" y={toSvgY(tick) + 3} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">
                    {tick}
                  </text>
                </g>
              ))}

              {/* Residual Lines (Dashed Vertical Error Lines) */}
              {DATA_POINTS.map((p, idx) => {
                const yPred = slope * p.x + intercept;
                const ptX = toSvgX(p.x);
                const ptY = toSvgY(p.y);
                const predY = toSvgY(yPred);
                const absErr = Math.abs(p.y - yPred);

                return (
                  <line
                    key={idx}
                    x1={ptX}
                    y1={ptY}
                    x2={ptX}
                    y2={predY}
                    stroke={absErr > 12 ? '#f43f5e' : absErr > 6 ? '#f59e0b' : '#10b981'}
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                    opacity="0.8"
                  />
                );
              })}

              {/* Regression Fitted Line */}
              <line
                x1={toSvgX(lineX1)}
                y1={toSvgY(lineY1)}
                x2={toSvgX(lineX2)}
                y2={toSvgY(lineY2)}
                stroke="#06b6d4"
                strokeWidth="2.5"
                filter="drop-shadow(0 0 6px rgba(6,182,212,0.6))"
              />

              {/* Data Points */}
              {DATA_POINTS.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={toSvgX(p.x)}
                    cy={toSvgY(p.y)}
                    r="5"
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                </g>
              ))}

              {/* Labels */}
              <text x="405" y="215" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">Throttle (%)</text>
              <text x="45" y="25" fill="#64748b" fontSize="9" fontFamily="monospace">Speed (knots)</text>
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
              Blue Dots: Observed Sensor Telemetry
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-rose-500 inline-block" />
              Dashed Lines: Residual Loss (y - ŷ)
            </span>
          </div>
        </div>

        {/* Right: Sliders & Live MSE Gauge */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Live MSE Meter */}
            <div className={`p-4 rounded-xl border transition-all ${
              currentMSE <= TARGET_MSE
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                : currentMSE <= 80
                ? 'bg-amber-950/30 border-amber-500/50'
                : 'bg-rose-950/30 border-rose-500/50'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Mean Squared Error (MSE)
                </span>
                <span className={`text-xs font-mono font-bold ${
                  currentMSE <= TARGET_MSE ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {currentMSE <= TARGET_MSE ? '✓ PASSING THRESHOLD' : 'UNSTABLE'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`font-mono text-3xl font-black ${
                  currentMSE <= TARGET_MSE ? 'text-emerald-300' : currentMSE <= 80 ? 'text-amber-300' : 'text-rose-400'
                }`}>
                  {currentMSE.toFixed(1)}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Target: &lt; {TARGET_MSE}
                </span>
              </div>

              {/* Progress bar toward optimal threshold */}
              <div className="w-full h-1.5 bg-slate-900 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    currentMSE <= TARGET_MSE ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.max(5, Math.min(100, (1 - (currentMSE - OPTIMAL_MSE) / 150) * 100))}%` }}
                />
              </div>
            </div>

            {/* Slider 1: Slope (m) */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Slope (m) — Weight / Rate:</span>
                <span className="text-cyan-300 font-bold">{slope.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.2"
                step="0.02"
                value={slope}
                disabled={passed}
                onChange={(e) => {
                  setSlope(parseFloat(e.target.value));
                  setLastCheckResult(null);
                }}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-900 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0.0 (Flat)</span>
                <span>1.1 (Optimal)</span>
                <span>2.2 (Steep)</span>
              </div>
            </div>

            {/* Slider 2: Intercept (b) */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Intercept (b) — Bias / Baseline:</span>
                <span className="text-cyan-300 font-bold">{intercept}</span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                step="1"
                value={intercept}
                disabled={passed}
                onChange={(e) => {
                  setIntercept(parseInt(e.target.value, 10));
                  setLastCheckResult(null);
                }}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-900 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0</span>
                <span>8 (Optimal)</span>
                <span>35</span>
              </div>
            </div>

            {/* Diagnostic Result Message */}
            {lastCheckResult && (
              <div className={`p-3 rounded-xl border text-xs font-mono leading-relaxed ${
                lastCheckResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
              }`}>
                {lastCheckResult.message}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {!passed ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetRun}
                  className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl transition-all"
                  title="Reset Parameters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleVerifyFit}
                  disabled={checksRemaining <= 0}
                  className={`flex-1 py-3.5 rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    checksRemaining <= 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>VERIFY FIT &amp; UNLOCK GATE ({checksRemaining} CHECKS LEFT)</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onAdvance}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl font-mono text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
              >
                <span>ADVANCE TO ZONE 3: THE SWAMP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
