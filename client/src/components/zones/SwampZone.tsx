import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/audio';
import { CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Activity, Eye, Sparkles, Target, Compass } from 'lucide-react';
import { ZoneTelemetry } from '../../types';

interface SwampZoneProps {
  telemetry: ZoneTelemetry;
  onComplete: (score: number, timeSpentSec: number) => void;
  onAdvance: () => void;
}

// Training points (quadratic curve with mild noise)
const TRAIN_POINTS = [
  { x: 10, y: 35 },
  { x: 22, y: 55 },
  { x: 35, y: 72 },
  { x: 48, y: 80 },
  { x: 60, y: 78 },
  { x: 72, y: 64 },
  { x: 85, y: 40 }
];

// Unseen Validation points (scattered along same true distribution)
const VAL_POINTS = [
  { x: 16, y: 44 },
  { x: 28, y: 66 },
  { x: 42, y: 79 },
  { x: 54, y: 81 },
  { x: 66, y: 73 },
  { x: 78, y: 52 }
];

type CurveLabel = 'underfit' | 'good_fit' | 'overfit';

interface CurveQuestion {
  id: string;
  name: string;
  desc: string;
  correct: CurveLabel;
  svgPathTrain: string;
  svgPathVal: string;
}

const LOSS_CURVES: CurveQuestion[] = [
  {
    id: 'c1',
    name: 'Curve Alpha',
    desc: 'Both training and validation loss stall at high plateau values (~0.68). Model capacity is too low to capture curvature.',
    correct: 'underfit',
    // High flat parallel curves
    svgPathTrain: 'M 20 60 Q 100 58 180 56',
    svgPathVal: 'M 20 50 Q 100 48 180 47'
  },
  {
    id: 'c2',
    name: 'Curve Beta',
    desc: 'Training loss drops to near zero (~0.02), but validation loss diverges and spikes upward after epoch 25.',
    correct: 'overfit',
    // Train goes to zero; val drops then spikes high
    svgPathTrain: 'M 20 30 Q 80 80 180 95',
    svgPathVal: 'M 20 40 Q 70 70 100 65 T 180 15'
  },
  {
    id: 'c3',
    name: 'Curve Gamma',
    desc: 'Training loss steadily decreases and validation loss tracks closely alongside it, stabilizing at low loss (~0.12).',
    correct: 'good_fit',
    // Harmonious convergence
    svgPathTrain: 'M 20 30 Q 90 75 180 85',
    svgPathVal: 'M 20 40 Q 95 68 180 80'
  }
];

