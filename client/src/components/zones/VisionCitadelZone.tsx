import React, { useState, useRef } from 'react';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Trophy, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, 
  Eye, ShieldAlert, Award, Compass, Layers 
} from 'lucide-react';
import { ZoneTelemetry } from '../../types';

interface VisionCitadelZoneProps {
  telemetry: ZoneTelemetry;
  onComplete: (score: number, timeSpentSec: number) => void;
  onAdvance: () => void;
}

interface Question {
  id: string;
  topic: string;
  title: string;
  scenario: string;
  options: Array<{
    id: string;
    text: string;
    rationale: string;
    isCorrect: boolean;
  }>;
}

const BOSS_QUESTIONS: Question[] = [
  {
    id: 'cv_bq1',
    topic: 'Computer Vision Paradigms',
    title: 'Trial 1: Autonomous Channel & Obstacle Navigation',
    scenario: 'Your autonomous exploration vessel must navigate complex archipelago channels. It requires continuously delineating the exact curvilinear edges of navigable water channels (amorphous surfaces) while simultaneously counting, localizing, and individually tracking distinct maritime vessels (e.g., three separate nearby skiffs). Which combination of computer vision paradigms is essential?',
    options: [
      {
        id: 'opt1',
        text: 'Semantic Segmentation (for continuous channel & shoreline boundary masks) combined with Instance Segmentation or Object Detection (for separate discrete vessel instances).',
        rationale: 'Correct! Semantic segmentation assigns continuous pixel masks to stuff (water, sky, shore), while instance segmentation assigns unique instance IDs to distinct individual things (vessel 1, vessel 2).',
        isCorrect: true
      },
      {
        id: 'opt2',
        text: 'Image Classification alone, since a single label is sufficient to steer the rudder.',
        rationale: 'Incorrect. Whole-image classification outputs only a single categorical label and lacks spatial localization entirely.',
        isCorrect: false
      },
      {
        id: 'opt3',
        text: 'Linear Regression over raw RGB histogram values.',
        rationale: 'Incorrect. Histogram regression ignores all 2D spatial features and cannot delineate channels or detect objects.',
        isCorrect: false
      },
      {
        id: 'opt4',
        text: 'Bounding box Object Detection alone for all objects and water surfaces.',
        rationale: 'Incorrect. Rectangular boxes cannot cleanly delineate amorphous curved waterways or coastline shorelines without including massive non-water background areas.',
        isCorrect: false
      }
    ]
  },
  {
    id: 'cv_bq2',
    topic: 'Evaluation Metrics & Intersection over Union',
    title: 'Trial 2: Exact IoU Metric Calculation',
    scenario: 'An anchor box detector predicts a bounding box of area 60 px². The true ground-truth vessel box has an area of 80 px². The spatial intersection (overlap) between the two boxes measures 40 px². Using the formula IoU = Overlap / (Area_A + Area_B - Overlap), what is the resulting Intersection over Union score?',
    options: [
      {
        id: 'opt1',
        text: '0.40 (40% IoU)',
        rationale: 'Correct! Union = 60 + 80 - 40 = 100 px². IoU = 40 / 100 = 0.40 (40%).',
        isCorrect: true
      },
      {
        id: 'opt2',
        text: '0.50 (50% IoU)',
        rationale: 'Incorrect. 40 / 80 calculates precision relative to ground truth only, not union.',
        isCorrect: false
      },
      {
        id: 'opt3',
        text: '0.67 (67% IoU)',
        rationale: 'Incorrect. 40 / 60 calculates recall relative to predicted box only, not union.',
        isCorrect: false
      },
      {
        id: 'opt4',
        text: '0.28 (28% IoU)',
        rationale: 'Incorrect. Arithmetic miscalculation in the union denominator.',
        isCorrect: false
      }
    ]
  },
  {
    id: 'cv_bq3',
    topic: 'Covariate Shift & Generalization',
    title: 'Trial 3: Diagnosing Domain Shift in Extreme Weather',
    scenario: 'A state-of-the-art vision model trained on 100,000 clear, sunny California daytime coastal photos suffers a catastrophic 80% accuracy drop when deployed on foggy Scandinavian winter voyages. What fundamental machine learning phenomenon occurred, and how is it systematically mitigated?',
    options: [
      {
        id: 'opt1',
        text: 'Domain / Covariate Shift: The operational input distribution P(X) drastically diverges from training distribution P(X); mitigated via domain adaptation, winter weather data collection, and atmospheric brightness/fog augmentation.',
        rationale: 'Correct! Convolutional features learned exclusively on high-contrast sunny data fail when contrast, color distributions, and illumination conditions shift fundamentally in real deployments.',
        isCorrect: true
      },
      {
        id: 'opt2',
        text: 'Catastrophic Underfitting: The neural network is too small and should be scaled down to 3 layers.',
        rationale: 'Incorrect. The model was capable on its original training domain; the failure stems from distribution divergence.',
        isCorrect: false
      },
      {
        id: 'opt3',
        text: 'Hardware Timer Drift: The drone camera shutter frequency is out of sync.',
        rationale: 'Incorrect. This is an algorithmic representation gap, not a clock drift issue.',
        isCorrect: false
      },
      {
        id: 'opt4',
        text: 'Over-regularization: Solved by eliminating all Batch Normalization layers and skip connections.',
        rationale: 'Incorrect. Removing normalization will degrade training stability without addressing weather generalization.',
        isCorrect: false
      }
    ]
  }
];

