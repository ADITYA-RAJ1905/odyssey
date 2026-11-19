import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/audio';
import { visionModelService, ClipClassificationResult } from '../../services/visionModelService';
import { 
  CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Compass, 
  Send, RefreshCw, Cpu, MessageSquareQuote, Layers, Target 
} from 'lucide-react';
import { ZoneTelemetry } from '../../types';

interface ClipCliffsZoneProps {
  telemetry: ZoneTelemetry;
  onComplete: (score: number, timeSpentSec: number) => void;
  onAdvance: () => void;
}

type ClipSampleKey = 'compass' | 'mirage' | 'jellyfish';

interface ClipSampleMeta {
  key: ClipSampleKey;
  title: string;
  tagline: string;
  defaultLabels: string[];
}

const CLIP_SAMPLES: ClipSampleMeta[] = [
  {
    key: 'compass',
    title: 'The Brass Astrolabe',
    tagline: 'Ancient celestial navigation compass with engraved azimuth circles.',
    defaultLabels: [
      'an antique astrolabe compass',
      'a modern smartphone with GPS screen',
      'a generic metal coin on a table'
    ]
  },
  {
    key: 'mirage',
    title: 'Fata Morgana Mirage',
    tagline: 'Atmospheric optical illusion causing distant islands to appear suspended in the sky.',
    defaultLabels: [
      'an optical ocean mirage illusion',
      'a solid concrete skyscraper',
      'a fleet of submarines'
    ]
  },
  {
    key: 'jellyfish',
    title: 'Bioluminescent Abyss',
    tagline: 'Deep-sea translucent jellyfish emitting turquoise bioluminescence in the dark ocean.',
    defaultLabels: [
      'a glowing bioluminescent jellyfish',
      'a plastic shopping bag floating in water',
      'a bird flying in the clouds'
    ]
  }
];

