import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import { 
  Compass, ArrowLeft, CheckCircle2, Lock, Sparkles, Trophy, 
  Layers, FileText, Coins, Grid, Cpu, ShieldAlert 
} from 'lucide-react';
import { BanditCoveZone } from '../components/zones/BanditCoveZone';
import { QValueMazeZone } from '../components/zones/QValueMazeZone';
import { CartPoleArenaZone } from '../components/zones/CartPoleArenaZone';
import { PolicyCitadelZone } from '../components/zones/PolicyCitadelZone';

type ZoneId = 'bandit_cove' | 'q_value_maze' | 'cartpole_arena' | 'policy_citadel';

interface ZoneMeta {
  id: ZoneId;
  num: number;
  name: string;
  domain: string;
  icon: any;
}

const ZONES: ZoneMeta[] = [
  { id: 'bandit_cove', num: 1, name: 'Bandit Cove', domain: 'Multi-Armed Bandits & ε-Greedy', icon: Coins },
  { id: 'q_value_maze', num: 2, name: 'Q-Value Maze', domain: 'GridWorld MDP & Bellman Updates', icon: Grid },
  { id: 'cartpole_arena', num: 3, name: 'CartPole Arena', domain: 'Deep Neural Policy (TensorFlow.js)', icon: Cpu },
  { id: 'policy_citadel', num: 4, name: 'Policy Citadel', domain: 'Boss Diagnostic Trial', icon: Compass }
];

