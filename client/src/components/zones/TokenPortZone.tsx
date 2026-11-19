import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/audio';
import { nlpModelService, TokenItem } from '../../services/nlpModelService';
import { 
  CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Hash, 
  Cpu, Type, Layers, RefreshCw, HelpCircle, Binary 
} from 'lucide-react';
import { ZoneTelemetry } from '../../types';

interface TokenPortZoneProps {
  telemetry: ZoneTelemetry;
  onComplete: (score: number, timeSpentSec: number) => void;
  onAdvance: () => void;
}

const PRESET_SNIPPETS = [
  { label: 'Strawberry', text: 'strawberry' },
  { label: 'Code & Numbers', text: 'const memoryUsage = 38192;' },
  { label: 'Compound Words', text: 'unbelievable archipelago adventures 🚀' },
  { label: 'Long Word', text: 'antidisestablishmentarianism' }
];

const TOKEN_COLORS = [
  'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
  'bg-cyan-950/80 border-cyan-500/50 text-cyan-300',
  'bg-purple-950/80 border-purple-500/50 text-purple-300',
  'bg-amber-950/80 border-amber-500/50 text-amber-300',
  'bg-rose-950/80 border-rose-500/50 text-rose-300',
  'bg-indigo-950/80 border-indigo-500/50 text-indigo-300'
];

