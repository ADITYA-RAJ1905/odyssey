import React, { useState, useEffect, useRef, useMemo } from 'react';
import { sounds } from '../../utils/audio';
import { usePretrainedVisionModel } from '../../hooks/usePretrainedVisionModel';
import { DetectionResult } from '../../services/visionModelService';
import { 
  CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Eye, 
  Upload, Sliders, Cpu, ShieldCheck, Target, RefreshCw 
} from 'lucide-react';
import { ZoneTelemetry } from '../../types';

interface VisionObservatoryZoneProps {
  telemetry: ZoneTelemetry;
  onComplete: (score: number, timeSpentSec: number) => void;
  onAdvance: () => void;
}

type SampleKey = 'sample_1_street' | 'sample_2_desk' | 'sample_3_wildlife';

interface SampleMeta {
  key: SampleKey;
  title: string;
  category: string;
  desc: string;
  isMissionTarget?: boolean;
}

const SAMPLES: SampleMeta[] = [
  {
    key: 'sample_1_street',
    title: 'Sample 1: Coastal Harbor Crossing',
    category: 'Urban Reconnaissance',
    desc: 'Dense vehicular and pedestrian traffic near the archipelago ferry docks.'
  },
  {
    key: 'sample_2_desk',
    title: 'Sample 2: Navigator Workstation',
    category: 'Mission Target Challenge',
    desc: 'Desk setup with laptop, coffee mug, keyboard, and background sensor noise.',
    isMissionTarget: true
  },
  {
    key: 'sample_3_wildlife',
    title: 'Sample 3: Island Savannah Fauna',
    category: 'Biometric Ecology',
    desc: 'Wildlife watering hole with elephants, zebras, and airborne birds.'
  }
];

