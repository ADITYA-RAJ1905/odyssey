import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/audio';
import { nlpModelService, SimilarityResult } from '../../services/nlpModelService';
import { 
  CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Compass, 
  Send, RefreshCw, Cpu, Layers, GitCompare, ShieldAlert, Target
} from 'lucide-react';
import { ZoneTelemetry } from '../../types';

interface EmbeddingLagoonZoneProps {
  telemetry: ZoneTelemetry;
  onComplete: (score: number, timeSpentSec: number) => void;
  onAdvance: () => void;
}

const SAMPLE_PAIRS = [
  {
    label: 'Synonyms (Zero Overlap)',
    desc: 'Identical meaning, completely different vocabulary',
    sentA: 'The physician inspected the patient.',
    sentB: 'The doctor examined the sick person.'
  },
  {
    label: 'Syntactic Inversion',
    desc: 'Nearly 100% lexical overlap, but reversed agent roles',
    sentA: 'The clever dog chased the brown cat.',
    sentB: 'The clever cat chased the brown dog.'
  },
  {
    label: 'Unrelated Domains',
    desc: 'Quantum computing vs bakery',
    sentA: 'Quantum algorithms exploit superposition.',
    sentB: 'The baker baked a delicious chocolate cake.'
  }
];

const TARGET_ANCHOR = 'The server crashed due to an out-of-memory error';
const FORBIDDEN_WORDS = ['server', 'servers', 'crash', 'crashed', 'crashes', 'crashing', 'memory', 'memories', 'error', 'errors'];

