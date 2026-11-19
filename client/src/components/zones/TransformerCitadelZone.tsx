import React, { useState, useRef } from 'react';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Trophy, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, 
  MessageSquareCode, ShieldAlert, Award, Compass, Layers, Network 
} from 'lucide-react';
import { ZoneTelemetry } from '../../types';

interface TransformerCitadelZoneProps {
  telemetry: ZoneTelemetry;
  onComplete: (score: number, timeSpentSec: number) => void;
  onAdvance: () => void;
}

interface Question {
  id: string;
  topic: string;
  title: string;
  scenario: string;
  options: Array<{
    id: string;
    text: string;
    rationale: string;
    isCorrect: boolean;
  }>;
}

const BOSS_QUESTIONS: Question[] = [
  {
    id: 'nlp_bq1',
    topic: 'Self-Attention vs. Recurrent Architectures',
    title: 'Trial 1: The Architectural Paradigm Shift',
    scenario: 'In legacy NLP architectures (such as RNNs, LSTMs, and GRUs), sentences were processed strictly sequentially: token t relied on the hidden state of token t-1. In 2017, the Transformer architecture ("Attention Is All You Need") completely displaced recurrent networks. What is the fundamental theoretical and computational reason Self-Attention superseded recurrent models?',
    options: [
      {
        id: 'opt1',
        text: 'Self-Attention computes direct pairwise connections between all tokens in a sequence simultaneously in O(1) path length, completely eliminating sequential recurrent bottlenecks and enabling massive parallelization across GPU tensor cores.',
        rationale: 'Correct! Self-Attention computes Q, K, V projections in parallel across the entire sequence length at once, eliminating sequential recurrent dependency and solving vanishing gradient degradation across long-distance contexts.',
        isCorrect: true
      },
      {
        id: 'opt2',
        text: 'Self-Attention converts natural language into binary Huffman code, compressing text files by 99% before training.',
        rationale: 'Incorrect. Self-attention is a dense matrix transformation, not a data compression algorithm.',
        isCorrect: false
      },
      {
        id: 'opt3',
        text: 'LSTMs were mathematically deprecated because backpropagation through time cannot calculate derivatives of non-linear activations.',
        rationale: 'Incorrect. Backpropagation through time works mathematically for RNNs, but gradient vanishing/exploding and lack of parallelization caused severe scaling bottlenecks.',
        isCorrect: false
      },
      {
        id: 'opt4',
        text: 'Transformers are restricted to short sequences of 10 words or fewer, making them faster than RNNs.',
        rationale: 'Incorrect. Transformers scale to contexts of hundreds of thousands of tokens; RNNs struggle with long contexts.',
        isCorrect: false
      }
    ]
  },
  {
    id: 'nlp_bq2',
    topic: 'Semantic Search & Retrieval Pipeline',
    title: 'Trial 2: Million-Scale Semantic Search Architecture',
    scenario: 'You are tasked with building a sub-second search engine across 10 million technical documentation articles and maritime survivor transmissions. Users submit complex, ambiguous queries like "emergency transceiver battery corrosion". Which architecture delivers the optimal balance of millisecond query latency and deep semantic understanding?',
    options: [
      {
        id: 'opt1',
        text: 'A two-stage retrieval pipeline: Pre-index document chunks as dense vectors using a Bi-Encoder (e.g. sentence-transformers) in an approximate nearest neighbor index (FAISS/HNSW) for sub-10ms top-100 candidate retrieval, then rerank the top candidates using a heavy Cross-Encoder for deep joint query-document cross-attention.',
        rationale: 'Correct! Bi-Encoders allow pre-computing embeddings offline for instant ANN vector search, while Cross-Encoders evaluate query and document simultaneously with full token-to-token attention for maximum reranking precision on candidate subsets.',
        isCorrect: true
      },
      {
        id: 'opt2',
        text: 'Pass all 10,000,000 documents through a Cross-Encoder sequentially in real-time during each incoming user query.',
        rationale: 'Incorrect. Evaluating 10 million documents through a Cross-Encoder during an interactive query would take hours and cost millions in compute.',
        isCorrect: false
      },
      {
        id: 'opt3',
        text: 'Exact substring matching (grep / SQL LIKE) alone, because dense neural vectors cannot represent technical terminology.',
        rationale: 'Incorrect. Keyword matching fails whenever queries use synonyms, paraphrases, or conceptual descriptions without exact keyword overlap.',
        isCorrect: false
      },
      {
        id: 'opt4',
        text: 'Train a single Perceptron on raw character ASCII values without token embeddings or vector indices.',
        rationale: 'Incorrect. A single perceptron has no sequence awareness, no semantic representation, and cannot perform search.',
        isCorrect: false
      }
    ]
  },
  {
    id: 'nlp_bq3',
    topic: 'Context Window Truncation & Hallucination',
    title: 'Trial 3: Long-Horizon Dialogue Degradation',
    scenario: 'An autonomous archipelago navigation copilot powered by a 4k-token LLM performs accurately during initial exchanges. However, during an extended multi-day voyage with a long continuous conversational history, it suddenly invents fictional navigation coordinates and hallucinated archipelago laws. Telemetry reveals the total prompt length reached 4,200 tokens. What is the diagnosis and proper engineering remedy?',
    options: [
      {
        id: 'opt1',
        text: 'Context Window Truncation: The input stream exceeded the model’s fixed context window, silently truncating the foundational system instructions and maritime safety guardrails; resolve by implementing dynamic sliding-window summarization and RAG retrieval of relevant context chunks rather than raw prompt appending.',
        rationale: 'Correct! When prompt tokens exceed context limits, earlier prompt tokens (often containing system instructions and ground-truth knowledge) are discarded or truncated, leading to ungrounded hallucination. A RAG pipeline with semantic chunking and conversation summarization prevents this.',
        isCorrect: true
      },
      {
        id: 'opt2',
        text: 'Hardware Memory Leak: The server GPU tensor cores became permanently magnetized; resolve by physically power-cycling the host machine.',
        rationale: 'Incorrect. The model’s hallucination is algorithmic context truncation, not hardware magnetization.',
        isCorrect: false
      },
      {
        id: 'opt3',
        text: 'Learning Rate Drift: The model was unintentionally fine-tuning itself on user keystrokes in real-time; resolve by setting optimizer learning rate to zero.',
        rationale: 'Incorrect. Standard LLM inference does not update model weights; context limits are an inference-time token constraint.',
        isCorrect: false
      },
      {
        id: 'opt4',
        text: 'Tokenizer Decryption Failure: The BPE tokenizer ran out of unique integer IDs; resolve by switching from UTF-8 to UTF-16.',
        rationale: 'Incorrect. Tokenizer vocabulary size is static and fixed at build time; it does not "run out" of IDs.',
        isCorrect: false
      }
    ]
  }
];

