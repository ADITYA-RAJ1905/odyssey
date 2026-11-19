import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import { 
  Cpu, ArrowLeft, CheckCircle2, Lock, Sparkles, Trophy, 
  Compass, TrendingUp, Activity, FileText 
} from 'lucide-react';
import { ShorelineZone } from '../components/zones/ShorelineZone';
import { RidgeZone } from '../components/zones/RidgeZone';
import { SwampZone } from '../components/zones/SwampZone';
import { LighthouseZone } from '../components/zones/LighthouseZone';

type ZoneId = 'shoreline' | 'ridge' | 'swamp' | 'lighthouse';

interface ZoneMeta {
  id: ZoneId;
  num: number;
  name: string;
  domain: string;
  icon: any;
}

const ZONES: ZoneMeta[] = [
  { id: 'shoreline', num: 1, name: 'The Shoreline', domain: 'Supervised vs. Unsupervised', icon: Compass },
  { id: 'ridge', num: 2, name: 'The Ridge', domain: 'Linear Regression & Loss/MSE', icon: TrendingUp },
  { id: 'swamp', num: 3, name: 'The Swamp', domain: 'Overfitting vs. Underfitting', icon: Activity },
  { id: 'lighthouse', num: 4, name: 'The Lighthouse', domain: 'Boss Diagnostic Trial', icon: Cpu }
];

export const MLIslandView: React.FC = () => {
  const { profile, telemetry, completeZone, conquerIsland, navigateTo } = useGame();
  const [currentZoneId, setCurrentZoneId] = useState<ZoneId>('shoreline');

  const mlTelemetry = telemetry.islands.machine_learning;
  const isIslandCompleted = mlTelemetry.status === 'completed' || profile?.conquered_islands?.includes(1);

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
    completeZone('machine_learning', 'shoreline', score, timeSpent);
  };

  const handleZone2Complete = (score: number, timeSpent: number) => {
    completeZone('machine_learning', 'ridge', score, timeSpent);
  };

  const handleZone3Complete = (score: number, timeSpent: number) => {
    completeZone('machine_learning', 'swamp', score, timeSpent);
  };

  const handleZone4Complete = async (score: number, timeSpent: number) => {
    completeZone('machine_learning', 'lighthouse', score, timeSpent);
    await conquerIsland(1);
  };

  // Total island score calculation
  const totalMlScore = 
    mlTelemetry.zones.shoreline.score +
    mlTelemetry.zones.ridge.score +
    mlTelemetry.zones.swamp.score +
    mlTelemetry.zones.lighthouse.score;

  const completedCount = [
    mlTelemetry.zones.shoreline.completed,
    mlTelemetry.zones.ridge.completed,
    mlTelemetry.zones.swamp.completed,
    mlTelemetry.zones.lighthouse.completed
  ].filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Island Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel px-6 py-4 rounded-2xl border-cyan-500/30 glow-cyan">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateTo('map')}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Return to World Map"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                Island 01 • Machine Learning
              </span>
              {isIslandCompleted && (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> RELIC SECURED: MATRIX OF FORESIGHT
                </span>
              )}
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-6 h-6 text-cyan-400" />
              <span>The Predictor</span>
            </h1>
          </div>
        </div>

        {/* Score & Telemetry Controls */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 bg-cyan-950/50 border border-cyan-500/30 rounded-xl text-right">
            <div className="text-[10px] font-mono text-cyan-400 uppercase">Zones Conquered</div>
            <div className="font-mono font-bold text-cyan-200 text-base">{completedCount} / 4 Zones</div>
          </div>
          <div className="px-4 py-1.5 bg-cyan-950/50 border border-cyan-500/30 rounded-xl text-right">
            <div className="text-[10px] font-mono text-cyan-400 uppercase">Island Score</div>
            <div className="font-mono font-bold text-emerald-400 text-base">{totalMlScore} PTS</div>
          </div>
          <button
            onClick={() => navigateTo('report')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 hover:text-white transition-all text-xs font-mono flex items-center gap-1.5 shadow-md"
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
          const zoneData = mlTelemetry.zones[z.id];
          const isDone = zoneData.completed;
          const Icon = z.icon;

          return (
            <div
              key={z.id}
              onClick={() => handleSelectZone(z.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                isCurrent
                  ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)] ring-2 ring-cyan-500/30'
                  : isDone
                  ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400'
                  : unlocked
                  ? 'glass-card border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/50 border-slate-900 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isCurrent ? 'bg-cyan-500 text-slate-950' : isDone ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50' : 'bg-slate-900 text-slate-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      Zone 0{z.num}
                    </span>
                    {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
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
        {currentZoneId === 'shoreline' && (
          <ShorelineZone
            telemetry={mlTelemetry.zones.shoreline}
            onComplete={handleZone1Complete}
            onAdvance={() => handleSelectZone('ridge')}
          />
        )}

        {currentZoneId === 'ridge' && (
          <RidgeZone
            telemetry={mlTelemetry.zones.ridge}
            onComplete={handleZone2Complete}
            onAdvance={() => handleSelectZone('swamp')}
          />
        )}

        {currentZoneId === 'swamp' && (
          <SwampZone
            telemetry={mlTelemetry.zones.swamp}
            onComplete={handleZone3Complete}
            onAdvance={() => handleSelectZone('lighthouse')}
          />
        )}

        {currentZoneId === 'lighthouse' && (
          <LighthouseZone
            telemetry={mlTelemetry.zones.lighthouse}
            onComplete={handleZone4Complete}
            onOpenReport={() => navigateTo('report')}
            onContinueToIsland2={() => navigateTo('dl')}
          />
        )}
      </div>
    </div>
  );
};