export const EmbeddingLagoonZone: React.FC<EmbeddingLagoonZoneProps> = ({
  telemetry,
  onComplete,
  onAdvance
}) => {
  const [activeTab, setActiveTab] = useState<'sandbox' | 'challenge'>('sandbox');

  // Sandbox State
  const [sentenceA, setSentenceA] = useState<string>(SAMPLE_PAIRS[0].sentA);
  const [sentenceB, setSentenceB] = useState<string>(SAMPLE_PAIRS[0].sentB);
  const [sandboxResult, setSandboxResult] = useState<SimilarityResult>({
    similarity: 0.88,
    keywordOverlapPct: 15,
    isFallback: false
  });
  const [isComputingSandbox, setIsComputingSandbox] = useState<boolean>(false);

  // Challenge State
  const [userParaphrase, setUserParaphrase] = useState<string>('');
  const [challengeResult, setChallengeResult] = useState<SimilarityResult | null>(null);
  const [isComputingChallenge, setIsComputingChallenge] = useState<boolean>(false);
  const [detectedForbidden, setDetectedForbidden] = useState<string[]>([]);
  const [modelStatus, setModelStatus] = useState<string>('Loading all-MiniLM-L6-v2 (384-dim)...');

  const startTimeRef = useRef<number>(Date.now());
  const [attempts, setAttempts] = useState<number>(telemetry.attempts || 0);

  // Initialize embedding model
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      await nlpModelService.loadEmbeddingModel();
      if (!isMounted) return;
      setModelStatus('Xenova/all-MiniLM-L6-v2 Ready (384-dim Mean-Pooled)');
    };
    init();
    return () => { isMounted = false; };
  }, []);

  // Compute sandbox similarity
  useEffect(() => {
    let isMounted = true;
    const compute = async () => {
      if (!sentenceA.trim() || !sentenceB.trim()) return;
      setIsComputingSandbox(true);
      const res = await nlpModelService.computeSimilarity(sentenceA, sentenceB);
      if (!isMounted) return;
      setSandboxResult(res);
      setIsComputingSandbox(false);
    };

    const timer = setTimeout(compute, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [sentenceA, sentenceB]);

  // Handle challenge input changes & check forbidden keywords
  useEffect(() => {
    let isMounted = true;

    // Detect forbidden words
    const lower = userParaphrase.toLowerCase();
    const found = FORBIDDEN_WORDS.filter((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(lower);
    });
    setDetectedForbidden(found);

    if (userParaphrase.trim().length > 5) {
      setIsComputingChallenge(true);
      const timer = setTimeout(async () => {
        const res = await nlpModelService.computeSimilarity(TARGET_ANCHOR, userParaphrase);
        if (!isMounted) return;
        setChallengeResult(res);
        setIsComputingChallenge(false);
      }, 350);

      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    } else {
      setChallengeResult(null);
      setIsComputingChallenge(false);
    }
  }, [userParaphrase]);

  const handleValidateChallenge = () => {
    sounds.playClick();
    setAttempts((prev) => prev + 1);

    if (!challengeResult) return;

    const meetsThreshold = challengeResult.similarity >= 0.65;
    const noForbidden = detectedForbidden.length === 0;

    if (meetsThreshold && noForbidden) {
      sounds.playSuccess();
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      const score = Math.min(100, Math.round(challengeResult.similarity * 100) + 10);
      onComplete(score, elapsed);
    } else {
      sounds.playError();
    }
  };

  const isChallengePassed = telemetry.completed || (challengeResult && challengeResult.similarity >= 0.65 && detectedForbidden.length === 0);

  return (
    <div className="space-y-6">
      {/* Zone Header */}
      <div className="glass-panel p-6 rounded-2xl border-emerald-500/30 glow-emerald space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                Zone 02 · Natural Language Processing
              </div>
              <h2 className="font-cinzel text-2xl font-bold text-white">
                Embedding Lagoon: Dense Vector Space & Cosine Metric
              </h2>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-700">
            <button
              onClick={() => { sounds.playClick(); setActiveTab('sandbox'); }}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'sandbox'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Vector Similarity Sandbox
            </button>
            <button
              onClick={() => { sounds.playClick(); setActiveTab('challenge'); }}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'challenge'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Semantic Paraphrase Gate
              {isChallengePassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'sandbox' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input Text Prompts & Presets */}
          <div className="lg:col-span-6 space-y-5">
            <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <GitCompare className="w-4 h-4 text-emerald-400" />
                  Dual Sentence Comparator
                </span>
                <span className="text-[10px] font-mono text-emerald-400/80">
                  {modelStatus}
                </span>
              </div>

              {/* Presets */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Test Semantic vs. Lexical Contrasts:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SAMPLE_PAIRS.map((pair) => (
                    <button
                      key={pair.label}
                      onClick={() => {
                        sounds.playClick();
                        setSentenceA(pair.sentA);
                        setSentenceB(pair.sentB);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300 text-left transition-all"
                    >
                      <div className="text-xs font-bold font-mono">{pair.label}</div>
                      <div className="text-[10px] text-slate-500 truncate">{pair.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-mono text-emerald-400 block mb-1">
                    Sentence A (Anchor Vector):
                  </label>
                  <textarea
                    value={sentenceA}
                    onChange={(e) => setSentenceA(e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-400 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-cyan-400 block mb-1">
                    Sentence B (Candidate Vector):
                  </label>
                  <textarea
                    value={sentenceB}
                    onChange={(e) => setSentenceB(e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-400 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Theory Explanation */}
            <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <div className="font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                Cosine Metric vs. Jaccard Keyword Overlap
              </div>
              <p>
                Keyword search (TF-IDF / BM25) only measures matching words. Dense bi-encoder transformers like <code className="text-emerald-300">all-MiniLM-L6-v2</code> embed entire semantic concepts into normalized 384-dimensional hyperspheres.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-400 flex justify-between items-center">
                <span>Cosine Formula:</span>
                <span className="text-emerald-300 font-bold">cos(θ) = (u · v) / (||u|| ||v||)</span>
              </div>
            </div>
          </div>

          {/* Right: Live Vector Meter & Geometrics */}
          <div className="lg:col-span-6 space-y-5">
            <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
              <h3 className="font-cinzel text-lg font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-400" />
                Live High-Dimensional Metric
              </h3>

              {/* Main Cosine Similarity Gauge */}
              <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col items-center justify-center space-y-4">
                <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
                  Cosine Similarity Score
                </div>

                <div className="relative flex items-center justify-center">
                  <div className={`text-5xl font-mono font-extrabold transition-colors ${
                    sandboxResult.similarity >= 0.70
                      ? 'text-emerald-400'
                      : sandboxResult.similarity >= 0.40
                      ? 'text-cyan-400'
                      : sandboxResult.similarity >= 0.10
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}>
                    {sandboxResult.similarity >= 0 ? `+${sandboxResult.similarity.toFixed(2)}` : sandboxResult.similarity.toFixed(2)}
                  </div>
                </div>

                {/* Meter Bar */}
                <div className="w-full space-y-1.5">
                  <div className="h-3 rounded-full bg-slate-800 overflow-hidden relative">
                    <div
                      className={`h-full transition-all duration-300 ${
                        sandboxResult.similarity >= 0.70
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : sandboxResult.similarity >= 0.40
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-400'
                          : 'bg-gradient-to-r from-amber-500 to-rose-400'
                      }`}
                      style={{
                        width: `${Math.max(5, Math.min(100, ((sandboxResult.similarity + 1) / 2) * 100))}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>-1.00 (Opposite)</span>
                    <span>0.00 (Orthogonal)</span>
                    <span>+1.00 (Identical)</span>
                  </div>
                </div>

                {/* Comparison Card: Lexical vs Semantic */}
                <div className="w-full grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <div className="text-[10px] font-mono uppercase text-slate-500">Keyword Overlap</div>
                    <div className="text-xl font-mono font-bold text-slate-300">
                      {sandboxResult.keywordOverlapPct}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <div className="text-[10px] font-mono uppercase text-slate-500">Semantic Proximity</div>
                    <div className="text-xl font-mono font-bold text-emerald-400">
                      {Math.round(Math.max(0, sandboxResult.similarity) * 100)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Ready to Advance CTA */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-4">
                <div className="text-xs text-slate-300">
                  Ready to test zero-lexical semantic paraphrasing?
                </div>
                <button
                  onClick={() => { sounds.playClick(); setActiveTab('challenge'); }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-mono text-xs font-bold hover:bg-emerald-400 transition-colors shrink-0 flex items-center gap-1.5"
                >
                  Enter Paraphrase Challenge
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Challenge View: Paraphrase Gate */
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
                <Target className="w-4 h-4" />
                Zone 2 Unlock Gate: Zero-Noun/Verb Semantic Paraphrase
              </div>
              <h3 className="font-cinzel text-xl font-bold text-white">
                The Paraphrase Crucible
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Rewrite the target sentence so it conveys the exact same technical failure, but using <span className="text-rose-400 font-bold">zero blacklisted words</span> while still scoring <span className="text-emerald-400 font-bold">&gt; 0.65 Cosine Similarity</span>.
              </p>
            </div>

            {/* Target Anchor Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Target Anchor Sentence:
              </span>
              <div className="text-base font-mono font-bold text-emerald-300">
                "{TARGET_ANCHOR}"
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono text-slate-400">
                <span>Forbidden Tokens:</span>
                {['server', 'crashed', 'memory', 'error'].map((w) => (
                  <span key={w} className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300">
                    {w}
                  </span>
                ))}
              </div>
            </div>

            {/* Player Input Area */}
            <div className="space-y-3">
              <label className="text-xs font-mono text-slate-300 block">
                Your Paraphrase (e.g. use terms like <span className="text-cyan-300">machine, system, host, stopped, halted, RAM, capacity, exhausted, exceeded</span>):
              </label>
              <textarea
                value={userParaphrase}
                onChange={(e) => setUserParaphrase(e.target.value)}
                rows={3}
                placeholder="e.g. The machine ceased functioning because RAM capacity was completely exhausted."
                className={`w-full px-4 py-3 rounded-xl bg-slate-900/90 border text-slate-100 font-mono text-sm focus:outline-none transition-all resize-none ${
                  detectedForbidden.length > 0
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-slate-700 focus:border-emerald-400'
                }`}
              />

              {/* Forbidden Warning */}
              {detectedForbidden.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center gap-2 text-xs font-mono text-rose-300">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>
                    Forbidden keyword detected: <strong>"{detectedForbidden.join(', ')}"</strong>. Replace this term to proceed.
                  </span>
                </div>
              )}
            </div>

            {/* Live Similarity Gauge for Challenge */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Live MiniLM Cosine Similarity:</span>
                <span className={`text-base font-bold ${
                  challengeResult && challengeResult.similarity >= 0.65 && detectedForbidden.length === 0
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}>
                  {isComputingChallenge ? 'Computing...' : challengeResult ? challengeResult.similarity.toFixed(2) : '0.00'} / Target &gt; 0.65
                </span>
              </div>

              <div className="h-3 rounded-full bg-slate-800 overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 ${
                    challengeResult && challengeResult.similarity >= 0.65 && detectedForbidden.length === 0
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-amber-500 to-rose-400'
                  }`}
                  style={{
                    width: `${Math.max(5, Math.min(100, challengeResult ? ((challengeResult.similarity + 1) / 2) * 100 : 0))}%`
                  }}
                />
              </div>

              {challengeResult && (
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-slate-500">
                    Keyword Overlap: {challengeResult.keywordOverlapPct}%
                  </span>
                  {challengeResult.similarity >= 0.65 && detectedForbidden.length === 0 ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Condition Met! Threshold passed.
                    </span>
                  ) : (
                    <span className="text-amber-400">
                      Need similarity &ge; 0.65 and zero blacklisted keywords
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Submit & Status Bar */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={handleValidateChallenge}
                disabled={!challengeResult || isComputingChallenge}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-mono text-sm font-bold hover:bg-emerald-400 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-2"
              >
                Validate Paraphrase Gate
              </button>
            </div>

            {/* Advance to Zone 3 Button */}
            {isChallengePassed && (
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => { sounds.playClick(); onAdvance(); }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-mono text-sm font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  Advance to Zone 3: Sentiment Gorge
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