export const TokenPortZone: React.FC<TokenPortZoneProps> = ({
  telemetry,
  onComplete,
  onAdvance
}) => {
  const [activeTab, setActiveTab] = useState<'teach' | 'test'>('teach');

  // Teach Sandbox State
  const [inputText, setInputText] = useState<string>('strawberry');
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [charCount, setCharCount] = useState<number>(10);
  const [compressionRatio, setCompressionRatio] = useState<number>(2.5);
  const [isTokenizing, setIsTokenizing] = useState<boolean>(false);
  const [modelStatus, setModelStatus] = useState<string>('Initializing tokenizer...');

  // Test Gate State
  const [testAnswers, setTestAnswers] = useState<{
    q1: string | null;
    q2: string | null;
    q3: string | null;
  }>({ q1: null, q2: null, q3: null });
  const [testSubmitted, setTestSubmitted] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const [attempts, setAttempts] = useState<number>(telemetry.attempts || 0);

  // Initialize and run tokenization
  useEffect(() => {
    let isMounted = true;
    const runTokenize = async () => {
      setIsTokenizing(true);
      await nlpModelService.loadTokenizer();
      if (!isMounted) return;
      const res = await nlpModelService.tokenize(inputText);
      if (!isMounted) return;
      setTokens(res.tokens);
      setCharCount(res.charCount);
      setCompressionRatio(res.compressionRatio);
      setIsTokenizing(false);
      setModelStatus('Tokenizer ready (DistilBERT WordPiece)');
    };

    runTokenize();

    return () => {
      isMounted = false;
    };
  }, [inputText]);

  const handlePreset = (snippet: string) => {
    sounds.playClick();
    setInputText(snippet);
  };

  // Test verification
  const handleTestSubmit = () => {
    sounds.playClick();
    setTestSubmitted(true);
    setAttempts((prev) => prev + 1);

    const isQ1Correct = testAnswers.q1 === 'a';
    const isQ2Correct = testAnswers.q2 === 'a';
    const isQ3Correct = testAnswers.q3 === 'a';

    const allCorrect = isQ1Correct && isQ2Correct && isQ3Correct;

    if (allCorrect) {
      sounds.playSuccess();
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      const score = Math.max(70, 100 - (attempts * 10));
      onComplete(score, elapsed);
    } else {
      sounds.playError();
    }
  };

  const isZoneCompleted = telemetry.completed || (testSubmitted && testAnswers.q1 === 'a' && testAnswers.q2 === 'a' && testAnswers.q3 === 'a');

  return (
    <div className="space-y-6">
      {/* Zone Header */}
      <div className="glass-panel p-6 rounded-2xl border-emerald-500/30 glow-emerald space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Type className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                Zone 01 · Natural Language Processing
              </div>
              <h2 className="font-cinzel text-2xl font-bold text-white">
                Token Port: Subwords, Vocabularies & Context Limits
              </h2>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-700">
            <button
              onClick={() => { sounds.playClick(); setActiveTab('teach'); }}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'teach'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Interactive Sandbox
            </button>
            <button
              onClick={() => { sounds.playClick(); setActiveTab('test'); }}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'test'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Unlock Gate
              {isZoneCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'teach' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Input & Controls */}
          <div className="lg:col-span-5 space-y-5">
            <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-emerald-400" />
                  Tokenizer Input Stream
                </span>
                <span className="text-[11px] font-mono text-emerald-400/80">
                  {modelStatus}
                </span>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">
                  Type any text (compound words, emojis, numbers, or code):
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all resize-none"
                  placeholder="Enter text to tokenize..."
                />
              </div>

              {/* Quick Snippet Presets */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Curated Tokenization Presets:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_SNIPPETS.map((snippet) => (
                    <button
                      key={snippet.label}
                      onClick={() => handlePreset(snippet.text)}
                      className={`px-3 py-2 rounded-lg text-xs font-mono text-left transition-all border ${
                        inputText === snippet.text
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {snippet.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Telemetry Metrics */}
              <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-[10px] font-mono uppercase text-slate-500">Characters</div>
                  <div className="text-lg font-bold font-mono text-white">{charCount}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-[10px] font-mono uppercase text-slate-500">Total Tokens</div>
                  <div className="text-lg font-bold font-mono text-emerald-400">{tokens.length}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-[10px] font-mono uppercase text-slate-500">Ratio</div>
                  <div className="text-lg font-bold font-mono text-cyan-400">{compressionRatio} c/t</div>
                </div>
              </div>
            </div>

            {/* Conceptual Guide Card */}
            <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                <Binary className="w-4 h-4" />
                How WordPiece & BPE Tokenization Works
              </div>
              <p>
                Neural networks cannot read raw ASCII text strings. Before reaching the Transformer, text is mapped into integer token IDs using a finite vocabulary dictionary (~30,000 to 100,000 subwords).
              </p>
              <p>
                Tokens beginning with <code className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-mono text-[11px]">##</code> represent subword continuation fragments, ensuring unknown or rare words can be represented without generating out-of-vocabulary <code className="text-amber-400">[UNK]</code> tokens.
              </p>
            </div>
          </div>

          {/* Right: Live Token Chip Inspector */}
          <div className="lg:col-span-7 space-y-5">
            <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-cinzel text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  Vocabulary Tensor Breakdown
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {tokens.filter(t => t.isSubword).length} subword splits
                </span>
              </div>

              {/* Token Chips Display */}
              <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 min-h-[160px] flex flex-wrap gap-2.5 items-center content-start">
                {isTokenizing ? (
                  <div className="w-full flex items-center justify-center py-10 text-slate-400 font-mono text-xs gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    Tokenizing input stream...
                  </div>
                ) : tokens.length === 0 ? (
                  <div className="w-full text-center py-10 text-slate-500 font-mono text-xs">
                    Type text on the left to see live token IDs
                  </div>
                ) : (
                  tokens.map((token, idx) => (
                    <div
                      key={`${token.id}-${idx}`}
                      className={`px-3 py-2 rounded-xl border flex flex-col items-center gap-1 transition-transform hover:scale-105 shadow-sm ${
                        TOKEN_COLORS[token.colorIndex % TOKEN_COLORS.length]
                      }`}
                    >
                      <span className="font-mono text-sm font-bold">
                        {token.text}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono opacity-80">
                          ID: {token.id}
                        </span>
                        {token.isSubword && (
                          <span className="text-[9px] px-1 rounded bg-black/40 font-mono uppercase">
                            subword
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Sequence Embedding Preview */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Input Tensor Dimensions</span>
                  <span className="text-emerald-400">
                    [Batch: 1, Sequence: {tokens.length}, Hidden Dim: 768]
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden flex">
                  {tokens.map((_, i) => (
                    <div
                      key={i}
                      className="h-full flex-1 border-r border-slate-900"
                      style={{
                        backgroundColor: i % 2 === 0 ? '#10b981' : '#06b6d4',
                        opacity: 0.6 + (i / Math.max(1, tokens.length)) * 0.4
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Advance to Test Banner */}
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-4">
              <div className="text-xs text-slate-300">
                Ready to verify your understanding of subword vocabulary and context limits?
              </div>
              <button
                onClick={() => { sounds.playClick(); setActiveTab('test'); }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-mono text-xs font-bold hover:bg-emerald-400 transition-colors shrink-0 flex items-center gap-1.5"
              >
                Go to Unlock Gate
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Test Gate View */
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-5">
            <div>
              <h3 className="font-cinzel text-xl font-bold text-white mb-1">
                Zone 1 Unlock Gate: Tokenization Diagnostics
              </h3>
              <p className="text-xs text-slate-400">
                Answer all 3 practical tokenization challenges correctly to unlock Zone 2.
              </p>
            </div>

            {/* Question 1: Strawberry puzzle */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold text-emerald-400">
                Challenge 1 of 3: The "Strawberry" Subword Riddle
              </span>
              <p className="text-sm text-slate-200">
                Why do modern Large Language Models frequently fail when asked to count the exact number of times the letter "r" appears in the word "strawberry"?
              </p>
              <div className="space-y-2 text-xs">
                {[
                  {
                    id: 'a',
                    text: 'Because tokenizers fragment words into multi-character subwords (like "straw" + "##berry"), meaning the neural network processes high-dimensional token vectors rather than an array of individual letters.'
                  },
                  {
                    id: 'b',
                    text: 'Because attention heads are mathematically prohibited from inspecting consonants and only process vowels.'
                  },
                  {
                    id: 'c',
                    text: 'Because the embedding dictionary only contains 26 tokens total, causing letter collisions.'
                  }
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      testAnswers.q1 === opt.id
                        ? 'bg-emerald-500/15 border-emerald-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="q1"
                      checked={testAnswers.q1 === opt.id}
                      onChange={() => setTestAnswers((prev) => ({ ...prev, q1: opt.id }))}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <span>{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 2: Numeric tokenization */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold text-emerald-400">
                Challenge 2 of 3: Numbers & Vocabulary Explosion
              </span>
              <p className="text-sm text-slate-200">
                Why does entering a number like <code className="px-1.5 py-0.5 rounded bg-slate-950 font-mono text-emerald-300">38192</code> consume multiple tokens while common English words consume only 1 token?
              </p>
              <div className="space-y-2 text-xs">
                {[
                  {
                    id: 'a',
                    text: 'Tokenizers optimize vocabulary size against text frequency; common words earn dedicated single-token IDs, while arbitrary numbers are fragmented into arbitrary chunks of 1 to 3 digits.'
                  },
                  {
                    id: 'b',
                    text: 'Numbers require floating-point IEEE-754 binary conversion before the model can compute cross-entropy.'
                  },
                  {
                    id: 'c',
                    text: 'Because integers are represented in reverse Polish notation inside Transformer embeddings.'
                  }
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      testAnswers.q2 === opt.id
                        ? 'bg-emerald-500/15 border-emerald-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="q2"
                      checked={testAnswers.q2 === opt.id}
                      onChange={() => setTestAnswers((prev) => ({ ...prev, q2: opt.id }))}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <span>{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 3: Context window limits */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold text-emerald-400">
                Challenge 3 of 3: Context Window Budgeting
              </span>
              <p className="text-sm text-slate-200">
                You are designing an AI agent with an 8,192 (8k) token context window. If a user submits a 4,000-word document, how much of your total context budget is typically consumed?
              </p>
              <div className="space-y-2 text-xs">
                {[
                  {
                    id: 'a',
                    text: 'Approximately 5,200 to 5,500 tokens (~1.3 tokens per English word), consuming over 65% of the total 8k context window.'
                  },
                  {
                    id: 'b',
                    text: 'Exactly 4,000 tokens, because tokenizers have a 1:1 parity with whitespace words in English.'
                  },
                  {
                    id: 'c',
                    text: 'Less than 1,000 tokens due to lossy prompt compression algorithms built into self-attention.'
                  }
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      testAnswers.q3 === opt.id
                        ? 'bg-emerald-500/15 border-emerald-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="q3"
                      checked={testAnswers.q3 === opt.id}
                      onChange={() => setTestAnswers((prev) => ({ ...prev, q3: opt.id }))}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <span>{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit & Status Bar */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={handleTestSubmit}
                disabled={!testAnswers.q1 || !testAnswers.q2 || !testAnswers.q3}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-mono text-sm font-bold hover:bg-emerald-400 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-2"
              >
                Validate Diagnostics
              </button>

              {testSubmitted && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  {testAnswers.q1 === 'a' && testAnswers.q2 === 'a' && testAnswers.q3 === 'a' ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      All 3 challenges verified! Zone 2 Unlocked.
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      One or more answers are incorrect. Review and retry!
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Advance Button */}
            {isZoneCompleted && (
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => { sounds.playClick(); onAdvance(); }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-mono text-sm font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  Advance to Zone 2: Embedding Lagoon
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