export const SwampZone: React.FC<SwampZoneProps> = ({ telemetry, onComplete, onAdvance }) => {
  const [activeTab, setActiveTab] = useState<'teach' | 'test'>('teach');

  // Teach Sandbox State
  const [degree, setDegree] = useState<number>(3); // 1 = underfit, 3 = good, 12 = overfit
  const [showValData, setShowValData] = useState<boolean>(false);

  // Test Gate State
  const [answers, setAnswers] = useState<Record<string, CurveLabel | null>>({
    c1: null,
    c2: null,
    c3: null
  });
  const [evaluated, setEvaluated] = useState<boolean>(false);
  const [passed, setPassed] = useState<boolean>(telemetry.completed);
  const [attempts, setAttempts] = useState<number>(telemetry.attempts);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Time tracker
  const startTimeRef = useRef<number>(Date.now());
  const [elapsedSec, setElapsedSec] = useState<number>(telemetry.timeSpentSec || 0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute curve path based on complexity degree
  const getFittedCurvePath = (deg: number) => {
    if (deg === 1) {
      // Linear Underfit (straight horizontal-ish line)
      return 'M 30 180 L 370 120';
    } else if (deg <= 4) {
      // Degree 3: Smooth quadratic parabola (Optimal Fit)
      return 'M 30 200 Q 200 40 370 200';
    } else {
      // High degree polynomial (Degree 12-15): Wild oscillations through every point
      return 'M 30 220 C 50 20, 70 240, 100 130 C 130 30, 160 250, 200 60 C 240 250, 270 40, 310 170 C 340 240, 360 20, 380 230';
    }
  };

  // Error simulation for display
  const trainError = degree === 1 ? 38.5 : degree <= 4 ? 8.2 : 0.4;
  const valError = degree === 1 ? 42.1 : degree <= 4 ? 9.1 : 312.4;

  const handleSelectAnswer = (id: string, label: CurveLabel) => {
    if (passed) return;
    sounds.playClick();
    setAnswers((prev) => ({ ...prev, [id]: label }));
    setEvaluated(false);
  };

  const handleSubmitTest = () => {
    const allAnswered = Object.values(answers).every((val) => val !== null);
    if (!allAnswered) {
      setFeedback('Please diagnose all 3 loss curves before submitting.');
      sounds.playError();
      return;
    }

    const currentAttempts = attempts + 1;
    setAttempts(currentAttempts);

    const isAllCorrect = LOSS_CURVES.every((c) => answers[c.id] === c.correct);
    setEvaluated(true);

    const timeSpent = Math.max(15, Math.round((Date.now() - startTimeRef.current) / 1000));

    if (isAllCorrect) {
      sounds.playSuccess();
      setPassed(true);
      const score = currentAttempts === 1 ? 100 : currentAttempts === 2 ? 85 : 70;
      setFeedback(`Diagnostics confirmed! All 3 curves correctly categorized. Zone 3 cleared (+${score} PTS).`);
      onComplete(score, timeSpent);
    } else {
      sounds.playError();
      setFeedback('Diagnostic variance detected: Check the divergence between training and validation loss curves.');
    }
  };

  const handleResetTest = () => {
    sounds.playClick();
    setAnswers({ c1: null, c2: null, c3: null });
    setEvaluated(false);
    setFeedback(null);
  };

  return (
    <div className="space-y-6">
      {/* Zone Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 glass-card rounded-xl border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">
              Zone 03 • The Swamp
            </div>
            <h2 className="font-cinzel text-lg font-bold text-white">
              Overfitting vs. Underfitting (Generalization Gap)
            </h2>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => { setActiveTab('teach'); sounds.playClick(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'teach'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Complexity Sandbox</span>
          </button>
          <button
            onClick={() => { setActiveTab('test'); sounds.playClick(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'test'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>2. Gate Test</span>
            {passed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
          </button>
        </div>
      </div>

      {/* --- TAB 1: TEACH SANDBOX --- */}
      {activeTab === 'teach' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: SVG Polynomial Fitting Plane */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Model Fitting Curve vs Data Points
              </span>
              <button
                onClick={() => { setShowValData(!showValData); sounds.playRadar(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  showValData
                    ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showValData ? 'Hide Unseen Data' : 'Test on Unseen Data'}</span>
              </button>
            </div>

            {/* SVG Canvas */}
            <div className="relative w-full h-64 bg-slate-950/90 rounded-xl border border-slate-800/80 overflow-hidden radar-grid p-2">
              <svg className="w-full h-full" viewBox="0 0 400 240">
                {/* Axes */}
                <line x1="25" y1="215" x2="385" y2="215" stroke="#334155" strokeWidth="1.5" />
                <line x1="25" y1="20" x2="25" y2="215" stroke="#334155" strokeWidth="1.5" />

                {/* Fitted Model Curve */}
                <path
                  d={getFittedCurvePath(degree)}
                  fill="none"
                  stroke={degree === 1 ? '#f59e0b' : degree <= 4 ? '#06b6d4' : '#f43f5e'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  filter={degree > 4 ? 'drop-shadow(0 0 8px rgba(244,63,94,0.6))' : 'drop-shadow(0 0 6px rgba(6,182,212,0.5))'}
                />

                {/* Training Points (Cyan Circles) */}
                {TRAIN_POINTS.map((p, idx) => {
                  const cx = 25 + (p.x / 100) * 350;
                  const cy = 215 - (p.y / 100) * 190;
                  return (
                    <circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r="5"
                      fill="#06b6d4"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Unseen Validation Points (Amber Diamonds) */}
                {showValData &&
                  VAL_POINTS.map((p, idx) => {
                    const cx = 25 + (p.x / 100) * 350;
                    const cy = 215 - (p.y / 100) * 190;
                    return (
                      <polygon
                        key={idx}
                        points={`${cx},${cy - 6} ${cx + 6},${cy} ${cx},${cy + 6} ${cx - 6},${cy}`}
                        fill="#f59e0b"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    );
                  })}
              </svg>
            </div>

            {/* Error Telemetry comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl font-mono text-xs">
                <div className="text-slate-400">Training Loss (Seen Data)</div>
                <div className={`text-lg font-bold mt-1 ${
                  trainError < 1 ? 'text-rose-400' : trainError < 15 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  MSE: {trainError.toFixed(1)}
                </div>
              </div>

              <div className={`p-3 rounded-xl border font-mono text-xs transition-all ${
                showValData
                  ? valError > 100
                    ? 'bg-rose-950/40 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                    : 'bg-emerald-950/30 border-emerald-500/50'
                  : 'bg-slate-900/80 border-slate-800 opacity-60'
              }`}>
                <div className="text-slate-400">Validation Loss (Unseen Data)</div>
                <div className={`text-lg font-bold mt-1 ${
                  !showValData ? 'text-slate-500' : valError > 100 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {showValData ? `MSE: ${valError.toFixed(1)}` : 'Hidden (Click Toggle)'}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Complexity Slider & Pedagogical Insight */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-300">Model Complexity:</span>
                  <span className={`font-bold uppercase ${
                    degree === 1 ? 'text-amber-400' : degree <= 4 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {degree === 1 ? 'Degree 1 (Underfitting)' : degree <= 4 ? 'Degree 3 (Optimal Fit)' : 'Degree 15 (Severe Overfitting)'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => { setDegree(1); sounds.playClick(); }}
                    className={`py-2 px-3 rounded-xl font-mono text-xs border transition-all ${
                      degree === 1
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    1. Underfit
                  </button>
                  <button
                    onClick={() => { setDegree(3); sounds.playClick(); }}
                    className={`py-2 px-3 rounded-xl font-mono text-xs border transition-all ${
                      degree === 3
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    2. Optimal Fit
                  </button>
                  <button
                    onClick={() => { setDegree(15); sounds.playClick(); }}
                    className={`py-2 px-3 rounded-xl font-mono text-xs border transition-all ${
                      degree === 15
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300 ring-2 ring-rose-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    3. Overfit
                  </button>
                </div>
              </div>

              {/* Dynamic Explanation Card */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs leading-relaxed space-y-2 text-slate-300">
                {degree === 1 && (
                  <>
                    <h4 className="font-bold text-amber-300">High Bias (Underfitting)</h4>
                    <p>
                      The model is too simplistic (inflexible linear hypothesis). It fails to learn the underlying trend in both the training data and unseen test data.
                    </p>
                  </>
                )}
                {degree === 3 && (
                  <>
                    <h4 className="font-bold text-emerald-300">Balanced Tradeoff (Good Fit)</h4>
                    <p>
                      The model captures the general true curve while ignoring individual random noise. Both training loss and validation loss remain balanced and low.
                    </p>
                  </>
                )}
                {degree === 15 && (
                  <>
                    <h4 className="font-bold text-rose-300">High Variance (Overfitting)</h4>
                    <p>
                      The model has excessive capacity and memorizes random training noise. While training loss drops to nearly zero, it fails completely on new, unseen validation data!
                    </p>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => { setActiveTab('test'); sounds.playSelect(); }}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl font-mono text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
            >
              <span>PROCEED TO LOSS CURVE DIAGNOSTIC GATE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 2: GATE TEST --- */}
      {activeTab === 'test' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-cinzel text-xl font-bold text-white">
                The Swamp Gate Trial: Loss Curve Diagnostic
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Inspect the Training vs. Validation Loss dynamics on each card and assign the correct diagnosis.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">Attempts: <strong className="text-white">{attempts}</strong></span>
              <span className="text-slate-400">Elapsed: <strong className="text-cyan-300">{elapsedSec}s</strong></span>
            </div>
          </div>

          {/* 3 Loss Curve Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LOSS_CURVES.map((curve) => {
              const selected = answers[curve.id];
              const isCorrect = evaluated && selected === curve.correct;
              const isWrong = evaluated && selected !== curve.correct;

              return (
                <div
                  key={curve.id}
                  className={`p-4 rounded-xl border transition-all glass-card space-y-3 ${
                    isCorrect
                      ? 'border-emerald-500/60 bg-emerald-950/20'
                      : isWrong
                      ? 'border-rose-500/60 bg-rose-950/20'
                      : selected
                      ? 'border-cyan-500/40 bg-slate-900/60'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-sm font-cinzel">
                      {curve.name}
                    </span>
                    {evaluated && (
                      isCorrect ? (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" /> Misidentified
                        </span>
                      )
                    )}
                  </div>

                  {/* SVG Thumbnail Plot */}
                  <div className="w-full h-28 bg-slate-950/80 rounded-lg border border-slate-800/80 p-1 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 200 110">
                      <line x1="15" y1="95" x2="190" y2="95" stroke="#334155" strokeWidth="1" />
                      <line x1="15" y1="10" x2="15" y2="95" stroke="#334155" strokeWidth="1" />

                      {/* Training Loss Curve (Cyan) */}
                      <path d={curve.svgPathTrain} fill="none" stroke="#06b6d4" strokeWidth="2" />
                      {/* Validation Loss Curve (Amber) */}
                      <path d={curve.svgPathVal} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,3" />

                      <text x="185" y="105" fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="end">Epochs</text>
                      <text x="20" y="12" fill="#64748b" fontSize="7" fontFamily="monospace">Loss</text>
                    </svg>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-0.5 bg-cyan-400 inline-block" /> Training Loss
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-0.5 bg-amber-400 inline-block" /> Validation Loss
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs leading-snug">
                    {curve.desc}
                  </p>

                  {/* Diagnosis Options */}
                  <div className="space-y-1.5 pt-1">
                    {[
                      { label: 'Underfitting (High Bias)', value: 'underfit' },
                      { label: 'Good Fit (Balanced)', value: 'good_fit' },
                      { label: 'Overfitting (High Variance)', value: 'overfit' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleSelectAnswer(curve.id, opt.value as CurveLabel)}
                        disabled={passed}
                        className={`w-full py-1.5 px-2.5 rounded-lg font-mono text-[11px] text-left border transition-all ${
                          selected === opt.value
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-500/40'
                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="text-xs font-mono text-slate-300">
              {feedback ? (
                <span className={passed ? 'text-emerald-400' : 'text-amber-400'}>
                  {feedback}
                </span>
              ) : (
                <span className="text-slate-500">
                  Select diagnosis for each curve, then submit.
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!passed ? (
                <>
                  <button
                    onClick={handleResetTest}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 transition-colors"
                    title="Clear Selections"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSubmitTest}
                    className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl font-mono text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    VERIFY DIAGNOSIS
                  </button>
                </>
              ) : (
                <button
                  onClick={onAdvance}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl font-mono text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
                >
                  <span>ADVANCE TO ZONE 4: THE LIGHTHOUSE (BOSS TRIAL)</span>
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
