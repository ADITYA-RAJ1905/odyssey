import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import { 
  Eye, ArrowLeft, CheckCircle2, Lock, Sparkles, Trophy, 
  Layers, Compass, FileText, Image as ImageIcon, Crosshair 
} from 'lucide-react';
import { PixelHarborZone } from '../components/zones/PixelHarborZone';
import { SegmentationReefZone } from '../components/zones/SegmentationReefZone';
import { ClipCliffsZone } from '../components/zones/ClipCliffsZone';
import { VisionCitadelZone } from '../components/zones/VisionCitadelZone';

type ZoneId = 'pixel_harbor' | 'segmentation_reef' | 'clip_lighthouse' | 'vision_citadel';

interface ZoneMeta {
  id: ZoneId;
  num: number;
  name: string;
  domain: string;
  icon: any;
}

const ZONES: ZoneMeta[] = [
  { id: 'pixel_harbor', num: 1, name: 'Pixel Harbor', domain: 'Tensors & Augmentation', icon: ImageIcon },
  { id: 'segmentation_reef', num: 2, name: 'Segmentation Reef', domain: 'SegFormer-B0 Masks', icon: Layers },
  { id: 'clip_lighthouse', num: 3, name: 'Zero-Shot Cliffs', domain: 'CLIP Vision-Language', icon: Compass },
  { id: 'vision_citadel', num: 4, name: 'Vision Citadel', domain: 'Boss Diagnostic Trial', icon: Eye }
];

export const CVIslandView: React.FC = () => {
  const { profile, telemetry, completeZone, conquerIsland, navigateTo } = useGame();
  const [currentZoneId, setCurrentZoneId] = useState<ZoneId>('pixel_harbor');

  const cvTelemetry = telemetry.islands.computer_vision || (telemetry.islands as any).island_3;
  const isIslandCompleted = cvTelemetry?.status === 'completed' || profile?.conquered_islands?.includes(3);

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
    completeZone('computer_vision', 'pixel_harbor', score, timeSpent);
  };

  const handleZone2Complete = (score: number, timeSpent: number) => {
    completeZone('computer_vision', 'segmentation_reef', score, timeSpent);
  };

  const handleZone3Complete = (score: number, timeSpent: number) => {
    completeZone('computer_vision', 'clip_lighthouse', score, timeSpent);
  };

  const handleZone4Complete = async (score: number, timeSpent: number) => {
    completeZone('computer_vision', 'vision_citadel', score, timeSpent);
    await conquerIsland(3);
  };

  // Total island score calculation
  const totalCvScore = 
    (cvTelemetry?.zones?.pixel_harbor?.score || 0) +
    (cvTelemetry?.zones?.segmentation_reef?.score || 0) +
    (cvTelemetry?.zones?.clip_lighthouse?.score || 0) +
    (cvTelemetry?.zones?.vision_citadel?.score || 0);

  const completedCount = cvTelemetry?.zones ? [
    cvTelemetry.zones.pixel_harbor?.completed,
    cvTelemetry.zones.segmentation_reef?.completed,
    cvTelemetry.zones.clip_lighthouse?.completed,
    cvTelemetry.zones.vision_citadel?.completed
  ].filter(Boolean).length : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Island Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel px-6 py-4 rounded-2xl border-amber-500/30 glow-amber">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateTo('map')}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 transition-colors"
            title="Return to World Map"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                Island 03 • Computer Vision
              </span>
              {isIslandCompleted && (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> RELIC SECURED: LENS OF PERCEPTION
                </span>
              )}
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <Eye className="w-6 h-6 text-amber-400" />
              <span>The Observer</span>
            </h1>
          </div>
        </div>

        {/* Score & Telemetry Controls */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 bg-amber-950/50 border border-amber-500/30 rounded-xl text-right">
            <div className="text-[10px] font-mono text-amber-400 uppercase">Zones Conquered</div>
            <div className="font-mono font-bold text-amber-200 text-base">{completedCount} / 4 Zones</div>
          </div>
          <div className="px-4 py-1.5 bg-amber-950/50 border border-amber-500/30 rounded-xl text-right">
            <div className="text-[10px] font-mono text-amber-400 uppercase">Island Score</div>
            <div className="font-mono font-bold text-emerald-400 text-base">{totalCvScore} PTS</div>
          </div>
          <button
            onClick={() => navigateTo('report')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-amber-300 hover:text-white transition-all text-xs font-mono flex items-center gap-1.5 shadow-md"
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
          const zoneData = cvTelemetry?.zones?.[z.id] || { completed: false, attempts: 0, score: 0 };
          const isDone = zoneData.completed;
          const Icon = z.icon;

          return (
            <div
              key={z.id}
              onClick={() => handleSelectZone(z.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                isCurrent
                  ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)] ring-2 ring-amber-500/30'
                  : isDone
                  ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400'
                  : unlocked
                  ? 'glass-card border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/50 border-slate-900 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isCurrent ? 'bg-amber-500 text-slate-950' : isDone ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50' : 'bg-slate-900 text-slate-500'
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
        {currentZoneId === 'pixel_harbor' && (
          <PixelHarborZone
            telemetry={cvTelemetry?.zones?.pixel_harbor || { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }}
            onComplete={handleZone1Complete}
            onAdvance={() => handleSelectZone('segmentation_reef')}
          />
        )}

        {currentZoneId === 'segmentation_reef' && (
          <SegmentationReefZone
            telemetry={cvTelemetry?.zones?.segmentation_reef || { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }}
            onComplete={handleZone2Complete}
            onAdvance={() => handleSelectZone('clip_lighthouse')}
          />
        )}

        {currentZoneId === 'clip_lighthouse' && (
          <ClipCliffsZone
            telemetry={cvTelemetry?.zones?.clip_lighthouse || { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }}
            onComplete={handleZone3Complete}
            onAdvance={() => handleSelectZone('vision_citadel')}
          />
        )}

        {currentZoneId === 'vision_citadel' && (
          <VisionCitadelZone
            telemetry={cvTelemetry?.zones?.vision_citadel || { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }}
            onComplete={handleZone4Complete}
            onAdvance={() => navigateTo('nlp')}
          />
        )}
      </div>
    </div>
  );
};
