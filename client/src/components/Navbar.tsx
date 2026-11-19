import React from 'react';
import { useGame } from '../context/GameContext';
import { Compass, Trophy, Volume2, VolumeX, Map, RotateCcw, FileText } from 'lucide-react';
import { RelicsBar } from './RelicsBar';

export const Navbar: React.FC = () => {
  const { profile, currentView, navigateTo, soundEnabled, toggleAudio, resetGame } = useGame();

  const handleReset = () => {
    if (window.confirm('Restart the Odyssey from the stranded shores? Your progress will be reset.')) {
      resetGame();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo / Brand */}
        <div
          onClick={() => navigateTo('landing')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-lg bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-cinzel tracking-wider font-bold text-lg bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
              ODYSSEY
            </div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 -mt-1 font-mono">
              The AI Archipelago
            </div>
          </div>
        </div>

        {/* Center: Rank & Progress */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/60 border border-slate-800 rounded-full text-xs">
            <span className="text-slate-400">Rank:</span>
            <span className="font-medium text-cyan-300">
              {profile?.rank_title || 'Stranded Castaway'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/60 border border-slate-800 rounded-full text-xs">
            <span className="text-slate-400">Islands:</span>
            <span className="font-semibold text-emerald-400 font-mono">
              {profile?.conquered_islands?.length || 0} / 6
            </span>
          </div>

          {/* Relics */}
          <RelicsBar />
        </div>

        {/* Right HUD Controls */}
        <div className="flex items-center gap-2.5">
          {/* Total Score */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/30 border border-amber-500/30 rounded-lg text-amber-300 font-mono text-sm font-semibold shadow-[0_0_10px_rgba(245,158,11,0.15)]">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{profile?.total_score?.toLocaleString() || 0}</span>
            <span className="text-[10px] text-amber-500 font-sans">PTS</span>
          </div>

          {/* Mastery Report Button */}
          <button
            onClick={() => navigateTo('report')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentView === 'report'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="View Odyssey Mastery Report"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report</span>
          </button>

          {/* World Map Button */}
          {currentView !== 'map' && currentView !== 'landing' && (
            <button
              onClick={() => navigateTo('map')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-medium transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] hover:border-cyan-400"
            >
              <Map className="w-3.5 h-3.5" />
              <span>World Map</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleAudio}
            title={soundEnabled ? 'Mute audio' : 'Unmute audio'}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Reset Game */}
          <button
            onClick={handleReset}
            title="Reset Game Progress"
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-500 hover:text-rose-400 hover:border-rose-900/40 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

