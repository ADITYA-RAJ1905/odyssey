import React, { useState, useMemo, useRef, useEffect } from 'react';
import { sounds } from '../../utils/audio';
import { CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Layers, Eye, Play, Pause, RotateCcw } from 'lucide-react';
import { ZoneTelemetry } from '../../types';

interface ConvCanyonZoneProps {
  telemetry: ZoneTelemetry;
  onComplete: (score: number, timeSpentSec: number) => void;
  onAdvance: () => void;
}

type KernelType = 'vertical' | 'horizontal' | 'sharpen';
type PresetType = 'vert_stripe' | 'horiz_stripe' | 'diagonal';

const KERNELS: Record<KernelType, { name: string; matrix: number[][]; desc: string }> = {
  vertical: {
    name: 'Vertical Edge (Sobel-X)',
    matrix: [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ],
    desc: 'Computes horizontal derivative. Lights up vertical boundaries where intensity shifts left-to-right.'
  },
  horizontal: {
    name: 'Horizontal Edge (Sobel-Y)',
    matrix: [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1]
    ],
    desc: 'Computes vertical derivative. Lights up horizontal boundaries where intensity shifts top-to-bottom.'
  },
  sharpen: {
    name: 'Sharpen Kernel',
    matrix: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0]
    ],
    desc: 'Enhances high-frequency spatial differences, amplifying edges and local contrast against neighbors.'
  }
};

const PRESETS: Record<PresetType, { name: string; grid: number[][] }> = {
  vert_stripe: {
    name: 'Vertical Boundary (Black/White split)',
    grid: [
      [10, 10, 10, 90, 90, 90],
      [10, 10, 10, 90, 90, 90],
      [10, 10, 10, 90, 90, 90],
      [10, 10, 10, 90, 90, 90],
      [10, 10, 10, 90, 90, 90],
      [10, 10, 10, 90, 90, 90]
    ]
  },
  horiz_stripe: {
    name: 'Horizontal Shelf (Top/Bottom split)',
    grid: [
      [90, 90, 90, 90, 90, 90],
      [90, 90, 90, 90, 90, 90],
      [90, 90, 90, 90, 90, 90],
      [10, 10, 10, 10, 10, 10],
      [10, 10, 10, 10, 10, 10],
      [10, 10, 10, 10, 10, 10]
    ]
  },
  diagonal: {
    name: 'Diagonal Ridge',
    grid: [
      [90, 10, 10, 10, 10, 10],
      [10, 90, 10, 10, 10, 10],
      [10, 10, 90, 10, 10, 10],
      [10, 10, 10, 90, 10, 10],
      [10, 10, 10, 10, 90, 10],
      [10, 10, 10, 10, 10, 90]
    ]
  }
};

