import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import { 
  Cpu, ArrowLeft, CheckCircle2, Lock, Sparkles, Trophy, 
  Layers, Eye, Activity, FileText, Zap 
} from 'lucide-react';
import { PerceptronBayZone } from '../components/zones/PerceptronBayZone';
import { ConvCanyonZone } from '../components/zones/ConvCanyonZone';
import { VisionObservatoryZone } from '../components/zones/VisionObservatoryZone';
import { NeuralCitadelZone } from '../components/zones/NeuralCitadelZone';

type ZoneId = 'perceptron_bay' | 'conv_canyon' | 'vision_observatory' | 'neural_citadel';

interface ZoneMeta {
  id: ZoneId;
  num: number;
  name: string;
  domain: string;
  icon: any;
}

const ZONES: ZoneMeta[] = [
  { id: 'perceptron_bay', num: 1, name: 'Perceptron Bay', domain: 'Neurons & Activations', icon: Zap },
  { id: 'conv_canyon', num: 2, name: 'Conv Canyon', domain: 'CNNs & Kernels', icon: Layers },
  { id: 'vision_observatory', num: 3, name: 'Vision Observatory', domain: 'Pre-Trained Detection', icon: Eye },
  { id: 'neural_citadel', num: 4, name: 'Neural Citadel', domain: 'Boss Diagnostic Trial', icon: Cpu }
];

export const DLIslandView: React.FC = () => {
  const { profile, telemetry, completeZone, conquerIsland, navigateTo } = useGame();
  const [currentZoneId, setCurrentZoneId] = useState<ZoneId>('perceptron_bay');

  const dlTelemetry = telemetry.islands.deep_learning || (telemetry.islands as any).island_2;
  const isIslandCompleted = dlTelemetry?.status === 'completed' || profile?.conquered_islands?.includes(2);

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
    completeZone('deep_learning', 'perceptron_bay', score, timeSpent);
  };

  const handleZone2Complete = (score: number, timeSpent: number) => {
    completeZone('deep_learning', 'conv_canyon', score, timeSpent);
  };

  const handleZone3Complete = (score: number, timeSpent: number) => {
    completeZone('deep_learning', 'vision_observatory', score, timeSpent);
  };

  const handleZone4Complete = async (score: number, timeSpent: number) => {
    completeZone('deep_learning', 'neural_citadel', score, timeSpent);
    await conquerIsland(2);
  };

  // Total island score calculation
  const totalDlScore = 
    (dlTelemetry?.zones?.perceptron_bay?.score || 0) +
    (dlTelemetry?.zones?.conv_canyon?.score || 0) +
    (dlTelemetry?.zones?.vision_observatory?.score || 0) +
    (dlTelemetry?.zones?.neural_citadel?.score || 0);

  const completedCount = dlTelemetry?.zones ? [
    dlTelemetry.zones.perceptron_bay?.completed,
    dlTelemetry.zones.conv_canyon?.completed,
    dlTelemetry.zones.vision_observatory?.completed,
    dlTelemetry.zones.neural_citadel?.completed
  ].filter(Boolean).length : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Island Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel px-6 py-4 rounded-2xl border-purple-500/30 glow-purple">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateTo('map')}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-purple-300 transition-colors"
            title="Return to World Map"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400">
                Island 02 • Deep Learning
              </span>
              {isIslandCompleted && (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> RELIC SECURED: PRISMATIC MIRROR
                </span>
              )}
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <span>The Mirror</span>
            </h1>
          </div>
        </div>

        {/* Score & Telemetry Controls */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 bg-purple-950/50 border border-purple-500/30 rounded-xl text-right">
            <div className="text-[10px] font-mono text-purple-400 uppercase">Zones Conquered</div>
            <div className="font-mono font-bold text-purple-200 text-base">{completedCount} / 4 Zones</div>
          </div>
          <div className="px-4 py-1.5 bg-purple-950/50 border border-purple-500/30 rounded-xl text-right">
            <div className="text-[10px] font-mono text-purple-400 uppercase">Island Score</div>
            <div className="font-mono font-bold text-emerald-400 text-base">{totalDlScore} PTS</div>
          </div>
          <button
            onClick={() => navigateTo('report')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-400 text-purple-300 hover:text-white transition-all text-xs font-mono flex items-center gap-1.5 shadow-md"
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
          const zoneData = dlTelemetry?.zones?.[z.id] || { completed: false, attempts: 0, score: 0 };
          const isDone = zoneData.completed;
          const Icon = z.icon;

          return (
            <div
              key={z.id}
              onClick={() => handleSelectZone(z.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                isCurrent
                  ? 'bg-purple-500/20 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.35)] ring-2 ring-purple-500/30'
                  : isDone
                  ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400'
                  : unlocked
                  ? 'glass-card border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/50 border-slate-900 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isCurrent ? 'bg-purple-500 text-slate-950' : isDone ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50' : 'bg-slate-900 text-slate-500'
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
        {currentZoneId === 'perceptron_bay' && (
          <PerceptronBayZone
            telemetry={dlTelemetry?.zones?.perceptron_bay || { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }}
            onComplete={handleZone1Complete}
            onAdvance={() => handleSelectZone('conv_canyon')}
          />
        )}

        {currentZoneId === 'conv_canyon' && (
          <ConvCanyonZone
            telemetry={dlTelemetry?.zones?.conv_canyon || { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }}
            onComplete={handleZone2Complete}
            onAdvance={() => handleSelectZone('vision_observatory')}
          />
        )}

        {currentZoneId === 'vision_observatory' && (
          <VisionObservatoryZone
            telemetry={dlTelemetry?.zones?.vision_observatory || { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }}
            onComplete={handleZone3Complete}
            onAdvance={() => handleSelectZone('neural_citadel')}
          />
        )}

        {currentZoneId === 'neural_citadel' && (
          <NeuralCitadelZone
            telemetry={dlTelemetry?.zones?.neural_citadel || { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }}
            onComplete={handleZone4Complete}
            onAdvance={() => navigateTo('cv')}
          />
        )}
      </div>
    </div>
  );
};
