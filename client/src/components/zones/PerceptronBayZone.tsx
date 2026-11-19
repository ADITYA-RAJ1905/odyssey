import React, { useState, useEffect, useRef, useMemo } from 'react';
import { sounds } from '../../utils/audio';
import { CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Sparkles, Cpu, Activity, Zap } from 'lucide-react';
import { ZoneTelemetry } from '../../types';

interface PerceptronBayZoneProps {
  telemetry: ZoneTelemetry;
  onComplete: (score: number, timeSpentSec: number) => void;
  onAdvance: () => void;
}

type ActivationFn = 'step' | 'sigmoid' | 'relu';

export const PerceptronBayZone: React.FC<PerceptronBayZoneProps> = ({
  telemetry,
  onComplete,
  onAdvance
}) => {
  const [activeTab, setActiveTab] = useState<'teach' | 'test'>('teach');

  // Teach Sandbox State
  const [inputs, setInputs] = useState<[number, number, number]>([1, 0, 1]);
  const [weights, setWeights] = useState<[number, number, number]>([1.2, -0.8, 1.5]);
  const [bias, setBias] = useState<number>(-0.5);
  const [activation, setActivation] = useState<ActivationFn>('sigmoid');

  // Test Gate State (Majority Gate Challenge)
  const [testWeights, setTestWeights] = useState<[number, number, number]>([0.0, 0.0, 0.0]);
  const [testBias, setTestBias] = useState<number>(0.0);
  const [testActivation, setTestActivation] = useState<ActivationFn>('step');
  const [testSubmitted, setTestSubmitted] = useState<boolean>(false);

  // Telemetry timer
  const startTimeRef = useRef<number>(Date.now());
  const [attempts, setAttempts] = useState<number>(telemetry.attempts || 0);

  // Compute weighted sum z and activation a for Teach Sandbox
  const teachZ = useMemo(() => {
    return inputs[0] * weights[0] + inputs[1] * weights[1] + inputs[2] * weights[2] + bias;
  }, [inputs, weights, bias]);

  const computeActivation = (z: number, fn: ActivationFn): number => {
    switch (fn) {
      case 'step':
        return z >= 0 ? 1 : 0;
      case 'sigmoid':
        return 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, z))));
      case 'relu':
        return Math.max(0, z);
    }
  };

  const teachOutput = useMemo(() => {
    return computeActivation(teachZ, activation);
  }, [teachZ, activation]);

  // Test Combinations for 2-of-3 Majority Gate
  const testTruthTable = useMemo(() => {
    const rows = [
      { x1: 0, x2: 0, x3: 0, expected: 0 },
      { x1: 1, x2: 0, x3: 0, expected: 0 },
      { x1: 0, x2: 1, x3: 0, expected: 0 },
      { x1: 0, x2: 0, x3: 1, expected: 0 },
      { x1: 1, x2: 1, x3: 0, expected: 1 },
      { x1: 1, x2: 0, x3: 1, expected: 1 },
      { x1: 0, x2: 1, x3: 1, expected: 1 },
      { x1: 1, x2: 1, x3: 1, expected: 1 },
    ];

    return rows.map((row) => {
      const z = row.x1 * testWeights[0] + row.x2 * testWeights[1] + row.x3 * testWeights[2] + testBias;
      const rawA = computeActivation(z, testActivation);
      const actual = rawA >= 0.5 ? 1 : 0;
      const pass = actual === row.expected;
      return { ...row, z, actual, pass };
    });
  }, [testWeights, testBias, testActivation]);

  const allPassed = testTruthTable.every((r) => r.pass);

  const handleValidateTest = () => {
    const elapsedSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    setAttempts((prev) => prev + 1);
    setTestSubmitted(true);

    if (allPassed) {
      sounds.playSuccess();
      const score = Math.max(70, 100 - (attempts * 10));
      onComplete(score, elapsedSec);
    } else {
      sounds.playError();
    }
  };

  const handleResetWeights = () => {
    sounds.playClick();
    setWeights([1.0, 1.0, 1.0]);
    setBias(-1.5);
    setActivation('step');
  };

  return (
    <div className="space-y-6">
      {/* Zone Header */}
      <div className="glass-panel p-6 rounded-2xl border-purple-500/30 glow-purple space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/30 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
                Zone 01 • Deep Learning Foundations
              </span>
              {telemetry.completed && (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED GATE CLEARED
                </span>
              )}
            </div>
            <h2 className="font-cinzel text-2xl font-bold text-white mt-1 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-purple-400" />
              <span>Perceptron Bay: Neurons, Weights &amp; Activations</span>
            </h2>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => { sounds.playClick(); setActiveTab('teach'); }}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'teach'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>1. Teach Sandbox</span>
            </button>
            <button
              onClick={() => { sounds.playClick(); setActiveTab('test'); }}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'test'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>2. Gate Challenge</span>
              {telemetry.completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
            </button>
          </div>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
          The fundamental building block of all deep learning architectures is the <strong>Artificial Neuron (Perceptron)</strong>.
          Signals flow into weighted synapses, are summed with a bias parameter (z = w · x + b), and undergo a non-linear activation transformation (a = f(z)) to enable complex decision boundaries.
        </p>
      </div>

      {/* TAB 1: TEACH SANDBOX */}
      {activeTab === 'teach' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Neuron Parameters</span>
              </h3>
              <button
                onClick={handleResetWeights}
                className="text-[11px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"
                title="Reset to sample values"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Input Vector Toggles */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                1. Input Signals ($x_1, x_2, x_3$)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      sounds.playClick();
                      const next = [...inputs] as [number, number, number];
                      next[idx] = next[idx] === 1 ? 0 : 1;
                      setInputs(next);
                    }}
                    className={`py-3 rounded-xl border text-center transition-all ${
                      inputs[idx] === 1
                        ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-slate-400">x_{idx + 1}</div>
                    <div className="font-mono text-lg font-bold">{inputs[idx]}</div>
                    <div className="text-[9px] font-mono text-slate-400">{inputs[idx] === 1 ? 'ACTIVE' : 'OFF'}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Draggable Weight Sliders */}
            <div className="space-y-4">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                2. Synaptic Weights ($w_1, w_2, w_3$)
              </label>
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Weight w_{idx + 1} (Synapse {idx + 1}):</span>
                    <span className="font-bold text-purple-300">{weights[idx].toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="-3.0"
                    max="3.0"
                    step="0.1"
                    value={weights[idx]}
                    onChange={(e) => {
                      const next = [...weights] as [number, number, number];
                      next[idx] = parseFloat(e.target.value);
                      setWeights(next);
                    }}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>-3.0 (Inhibitory)</span>
                    <span>0.0</span>
                    <span>+3.0 (Excitatory)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bias Slider */}
            <div className="space-y-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Neuron Bias ($b$):</span>
                <span className="font-bold text-amber-300">{bias.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-5.0"
                max="5.0"
                step="0.1"
                value={bias}
                onChange={(e) => setBias(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-5.0 (High Threshold)</span>
                <span>0.0</span>
                <span>+5.0 (Low Threshold)</span>
              </div>
            </div>

            {/* Activation Function Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                3. Activation Function ($f(z)$)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['step', 'sigmoid', 'relu'] as ActivationFn[]).map((fn) => (
                  <button
                    key={fn}
                    onClick={() => { sounds.playClick(); setActivation(fn); }}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold capitalize transition-all ${
                      activation === fn
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {fn === 'relu' ? 'ReLU' : fn}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive SVG Visualization Column */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border-slate-800 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-cinzel text-base font-bold text-white">
                  Live Neural Synapse &amp; Activation Graph
                </h3>
                <span className="text-xs font-mono text-purple-400">
                  z = {teachZ.toFixed(2)}
                </span>
              </div>

              {/* Neural Network SVG Diagram */}
              <div className="w-full h-56 bg-slate-950/80 rounded-2xl border border-slate-800 mt-4 relative overflow-hidden flex items-center justify-center p-2">
                <svg viewBox="0 0 500 200" className="w-full h-full">
                  <defs>
                    <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  {/* Input Synapses (Lines) */}
                  {[
                    { y: 40, xVal: inputs[0], wVal: weights[0] },
                    { y: 100, xVal: inputs[1], wVal: weights[1] },
                    { y: 160, xVal: inputs[2], wVal: weights[2] },
                  ].map((item, idx) => (
                    <g key={idx}>
                      <line
                        x1="80"
                        y1={item.y}
                        x2="240"
                        y2="100"
                        stroke={item.xVal === 1 ? '#a855f7' : '#334155'}
                        strokeWidth={Math.max(1.5, Math.min(6, Math.abs(item.wVal) * 2))}
                        strokeDasharray={item.wVal < 0 ? '4 3' : 'none'}
                        className="transition-all duration-300"
                      />
                      <text
                        x="150"
                        y={item.y < 100 ? item.y + 18 : item.y > 100 ? item.y - 12 : item.y - 8}
                        fill="#cbd5e1"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        w_{idx + 1}={item.wVal.toFixed(1)}
                      </text>
                    </g>
                  ))}

                  {/* Input Nodes (Circles) */}
                  {[
                    { y: 40, label: 'x₁', val: inputs[0] },
                    { y: 100, label: 'x₂', val: inputs[1] },
                    { y: 160, label: 'x₃', val: inputs[2] },
                  ].map((node, idx) => (
                    <g key={idx}>
                      <circle
                        cx="60"
                        cy={node.y}
                        r="20"
                        fill={node.val === 1 ? '#7e22ce' : '#0f172a'}
                        stroke={node.val === 1 ? '#c084fc' : '#475569'}
                        strokeWidth="2"
                        className="transition-colors duration-300"
                      />
                      <text x="60" y={node.y + 4} textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="bold">
                        {node.val}
                      </text>
                      <text x="25" y={node.y + 4} fill="#94a3b8" fontSize="10" fontFamily="monospace">
                        {node.label}
                      </text>
                    </g>
                  ))}

                  {/* Bias Input */}
                  <line x1="240" y1="30" x2="240" y2="70" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
                  <text x="240" y="24" textAnchor="middle" fill="#f59e0b" fontSize="10" fontFamily="monospace">
                    bias: {bias.toFixed(1)}
                  </text>

                  {/* Summation Node (Soma) */}
                  <circle cx="260" cy="100" r="32" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2.5" />
                  <text x="260" y="96" textAnchor="middle" fill="#c7d2fe" fontSize="14" fontWeight="bold">
                    Σ
                  </text>
                  <text x="260" y="114" textAnchor="middle" fill="#a5b4fc" fontSize="9" fontFamily="monospace">
                    z={teachZ.toFixed(2)}
                  </text>

                  {/* Activation Arrow */}
                  <line x1="292" y1="100" x2="350" y2="100" stroke="#818cf8" strokeWidth="3" markerEnd="url(#arrow)" />

                  {/* Activation Function Block */}
                  <rect x="350" y="70" width="55" height="60" rx="10" fill="#090d16" stroke="#a855f7" strokeWidth="2" />
                  <text x="377" y="96" textAnchor="middle" fill="#e9d5ff" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    f(z)
                  </text>
                  <text x="377" y="112" textAnchor="middle" fill="#c084fc" fontSize="9" fontFamily="monospace uppercase">
                    {activation}
                  </text>

                  {/* Output Synapse & Node */}
                  <line x1="405" y1="100" x2="445" y2="100" stroke="#a855f7" strokeWidth="3" />
                  <circle
                    cx="460"
                    cy="100"
                    r="22"
                    fill={teachOutput > 0.5 ? '#166534' : '#1e1b4b'}
                    stroke={teachOutput > 0.5 ? '#4ade80' : '#818cf8'}
                    strokeWidth="2.5"
                    className="transition-colors duration-300"
                  />
                  <text x="460" y="104" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="monospace">
                    {teachOutput.toFixed(2)}
                  </text>
                  <text x="460" y="136" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                    output a
                  </text>
                </svg>
              </div>

              {/* Activation Function Curve Display */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">Activation Function Characteristic:</span>
                  <span className="text-purple-300 font-bold uppercase">{activation} Curve</span>
                </div>
                <div className="h-24 w-full bg-slate-900/80 rounded-lg border border-slate-800 relative overflow-hidden flex items-center justify-center">
                  <svg viewBox="-6 -1.5 12 3" className="w-full h-full px-4">
                    {/* Axes */}
                    <line x1="-6" y1="0" x2="6" y2="0" stroke="#334155" strokeWidth="0.08" />
                    <line x1="0" y1="-1.5" x2="0" y2="1.5" stroke="#334155" strokeWidth="0.08" />

                    {/* Curve */}
                    {activation === 'step' && (
                      <path d="M -6 0 L 0 0 L 0 -1 L 6 -1" fill="none" stroke="#a855f7" strokeWidth="0.15" />
                    )}
                    {activation === 'sigmoid' && (
                      <path
                        d="M -6 0 Q -3 0 -1 -0.27 T 0 -0.5 T 1 -0.73 T 3 -1 T 6 -1"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="0.15"
                      />
                    )}
                    {activation === 'relu' && (
                      <path d="M -6 0 L 0 0 L 1.5 -1.5" fill="none" stroke="#a855f7" strokeWidth="0.15" />
                    )}

                    {/* Operating Point */}
                    <circle
                      cx={Math.max(-5.5, Math.min(5.5, teachZ))}
                      cy={-Math.max(0, Math.min(1.4, teachOutput))}
                      r="0.25"
                      fill="#f59e0b"
                      stroke="#ffffff"
                      strokeWidth="0.05"
                    />
                  </svg>
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Net Input z = {teachZ.toFixed(2)}</span>
                  <span className="text-emerald-400 font-bold">Activated Output a = {teachOutput.toFixed(3)}</span>
                </div>
              </div>
            </div>

            {/* Advance to Test Callout */}
            <div className="pt-2">
              <button
                onClick={() => { sounds.playClick(); setActiveTab('test'); }}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
              >
                <span>Proceed to Zone 1 Gate Challenge</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEST GATE (2-OF-3 MAJORITY GATE CHALLENGE) */}
      {activeTab === 'test' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border-purple-500/30 glow-purple space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-900/30 pb-4">
            <div>
              <div className="text-xs font-mono text-purple-400 uppercase tracking-widest">
                Unlock Gate Challenge
              </div>
              <h3 className="font-cinzel text-xl font-bold text-white mt-0.5">
                Target: Configure a 2-of-3 Majority Decision Gate
              </h3>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Verification Metric</div>
              <div className="font-mono text-sm font-bold text-purple-300">
                {testTruthTable.filter((r) => r.pass).length} / 8 Truth Table Rows Passing
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl space-y-2 text-xs text-slate-300">
            <p>
              <strong>Objective:</strong> In naval telemetry, three independent sensors watch for ocean turbulence. You must configure the neuron weights ($w_1, w_2, w_3$) and threshold bias ($b$) with <strong>Step Activation</strong> such that the neuron fires <strong>HIGH (1)</strong> if and only if <strong>at least 2 out of 3 sensors</strong> are active.
            </p>
            <p className="text-slate-400 text-[11px]">
              <em>Hint:</em> Equal positive weights (e.g., $w_i = 1.0$) combined with a negative bias between $-1.0$ and $-2.0$ ensure a single active sensor produces negative net input, while two active sensors overcome the bias threshold.
            </p>
          </div>

          {/* Interactive Sliders for Test */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Weight w_{idx + 1}:</span>
                  <span className="font-bold text-purple-300">{testWeights[idx].toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-3.0"
                  max="3.0"
                  step="0.5"
                  value={testWeights[idx]}
                  onChange={(e) => {
                    const next = [...testWeights] as [number, number, number];
                    next[idx] = parseFloat(e.target.value);
                    setTestWeights(next);
                  }}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            ))}

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Bias b:</span>
                <span className="font-bold text-amber-300">{testBias.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-4.0"
                max="2.0"
                step="0.5"
                value={testBias}
                onChange={(e) => setTestBias(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Live Truth Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase">
                  <th className="py-2 px-3">Input (x₁, x₂, x₃)</th>
                  <th className="py-2 px-3">Active Count</th>
                  <th className="py-2 px-3">Net Input z</th>
                  <th className="py-2 px-3">Neuron Output a</th>
                  <th className="py-2 px-3">Target Output</th>
                  <th className="py-2 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {testTruthTable.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      row.pass ? 'bg-emerald-950/10' : 'bg-rose-950/20'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-white">
                      ({row.x1}, {row.x2}, {row.x3})
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {row.x1 + row.x2 + row.x3}
                    </td>
                    <td className="py-2.5 px-3 text-purple-300">
                      {row.z.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        row.actual === 1 ? 'bg-purple-900/80 text-purple-200' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {row.actual}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-300">
                      {row.expected}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {row.pass ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4" /> PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                          <AlertTriangle className="w-4 h-4" /> FAIL
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Validation Feedback & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="text-xs font-mono text-slate-400">
              Attempts: <span className="text-white font-bold">{attempts}</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!allPassed ? (
                <button
                  onClick={handleValidateTest}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Validate Configuration</span>
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
                  <span>Gate Cleared! Unlock Zone 2: Convolution Canyon</span>
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