export const ConvCanyonZone: React.FC<ConvCanyonZoneProps> = ({
  telemetry,
  onComplete,
  onAdvance
}) => {
  const [activeTab, setActiveTab] = useState<'teach' | 'test'>('teach');

  // Teach Sandbox State
  const [selectedPreset, setSelectedPreset] = useState<PresetType>('vert_stripe');
  const [selectedKernel, setSelectedKernel] = useState<KernelType>('vertical');
  const [hoveredCell, setHoveredCell] = useState<[number, number]>([0, 1]); // row, col in 4x4 output
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Test Gate State
  const [testAnswers, setTestAnswers] = useState<{
    q1: KernelType | null;
    q2: string | null;
    q3: string | null;
  }>({ q1: null, q2: null, q3: null });
  const [testSubmitted, setTestSubmitted] = useState<boolean>(false);

  // Telemetry
  const startTimeRef = useRef<number>(Date.now());
  const [attempts, setAttempts] = useState<number>(telemetry.attempts || 0);

  // Calculate 4x4 Feature Map
  const featureMap = useMemo(() => {
    const inputGrid = PRESETS[selectedPreset].grid;
    const kernelMatrix = KERNELS[selectedKernel].matrix;
    const out: number[][] = [];

    for (let r = 0; r < 4; r++) {
      const row: number[] = [];
      for (let c = 0; c < 4; c++) {
        let sum = 0;
        for (let kr = 0; kr < 3; kr++) {
          for (let kc = 0; kc < 3; kc++) {
            sum += inputGrid[r + kr][c + kc] * kernelMatrix[kr][kc];
          }
        }
        row.push(sum);
      }
      out.push(row);
    }
    return out;
  }, [selectedPreset, selectedKernel]);

  // Auto-scan stepping animation
  useEffect(() => {
    if (!isScanning) return;
    const timer = setInterval(() => {
      setHoveredCell(([r, c]) => {
        let nextC = c + 1;
        let nextR = r;
        if (nextC >= 4) {
          nextC = 0;
          nextR = (r + 1) % 4;
        }
        return [nextR, nextC];
      });
    }, 600);
    return () => clearInterval(timer);
  }, [isScanning]);

  // Dot product formula breakdown for hovered cell
  const dotProductDetails = useMemo(() => {
    const [r, c] = hoveredCell;
    const inputGrid = PRESETS[selectedPreset].grid;
    const kernelMatrix = KERNELS[selectedKernel].matrix;
    const terms: string[] = [];
    let total = 0;

    for (let kr = 0; kr < 3; kr++) {
      for (let kc = 0; kc < 3; kc++) {
        const val = inputGrid[r + kr][c + kc];
        const weight = kernelMatrix[kr][kc];
        const product = val * weight;
        total += product;
        if (weight !== 0) {
          terms.push(`(${val} × ${weight > 0 ? '+' : ''}${weight})`);
        }
      }
    }
    return { terms, total };
  }, [hoveredCell, selectedPreset, selectedKernel]);

  // Test Evaluation
  const testResults = useMemo(() => {
    // Q1: Target feature map has strong response along vertical boundaries -> vertical
    const q1Pass = testAnswers.q1 === 'vertical';
    // Q2: 6 - 3 + 1 = 4 -> '4x4'
    const q2Pass = testAnswers.q2 === '4x4';
    // Q3: Max Pooling reduces dimensions & translation invariance
    const q3Pass = testAnswers.q3 === 'invariance';

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

  return (
    <div className="space-y-6">
      {/* Zone Header */}
      <div className="glass-panel p-6 rounded-2xl border-purple-500/30 glow-purple space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/30 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
                Zone 02 • Convolutional Feature Extraction
              </span>
              {telemetry.completed && (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED GATE CLEARED
                </span>
              )}
            </div>
            <h2 className="font-cinzel text-2xl font-bold text-white mt-1 flex items-center gap-2">
              <Layers className="w-6 h-6 text-purple-400" />
              <span>Convolution Canyon: Kernels, Sliding Windows &amp; Feature Maps</span>
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
              <Eye className="w-4 h-4" />
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
              <Sparkles className="w-4 h-4" />
              <span>2. Gate Challenge</span>
              {telemetry.completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
            </button>
          </div>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
          Standard dense layers flatten images into 1D vectors, destroying 2D spatial relationships. <strong>Convolutional Neural Networks (CNNs)</strong> preserve spatial topology by sliding localized $3 \times 3$ filter kernels across the input, computing element-wise dot products to extract edge orientations and texture feature maps.
        </p>
      </div>

      {/* TAB 1: TEACH SANDBOX */}
      {activeTab === 'teach' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
            <h3 className="font-cinzel text-base font-bold text-white border-b border-slate-800 pb-3">
              Convolution Controls
            </h3>

            {/* Input Pattern Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                1. Input Image Pattern ($6 \times 6$)
              </label>
              <div className="space-y-2">
                {(['vert_stripe', 'horiz_stripe', 'diagonal'] as PresetType[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => { sounds.playClick(); setSelectedPreset(key); }}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-mono transition-all flex items-center justify-between ${
                      selectedPreset === key
                        ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{PRESETS[key].name}</span>
                    {selectedPreset === key && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Kernel Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                2. Filter Kernel ($3 \times 3$)
              </label>
              <div className="space-y-2">
                {(['vertical', 'horizontal', 'sharpen'] as KernelType[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => { sounds.playClick(); setSelectedKernel(k); }}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      selectedKernel === k
                        ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-xs font-bold">
                      <span>{KERNELS[k].name}</span>
                      {selectedKernel === k && <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-sans">{KERNELS[k].desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Scan Play / Pause */}
            <div className="pt-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsScanning((prev) => !prev);
                }}
                className={`w-full py-2.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 ${
                  isScanning
                    ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/30'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {isScanning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isScanning ? 'Pause Window Scan' : 'Auto-Step Sliding Window'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Grids & Calculation Column */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-cinzel text-base font-bold text-white">
                Sliding Window Matrix Convolver
              </h3>
              <span className="text-xs font-mono text-purple-400">
                Hover over Output to trace $3 \times 3$ receptive field
              </span>
            </div>

            {/* 3 Grids Display: Input (6x6) * Kernel (3x3) = Feature Map (4x4) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* 6x6 Input Image */}
              <div className="space-y-2 text-center">
                <div className="text-[11px] font-mono text-slate-300 font-bold uppercase">
                  Input Image ($6 \times 6$)
                </div>
                <div className="grid grid-cols-6 gap-1 bg-slate-950 p-2 rounded-xl border border-slate-800 mx-auto w-44 h-44">
                  {PRESETS[selectedPreset].grid.map((row, rIdx) =>
                    row.map((val, cIdx) => {
                      // Check if inside receptive field of hoveredCell
                      const [hr, hc] = hoveredCell;
                      const isInWindow = rIdx >= hr && rIdx < hr + 3 && cIdx >= hc && cIdx < hc + 3;

                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          className={`rounded flex items-center justify-center text-[9px] font-mono transition-all duration-200 ${
                            isInWindow
                              ? 'border-2 border-cyan-400 bg-cyan-600/40 text-white font-bold scale-105 z-10 shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                              : val > 50
                              ? 'bg-slate-300 text-slate-900'
                              : 'bg-slate-900 text-slate-500 border border-slate-800'
                          }`}
                        >
                          {val}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 3x3 Kernel */}
              <div className="space-y-2 text-center">
                <div className="text-[11px] font-mono text-purple-300 font-bold uppercase">
                  Kernel ($3 \times 3$)
                </div>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-2 rounded-xl border border-purple-500/40 mx-auto w-28 h-28">
                  {KERNELS[selectedKernel].matrix.map((kRow, krIdx) =>
                    kRow.map((kVal, kcIdx) => (
                      <div
                        key={`${krIdx}-${kcIdx}`}
                        className={`rounded flex items-center justify-center text-[10px] font-mono font-bold ${
                          kVal > 0
                            ? 'bg-purple-900/80 text-purple-200 border border-purple-500/50'
                            : kVal < 0
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                            : 'bg-slate-900 text-slate-500'
                        }`}
                      >
                        {kVal > 0 ? `+${kVal}` : kVal}
                      </div>
                    ))
                  )}
                </div>
                <div className="text-[10px] font-mono text-slate-500">Dot-product weights</div>
              </div>

              {/* 4x4 Output Feature Map */}
              <div className="space-y-2 text-center">
                <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase">
                  Feature Map ($4 \times 4$)
                </div>
                <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-2 rounded-xl border border-emerald-500/30 mx-auto w-36 h-36">
                  {featureMap.map((fRow, frIdx) =>
                    fRow.map((fVal, fcIdx) => {
                      const isSelected = hoveredCell[0] === frIdx && hoveredCell[1] === fcIdx;
                      const absVal = Math.abs(fVal);
                      const intensity = Math.min(1, absVal / 300);

                      return (
                        <button
                          key={`${frIdx}-${fcIdx}`}
                          onMouseEnter={() => setHoveredCell([frIdx, fcIdx])}
                          className={`rounded flex items-center justify-center text-[10px] font-mono font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'border-2 border-emerald-400 bg-emerald-500/60 text-white scale-110 shadow-[0_0_10px_rgba(52,211,153,0.8)] z-10'
                              : intensity > 0.4
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-900/90 text-slate-400 border border-slate-800'
                          }`}
                        >
                          {fVal}
                        </button>
                      );
                    })
                  )}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Active Cell: [{hoveredCell[0]}, {hoveredCell[1]}]
                </div>
              </div>
            </div>

            {/* Dot Product Arithmetic Breakdown Box */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Receptive Field Dot-Product at [{hoveredCell[0]}, {hoveredCell[1]}]:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  Output = {dotProductDetails.total}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-nowrap bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                {dotProductDetails.terms.length > 0 ? (
                  <span>
                    Σ = {dotProductDetails.terms.slice(0, 6).join(' + ')}
                    {dotProductDetails.terms.length > 6 && ' + ...'} = <strong>{dotProductDetails.total}</strong>
                  </span>
                ) : (
                  <span>All kernel weights zero in window</span>
                )}
              </div>
            </div>

            {/* Advance to Test Callout */}
            <div className="pt-2">
              <button
                onClick={() => { sounds.playClick(); setActiveTab('test'); }}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
              >
                <span>Proceed to Zone 2 Gate Challenge</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEST GATE */}
      {activeTab === 'test' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border-purple-500/30 glow-purple space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-900/30 pb-4">
            <div>
              <div className="text-xs font-mono text-purple-400 uppercase tracking-widest">
                Unlock Gate Challenge
              </div>
              <h3 className="font-cinzel text-xl font-bold text-white mt-0.5">
                Convolutional Filter &amp; Topology Diagnostic
              </h3>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Verification Metric</div>
              <div className="font-mono text-sm font-bold text-purple-300">
                {testResults.passedCount} / 3 Diagnostic Questions Correct
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Question 1: Feature Map Matching */}
            <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-xs font-mono text-purple-400 uppercase">Question 1 • Kernel Identification</div>
              <p className="text-sm text-slate-200">
                A satellite reconnaissance feed contains sharp vertical coastlines. When processed through an unknown $3 \times 3$ kernel, the feature map produces <strong>high positive/negative activation peaks on vertical boundaries</strong>, but yields <strong>zero response along horizontal coastlines</strong>. Which filter was applied?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { id: 'vertical', label: 'Vertical Sobel-X Edge', icon: '[-1 0 1; -2 0 2; -1 0 1]' },
                  { id: 'horizontal', label: 'Horizontal Sobel-Y Edge', icon: '[-1 -2 -1; 0 0 0; 1 2 1]' },
                  { id: 'sharpen', label: 'Gaussian / Sharpen Filter', icon: '[0 -1 0; -1 5 -1; 0 -1 0]' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      sounds.playClick();
                      setTestAnswers((prev) => ({ ...prev, q1: opt.id as KernelType }));
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      testAnswers.q1 === opt.id
                        ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold">{opt.label}</div>
                    <div className="font-mono text-[10px] text-slate-500 mt-1">{opt.icon}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Dimension Formula */}
            <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-xs font-mono text-purple-400 uppercase">Question 2 • Spatial Dimensions</div>
              <p className="text-sm text-slate-200">
                Given an input image of dimension W = 6 × 6, filtered by a kernel of size K = 3 × 3 with stride S = 1 and zero padding (P = 0), using the spatial dimension formula O = ⌊(W - K + 2P)/S⌋ + 1, what is the output spatial resolution?
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {['6x6', '5x5', '4x4', '3x3'].map((dim) => (
                  <button
                    key={dim}
                    onClick={() => {
                      sounds.playClick();
                      setTestAnswers((prev) => ({ ...prev, q2: dim }));
                    }}
                    className={`p-3 rounded-xl border text-center font-mono text-xs font-bold transition-all ${
                      testAnswers.q2 === dim
                        ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {dim}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3: Max Pooling Function */}
            <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-xs font-mono text-purple-400 uppercase">Question 3 • Max Pooling Purpose</div>
              <p className="text-sm text-slate-200">
                Why are Max-Pooling layers commonly inserted between successive convolutional blocks in deep neural architectures?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  {
                    id: 'invariance',
                    title: 'Dimensionality & Invariance',
                    desc: 'Downsamples spatial dimensions to reduce parameter count and provides local translational invariance.'
                  },
                  {
                    id: 'weights',
                    title: 'Weight Normalization',
                    desc: 'Calculates the L2 norm of weights to avoid exploding gradients.'
                  }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      sounds.playClick();
                      setTestAnswers((prev) => ({ ...prev, q3: opt.id }));
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      testAnswers.q3 === opt.id
                        ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-md'
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
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
                >
                  <span>Verify Answers</span>
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
                  <span>Gate Cleared! Unlock Zone 3: Vision Observatory</span>
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
