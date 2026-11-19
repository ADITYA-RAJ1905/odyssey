import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Home, Trophy, Sparkles, Award, CheckCircle2, RotateCcw, 
  Map, ShieldCheck, Cpu, Eye, MessageSquareCode, Compass, BookOpen, FileText 
} from 'lucide-react';

export const HomeIslandView: React.FC = () => {
  const { profile, resetGame, navigateTo } = useGame();

  useEffect(() => {
    sounds.playFanfare();

    // Trigger confetti fireworks
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#06b6d4', '#a855f7', '#f59e0b', '#10b981', '#f43f5e', '#6366f1', '#eab308']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#06b6d4', '#a855f7', '#f59e0b', '#10b981', '#f43f5e', '#6366f1', '#eab308']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const totalScore = profile?.total_score || 0;
  const scores = profile?.island_scores || { ml: 0, dl: 0, cv: 0, nlp: 0, rl: 0, rag: 0 };

  const relics = [
    { name: 'The Matrix of Foresight', domain: 'Machine Learning', score: scores.ml, icon: Cpu, color: 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40' },
    { name: 'The Prismatic Mirror', domain: 'Deep Learning', score: scores.dl, icon: Sparkles, color: 'text-purple-400 border-purple-500/50 bg-purple-950/40' },
    { name: 'The Lens of Perception', domain: 'Computer Vision', score: scores.cv, icon: Eye, color: 'text-amber-400 border-amber-500/50 bg-amber-950/40' },
    { name: 'The Echo Stone', domain: 'Natural Language', score: scores.nlp, icon: MessageSquareCode, color: 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40' },
    { name: 'The Compass of Optimality', domain: 'Reinforcement Learning', score: scores.rl, icon: Compass, color: 'text-rose-400 border-rose-500/50 bg-rose-950/40' },
    { name: 'The Codex of Retrieval', domain: 'Retrieval-Augmented Gen', score: scores.rag || 0, icon: BookOpen, color: 'text-indigo-400 border-indigo-500/50 bg-indigo-950/40' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 animate-in fade-in zoom-in duration-500">
      {/* Grand Title Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-950/50 border border-yellow-500/40 text-yellow-300 font-mono text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.3)]">
          <Award className="w-4 h-4 text-yellow-400" />
          <span>Odyssey Conquered • Homecoming Achieved</span>
        </div>

        <h1 className="font-cinzel text-4xl sm:text-6xl font-black text-white">
          <span className="bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
            WELCOME HOME, EXPLORER
          </span>
        </h1>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-light">
          You have mastered all six autonomous trial islands of the archipelago. The navigation transceiver is fully powered, and the rescue fleet has reached your shores.
        </p>
      </div>

      {/* Odyssey Core Relics Assembly */}
      <div className="glass-panel p-8 rounded-3xl border-yellow-500/30 glow-gold space-y-6">
        <div className="text-center space-y-1">
          <div className="text-xs font-mono uppercase text-yellow-400 tracking-wider font-semibold">
            Artifact Assembly Completed
          </div>
          <h2 className="font-cinzel text-2xl font-bold text-white">
            The Six Relics of Intelligence
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {relics.map((relic, idx) => {
            const Icon = relic.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border ${relic.color} flex flex-col justify-between space-y-3 shadow-lg`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-current flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-cinzel font-bold text-white text-sm">
                    {relic.name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {relic.domain}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Score:</span>
                  <span className="font-bold text-white">{relic.score} PTS</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Graduation Certificate & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-400">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-slate-400">Final Mastery Designation</div>
              <h3 className="font-cinzel text-2xl font-bold text-white">
                {profile?.rank_title || 'Grandmaster of the Odyssey'}
              </h3>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300 leading-relaxed font-light">
            <p>
              Your expedition demonstrated rigorous proficiency across the foundational paradigms of Modern Artificial Intelligence:
            </p>
            <ul className="space-y-1.5 text-xs font-mono text-slate-300 pl-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Supervised Learning: Random Forest classification, Gradient Boosting regression, Isolation Forest</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Deep Learning: Vision Transformer (ViT) patch attention and softmax logits</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Computer Vision: Bounding box regression, IoU thresholds, and spatial feature maps</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Natural Language Processing: Multi-head attention, intent semantics, and irony detection</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Reinforcement Learning: Markov Decision Processes (MDP) and Bellman optimality equations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Retrieval-Augmented Generation: FAISS vector indexing, dense TF-IDF embeddings, and grounded document retrieval</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Total Points & Replay Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border-slate-800 flex flex-col justify-between space-y-6 text-center">
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase text-slate-400">Cumulative Odyssey Score</div>
            <div className="font-mono text-4xl sm:text-5xl font-black text-amber-300 drop-shadow-md">
              {totalScore.toLocaleString()}
            </div>
            <div className="text-xs font-mono text-slate-500">POINTS ACCUMULATED</div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigateTo('report')}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <FileText className="w-4 h-4" />
              <span>VIEW FINAL MASTERY REPORT</span>
            </button>

            <button
              onClick={() => navigateTo('map')}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Map className="w-4 h-4" />
              <span>RETURN TO WORLD MAP</span>
            </button>

            <button
              onClick={resetGame}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold font-mono text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>START A NEW ODYSSEY</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

