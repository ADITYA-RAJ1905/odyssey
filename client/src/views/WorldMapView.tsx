import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ViewType } from '../types';
import { sounds } from '../utils/audio';
import { 
  Compass, Cpu, Sparkles, Eye, MessageSquareCode, 
  Lock, CheckCircle2, Home, ArrowRight, ShieldCheck, BookOpen, Trophy 
} from 'lucide-react';

interface IslandNode {
  id: number;
  viewKey: ViewType;
  name: string;
  domain: string;
  tagline: string;
  icon: any;
  x: number; // percentage coordinates on archipelago map
  y: number;
  relicName: string;
  themeColor: string;
  glowColor: string;
  borderActive: string;
}

const ISLANDS: IslandNode[] = [
  {
    id: 1,
    viewKey: 'ml',
    name: 'The Predictor',
    domain: 'Machine Learning',
    tagline: 'Statistical inference, credit default models, and anomaly isolation.',
    icon: Cpu,
    x: 16,
    y: 65,
    relicName: 'The Matrix of Foresight',
    themeColor: 'text-cyan-400 bg-cyan-950/80',
    glowColor: 'shadow-cyan-500/50',
    borderActive: 'border-cyan-400 ring-cyan-500/40'
  },
  {
    id: 2,
    viewKey: 'dl',
    name: 'The Mirror',
    domain: 'Deep Learning',
    tagline: 'Perception of facial micro-expressions and emotion distributions.',
    icon: Sparkles,
    x: 32,
    y: 28,
    relicName: 'The Prismatic Mirror',
    themeColor: 'text-purple-400 bg-purple-950/80',
    glowColor: 'shadow-purple-500/50',
    borderActive: 'border-purple-400 ring-purple-500/40'
  },
  {
    id: 3,
    viewKey: 'cv',
    name: 'The Observer',
    domain: 'Computer Vision',
    tagline: 'Drone aerial surveillance, feature maps, and object bounding boxes.',
    icon: Eye,
    x: 48,
    y: 72,
    relicName: 'The Lens of Perception',
    themeColor: 'text-amber-400 bg-amber-950/80',
    glowColor: 'shadow-amber-500/50',
    borderActive: 'border-amber-400 ring-amber-500/40'
  },
  {
    id: 4,
    viewKey: 'nlp',
    name: 'The Voices',
    domain: 'Natural Language',
    tagline: 'Deciphering survivor transmissions, sentiment, intent, and subtle sarcasm.',
    icon: MessageSquareCode,
    x: 64,
    y: 30,
    relicName: 'The Echo Stone',
    themeColor: 'text-emerald-400 bg-emerald-950/80',
    glowColor: 'shadow-emerald-500/50',
    borderActive: 'border-emerald-400 ring-emerald-500/40'
  },
  {
    id: 5,
    viewKey: 'rl',
    name: 'The Decision',
    domain: 'Reinforcement Learning',
    tagline: 'Survival grid-world MDP, hazard evasion, and Bellman Q-value policy.',
    icon: Compass,
    x: 80,
    y: 64,
    relicName: 'The Compass of Optimality',
    themeColor: 'text-rose-400 bg-rose-950/80',
    glowColor: 'shadow-rose-500/50',
    borderActive: 'border-rose-400 ring-rose-500/40'
  },
  {
    id: 6,
    viewKey: 'rag',
    name: 'The Archive',
    domain: 'Retrieval-Augmented Gen',
    tagline: 'Vector indexing, live URL ingestion, and semantic grounded retrieval.',
    icon: BookOpen,
    x: 82,
    y: 32,
    relicName: 'The Codex of Retrieval',
    themeColor: 'text-indigo-400 bg-indigo-950/80',
    glowColor: 'shadow-indigo-500/50',
    borderActive: 'border-indigo-400 ring-indigo-500/40'
  },
  {
    id: 7,
    viewKey: 'report',
    name: 'The Oracle Citadel',
    domain: 'Mastery Analytics & AI Debrief',
    tagline: 'Review comprehensive mastery analytics, receive the Oracle AI debrief, and export your accreditation certificate.',
    icon: Trophy,
    x: 94,
    y: 20,
    relicName: 'The Odyssey Master Core',
    themeColor: 'text-yellow-300 bg-yellow-950/80',
    glowColor: 'shadow-yellow-400/70',
    borderActive: 'border-yellow-400 ring-yellow-500/50'
  }
];

