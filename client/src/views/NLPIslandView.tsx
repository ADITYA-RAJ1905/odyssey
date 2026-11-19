import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import { 
  MessageSquareCode, ArrowLeft, CheckCircle2, Lock, Sparkles, Trophy, 
  Layers, Compass, FileText, Type, Network, Hash 
} from 'lucide-react';
import { TokenPortZone } from '../components/zones/TokenPortZone';
import { EmbeddingLagoonZone } from '../components/zones/EmbeddingLagoonZone';
import { SentimentGorgeZone } from '../components/zones/SentimentGorgeZone';
import { TransformerCitadelZone } from '../components/zones/TransformerCitadelZone';

type ZoneId = 'token_port' | 'embedding_lagoon' | 'sentiment_gorge' | 'transformer_citadel';

interface ZoneMeta {
  id: ZoneId;
  num: number;
  name: string;
  domain: string;
  icon: any;
}

const ZONES: ZoneMeta[] = [
  { id: 'token_port', num: 1, name: 'Token Port', domain: 'Subwords & Vocabularies', icon: Type },
  { id: 'embedding_lagoon', num: 2, name: 'Embedding Lagoon', domain: 'Dense Vector Cosine Metric', icon: Compass },
  { id: 'sentiment_gorge', num: 3, name: 'Sentiment Gorge', domain: 'Self-Attention & Sarcasm', icon: Network },
  { id: 'transformer_citadel', num: 4, name: 'Transformer Citadel', domain: 'Boss Diagnostic Trial', icon: MessageSquareCode }
];

export const NLPIslandView: React.FC = () => {
  const { profile, telemetry, completeZone, conquerIsland, navigateTo } = useGame();
  const [currentZoneId, setCurrentZoneId] = useState<ZoneId>('token_port');

  const nlpTelemetry = (telemetry.islands as any).nlp || (telemetry.islands as any).island_4;
  const isIslandCompleted = nlpTelemetry?.status === 'completed' || profile?.conquered_islands?.includes(4);

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
    completeZone('nlp', 'token_port', score, timeSpent);
  };

  const handleZone2Complete = (score: number, timeSpent: number) => {
    completeZone('nlp', 'embedding_lagoon', score, timeSpent);
  };

  const handleZone3Complete = (score: number, timeSpent: number) => {
    completeZone('nlp', 'sentiment_gorge', score, timeSpent);
  };

  const handleZone4Complete = async (score: number, timeSpent: number) => {
    completeZone('nlp', 'transformer_citadel', score, timeSpent);
    await conquerIsland(4);
  };

  // Total island score calculation
  const totalNlpScore = 
    (nlpTelemetry?.zones?.token_port?.score || 0) +
    (nlpTelemetry?.zones?.embedding_lagoon?.score || 0) +
    (nlpTelemetry?.zones?.sentiment_gorge?.score || 0) +
    (nlpTelemetry?.zones?.transformer_citadel?.score || 0);

  const completedCount = nlpTelemetry?.zones ? [
    nlpTelemetry.zones.token_port?.completed,
    nlpTelemetry.zones.embedding_lagoon?.completed,
    nlpTelemetry.zones.sentiment_gorge?.completed,
    nlpTelemetry.zones.transformer_citadel?.completed
  ].filter(Boolean).length : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Island Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel px-6 py-4 rounded-2xl border-emerald-500/30 glow-emerald">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateTo('map')}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-emerald-400 text-slate-300 hover:text-emerald-300 transition-colors"
            title="Return to World Map"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                Island 04 • Natural Language Processing
              </span>
              {isIslandCompleted && (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> RELIC SECURED: ECHO STONE
                </span>
              )}
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <MessageSquareCode className="w-6 h-6 text-emerald-400" />
              <span>The Voices</span>
            </h1>
          </div>
        </div>

        {/* Score & Telemetry Controls */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-right">
            <div className="text-[10px] font-mono text-emerald-400 uppercase">Zones Conquered</div>
            <div className="font-mono font-bold text-emerald-200 text-base">{completedCount} / 4 Zones</div>
          </div>
          <div className="px-4 py-1.5 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-right">
            <div className="text-[10px] font-mono text-emerald-400 uppercase">Island Score</div>
            <div className="font-mono font-bold text-emerald-400 text-base">{totalNlpScore} PTS</div>
          </div>
          <button
            onClick={() => navigateTo('report')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-400 text-emerald-300 hover:text-white transition-all text-xs font-mono flex items-center gap-1.5 shadow-md"
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
          const zoneData = nlpTelemetry?.zones?.[z.id] || { completed: false, attempts: 0, score: 0 };
          const isDone = zoneData.completed;
          const Icon = z.icon;

          return (
            <div
              key={z.id}
              onClick={() => handleSelectZone(z.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                isCurrent
                  ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)] ring-2 ring-emerald-500/30'
                  : isDone
                  ? 'bg-emerald-950/30 border-emerald-500/40 hover:border-emerald-400'
                  : unlocked
                  ? 'glass-card border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/50 border-slate-900 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isCurrent ? 'bg-emerald-500 text-slate-950' : isDone ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50' : 'bg-slate-900 text-slate-500'
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
        {currentZoneId === 'token_port' && (
          <TokenPortZone
            telemetry={nlpTelemetry?.zones?.token_port || { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }}
            onComplete={handleZone1Complete}
            onAdvance={() => handleSelectZone('embedding_lagoon')}
          />
        )}

        {currentZoneId === 'embedding_lagoon' && (
          <EmbeddingLagoonZone
            telemetry={nlpTelemetry?.zones?.embedding_lagoon || { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }}
            onComplete={handleZone2Complete}
            onAdvance={() => handleSelectZone('sentiment_gorge')}
          />
        )}

        {currentZoneId === 'sentiment_gorge' && (
          <SentimentGorgeZone
            telemetry={nlpTelemetry?.zones?.sentiment_gorge || { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }}
            onComplete={handleZone3Complete}
            onAdvance={() => handleSelectZone('transformer_citadel')}
          />
        )}

        {currentZoneId === 'transformer_citadel' && (
          <TransformerCitadelZone
            telemetry={nlpTelemetry?.zones?.transformer_citadel || { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }}
            onComplete={handleZone4Complete}
            onAdvance={() => navigateTo('rl')}
          />
        )}
      </div>
    </div>
  );
};