export const ClipCliffsZone: React.FC<ClipCliffsZoneProps> = ({
  telemetry,
  onComplete,
  onAdvance
}) => {
  const [selectedSample, setSelectedSample] = useState<ClipSampleKey>('compass');
  const [customLabelInput, setCustomLabelInput] = useState<string>('');
  const [candidateLabels, setCandidateLabels] = useState<string[]>(CLIP_SAMPLES[0].defaultLabels);
  const [clipResults, setClipResults] = useState<ClipClassificationResult[]>([]);
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [gateUnlocked, setGateUnlocked] = useState<boolean>(telemetry.completed);

  const startTimeRef = useRef<number>(Date.now());
  const [attempts, setAttempts] = useState<number>(telemetry.attempts || 0);

  // Run Zero-Shot CLIP classification
  const runClassification = async (sampleKey: ClipSampleKey, labels: string[]) => {
    setIsClassifying(true);
    try {
      const results = await visionModelService.zeroShotClassify(sampleKey, labels, sampleKey);
      setClipResults(results);
    } catch (err) {
      console.error('CLIP classification error:', err);
    } finally {
      setIsClassifying(false);
    }
  };

  // Run on mount or sample switch
  useEffect(() => {
    const sample = CLIP_SAMPLES.find((s) => s.key === selectedSample);
    const initialLabels = sample ? sample.defaultLabels : candidateLabels;
    setCandidateLabels(initialLabels);
    runClassification(selectedSample, initialLabels);
  }, [selectedSample]);

  // Handle adding custom candidate label
  const handleAddCustomLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLabelInput.trim()) return;
    sounds.playClick();
    const updated = [customLabelInput.trim(), ...candidateLabels.filter((l) => l !== customLabelInput.trim())].slice(0, 5);
    setCandidateLabels(updated);
    setCustomLabelInput('');
    runClassification(selectedSample, updated);
  };

  // Remove a candidate label
  const handleRemoveLabel = (labelToRemove: string) => {
    if (candidateLabels.length <= 2) return;
    sounds.playClick();
    const updated = candidateLabels.filter((l) => l !== labelToRemove);
    setCandidateLabels(updated);
    runClassification(selectedSample, updated);
  };

  // Prompt Engineering Challenge Verification
  // Target: On 'compass', top label score must be >= 0.85
  const topResult = clipResults[0];
  const isChallengeAchieved = selectedSample === 'compass' && topResult && topResult.score >= 0.85;

  const handleValidateGate = () => {
    const elapsedSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    setAttempts((prev) => prev + 1);

    if (isChallengeAchieved) {
      sounds.playSuccess();
      setGateUnlocked(true);
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
                Zone 03 • Zero-Shot Vision-Language Alignment
              </span>
              {(telemetry.completed || gateUnlocked) && (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED GATE CLEARED
                </span>
              )}
            </div>
            <h2 className="font-cinzel text-2xl font-bold text-white mt-1 flex items-center gap-2">
              <Compass className="w-6 h-6 text-amber-400" />
              <span>Zero-Shot Cliffs: Contrastive Language-Image Pretraining (CLIP)</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Model:</span>
            <span className="text-amber-300 font-bold">CLIP-ViT-Base-Patch32</span>
          </div>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
          Traditional vision models are locked to fixed classification classes ($K=1000$ in ImageNet). <strong>CLIP (Contrastive Language-Image Pretraining)</strong> projects visual features and textual embeddings into a unified high-dimensional vector space. By computing cosine similarity between image vectors and text vectors, CLIP can categorize unseen concepts <strong>Zero-Shot</strong>—without any task-specific retraining!
        </p>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sample Gallery & Custom Prompter */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
          <h3 className="font-cinzel text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Visual Embeddings Target</span>
            {isClassifying && <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />}
          </h3>

          {/* Sample Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
              1. Select Intriguing Target
            </label>
            <div className="space-y-2">
              {CLIP_SAMPLES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => { sounds.playClick(); setSelectedSample(s.key); }}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    selectedSample === s.key
                      ? 'bg-amber-600/30 border-amber-500 text-amber-200 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs font-bold">
                    <span>{s.title}</span>
                    {s.key === 'compass' && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                        GATE MISSION
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-sans">{s.tagline}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Candidate Label Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
              2. Inject Custom Candidate Text Prompt
            </label>
            <form onSubmit={handleAddCustomLabel} className="flex gap-2">
              <input
                type="text"
                placeholder='e.g., "an antique astrolabe"'
                value={customLabelInput}
                onChange={(e) => setCustomLabelInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white font-mono text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Test</span>
              </button>
            </form>
            <div className="text-[10px] font-mono text-slate-500">
              CLIP computes cosine similarity between your text and the visual embedding.
            </div>
          </div>

          {/* Active Candidate Labels Pill List */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
              Active Candidate Labels ({candidateLabels.length})
            </label>
            <div className="space-y-1.5">
              {candidateLabels.map((lbl, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs font-mono text-slate-300"
                >
                  <span className="truncate pr-2">"{lbl}"</span>
                  {candidateLabels.length > 2 && (
                    <button
                      onClick={() => handleRemoveLabel(lbl)}
                      className="text-slate-500 hover:text-rose-400 text-xs px-1.5"
                      title="Remove label"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Target & Live Softmax Distribution */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border-slate-800 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-cinzel text-base font-bold text-white">
                Live Zero-Shot Softmax Probability Spectrum
              </h3>
              <span className="text-xs font-mono text-amber-400">
                Vector Similarity Cosine Distance
              </span>
            </div>

            {/* Stylized Visual Image Display */}
            <div className="w-full h-56 bg-slate-950 rounded-2xl border border-slate-800 mt-4 relative overflow-hidden flex items-center justify-center">
              {selectedSample === 'compass' ? (
                <svg viewBox="0 0 400 220" className="w-full h-full opacity-80">
                  <circle cx="200" cy="110" r="80" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="4" />
                  <circle cx="200" cy="110" r="70" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 2" />
                  <circle cx="200" cy="110" r="45" fill="none" stroke="#fef08a" strokeWidth="1" />
                  {/* Compass needle */}
                  <polygon points="200,45 208,110 200,105 192,110" fill="#ef4444" />
                  <polygon points="200,175 208,110 200,115 192,110" fill="#94a3b8" />
                  <circle cx="200" cy="110" r="6" fill="#f59e0b" />
                  <text x="200" y="38" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold" fontFamily="monospace">N</text>
                  <text x="200" y="195" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="bold" fontFamily="monospace">S</text>
                  <text x="285" y="114" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="bold" fontFamily="monospace">E</text>
                  <text x="115" y="114" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="bold" fontFamily="monospace">W</text>
                </svg>
              ) : selectedSample === 'mirage' ? (
                <svg viewBox="0 0 400 220" className="w-full h-full">
                  <rect x="0" y="0" width="400" height="130" fill="#0369a1" />
                  <rect x="0" y="130" width="400" height="90" fill="#082f49" />
                  {/* Floating mirage island */}
                  <polygon points="120,90 180,60 280,90" fill="#047857" opacity="0.75" />
                  <polygon points="120,110 180,140 280,110" fill="#065f46" opacity="0.4" />
                  <text x="200" y="40" textAnchor="middle" fill="#bae6fd" fontSize="11" fontFamily="monospace">Fata Morgana Inversion Boundary</text>
                </svg>
              ) : (
                <svg viewBox="0 0 400 220" className="w-full h-full bg-[#020617]">
                  {/* Bioluminescent Jellyfish */}
                  <path d="M 160 80 Q 200 40 240 80 T 200 100 Z" fill="#06b6d4" fillOpacity="0.8" stroke="#67e8f9" strokeWidth="2" />
                  <path d="M 175 100 Q 185 140 170 180" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="3 3" />
                  <path d="M 200 100 Q 205 150 195 190" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="3 3" />
                  <path d="M 225 100 Q 215 140 230 180" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="3 3" />
                  <circle cx="200" cy="80" r="30" fill="#38bdf8" fillOpacity="0.2" className="animate-ping" style={{ animationDuration: '3s' }} />
                </svg>
              )}
            </div>

            {/* Softmax Probability Bars */}
            <div className="space-y-3 mt-6">
              {clipResults.map((r, idx) => {
                const pct = Math.round(r.score * 100);
                const isLeader = idx === 0;

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className={`truncate max-w-md ${isLeader ? 'text-white font-bold' : 'text-slate-400'}`}>
                        "{r.label}"
                      </span>
                      <span className={`font-bold ml-2 ${isLeader ? 'text-amber-400 text-sm' : 'text-slate-400'}`}>
                        {pct}%
                      </span>
                    </div>

                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isLeader
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                            : 'bg-slate-700'
                        }`}
                        style={{ width: `${Math.max(3, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Unlock Gate Callout Card */}
          <div className="p-4 bg-amber-950/30 rounded-2xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
              <span className="text-xs font-mono text-amber-300 uppercase font-bold flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" />
                <span>Zero-Shot Calibration Challenge</span>
              </span>
              <span className="text-xs font-mono text-slate-400">
                Target: &gt;85% Confidence
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Select <strong>Sample 1 (The Brass Astrolabe)</strong>. Craft or retain a descriptive text label that enables CLIP to classify the target with <strong>greater than 85% probability</strong> over competing distractors.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs font-mono text-slate-400">
                Top Confidence: <strong className={topResult?.score >= 0.85 ? 'text-emerald-400 font-bold' : 'text-amber-300'}>
                  {topResult ? `${(topResult.score * 100).toFixed(0)}%` : '0%'}
                </strong>
              </div>

              {!isChallengeAchieved && !gateUnlocked ? (
                <button
                  onClick={handleValidateGate}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition-all shadow-md"
                >
                  Verify Prompt Dominance
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!gateUnlocked) handleValidateGate();
                    onAdvance();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 animate-pulse"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Gate Cleared! Unlock Zone 4: The Vision Citadel</span>
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