export const VisionObservatoryZone: React.FC<VisionObservatoryZoneProps> = ({
  telemetry,
  onComplete,
  onAdvance
}) => {
  const {
    status: modelStatus,
    progress: modelProgress,
    statusMessage,
    isUsingFallback,
    modelName,
    isDetecting,
    detections,
    initModel,
    runDetection
  } = usePretrainedVisionModel();

  const [selectedSample, setSelectedSample] = useState<SampleKey>('sample_2_desk');
  const [threshold, setThreshold] = useState<number>(0.35); // Start at lower threshold so noise is visible
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [missionCleared, setMissionCleared] = useState<boolean>(false);
  const [validationFeedback, setValidationFeedback] = useState<string | null>(null);

  // Telemetry timer
  const startTimeRef = useRef<number>(Date.now());
  const [attempts, setAttempts] = useState<number>(telemetry.attempts || 0);

  // Initialize model on mount
  useEffect(() => {
    initModel();
  }, [initModel]);

  // Run detection whenever sample or threshold changes
  useEffect(() => {
    const targetSource = customImage || selectedSample;
    runDetection(targetSource, threshold, customImage ? undefined : selectedSample);
  }, [selectedSample, threshold, customImage, runDetection]);

  // Handle custom user image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        sounds.playClick();
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Evaluate Mission Target on Sample 2
  // Goal: Laptop (0.96), coffee mug (0.89), keyboard (0.82) detected; phone (0.38) and mouse (0.28) filtered out
  const missionStatus = useMemo(() => {
    if (selectedSample !== 'sample_2_desk' || customImage) {
      return {
        isTargetSample: false,
        valid: false,
        targetCount: 0,
        falsePositives: 0,
        missedTargets: 0,
        message: 'Select Sample 2 (Navigator Workstation) to attempt the Gate Challenge.'
      };
    }

    const labels = detections.map((d) => d.label.toLowerCase());
    const hasLaptop = labels.some((l) => l.includes('laptop'));
    const hasCup = labels.some((l) => l.includes('cup') || l.includes('mug'));
    const hasKeyboard = labels.some((l) => l.includes('keyboard'));

    const falsePositiveLabels = labels.filter(
      (l) => !l.includes('laptop') && !l.includes('cup') && !l.includes('mug') && !l.includes('keyboard')
    );

    const targetCount = [hasLaptop, hasCup, hasKeyboard].filter(Boolean).length;
    const missedTargets = 3 - targetCount;
    const falsePositives = falsePositiveLabels.length;

    const valid = targetCount === 3 && falsePositives === 0;

    let message = '';
    if (falsePositives > 0) {
      message = `Over-sensitive: Threshold is too low (${threshold.toFixed(2)}). ${falsePositives} false alarm object(s) detected (${falsePositiveLabels.join(', ')}). Increase threshold to improve Precision!`;
    } else if (missedTargets > 0) {
      message = `Under-sensitive: Threshold is too high (${threshold.toFixed(2)}). Missed ${missedTargets} valid workstation object(s). Decrease threshold to improve Recall!`;
    } else {
      message = `Optimal Calibration! All 3 target objects detected with 0 false positives ($F_1$-Score = 1.0).`;
    }

    return {
      isTargetSample: true,
      valid,
      targetCount,
      falsePositives,
      missedTargets,
      message
    };
  }, [selectedSample, customImage, detections, threshold]);

  const handleVerifyMission = () => {
    const elapsedSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    setAttempts((prev) => prev + 1);

    if (missionStatus.valid) {
      sounds.playSuccess();
      setMissionCleared(true);
      setValidationFeedback('Mission parameters verified! Model calibration meets high-reliability naval standard.');
      const score = Math.max(75, 100 - (attempts * 8));
      onComplete(score, elapsedSec);
    } else {
      sounds.playError();
      setValidationFeedback(missionStatus.message);
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
                Zone 03 • Pre-Trained Deep Neural Inference
              </span>
              {(telemetry.completed || missionCleared) && (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED GATE CLEARED
                </span>
              )}
            </div>
            <h2 className="font-cinzel text-2xl font-bold text-white mt-1 flex items-center gap-2">
              <Eye className="w-6 h-6 text-purple-400" />
              <span>Vision Observatory: Pre-Trained Object Detection &amp; Threshold Tuning</span>
            </h2>
          </div>

          {/* Model Status HUD Pill */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800">
            <Cpu className="w-4 h-4 text-purple-400" />
            <div className="text-left text-xs font-mono">
              <div className="text-slate-400 text-[10px]">Model: {modelName}</div>
              <div className="text-purple-300 font-bold flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${modelStatus === 'ready' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                <span>{modelStatus === 'ready' ? 'ONNX WASM Active' : statusMessage}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Model Download Progress Bar (if loading) */}
        {modelStatus === 'downloading' && (
          <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-500/30 space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-purple-300">
              <span>{statusMessage}</span>
              <span>{modelProgress}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full transition-all duration-300"
                style={{ width: `${modelProgress}%` }}
              />
            </div>
          </div>
        )}

        <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
          Here you deploy a pre-trained Vision Transformer model directly in your browser. The network predicts bounding box coordinates and classification logits. Tuning the <strong>Confidence Threshold</strong> demonstrates the fundamental trade-off between <strong>Precision</strong> (eliminating false alarms) and <strong>Recall</strong> (detecting all true objects).
        </p>
      </div>

      {/* Main Interactive Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sample Selector & Sliders */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
          <h3 className="font-cinzel text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Reconnaissance Feed</span>
            <Sliders className="w-4 h-4 text-purple-400" />
          </h3>

          {/* Sample Feeds */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
              1. Select Visual Scene
            </label>
            <div className="space-y-2">
              {SAMPLES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedSample(s.key);
                    setCustomImage(null);
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    selectedSample === s.key && !customImage
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs font-bold">
                    <span>{s.title}</span>
                    {s.isMissionTarget && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                        GATE TARGET
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-sans">{s.desc}</div>
                </button>
              ))}
            </div>

            {/* Custom Image Upload Option */}
            <div className="pt-2">
              <label className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-700 hover:border-purple-500 bg-slate-950/40 text-slate-400 hover:text-purple-300 text-xs font-mono flex items-center justify-center gap-2 cursor-pointer transition-all">
                <Upload className="w-4 h-4" />
                <span>Upload Custom Surveillance Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Confidence Threshold Slider */}
          <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold">Confidence Threshold:</span>
              <span className="text-purple-300 font-bold text-base">{(threshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.95"
              step="0.05"
              value={threshold}
              onChange={(e) => {
                setThreshold(parseFloat(e.target.value));
              }}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.10 (High Recall / Noise)</span>
              <span>0.50</span>
              <span>0.95 (High Precision / Strict)</span>
            </div>

            {/* Precision vs Recall Bar Indicator */}
            <div className="pt-2 space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-sky-400">Recall: {threshold <= 0.45 ? '100%' : threshold <= 0.80 ? '100%' : '67%'}</span>
                <span className="text-amber-400">Precision: {threshold <= 0.40 ? '60%' : '100%'}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden flex">
                <div
                  className="bg-sky-500 h-full"
                  style={{ width: `${Math.max(20, (1 - threshold) * 100)}%` }}
                />
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${Math.max(20, threshold * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Gate Mission Card */}
          <div className="p-4 bg-purple-950/30 rounded-xl border border-purple-500/30 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono text-purple-300 font-bold">
              <Target className="w-4 h-4 text-purple-400" />
              <span>Gate Objective: Navigator Workstation</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Select <strong>Sample 2</strong>. Tune the threshold so the neural detector isolates all <strong>3 target items</strong> (Laptop, Coffee Mug, Keyboard) while filtering out low-confidence sensor artifacts.
            </p>
            <div className="text-[11px] font-mono text-purple-200 bg-purple-900/40 p-2 rounded-lg border border-purple-500/20">
              {missionStatus.message}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Feed with Bounding Box Overlay */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                <span>Tactical Visual Feed</span>
                {isDetecting && <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />}
              </h3>
              <span className="text-xs font-mono text-emerald-400">
                {detections.length} Object(s) Localized
              </span>
            </div>

            {/* Canvas / SVG Feed with Bounding Box Overlay */}
            <div className="w-full h-72 sm:h-80 bg-slate-950 rounded-2xl border border-slate-800 mt-4 relative overflow-hidden flex items-center justify-center">
              {/* Visual Scene Backdrop */}
              {customImage ? (
                <img
                  src={customImage}
                  alt="Surveillance Feed"
                  className="w-full h-full object-contain"
                />
              ) : selectedSample === 'sample_1_street' ? (
                <div className="w-full h-full bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950 relative flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="text-slate-600 font-mono text-xs">Coastal Harbor Traffic Visual Feed</div>
                </div>
              ) : selectedSample === 'sample_2_desk' ? (
                <div className="w-full h-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 relative flex items-center justify-center">
                  {/* Stylized Workstation SVG backdrop */}
                  <svg viewBox="0 0 460 280" className="w-full h-full opacity-60">
                    <rect x="20" y="220" width="420" height="40" fill="#1e293b" rx="4" />
                    {/* Laptop */}
                    <rect x="120" y="70" width="200" height="140" fill="#0f172a" stroke="#475569" strokeWidth="2" rx="6" />
                    <rect x="130" y="80" width="180" height="110" fill="#020617" />
                    <line x1="100" y1="210" x2="340" y2="210" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
                    {/* Coffee mug */}
                    <rect x="360" y="120" width="70" height="80" fill="#334155" rx="8" />
                    <path d="M 430 135 C 445 135 445 165 430 165" fill="none" stroke="#334155" strokeWidth="5" />
                    {/* Keyboard */}
                    <rect x="110" y="190" width="220" height="70" fill="#0f172a" stroke="#334155" strokeWidth="1.5" rx="4" />
                  </svg>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-emerald-950/40 to-slate-950 relative flex items-center justify-center">
                  <div className="text-slate-600 font-mono text-xs">Island Savannah Biometric Telemetry</div>
                </div>
              )}

              {/* Bounding Box SVG Overlay */}
              <svg viewBox="0 0 460 280" className="absolute inset-0 w-full h-full pointer-events-none">
                {detections.map((d, idx) => {
                  const { xmin, ymin, xmax, ymax } = d.box;
                  const w = xmax - xmin;
                  const h = ymax - ymin;
                  const isNoise = d.score < 0.45;

                  return (
                    <g key={idx} className="transition-all duration-300">
                      {/* Bounding Box Rectangle */}
                      <rect
                        x={xmin}
                        y={ymin}
                        width={w}
                        height={h}
                        fill={isNoise ? 'rgba(239, 68, 68, 0.1)' : 'rgba(168, 85, 247, 0.15)'}
                        stroke={isNoise ? '#ef4444' : '#c084fc'}
                        strokeWidth="2"
                        rx="4"
                      />

                      {/* Corner Accents */}
                      <line x1={xmin} y1={ymin} x2={xmin + 8} y2={ymin} stroke="#ffffff" strokeWidth="3" />
                      <line x1={xmin} y1={ymin} x2={xmin} y2={ymin + 8} stroke="#ffffff" strokeWidth="3" />
                      <line x1={xmax} y1={ymax} x2={xmax - 8} y2={ymax} stroke="#ffffff" strokeWidth="3" />
                      <line x1={xmax} y1={ymax} x2={xmax} y2={ymax - 8} stroke="#ffffff" strokeWidth="3" />

                      {/* Class Label Pill */}
                      <rect
                        x={xmin}
                        y={Math.max(10, ymin - 22)}
                        width={Math.max(70, d.label.length * 8 + 40)}
                        height="20"
                        fill={isNoise ? '#7f1d1d' : '#581c87'}
                        rx="4"
                      />
                      <text
                        x={xmin + 6}
                        y={Math.max(24, ymin - 8)}
                        fill="#f8fafc"
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {d.label}: {(d.score * 100).toFixed(0)}%
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Detections List Pill Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {detections.map((d, idx) => (
                <span
                  key={idx}
                  className={`text-xs font-mono px-3 py-1 rounded-lg border flex items-center gap-1.5 ${
                    d.score >= 0.80
                      ? 'bg-purple-950/60 border-purple-500/50 text-purple-200'
                      : d.score >= 0.50
                      ? 'bg-sky-950/60 border-sky-500/50 text-sky-200'
                      : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                  }`}
                >
                  <span className="font-bold">{d.label}</span>
                  <span className="text-[10px] opacity-75">({(d.score * 100).toFixed(0)}%)</span>
                </span>
              ))}
              {detections.length === 0 && (
                <span className="text-xs font-mono text-slate-500">
                  No objects exceed current threshold ({(threshold * 100).toFixed(0)}%). Lower threshold to increase recall.
                </span>
              )}
            </div>
          </div>

          {/* Validation Feedback & Action Buttons */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            {validationFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                  missionStatus.valid
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                {missionStatus.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{validationFeedback}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-mono text-slate-400">
                Attempts: <span className="text-white font-bold">{attempts}</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {!missionStatus.valid && !missionCleared ? (
                  <button
                    onClick={handleVerifyMission}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
                  >
                    <Target className="w-4 h-4" />
                    <span>Verify Calibration</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (!missionCleared) handleVerifyMission();
                      onAdvance();
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 animate-pulse"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Gate Cleared! Unlock Zone 4: The Neural Citadel</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
