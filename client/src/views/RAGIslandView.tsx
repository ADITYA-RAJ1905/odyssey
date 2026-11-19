import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { RAGQuestion, RAGPreset, RAGIngestResult, RAGEvalResult } from '../types';
import { sounds } from '../utils/audio';
import { 
  BookOpen, ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, 
  Globe, Database, Search, ArrowRight, ShieldCheck, Trophy, Sparkles, ExternalLink, Cpu 
} from 'lucide-react';

export const RAGIslandView: React.FC = () => {
  const { profile, refreshProfile, conquerIsland, navigateTo } = useGame();
  const [urlInput, setUrlInput] = useState<string>('https://en.wikipedia.org/wiki/Deep_Blue_(chess_computer)');
  const [presets, setPresets] = useState<RAGPreset[]>([]);
  const [ingestData, setIngestData] = useState<RAGIngestResult | null>(null);
  const [ingesting, setIngesting] = useState<boolean>(false);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  
  // Selected question & answer
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [evalResult, setEvalResult] = useState<RAGEvalResult | null>(null);
  const [showChunks, setShowChunks] = useState<boolean>(false);

  const isConquered = profile?.conquered_islands?.includes(6);
  const islandScore = profile?.island_scores?.rag || 0;

  // Load presets on mount
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const res = await fetch('/api/islands/rag/presets');
        if (res.ok) {
          const data = await res.json();
          setPresets(data);
        }
      } catch (err) {
        console.error('Failed to fetch RAG presets:', err);
      }
    };
    fetchPresets();
    handleIngest('https://en.wikipedia.org/wiki/Deep_Blue_(chess_computer)');
  }, []);

  const handleIngest = async (urlToIngest = urlInput) => {
    if (!urlToIngest || urlToIngest.trim().length < 4) return;
    setIngesting(true);
    setEvalResult(null);
    setSelectedAnswer('');
    setActiveQuestionIdx(0);

    try {
      sounds.playRadar();
      const res = await fetch('/api/islands/rag/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToIngest })
      });

      if (res.ok) {
        const data = await res.json();
        setIngestData(data);
        sounds.playSelect();
        if (data.questions && data.questions.length > 0 && data.questions[0].options) {
          setSelectedAnswer(data.questions[0].options[0]);
        }
      } else {
        sounds.playError();
      }
    } catch (err) {
      console.error('URL ingestion failed:', err);
      sounds.playError();
    } finally {
      setIngesting(false);
    }
  };

  const handleSelectPreset = (presetUrl: string) => {
    setUrlInput(presetUrl);
    handleIngest(presetUrl);
  };

  const handleSubmitAnswer = async () => {
    if (!ingestData || !ingestData.questions || ingestData.questions.length === 0) return;
    const currentQ = ingestData.questions[activeQuestionIdx];
    if (!currentQ || !selectedAnswer) return;

    setEvaluating(true);
    try {
      const res = await fetch('/api/islands/rag/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: currentQ.id,
          player_answer: selectedAnswer,
          time_taken: 8.0
        })
      });

      if (res.ok) {
        const data = await res.json();
        setEvalResult(data);
        await refreshProfile();

        if (data.is_correct) {
          sounds.playSuccess();
        } else {
          sounds.playError();
        }
      }
    } catch (err) {
      console.error('Answer evaluation failed:', err);
      sounds.playError();
    } finally {
      setEvaluating(false);
    }
  };

  const handleClaimRelic = async () => {
    await conquerIsland(6);
    sounds.playRelic();
  };

  const currentQuestion: RAGQuestion | undefined = ingestData?.questions?.[activeQuestionIdx];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel px-6 py-4 rounded-2xl border-indigo-500/30 glow-violet">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateTo('map')}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-indigo-400 text-slate-300 hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400">
                Island 06 • Retrieval-Augmented Generation
              </span>
              {isConquered && (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> RELIC CLAIMED
                </span>
              )}
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              <span>The Archive</span>
            </h1>
          </div>
        </div>

        {/* Score & Controls */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 bg-indigo-950/50 border border-indigo-500/30 rounded-xl text-right">
            <div className="text-[10px] font-mono text-indigo-400 uppercase">Island Score</div>
            <div className="font-mono font-bold text-indigo-200 text-base">{islandScore} PTS</div>
          </div>
          <button
            onClick={() => handleIngest(urlInput)}
            disabled={ingesting}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-400 text-slate-300 hover:text-indigo-300 transition-colors"
            title="Re-Index Current URL"
          >
            <RefreshCw className={`w-4 h-4 ${ingesting ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* URL INGESTION CONSOLE */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-wider font-semibold">
            <Globe className="w-4 h-4" />
            <span>Target Web Knowledge Ingestion</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Paste ANY URL or click a preset below
          </span>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://en.wikipedia.org/wiki/..."
              disabled={ingesting}
              className="w-full pl-4 pr-4 py-3.5 bg-slate-950/90 border border-slate-700 focus:border-indigo-400 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>
          <button
            onClick={() => handleIngest(urlInput)}
            disabled={ingesting || !urlInput.trim()}
            className="px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {ingesting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>INDEXING FAISS...</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                <span>INGEST & GENERATE QUESTIONS</span>
              </>
            )}
          </button>
        </div>

        {/* Presets Row */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-mono text-slate-400">
            Fast 1-Click Presets:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.url)}
                disabled={ingesting}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  urlInput === p.url
                    ? 'bg-indigo-500/20 border-indigo-400 text-white shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-xs text-indigo-300">{p.title}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.category}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN RAG ARENA */}
      {ingesting ? (
        <div className="glass-panel p-16 rounded-2xl text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="font-cinzel text-lg font-bold text-white">
              Parsing & Vectorizing Webpage
            </h3>
            <p className="text-slate-400 font-mono text-xs">
              Decomposing HTML $\to$ Semantic Overlap Chunking $\to$ FAISS IndexFlatIP Embedding...
            </p>
          </div>
        </div>
      ) : ingestData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Questions & Interaction */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Question Box */}
            {currentQuestion ? (
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border-slate-800 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-xs font-mono text-indigo-300 font-bold">
                      Question {activeQuestionIdx + 1} of {ingestData.questions.length}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      // {currentQuestion.type}
                    </span>
                  </div>

                  {/* Question Switcher Tabs */}
                  <div className="flex items-center gap-1">
                    {ingestData.questions.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveQuestionIdx(idx);
                          setEvalResult(null);
                          setSelectedAnswer(ingestData.questions[idx].options[0]);
                          sounds.playClick();
                        }}
                        className={`w-7 h-7 rounded-lg font-mono text-xs font-bold border transition-all ${
                          activeQuestionIdx === idx
                            ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="p-5 rounded-xl bg-indigo-950/25 border border-indigo-500/30 space-y-2">
                  <div className="text-[11px] font-mono text-indigo-400 uppercase font-semibold">
                    Grounded Inquiry (Derived from {ingestData.title}):
                  </div>
                  <div className="text-base sm:text-lg font-bold text-white leading-relaxed">
                    {currentQuestion.question}
                  </div>
                </div>

                {/* 4 Choices */}
                <div className="space-y-3">
                  <div className="text-xs font-mono uppercase text-slate-400">
                    Select Your Answer:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQuestion.options?.map((opt: string) => {
                      const isSelected = selectedAnswer === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => { setSelectedAnswer(opt); sounds.playClick(); }}
                          disabled={evaluating || !!evalResult}
                          className={`p-4 rounded-xl font-mono text-sm font-bold border text-left transition-all ${
                            isSelected
                              ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.3)] ring-2 ring-indigo-500/40'
                              : 'glass-card border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Button */}
                {!evalResult && (
                  <div className="pt-2">
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={evaluating || !selectedAnswer}
                      className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl font-mono uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      {evaluating ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <span>QUERY VECTOR INDEX & VERIFY ANSWER</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {/* Chunks Preview Accordion */}
            <div className="glass-panel p-4 rounded-2xl border-slate-800 space-y-3">
              <button
                onClick={() => setShowChunks(!showChunks)}
                className="w-full flex items-center justify-between text-xs font-mono text-indigo-300 hover:text-indigo-200"
              >
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  <span>Inspect Ingested Vector Chunks ({ingestData.chunks_count} Total)</span>
                </span>
                <span>{showChunks ? '▲ Collapse' : '▼ Expand'}</span>
              </button>

              {showChunks && (
                <div className="space-y-2 pt-2 animate-in fade-in">
                  {ingestData.sample_chunks?.map((chunkText, cIdx) => (
                    <div key={cIdx} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300">
                      <div className="text-[10px] text-slate-500 mb-1">Vector Chunk #{cIdx + 1}</div>
                      <div>{chunkText}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Grounded Vector Telemetry */}
          <div className="space-y-6">
            {evalResult ? (
              <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  {evalResult.is_correct ? (
                    <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-400">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-cinzel font-bold text-lg text-white">
                      {evalResult.is_correct ? 'Grounding Confirmed' : 'Factual Discrepancy'}
                    </h3>
                    <div className="text-xs font-mono text-indigo-300">
                      +{evalResult.score_result?.points_awarded || 0} PTS Awarded
                    </div>
                  </div>
                </div>

                {/* Vector Similarity Telemetry */}
                <div className="glass-card p-4 rounded-xl border-slate-800 space-y-3 font-mono text-xs">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex justify-between">
                    <span>FAISS Vector Retrieval</span>
                    <span className="text-indigo-400">Cosine Metric</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Similarity Score:</span>
                      <span className="text-emerald-400 font-bold">
                        {Math.round(evalResult.similarity_score * 1000) / 1000}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Retrieved Chunk:</span>
                      <span className="text-slate-200">{evalResult.retrieved_chunk_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Correct Answer:</span>
                      <span className="text-white font-bold">{evalResult.correct_answer}</span>
                    </div>
                  </div>
                </div>

                {/* Grounding Citation Box */}
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                  <div className="text-[10px] font-mono text-indigo-400 uppercase font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Grounding Passage Citation:</span>
                  </div>
                  <p className="text-xs text-slate-200 italic leading-relaxed">
                    "{evalResult.snippet || evalResult.retrieved_chunk_text}"
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  {activeQuestionIdx < (ingestData.questions.length - 1) ? (
                    <button
                      onClick={() => {
                        setActiveQuestionIdx(activeQuestionIdx + 1);
                        setEvalResult(null);
                        setSelectedAnswer(ingestData.questions[activeQuestionIdx + 1].options[0]);
                        sounds.playClick();
                      }}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-xl transition-all"
                    >
                      NEXT QUESTION IN THIS URL →
                    </button>
                  ) : (
                    <button
                      onClick={() => handleIngest(urlInput)}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-xl transition-all"
                    >
                      INGEST ANOTHER URL →
                    </button>
                  )}

                  {evalResult.is_correct && !isConquered && (
                    <button
                      onClick={handleClaimRelic}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold font-mono text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:scale-105"
                    >
                      ★ CLAIM "THE CODEX OF RETRIEVAL" RELIC
                    </button>
                  )}

                  {evalResult.is_correct && (
                    <button
                      onClick={() => navigateTo('map')}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold font-mono text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <span>PROCEED FORWARD ON WORLD MAP</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-wider">
                  <Database className="w-4 h-4" />
                  <span>RAG Architecture</span>
                </div>
                <h3 className="font-cinzel font-bold text-white text-base">
                  The Vector Pipeline
                </h3>
                <div className="space-y-2 text-xs text-slate-300 font-light leading-relaxed">
                  <p>
                    Retrieval-Augmented Generation bridges statistical models with authoritative, live external documents:
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 font-mono text-[11px] text-indigo-300 space-y-1">
                    <div>1. Live URL Fetch & HTML parsing</div>
                    <div>2. Semantic Overlapping Chunking</div>
                    <div>3. 256-d Dense Vector Embeddings</div>
                    <div>4. FAISS Inner Product Similarity</div>
                  </div>
                </div>
                <div className="pt-2 text-[11px] font-mono text-slate-400">
                  ⚡ Paste any valid web article URL to synthesize custom questions!
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

