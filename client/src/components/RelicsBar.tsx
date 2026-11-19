import React from 'react';
import { useGame } from '../context/GameContext';
import { Sparkles, Eye, Compass, MessageSquareCode, Cpu, BookOpen, HelpCircle } from 'lucide-react';

const RELIC_SLOTS = [
  { id: 'relic_ml', islandNum: 1, name: 'The Matrix of Foresight', icon: Cpu, color: 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40 shadow-cyan-500/30' },
  { id: 'relic_dl', islandNum: 2, name: 'The Prismatic Mirror', icon: Sparkles, color: 'text-purple-400 border-purple-500/50 bg-purple-950/40 shadow-purple-500/30' },
  { id: 'relic_cv', islandNum: 3, name: 'The Lens of Perception', icon: Eye, color: 'text-amber-400 border-amber-500/50 bg-amber-950/40 shadow-amber-500/30' },
  { id: 'relic_nlp', islandNum: 4, name: 'The Echo Stone', icon: MessageSquareCode, color: 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40 shadow-emerald-500/30' },
  { id: 'relic_rl', islandNum: 5, name: 'The Compass of Optimality', icon: Compass, color: 'text-rose-400 border-rose-500/50 bg-rose-950/40 shadow-rose-500/30' },
  { id: 'relic_rag', islandNum: 6, name: 'The Codex of Retrieval', icon: BookOpen, color: 'text-indigo-400 border-indigo-500/50 bg-indigo-950/40 shadow-indigo-500/30' }
];

export const RelicsBar: React.FC = () => {
  const { profile } = useGame();
  const unlockedRelicIds = new Set((profile?.relics || []).map((r) => r.id));

  return (
    <div className="flex items-center gap-2 bg-slate-900/70 border border-slate-800 rounded-full px-3 py-1.5 backdrop-blur-md">
      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold px-1">
        Relics:
      </span>
      <div className="flex items-center gap-1.5">
        {RELIC_SLOTS.map((slot) => {
          const isUnlocked = unlockedRelicIds.has(slot.id);
          const Icon = isUnlocked ? slot.icon : HelpCircle;

          return (
            <div
              key={slot.id}
              title={isUnlocked ? `${slot.name} (Unlocked)` : `Relic #${slot.islandNum}: Locked`}
              className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${
                isUnlocked
                  ? `${slot.color} shadow-[0_0_10px] scale-105`
                  : 'border-slate-800/80 bg-slate-950/60 text-slate-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