export const TransformerCitadelZone: React.FC<TransformerCitadelZoneProps> = ({
  telemetry,
  onComplete,
  onAdvance
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [answersState, setAnswersState] = useState<Record<number, boolean>>({});
  const [trialCompleted, setTrialCompleted] = useState<boolean>(telemetry.completed || false);

  const startTimeRef = useRef<number>(Date.now());
  const [attempts, setAttempts] = useState<number>(telemetry.attempts || 0);

  const currentQ = BOSS_QUESTIONS[currentQuestionIndex];
  const selectedOption = currentQ.options.find((o) => o.id === selectedOptionId);

  const handleSubmitQuestion = () => {
    if (!selectedOptionId) return;
    sounds.playClick();
    setSubmitted(true);

    const isCorrect = selectedOption?.isCorrect || false;
    setAnswersState((prev) => ({ ...prev, [currentQuestionIndex]: isCorrect }));

    if (isCorrect) {
      sounds.playSuccess();
    } else {
      sounds.playError();
      setAttempts((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    sounds.playClick();
    setSelectedOptionId(null);
    setSubmitted(false);

    if (currentQuestionIndex < BOSS_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Trial complete!
      setTrialCompleted(true);
      sounds.playRelic();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      const score = Math.max(80, 100 - (attempts * 5));
      onComplete(score, elapsed);
    }
  };

  const handleRetryQuestion = () => {
    sounds.playClick();
    setSelectedOptionId(null);
    setSubmitted(false);
  };

  return (
    <div className="space-y-6">
      {/* Zone Header */}
      <div className="glass-panel p-6 rounded-2xl border-emerald-500/30 glow-emerald space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <MessageSquareCode className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                Zone 04 · Natural Language Processing · Boss Diagnostic Trial
              </div>
              <h2 className="font-cinzel text-2xl font-bold text-white">
                The Transformer Citadel: Attention, Retrieval & Robustness
              </h2>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center gap-2">
            {BOSS_QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center transition-all ${
                  trialCompleted || answersState[i]
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
                    : i === currentQuestionIndex
                    ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/40'
                    : 'bg-slate-900 border border-slate-800 text-slate-500'
                }`}
              >
                {trialCompleted || answersState[i] ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {!trialCompleted ? (
        /* Question Trial Interface */
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-5">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                {currentQ.topic}
              </span>
              <span className="text-xs font-mono text-slate-500">
                Diagnostic {currentQuestionIndex + 1} of {BOSS_QUESTIONS.length}
              </span>
            </div>

            {/* Question Details */}
            <div>
              <h3 className="font-cinzel text-xl font-bold text-white mb-2">
                {currentQ.title}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                {currentQ.scenario}
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                let borderClass = 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-300';

                if (submitted) {
                  if (opt.isCorrect) {
                    borderClass = 'border-emerald-500 bg-emerald-500/15 text-white';
                  } else if (isSelected && !opt.isCorrect) {
                    borderClass = 'border-rose-500 bg-rose-500/15 text-rose-200';
                  }
                } else if (isSelected) {
                  borderClass = 'border-emerald-500 bg-emerald-500/10 text-white';
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (!submitted) {
                        sounds.playClick();
                        setSelectedOptionId(opt.id);
                      }
                    }}
                    disabled={submitted}
                    className={`w-full text-left p-4 rounded-xl border transition-all text-xs leading-relaxed flex items-start gap-3 ${borderClass}`}
                  >
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px] font-bold">
                      {opt.id.slice(-1).toUpperCase()}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback & Rationale */}
            {submitted && selectedOption && (
              <div
                className={`p-4 rounded-xl border space-y-2 text-xs leading-relaxed animate-in fade-in duration-200 ${
                  selectedOption.isCorrect
                    ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/50 border-rose-500/50 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold font-mono">
                  {selectedOption.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Diagnostic Confirmed
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Diagnostic Inconclusive
                    </>
                  )}
                </div>
                <p>{selectedOption.rationale}</p>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-xs font-mono text-slate-500">
                Attempts: {attempts}
              </span>

              <div className="flex items-center gap-3">
                {!submitted ? (
                  <button
                    onClick={handleSubmitQuestion}
                    disabled={!selectedOptionId}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-mono text-xs font-bold hover:bg-emerald-400 disabled:opacity-40 disabled:pointer-events-none transition-all"
                  >
                    Submit Diagnostic
                  </button>
                ) : selectedOption?.isCorrect ? (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-mono text-xs font-bold hover:bg-emerald-400 transition-all flex items-center gap-1.5"
                  >
                    {currentQuestionIndex < BOSS_QUESTIONS.length - 1 ? (
                      <>
                        Next Trial
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Complete Island 4 Boss Trial
                        <Trophy className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleRetryQuestion}
                    className="px-6 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs font-bold hover:bg-slate-700 transition-all"
                  >
                    Retry Trial
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Victory & Relic Conferred Screen */
        <div className="max-w-2xl mx-auto glass-panel p-8 rounded-3xl border-emerald-500/40 glow-emerald text-center space-y-6">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-400 mb-2">
            <Trophy className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              Boss Trial Mastered · Island 4 Conquered
            </div>
            <h3 className="font-cinzel text-3xl font-bold text-white">
              The Echo Stone Unlocked
            </h3>
            <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              You have mastered subword tokenization, high-dimensional vector spaces, multi-head self-attention, and sarcasm failure modes. The fourth relic of the Meridian Archipelago is now yours.
            </p>
          </div>

          {/* Relic Card */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 max-w-md mx-auto text-left flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0">
              <MessageSquareCode className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                Ancient Relic Conferred
              </div>
              <div className="font-cinzel text-lg font-bold text-white">
                The Echo Stone
              </div>
              <div className="text-xs text-slate-400">
                Decodes hidden intent, sarcasm, and high-dimensional semantic vectors across stranded transmissions.
              </div>
            </div>
          </div>

          {/* Navigation Action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => { sounds.playClick(); onAdvance(); }}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-mono text-sm font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              Set Sail for Island 5: The Decision
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
