import React, { useState, useEffect, useRef, useMemo } from 'react';
import { sounds } from '../../utils/audio';
import { visionModelService, SegmentationResult } from '../../services/visionModelService';
import { 
  CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Layers, 
  Eye, Sliders, Upload, RefreshCw, Box, Grid 
} from 'lucide-react';
import { ZoneTelemetry } from '../../types';

interface SegmentationReefZoneProps {
  telemetry: ZoneTelemetry;
  onComplete: (score: number, timeSpentSec: number) => void;
  onAdvance: () => void;
}

export const SegmentationReefZone: React.FC<SegmentationReefZoneProps> = ({
  telemetry,
  onComplete,
  onAdvance
}) => {
  const [selectedScene, setSelectedScene] = useState<'coastal_road' | 'interior_room'>('coastal_road');
  const [viewMode, setViewMode] = useState<'mask' | 'bbox'>('mask');
  const [opacity, setOpacity] = useState<number>(0.6);
  const [hoveredClass, setHoveredClass] = useState<string | null>(null);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [segmentData, setSegmentData] = useState<SegmentationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Challenge Answers
  const [challengeAnswers, setChallengeAnswers] = useState<{
    dominant: string | null;
    iouRationale: string | null;
  }>({ dominant: null, iouRationale: null });
  const [challengeSubmitted, setChallengeSubmitted] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const [attempts, setAttempts] = useState<number>(telemetry.attempts || 0);

  // Load Segmentation
  useEffect(() => {
    let active = true;
    const fetchSeg = async () => {
      setIsLoading(true);
      try {
        const result = await visionModelService.segment(customImage || selectedScene, customImage ? 'custom' : selectedScene);
        if (active) setSegmentData(result);
      } catch (err) {
        console.error('Segmentation error:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchSeg();
    return () => { active = false; };
  }, [selectedScene, customImage]);

  // Handle user upload
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Evaluation of Challenge
  const isDominantCorrect = challengeAnswers.dominant === 'sky';
  const isIouCorrect = challengeAnswers.iouRationale === 'iou_imbalance';
  const allCorrect = isDominantCorrect && isIouCorrect;

  const handleValidateChallenge = () => {
    const elapsedSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    setAttempts((prev) => prev + 1);
    setChallengeSubmitted(true);

    if (allCorrect) {
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
      <div className="glass-panel p-6 rounded-2xl border-amber-500/30 glow-amber space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900/30 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                Zone 02 • Pixel-Level Semantic Segmentation
              </span>
              {telemetry.completed && (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED GATE CLEARED
                </span>
              )}
            </div>
            <h2 className="font-cinzel text-2xl font-bold text-white mt-1 flex items-center gap-2">
              <Layers className="w-6 h-6 text-amber-400" />
              <span>Segmentation Reef: Pixel-Wise Masks (SegFormer-B0)</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Model:</span>
            <span className="text-amber-300 font-bold">SegFormer-B0 (ADE-512)</span>
          </div>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
          While Object Detection places coarse bounding boxes around entities, <strong>Semantic Segmentation</strong> classifies every individual pixel in the image lattice. This enables precision navigation: determining exact drivable road boundaries, shoreline reefs, and pedestrian silhouettes.
        </p>
      </div>

      {/* Main Interactive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Scene Controls */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
          <h3 className="font-cinzel text-base font-bold text-white border-b border-slate-800 pb-3">
            Segmentation Controls
          </h3>

          {/* Scene Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
              1. Select Surveillance Scene
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { sounds.playClick(); setSelectedScene('coastal_road'); setCustomImage(null); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedScene === 'coastal_road' && !customImage
                    ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-mono text-xs font-bold">Coastal Highway</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Sky, Road, Car, Pedestrian</div>
              </button>

              <button
                onClick={() => { sounds.playClick(); setSelectedScene('interior_room'); setCustomImage(null); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedScene === 'interior_room' && !customImage
                    ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-mono text-xs font-bold">Navigator Cabin</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Wall, Floor, Table, Chair</div>
              </button>
            </div>

            {/* Upload Option */}
            <label className="w-full mt-2 py-2.5 px-3 rounded-xl border border-dashed border-slate-700 hover:border-amber-500 bg-slate-950/40 text-slate-400 hover:text-amber-300 text-xs font-mono flex items-center justify-center gap-2 cursor-pointer transition-all">
              <Upload className="w-4 h-4" />
              <span>Upload Custom Photo</span>
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
          </div>

          {/* Visualization Mode: Bounding Box vs Semantic Mask */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
              2. Paradigm Comparison
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { sounds.playClick(); setViewMode('mask'); }}
                className={`p-3 rounded-xl border text-center font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  viewMode === 'mask'
                    ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Pixel-Wise Masks</span>
              </button>

              <button
                onClick={() => { sounds.playClick(); setViewMode('bbox'); }}
                className={`p-3 rounded-xl border text-center font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  viewMode === 'bbox'
                    ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <Box className="w-4 h-4" />
                <span>Bounding Boxes</span>
              </button>
            </div>
          </div>

          {/* Mask Opacity Slider */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Mask Alpha Opacity:</span>
              <span className="font-bold text-amber-300">{(opacity * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Interactive Class Legend with Pixel Area Percentages */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
              3. Segmented Class Distribution
            </label>
            <div className="space-y-1.5">
              {segmentData?.segments.map((seg) => {
                const isHovered = hoveredClass === seg.label;
                return (
                  <div
                    key={seg.label}
                    onMouseEnter={() => setHoveredClass(seg.label)}
                    onMouseLeave={() => setHoveredClass(null)}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs font-mono cursor-pointer ${
                      isHovered
                        ? 'border-white bg-slate-900 shadow-md scale-[1.02]'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-md border border-white/40"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="font-bold text-white capitalize">{seg.label}</span>
                    </div>
                    <span className="text-amber-300 font-bold">{seg.pixelPct}% of scene</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Canvas & Unlock Challenge */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border-slate-800 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                <span>Pixel Mask Segmentation Canvas</span>
                {isLoading && <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />}
              </h3>
              <span className="text-xs font-mono text-amber-400">
                Hover over legend classes to isolate masks
              </span>
            </div>

            {/* Segment Canvas Container */}
            <div className="w-full h-72 sm:h-80 bg-slate-950 rounded-2xl border border-slate-800 mt-4 relative overflow-hidden flex items-center justify-center">
              {/* Underlying Image Scene */}
              {customImage ? (
                <img src={customImage} alt="Scene" className="w-full h-full object-contain" />
              ) : selectedScene === 'coastal_road' ? (
                <svg viewBox="0 0 500 320" className="w-full h-full">
                  {/* Sky */}
                  <rect x="0" y="0" width="500" height="120" fill="#38bdf8" />
                  {/* Buildings */}
                  <rect x="0" y="115" width="180" height="95" fill="#475569" />
                  <rect x="340" y="105" width="160" height="95" fill="#475569" />
                  {/* Road */}
                  <polygon points="0,210 500,200 500,320 0,320" fill="#1e293b" />
                  {/* Car */}
                  <rect x="190" y="180" width="100" height="70" fill="#b45309" rx="6" />
                  {/* Person */}
                  <rect x="140" y="190" width="30" height="70" fill="#be123c" rx="4" />
                </svg>
              ) : (
                <svg viewBox="0 0 500 320" className="w-full h-full">
                  <rect x="0" y="0" width="500" height="180" fill="#312e81" />
                  <rect x="0" y="180" width="500" height="140" fill="#292524" />
                  <rect x="100" y="170" width="300" height="100" fill="#0369a1" rx="4" />
                  <rect x="40" y="190" width="70" height="100" fill="#9d174d" rx="4" />
                </svg>
              )}

              {/* Pixel Mask Layer (Mode === 'mask') */}
              {viewMode === 'mask' && segmentData && (
                <svg viewBox="0 0 500 320" className="absolute inset-0 w-full h-full pointer-events-none">
                  {segmentData.segments.map((seg) => {
                    const isHovered = hoveredClass === seg.label;
                    const effectiveOpacity = isHovered ? Math.min(0.95, opacity + 0.3) : opacity;

                    return (
                      <path
                        key={seg.label}
                        d={seg.pathData}
                        fill={seg.color}
                        fillOpacity={effectiveOpacity}
                        stroke={isHovered ? '#ffffff' : seg.color}
                        strokeWidth={isHovered ? '3' : '1'}
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </svg>
              )}

              {/* Bounding Box Mode (Mode === 'bbox') */}
              {viewMode === 'bbox' && (
                <svg viewBox="0 0 500 320" className="absolute inset-0 w-full h-full pointer-events-none">
                  <rect x="190" y="180" width="100" height="70" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                  <text x="194" y="174" fill="#f59e0b" fontSize="12" fontFamily="monospace" fontWeight="bold">car: 94%</text>
                  <rect x="140" y="190" width="30" height="70" fill="none" stroke="#f43f5e" strokeWidth="2.5" />
                  <text x="142" y="184" fill="#f43f5e" fontSize="12" fontFamily="monospace" fontWeight="bold">person: 88%</text>
                </svg>
              )}
            </div>
          </div>

          {/* Unlock Gate Diagnostic Challenge */}
          <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-amber-400 uppercase font-bold">
                Zone 2 Unlock Gate • Segmentation Analysis
              </span>
              <span className="text-xs font-mono text-slate-400">2 Requirements</span>
            </div>

            {/* Challenge Question 1 */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">
                1. Inspect the Coastal Highway scene: Which class occupies the <strong>dominant pixel area</strong>?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['sky', 'road', 'building'].map((cls) => (
                  <button
                    key={cls}
                    onClick={() => { sounds.playClick(); setChallengeAnswers((prev) => ({ ...prev, dominant: cls })); }}
                    className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold capitalize transition-all ${
                      challengeAnswers.dominant === cls
                        ? 'bg-amber-600 text-white border-amber-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Challenge Question 2: IoU Rationale */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">
                2. Why is <strong>Intersection over Union (IoU = Area of Overlap / Area of Union)</strong> preferred over simple <strong>Pixel Accuracy</strong> in segmentation?
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: 'iou_imbalance',
                    text: 'Class Imbalance Defense: A model that completely ignores small pedestrians (3% area) can still achieve 97% pixel accuracy by predicting only background; IoU fairly penalizes false positives and false negatives regardless of size.'
                  },
                  {
                    id: 'iou_speed',
                    text: 'Inference Acceleration: IoU requires less floating-point operations on tensor hardware.'
                  }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { sounds.playClick(); setChallengeAnswers((prev) => ({ ...prev, iouRationale: opt.id })); }}
                    className={`p-3 rounded-xl border text-left text-xs font-sans transition-all ${
                      challengeAnswers.iouRationale === opt.id
                        ? 'bg-amber-600/30 border-amber-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Validation & Gate Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
              <div className="text-xs font-mono text-slate-400">
                Attempts: <span className="text-white font-bold">{attempts}</span>
              </div>

              {!allCorrect ? (
                <button
                  onClick={handleValidateChallenge}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition-all shadow-md"
                >
                  Verify Segmentation Rationale
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleValidateChallenge();
                    onAdvance();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 animate-pulse"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Gate Cleared! Unlock Zone 3: Zero-Shot Cliffs</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