export const WorldMapView: React.FC = () => {
  const { profile, telemetry, isDemoMode, navigateTo } = useGame();
  const [selectedIsland, setSelectedIsland] = useState<IslandNode>(ISLANDS[0]);

  const conquered = new Set(profile?.conquered_islands || []);
  const currentIslandNum = profile?.current_island || 1;

  const isUnlocked = (_islandId: number) => {
    // All islands are open and accessible by default
    return true;
  };

  const handleSelect = (island: IslandNode) => {
    sounds.playClick();
    setSelectedIsland(island);
  };

  const handleTravel = (island: IslandNode) => {
    if (!isUnlocked(island.id)) {
      sounds.playError();
      return;
    }
    sounds.playSelect();
    navigateTo(island.viewKey);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel px-6 py-4 rounded-2xl border-slate-800">
        <div>
          <h2 className="font-cinzel text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Compass className="w-6 h-6 text-cyan-400 animate-spin" style={{ animationDuration: '24s' }} />
            <span>The Archipelago Chart</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-light mt-0.5">
            Plot your route across the 6 trial islands. Collect every relic to open the sea passage Home.
          </p>
        </div>

        {/* Status Counter */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">Relics Secured</div>
            <div className="font-mono font-bold text-lg text-emerald-400">
              {conquered.size} / 6 Relics
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500/40 bg-emerald-950/40 flex items-center justify-center text-emerald-400 font-bold font-mono">
            {Math.round((conquered.size / 6) * 100)}%
          </div>
        </div>
      </div>

      {/* Main Map Arena */}
      <div className="relative w-full h-[520px] rounded-2xl border border-slate-800 bg-[#040915] overflow-hidden radar-grid shadow-2xl">
        {/* Sea Chart Grid Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Curved Navigation Sea Routes */}
          {/* Path 1 -> 2 */}
          <path
            d="M 16% 65% Q 22% 40% 32% 28%"
            fill="none"
            stroke={conquered.has(1) ? '#06b6d4' : '#334155'}
            strokeWidth="3"
            strokeDasharray={conquered.has(1) ? 'none' : '6,6'}
            filter={conquered.has(1) ? 'url(#glow)' : undefined}
          />
          {/* Path 2 -> 3 */}
          <path
            d="M 32% 28% Q 40% 55% 48% 72%"
            fill="none"
            stroke={conquered.has(2) ? '#a855f7' : '#334155'}
            strokeWidth="3"
            strokeDasharray={conquered.has(2) ? 'none' : '6,6'}
            filter={conquered.has(2) ? 'url(#glow)' : undefined}
          />
          {/* Path 3 -> 4 */}
          <path
            d="M 48% 72% Q 56% 45% 64% 30%"
            fill="none"
            stroke={conquered.has(3) ? '#f59e0b' : '#334155'}
            strokeWidth="3"
            strokeDasharray={conquered.has(3) ? 'none' : '6,6'}
            filter={conquered.has(3) ? 'url(#glow)' : undefined}
          />
          {/* Path 4 -> 5 */}
          <path
            d="M 64% 30% Q 72% 50% 80% 64%"
            fill="none"
            stroke={conquered.has(4) ? '#10b981' : '#334155'}
            strokeWidth="3"
            strokeDasharray={conquered.has(4) ? 'none' : '6,6'}
            filter={conquered.has(4) ? 'url(#glow)' : undefined}
          />
          {/* Path 5 -> 6 (The Archive) */}
          <path
            d="M 80% 64% Q 81% 48% 82% 32%"
            fill="none"
            stroke={conquered.has(5) ? '#6366f1' : '#334155'}
            strokeWidth="3"
            strokeDasharray={conquered.has(5) ? 'none' : '6,6'}
            filter={conquered.has(5) ? 'url(#glow)' : undefined}
          />
          {/* Path 6 -> 7 (Home) */}
          <path
            d="M 82% 32% Q 88% 26% 94% 20%"
            fill="none"
            stroke={conquered.size >= 6 ? '#eab308' : '#334155'}
            strokeWidth="3"
            strokeDasharray={conquered.size >= 6 ? 'none' : '6,6'}
            filter={conquered.size >= 6 ? 'url(#glow)' : undefined}
          />
        </svg>

        {/* Ambient Oceanic Rings / Islands Visual Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-[20%] left-[8%] w-48 h-48 rounded-full border border-cyan-500/10 animate-ping" style={{ animationDuration: '8s' }} />
          <div className="absolute top-[50%] left-[55%] w-64 h-64 rounded-full border border-amber-500/10" />
          <div className="absolute top-[10%] right-[5%] w-72 h-72 rounded-full border border-yellow-500/15" />
        </div>

        {/* Interactive Island Nodes */}
        {ISLANDS.map((island) => {
          const unlocked = isUnlocked(island.id);
          const isCleared = conquered.has(island.id);
          const isCurrent = island.id === currentIslandNum && !isCleared;
          const isSelected = selectedIsland.id === island.id;
          const Icon = island.icon;

          return (
            <div
              key={island.id}
              style={{ left: `${island.x}%`, top: `${island.y}%` }}
              onClick={() => handleSelect(island)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group transition-all duration-300`}
            >
              {/* Pulsing ring for current island */}
              {isCurrent && (
                <div className="absolute -inset-2.5 rounded-full border-2 border-cyan-400/80 animate-ping pointer-events-none" />
              )}

              {/* Node Outer Circle */}
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-300 ${
                  isSelected
                    ? `${island.borderActive} ring-4 scale-110 shadow-[0_0_25px]`
                    : unlocked
                    ? 'border-slate-600/80 hover:border-slate-400 hover:scale-105'
                    : 'border-slate-800 bg-slate-950/90 opacity-60'
                } ${island.themeColor} ${island.glowColor} backdrop-blur-md`}
              >
                <Icon className={`w-6 h-6 ${unlocked ? 'text-current' : 'text-slate-600'}`} />

                {/* Status Indicator Icon */}
                <div className="absolute -top-1.5 -right-1.5">
                  {isCleared ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 bg-slate-950 rounded-full fill-emerald-950" />
                  ) : !unlocked ? (
                    <Lock className="w-4 h-4 text-slate-500 bg-slate-950 rounded-full p-0.5" />
                  ) : isCurrent ? (
                    <div className="w-3.5 h-3.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#06b6d4] animate-pulse" />
                  ) : null}
                </div>
              </div>

              {/* Node Label Below */}
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-center pointer-events-none">
                <div className="font-cinzel text-xs font-bold text-slate-200 drop-shadow-md">
                  {island.name}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {island.id === 7 ? 'Final Destination' : island.domain}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Island Dossier Bar */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${selectedIsland.themeColor}`}>
              <selectedIsland.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-500">
                  ISLAND 0{selectedIsland.id}
                </span>
                {conquered.has(selectedIsland.id) && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> CLEARED
                  </span>
                )}
              </div>
              <h3 className="font-cinzel text-xl font-bold text-white">
                {selectedIsland.name} — <span className="font-sans text-sm font-normal text-slate-300">{selectedIsland.domain}</span>
              </h3>
            </div>
          </div>
          <p className="text-slate-300 text-sm">
            {selectedIsland.tagline}
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Relic: <strong className="text-cyan-300">{selectedIsland.relicName}</strong></span>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {isUnlocked(selectedIsland.id) ? (
            <button
              onClick={() => handleTravel(selectedIsland)}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95"
            >
              <span>{conquered.has(selectedIsland.id) ? 'REPLAY CHALLENGE' : 'TRAVEL TO ISLAND'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 border border-slate-800 text-slate-500 rounded-xl text-sm font-mono cursor-not-allowed">
              <Lock className="w-4 h-4" />
              <span>
                {selectedIsland.id === 7 ? 'Collect all 6 Relics to unlock' : 'Clear prior island to navigate'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

