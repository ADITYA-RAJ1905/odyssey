import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/audio';
import { nlpModelService, SentimentResult } from '../../services/nlpModelService';
import { 
  CheckCircle2, AlertTriangle, ArrowRight, Sparkles, MessageSquare, 
  Send, RefreshCw, Cpu, ShieldAlert, Award, Smile, Frown, Network 
} from 'lucide-react';
import { ZoneTelemetry } from '../../types';

interface SentimentGorgeZoneProps {
  telemetry: ZoneTelemetry;
  onComplete: (score: number, timeSpentSec: number) => void;
  onAdvance: () => void;
}

const OVERT_NEGATIVE_WORDS = [
  'bad', 'terrible', 'awful', 'worst', 'hate', 'hated', 'horrible', 'poor', 
  'disgusting', 'trash', 'useless', 'garbage', 'broken', 'disaster', 'scam'
];

export const SentimentGorgeZone: React.FC<SentimentGorgeZoneProps> = ({
  telemetry,
  onComplete,
  onAdvance
}) => {
  const [activeTab, setActiveTab] = useState<'attention' | 'adversarial'>('attention');

  // Self-Attention Visualizer State
  const [targetAdjective, setTargetAdjective] = useState<'tired' | 'wide'>('tired');

  // Live Sentiment Sandbox State
  const [sandboxText, setSandboxText] = useState<string>(
    'The scenic coastal voyage provided breathtaking views of the archipelago.'
  );
  const [sandboxResult, setSandboxResult] = useState<SentimentResult>({
    label: 'POSITIVE',
    score: 0.98,
    positiveScore: 0.98,
    negativeScore: 0.02,
    isFallback: false
  });
  const [isClassifyingSandbox, setIsClassifyingSandbox] = useState<boolean>(false);

  // Adversarial Challenge State
  const [adversarialText, setAdversarialText] = useState<string>(
    'What a masterpiece of culinary art, I truly enjoyed waiting 3 hours for cold soup and non-existent service!'
  );
  const [adversarialResult, setAdversarialResult] = useState<SentimentResult | null>(null);
  const [isClassifyingAdversarial, setIsClassifyingAdversarial] = useState<boolean>(false);
  const [detectedOvertNegative, setDetectedOvertNegative] = useState<string[]>([]);
  const [modelStatus, setModelStatus] = useState<string>('Loading DistilBERT SST-2...');

  const startTimeRef = useRef<number>(Date.now());
  const [attempts, setAttempts] = useState<number>(telemetry.attempts || 0);

  // Initialize DistilBERT model
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      await nlpModelService.loadSentimentModel();
      if (!isMounted) return;
      setModelStatus('Xenova/distilbert-base-uncased-finetuned-sst-2-english Ready');
    };
    init();
    return () => { isMounted = false; };
  }, []);

  // Sandbox inference
  useEffect(() => {
    let isMounted = true;
    if (!sandboxText.trim()) return;

    setIsClassifyingSandbox(true);
    const timer = setTimeout(async () => {
      const res = await nlpModelService.classifySentiment(sandboxText);
      if (!isMounted) return;
      setSandboxResult(res);
      setIsClassifyingSandbox(false);
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [sandboxText]);

  // Adversarial challenge inference & keyword detection
  useEffect(() => {
    let isMounted = true;
    const lower = adversarialText.toLowerCase();
    const found = OVERT_NEGATIVE_WORDS.filter((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(lower);
    });
    setDetectedOvertNegative(found);

    if (adversarialText.trim().length > 10) {
      setIsClassifyingAdversarial(true);
      const timer = setTimeout(async () => {
        const res = await nlpModelService.classifySentiment(adversarialText);
        if (!isMounted) return;
        setAdversarialResult(res);
        setIsClassifyingAdversarial(false);
      }, 350);

      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    } else {
      setAdversarialResult(null);
      setIsClassifyingAdversarial(false);
    }
  }, [adversarialText]);

  const handleValidateAdversarial = () => {
    sounds.playClick();
    setAttempts((prev) => prev + 1);

    if (!adversarialResult) return;

    const isFooled = adversarialResult.label === 'POSITIVE' && adversarialResult.positiveScore >= 0.85;
    const noOvertWords = detectedOvertNegative.length === 0;

    if (isFooled && noOvertWords) {
      sounds.playSuccess();
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      const score = Math.min(100, Math.round(adversarialResult.positiveScore * 100));
      onComplete(score, elapsed);
    } else {
      sounds.playError();
    }
  };

  const isChallengePassed = telemetry.completed || (
    adversarialResult && 
    adversarialResult.label === 'POSITIVE' && 
    adversarialResult.positiveScore >= 0.85 && 
    detectedOvertNegative.length === 0
  );

  return (
    <div className="space-y-6">
      {/* Zone Header */}
      <div className="glass-panel p-6 rounded-2xl border-emerald-500/30 glow-emerald space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                Zone 03 · Natural Language Processing
              </div>
              <h2 className="font-cinzel text-2xl font-bold text-white">
                Sentiment Gorge: Self-Attention & Adversarial Sarcasm
              </h2>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-700">
            <button
              onClick={() => { sounds.playClick(); setActiveTab('attention'); }}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'attention'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Self-Attention Visualizer
            </button>
            <button
              onClick={() => { sounds.playClick(); setActiveTab('adversarial'); }}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'adversarial'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Sarcasm Adversarial Gate
              {isChallengePassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'attention' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Winograd Schema Attention Sandbox */}
          <div className="lg:col-span-6 space-y-5">
            <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Network className="w-4 h-4 text-emerald-400" />
                  Dynamic Attention Resolver (Winograd Schema)
                </span>
              </div>

              <p className="text-xs text-slate-300">
                Toggle the trailing adjective to observe how Multi-Head Self-Attention dynamically re-routes token affinity from pronoun <strong>"it"</strong>:
              </p>

              {/* The Sentence with Toggle */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-sm leading-relaxed space-y-3">
                <div className="font-mono text-slate-200">
                  "The{' '}
                  <span className={`px-2 py-0.5 rounded font-bold transition-all ${
                    targetAdjective === 'tired' ? 'bg-emerald-500/30 text-emerald-300 ring-1 ring-emerald-400' : 'text-slate-400'
                  }`}>
                    animal
                  </span>{' '}
                  didn't cross the{' '}
                  <span className={`px-2 py-0.5 rounded font-bold transition-all ${
                    targetAdjective === 'wide' ? 'bg-cyan-500/30 text-cyan-300 ring-1 ring-cyan-400' : 'text-slate-400'
                  }`}>
                    street
                  </span>{' '}
                  because{' '}
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                    it
                  </span>{' '}
                  was too{' '}
                  <span className="text-white font-bold underline decoration-emerald-400">
                    {targetAdjective}
                  </span>
                  ."
                </div>

                {/* Adjective Toggle Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => { sounds.playClick(); setTargetAdjective('tired'); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                      targetAdjective === 'tired'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Set: "too tired" (Biological State)
                  </button>
                  <button
                    onClick={() => { sounds.playClick(); setTargetAdjective('wide'); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                      targetAdjective === 'wide'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Set: "too wide" (Spatial Geometry)
                  </button>
                </div>
              </div>

              {/* Attention Weight Breakdown */}
              <div className="space-y-3 pt-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Computed Attention Weights from token "it":
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-emerald-400 font-bold">it → animal</span>
                      <span className="text-emerald-300 font-bold">
                        {targetAdjective === 'tired' ? '0.84 (Dominant)' : '0.12'}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-850 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: targetAdjective === 'tired' ? '84%' : '12%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-cyan-400 font-bold">it → street</span>
                      <span className="text-cyan-300 font-bold">
                        {targetAdjective === 'wide' ? '0.88 (Dominant)' : '0.16'}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-850 overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 transition-all duration-300"
                        style={{ width: targetAdjective === 'wide' ? '88%' : '16%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanatory Card */}
            <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
              <div className="font-mono text-emerald-400 font-semibold">
                Why Self-Attention Replaced Recurrent RNNs
              </div>
              <p>
                In RNNs/LSTMs, information had to travel sequentially token-by-token across the sentence, causing catastrophic forgetting on long spans. Self-attention computes dot-product query-key compatibility <code className="text-emerald-300">Softmax(QK^T / √d_k)V</code> in parallel with an $O(1)$ direct connection between any two positions.
              </p>
            </div>
          </div>

          {/* Right: Live DistilBERT Sentiment Classifier */}
          <div className="lg:col-span-6 space-y-5">
            <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-cinzel text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  Live Pre-Trained Sentiment Classifier
                </h3>
                <span className="text-[10px] font-mono text-emerald-400/80">
                  {modelStatus}
                </span>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-mono">
                  Test arbitrary sentences on DistilBERT SST-2:
                </label>
                <textarea
                  value={sandboxText}
                  onChange={(e) => setSandboxText(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-400 transition-all resize-none"
                />
              </div>

              {/* Output Confidence Meter */}
              <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {sandboxResult.label === 'POSITIVE' ? (
                      <Smile className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Frown className="w-5 h-5 text-rose-400" />
                    )}
                    <span className="font-mono text-sm font-bold text-white">
                      Predicted Class: {sandboxResult.label}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {Math.round(sandboxResult.score * 100)}% Confidence
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span>Positive Logit Probability</span>
                      <span className="text-emerald-300">
                        {Math.round(sandboxResult.positiveScore * 100)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${sandboxResult.positiveScore * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span>Negative Logit Probability</span>
                      <span className="text-rose-300">
                        {Math.round(sandboxResult.negativeScore * 100)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-rose-500 transition-all duration-300"
                        style={{ width: `${sandboxResult.negativeScore * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA to Adversarial Challenge */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-4">
                <div className="text-xs text-slate-300">
                  Ready to exploit sarcasm failure modes in DistilBERT?
                </div>
                <button
                  onClick={() => { sounds.playClick(); setActiveTab('adversarial'); }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-mono text-xs font-bold hover:bg-emerald-400 transition-colors shrink-0 flex items-center gap-1.5"
                >
                  Enter Sarcasm Gate
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Adversarial Sarcasm Challenge View */
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
                <ShieldAlert className="w-4 h-4" />
                Zone 3 Unlock Gate: Adversarial Sarcasm Subversion
              </div>
              <h3 className="font-cinzel text-xl font-bold text-white">
                The Sarcasm Paradox
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Standard sentiment classifiers often fail on sarcastic reviews because positive surface adjectives dominate lexical attention. Craft a <span className="text-amber-400 font-bold">genuinely negative review</span> using polite or sarcastic words without overt negative tokens that tricks DistilBERT into predicting <span className="text-emerald-400 font-bold">POSITIVE with &ge; 85% confidence</span>.
              </p>
            </div>

            {/* Rules & Banned Words Box */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Adversarial Rules:
              </span>
              <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                <li>Review must describe a genuinely terrible experience (e.g. ruined dinner, catastrophic flight, broken item).</li>
                <li>Cannot use overt negative tokens: <span className="text-rose-400 font-mono">bad, terrible, awful, worst, hate, horrible, poor, trash, useless, broken</span>.</li>
                <li>Model must predict <strong>POSITIVE</strong> with <strong>&ge; 85% confidence</strong>.</li>
              </ul>
            </div>

            {/* User Input Area */}
            <div className="space-y-3">
              <label className="text-xs font-mono text-slate-300 block">
                Your Sarcastic Review (e.g. praise the "masterpiece", "pure genius", "thrilled" to wait 3 hours for cold soup):
              </label>
              <textarea
                value={adversarialText}
                onChange={(e) => setAdversarialText(e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl bg-slate-900/90 border text-slate-100 font-mono text-sm focus:outline-none transition-all resize-none ${
                  detectedOvertNegative.length > 0
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-slate-700 focus:border-emerald-400'
                }`}
              />

              {/* Overt Negative Warning */}
              {detectedOvertNegative.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center gap-2 text-xs font-mono text-rose-300">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>
                    Banned negative keyword detected: <strong>"{detectedOvertNegative.join(', ')}"</strong>. Remove overt negative words to simulate subtle sarcasm!
                  </span>
                </div>
              )}
            </div>

            {/* Live Model Prediction Output */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">DistilBERT Predicted Sentiment:</span>
                <span className={`text-base font-bold ${
                  adversarialResult && adversarialResult.label === 'POSITIVE' && adversarialResult.positiveScore >= 0.85 && detectedOvertNegative.length === 0
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}>
                  {isClassifyingAdversarial
                    ? 'Classifying...'
                    : adversarialResult
                    ? `${adversarialResult.label} (${Math.round(adversarialResult.score * 100)}%)`
                    : 'Awaiting input...'}
                </span>
              </div>

              {/* Gauge */}
              <div className="h-3 rounded-full bg-slate-800 overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 ${
                    adversarialResult && adversarialResult.label === 'POSITIVE' && adversarialResult.positiveScore >= 0.85 && detectedOvertNegative.length === 0
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-amber-500 to-rose-400'
                  }`}
                  style={{
                    width: `${Math.max(5, Math.min(100, adversarialResult ? adversarialResult.positiveScore * 100 : 0))}%`
                  }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-500">
                  Required: POSITIVE &ge; 85%
                </span>
                {adversarialResult && adversarialResult.label === 'POSITIVE' && adversarialResult.positiveScore >= 0.85 && detectedOvertNegative.length === 0 ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Model Successfully Fooled! Sarcasm flaw exposed.
                  </span>
                ) : (
                  <span className="text-amber-400">
                    Model not yet convinced (&lt; 85% positive) or contains banned words.
                  </span>
                )}
              </div>
            </div>

            {/* Submit & Status Bar */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={handleValidateAdversarial}
                disabled={!adversarialResult || isClassifyingAdversarial}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-mono text-sm font-bold hover:bg-emerald-400 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-2"
              >
                Validate Sarcasm Gate
              </button>
            </div>

            {/* Advance to Zone 4 Button */}
            {isChallengePassed && (
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => { sounds.playClick(); onAdvance(); }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-mono text-sm font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  Advance to Zone 4: The Transformer Citadel
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