export const RLIslandView: React.FC = () => {
  const { profile, telemetry, completeZone, conquerIsland, navigateTo } = useGame();
  const [currentZoneId, setCurrentZoneId] = useState<ZoneId>('bandit_cove');

  const rlTelemetry = (telemetry.islands as any).reinforcement_learning || (telemetry.islands as any).island_5;
  const isIslandCompleted = rlTelemetry?.status === 'completed' || profile?.conquered_islands?.includes(5);

  // Determine if a zone is unlocked - all levels open
  const isZoneUnlocked = (_zoneId: ZoneId): boolean => true;

  const handleSelectZone = (zoneId: ZoneId) => {
    if (!isZoneUnlocked(zoneId)) {
      sounds.playError();
      return;
    }
    sounds.playClick();
    setCurrentZoneId(zoneId);
  };

  // Completion handlers for each zone
  const handleZone1Complete = (score: number, timeSpent: number) => {
    completeZone('reinforcement_learning', 'bandit_cove', score, timeSpent);
  };

  const handleZone2Complete = (score: number, timeSpent: number) => {
    completeZone('reinforcement_learning', 'q_value_maze', score, timeSpent);
  };

  const handleZone3Complete = (score: number, timeSpent: number) => {
    completeZone('reinforcement_learning', 'cartpole_arena', score, timeSpent);
  };

  const handleZone4Complete = async (score: number, timeSpent: number) => {
    completeZone('reinforcement_learning', 'policy_citadel', score, timeSpent);
    await conquerIsland(5);
  };

  // Total island score calculation
  const totalRlScore = 
    (rlTelemetry?.zones?.bandit_cove?.score || 0) +
    (rlTelemetry?.zones?.q_value_maze?.score || 0) +
    (rlTelemetry?.zones?.cartpole_arena?.score || 0) +
    (rlTelemetry?.zones?.policy_citadel?.score || 0);

  const completedCount = rlTelemetry?.zones ? [
    rlTelemetry.zones.bandit_cove?.completed,
    rlTelemetry.zones.q_value_maze?.completed,
    rlTelemetry.zones.cartpole_arena?.completed,
    rlTelemetry.zones.policy_citadel?.completed
  ].filter(Boolean).length : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Island Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel px-6 py-4 rounded-2xl border-indigo-500/30 glow-indigo">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateTo('map')}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-indigo-400 text-slate-300 hover:text-indigo-300 transition-colors"
            title="Return to World Map"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400">
                Island 05 • Reinforcement Learning
              </span>
              {isIslandCompleted && (
                <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3 text-indigo-400" /> RELIC SECURED: COMPASS OF OPTIMALITY
                </span>
              )}
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-indigo-400" />
              <span>The Decision</span>
            </h1>
          </div>
        </div>

        {/* Score & Telemetry Controls */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 bg-indigo-950/50 border border-indigo-500/30 rounded-xl text-right">
            <div className="text-[10px] font-mono text-indigo-400 uppercase">Zones Conquered</div>
            <div className="font-mono font-bold text-indigo-200 text-base">{completedCount} / 4 Zones</div>
          </div>
          <div className="px-4 py-1.5 bg-indigo-950/50 border border-indigo-500/30 rounded-xl text-right">
            <div className="text-[10px] font-mono text-indigo-400 uppercase">Island Score</div>
            <div className="font-mono font-bold text-indigo-300 text-base">{totalRlScore} PTS</div>
          </div>
          <button
            onClick={() => navigateTo('report')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-400 text-indigo-300 hover:text-white transition-all text-xs font-mono flex items-center gap-1.5 shadow-md"
            title="Open Final Mastery Report"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Report</span>
          </button>
        </div>
      </div>

      {/* 4-Zone Progression Stepper Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ZONES.map((z) => {
          const unlocked = isZoneUnlocked(z.id);
          const isCurrent = currentZoneId === z.id;
          const zoneData = rlTelemetry?.zones?.[z.id] || { completed: false, attempts: 0, score: 0 };
          const isDone = zoneData.completed;
          const Icon = z.icon;

          return (
            <div
              key={z.id}
              onClick={() => handleSelectZone(z.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                isCurrent
                  ? 'bg-indigo-500/20 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.35)] ring-2 ring-indigo-500/30'
                  : isDone
                  ? 'bg-indigo-950/30 border-indigo-500/40 hover:border-indigo-400'
                  : unlocked
                  ? 'glass-card border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/50 border-slate-900 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isCurrent ? 'bg-indigo-500 text-slate-950' : isDone ? 'bg-indigo-950 text-indigo-400 border border-indigo-500/50' : 'bg-slate-900 text-slate-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      Zone 0{z.num}
                    </span>
                    {isDone && <CheckCircle2 className="w-3 h-3 text-indigo-400" />}
                    {!unlocked && <Lock className="w-3 h-3 text-slate-600" />}
                  </div>
                  <div className="font-bold text-xs text-white">
                    {z.name}
                  </div>
                </div>
              </div>

              {zoneData.attempts > 0 && (
                <div className="text-right text-[10px] font-mono">
                  <div className="text-slate-400">{zoneData.score} pts</div>
                  <div className="text-slate-500">{zoneData.attempts} {zoneData.attempts === 1 ? 'try' : 'tries'}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Zone Content View */}
      <div className="space-y-6">
        {currentZoneId === 'bandit_cove' && (
          <BanditCoveZone
            telemetry={rlTelemetry?.zones?.bandit_cove || { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }}
            onComplete={handleZone1Complete}
            onAdvance={() => handleSelectZone('q_value_maze')}
          />
        )}

        {currentZoneId === 'q_value_maze' && (
          <QValueMazeZone
            telemetry={rlTelemetry?.zones?.q_value_maze || { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }}
            onComplete={handleZone2Complete}
            onAdvance={() => handleSelectZone('cartpole_arena')}
          />
        )}

        {currentZoneId === 'cartpole_arena' && (
          <CartPoleArenaZone
            telemetry={rlTelemetry?.zones?.cartpole_arena || { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }}
            onComplete={handleZone3Complete}
            onAdvance={() => handleSelectZone('policy_citadel')}
          />
        )}

        {currentZoneId === 'policy_citadel' && (
          <PolicyCitadelZone
            telemetry={rlTelemetry?.zones?.policy_citadel || { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }}
            onComplete={handleZone4Complete}
            onAdvance={() => navigateTo('rag')}
          />
        )}
      </div>
    </div>
  );
};