export const VisionCitadelZone: React.FC<VisionCitadelZoneProps> = ({
  telemetry,
  onComplete,
  onAdvance
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [relicUnlocked, setRelicUnlocked] = useState<boolean>(telemetry.completed);

  const startTimeRef = useRef<number>(Date.now());
  const [attempts, setAttempts] = useState<number>(telemetry.attempts || 0);

  // Evaluate correct answers
  const correctCount = BOSS_QUESTIONS.filter((q) => {
    const chosenId = selectedAnswers[q.id];
    const correctOpt = q.options.find((o) => o.isCorrect);
    return chosenId === correctOpt?.id;
  }).length;

  const allCorrect = correctCount === BOSS_QUESTIONS.length;

  const handleSelectOption = (qId: string, optId: string) => {
    if (relicUnlocked) return;
    sounds.playClick();
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleEvaluateBoss = () => {
    const elapsedSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    setAttempts((prev) => prev + 1);
    setIsSubmitted(true);

    if (allCorrect) {
      sounds.playRelic();
      setRelicUnlocked(true);
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });
      const score = Math.max(80, 100 - (attempts * 7));
      onComplete(score, elapsedSec);
    } else {
      sounds.playError();
    }
  };

  return (
    <div className="space-y-6">
      {/* Boss Trial Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-amber-500/40 glow-amber space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900/40 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono uppercase tracking-widest">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Zone 04 • Apex Evaluation Gate</span>
            </div>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-black text-white mt-1 flex items-center gap-2">
              <Eye className="w-7 h-7 text-amber-400" />
              <span>The Vision Citadel: Boss Diagnostic Trial</span>
            </h2>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-mono uppercase text-slate-400">Mastery Gate</div>
            <div className="font-mono text-sm font-bold text-amber-300">
              {correctCount} / {BOSS_QUESTIONS.length} Diagnostic Trials Solved
            </div>
          </div>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed max-w-3xl">
          You stand at the summit of the Vision Citadel. To synthesize the <strong>Lens of Perception</strong> and unlock Island 4 (The Voices / NLP), you must resolve three mission-critical computer vision dilemmas concerning paradigm selection, IoU metric precision, and domain shift mitigation.
        </p>
      </div>

      {/* Relic Acquired Victory Card */}
      {relicUnlocked && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900/90 to-amber-950/80 border-2 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.4)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)]">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-mono text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Computer Vision Domain Conquered</span>
              </div>
              <h3 className="font-cinzel text-2xl font-bold text-white mt-0.5">
                Relic Claimed: The Lens of Perception
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                The Lens of Perception resolves spatial topologies and semantic masks, illuminating the sea route to Island 4 (The Voices / Natural Language Processing).
              </p>
            </div>
          </div>

          <button
            onClick={onAdvance}
            className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-mono text-xs font-bold transition-all shadow-xl shadow-amber-600/40 flex items-center justify-center gap-2"
          >
            <span>Proceed to Island 4 (The Voices)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3 Diagnostic Questions */}
      <div className="space-y-6">
        {BOSS_QUESTIONS.map((q, idx) => {
          const selectedOptId = selectedAnswers[q.id];

          return (
            <div
              key={q.id}
              className="glass-panel p-6 sm:p-7 rounded-2xl border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                    {q.topic}
                  </span>
                </div>
                {isSubmitted && (
                  <span className="text-xs font-mono">
                    {q.options.find((o) => o.id === selectedOptId)?.isCorrect ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> PASSED
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> FAILED
                      </span>
                    )}
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-cinzel text-base sm:text-lg font-bold text-white">
                  {q.title}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm font-light mt-2 leading-relaxed">
                  {q.scenario}
                </p>
              </div>

              {/* Options List */}
              <div className="space-y-2.5 pt-2">
                {q.options.map((opt) => {
                  const isSelected = selectedOptId === opt.id;
                  let borderStyle = 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300';

                  if (isSelected && !isSubmitted) {
                    borderStyle = 'border-amber-500 bg-amber-950/40 text-white shadow-md';
                  } else if (isSubmitted) {
                    if (opt.isCorrect) {
                      borderStyle = 'border-emerald-500 bg-emerald-950/40 text-white';
                    } else if (isSelected && !opt.isCorrect) {
                      borderStyle = 'border-rose-500 bg-rose-950/40 text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      disabled={relicUnlocked}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${borderStyle}`}
                    >
                      <div className="flex items-center justify-between text-xs sm:text-sm font-sans">
                        <span>{opt.text}</span>
                        {isSubmitted && opt.isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                        )}
                      </div>
                      {isSubmitted && isSelected && (
                        <div className="text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-1.5 mt-1">
                          {opt.rationale}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trial Footer Action */}
      {!relicUnlocked && (
        <div className="glass-panel p-6 rounded-2xl border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono text-slate-400">
            Boss Verification Attempts: <span className="text-white font-bold">{attempts}</span>
          </div>

          <button
            onClick={handleEvaluateBoss}
            disabled={Object.keys(selectedAnswers).length < BOSS_QUESTIONS.length}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
              Object.keys(selectedAnswers).length === BOSS_QUESTIONS.length
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Submit Boss Evaluation</span>
          </button>
        </div>
      )}
    </div>
  );
};
