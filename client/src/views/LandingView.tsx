import React from 'react';
import { useGame } from '../context/GameContext';
import { Compass, Sparkles, Eye, MessageSquareCode, Cpu, ShieldCheck, ArrowRight, Anchor, BookOpen } from 'lucide-react';

export const LandingView: React.FC = () => {
  const { navigateTo, profile } = useGame();

  const islandsPreview = [
    {
      num: 1,
      name: 'The Predictor',
      domain: 'Machine Learning',
      desc: 'Credit risk classification, house price regression, transaction anomaly isolation.',
      icon: Cpu,
      color: 'from-cyan-500/20 to-blue-600/10 border-cyan-500/40 text-cyan-400'
    },
    {
      num: 2,
      name: 'The Mirror',
      domain: 'Deep Learning',
      desc: 'Perception of subtle micro-expressions and facial emotion distributions.',
      icon: Sparkles,
      color: 'from-purple-500/20 to-pink-600/10 border-purple-500/40 text-purple-400'
    },
    {
      num: 3,
      name: 'The Observer',
      domain: 'Computer Vision',
      desc: 'Aerial reconnaissance, object detection contours, dynamic scene analysis.',
      icon: Eye,
      color: 'from-amber-500/20 to-orange-600/10 border-amber-500/40 text-amber-400'
    },
    {
      num: 4,
      name: 'The Voices',
      domain: 'Natural Language Processing',
      desc: 'Deciphering survivor logs: sentiment, emotion, intent, and subtle sarcasm.',
      icon: MessageSquareCode,
      color: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/40 text-emerald-400'
    },
    {
      num: 5,
      name: 'The Decision',
      domain: 'Reinforcement Learning',
      desc: 'Survival grid-world MDP with health, hydration, hazards, and Bellman Q-values.',
      icon: Compass,
      color: 'from-rose-500/20 to-red-600/10 border-rose-500/40 text-rose-400'
    },
    {
      num: 6,
      name: 'The Archive',
      domain: 'Retrieval-Augmented Gen',
      desc: 'Live URL ingestion, vector chunk embeddings, grounded question answering.',
      icon: BookOpen,
      color: 'from-indigo-500/20 to-blue-700/10 border-indigo-500/40 text-indigo-400'
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12">
      {/* Background glow orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center space-y-8 z-10">
        {/* Expedition Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-widest backdrop-blur-md">
          <Anchor className="w-3.5 h-3.5 text-cyan-400" />
          <span>Stranded on an Unknown Archipelago</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="font-cinzel text-5xl sm:text-7xl font-black tracking-tight text-white">
            <span className="bg-gradient-to-r from-cyan-200 via-sky-300 to-indigo-200 bg-clip-text text-transparent">
              ODYSSEY
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 font-light max-w-2xl mx-auto">
            "Lost at sea. The world is learning. Find your way home."
          </p>
        </div>

        {/* Narrative Callout */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl max-w-2xl mx-auto border border-slate-700/60 shadow-2xl text-left space-y-4">
          <div className="flex items-center gap-3 text-cyan-400 font-cinzel font-bold text-lg">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span>The Castaway's Trial</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            A violent oceanic squall grounded your vessel upon an uncharted cluster of islands governed by autonomous intelligence nodes. To repair your navigation transceiver and reach <span className="text-amber-300 font-semibold">Home</span>, you must journey across six trial islands, solving real perceptual and algorithmic challenges.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-slate-400 border-t border-slate-800">
            <div>⚡ Real ML/DL/CV/NLP/RL/RAG Engines</div>
            <div>🏆 6 Island Relics to Collect</div>
            <div>🗺️ Interactive World Archipelago</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() => navigateTo('map')}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-base rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95"
          >
            <span>
              {profile?.conquered_islands && profile.conquered_islands.length > 0
                ? 'RESUME ODYSSEY (OPEN MAP)'
                : 'BEGIN THE ODYSSEY'}
            </span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Islands Preview Grid */}
        <div className="pt-10">
          <div className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-6">
            The Six Challenge Islands
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {islandsPreview.map((island) => {
              const Icon = island.icon;
              return (
                <div
                  key={island.num}
                  className={`glass-card p-4 rounded-xl border bg-gradient-to-b ${island.color} text-left flex flex-col justify-between hover:scale-[1.03] transition-transform`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900/80 border border-current flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-xs text-slate-400">
                        0{island.num}
                      </span>
                    </div>
                    <div className="font-cinzel font-bold text-slate-100 text-sm">
                      {island.name}
                    </div>
                    <div className="text-[11px] font-mono text-cyan-300 mb-2">
                      {island.domain}
                    </div>
                    <div className="text-xs text-slate-400 leading-snug">
                      {island.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

