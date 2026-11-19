import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/audio';
import { CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Trophy, Sparkles, ShieldAlert, Cpu } from 'lucide-react';
import { ZoneTelemetry } from '../../types';

interface LighthouseZoneProps {
  telemetry: ZoneTelemetry;
  onComplete: (score: number, timeSpentSec: number) => void;
  onOpenReport: () => void;
  onContinueToIsland2: () => void;
}

interface Question {
  id: number;
  category: string;
  scenario: string;
  options: { label: string; text: string; correct: boolean; feedback: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    category: '1. Model Architecture & Selection',
    scenario: 'Your navigation array detects an uncharted coral archipelago. You have 15 continuous acoustic depth sensors and an archive of 5,000 labeled historical seabed scans (Navigable Passage vs. Submerged Hazard). Which algorithm is optimal to predict if a passage is safe?',
    options: [
      {
        label: 'A',
        text: 'K-Means Clustering',
        correct: false,
        feedback: 'K-Means is unsupervised and discards the valuable 5,000 labeled historical safety tags.'
      },
      {
        label: 'B',
        text: 'Supervised Random Forest Classifier',
        correct: true,
        feedback: 'Correct! Random Forest builds an ensemble of decorrelated decision trees, handling continuous non-linear acoustic features and labeled classes with high resilience to noise.'
      },
      {
        label: 'C',
        text: 'Simple Linear Regression',
        correct: false,
        feedback: 'Linear regression predicts unconstrained continuous numerical quantities, not discrete safety categories.'
      },
      {
        label: 'D',
        text: 'Apriori Association Rule Mining',
        correct: false,
        feedback: 'Apriori finds transactional co-occurrences (e.g. basket analysis), not acoustic spatial classification.'
      }
    ]
  },
  {
    id: 2,
    category: '2. Mitigating Overfitting & Generalization',
    scenario: 'During heavy maritime fog, your ship\'s neural vision system achieves 99.8% training accuracy on calm waters, but drops sharply to 54.1% accuracy on stormy validation scans. The model is severely overfitting. What is the most effective engineering intervention?',
    options: [
      {
        label: 'A',
        text: 'Add 15 more hidden layers and multiply training epochs by 10x',
        correct: false,
        feedback: 'Increasing capacity and training time will worsen overfitting to training noise.'
      },
      {
        label: 'B',
        text: 'Apply L2 Regularization (Weight Decay) and introduce Dropout / Data Augmentation',
        correct: true,
        feedback: 'Correct! L2 regularization penalizes extreme model weights, while Dropout and Augmentation force the network to learn robust generalized feature representations.'
      },
      {
        label: 'C',
        text: 'Remove the validation dataset and evaluate solely on training accuracy',
        correct: false,
        feedback: 'Blinding yourself to the generalization gap hides failure, leading to catastrophic shipwreck!'
      },
      {
        label: 'D',
        text: 'Expand the feature set with uncalibrated random noise variables',
        correct: false,
        feedback: 'Adding noisy features increases the curse of dimensionality and exacerbates variance.'
      }
    ]
  },
  {
    id: 3,
    category: '3. Navigational Confusion Matrix (Precision vs. Recall)',
    scenario: 'The Lighthouse Hazard Detector produces the following 2x2 Confusion Matrix for detecting lethal submerged rocks:',
    options: [
      {
        label: 'A',
        text: 'Recall (Sensitivity = TP / [TP + FN]): Minimizing lethal False Negatives (missed rocks)',
        correct: true,
        feedback: 'Correct! Missing a submerged rock (False Negative) sinks the vessel. Maximizing Recall ensures nearly every rock is flagged, even if occasional False Alarms occur.'
      },
      {
        label: 'B',
        text: 'Precision (TP / [TP + FP]): Eliminating False Alarms even if it means missing a rock',
        correct: false,
        feedback: 'High Precision reduces false alarms, but if a rock is missed (False Negative), the vessel sinks!'
      },
      {
        label: 'C',
        text: 'Number of True Negatives alone',
        correct: false,
        feedback: 'Because open water is common, high TN can mask disastrous misses of actual hazards.'
      },
      {
        label: 'D',
        text: 'Training Convergence Speed',
        correct: false,
        feedback: 'Training speed is an operational metric, not a risk-management evaluation criteria.'
      }
    ]
  }
];

export const LighthouseZone: React.FC<LighthouseZoneProps> = ({
  telemetry,
  onComplete,
  onOpenReport,
  onContinueToIsland2
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number | null>>({
    1: null,
    2: null,
    3: null
  });
  const [evaluated, setEvaluated] = useState(false);
  const [passed, setPassed] = useState(telemetry.completed);
  const [attempts, setAttempts] = useState(telemetry.attempts);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Time tracking
  const startTimeRef = useRef<number>(Date.now());
  const [elapsedSec, setElapsedSec] = useState<number>(telemetry.timeSpentSec || 0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectOption = (qId: number, optIdx: number) => {
    if (passed) return;
    sounds.playClick();
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
    setEvaluated(false);
  };

  const handleSubmitBossTrial = () => {
    const allAnswered = Object.values(selectedAnswers).every((val) => val !== null);
    if (!allAnswered) {
      setFeedback('Please answer all 3 diagnostic questions before submitting.');
      sounds.playError();
      return;
    }

    const currentAttempts = attempts + 1;
    setAttempts(currentAttempts);

    const isAllCorrect = QUESTIONS.every((q) => {
      const chosenIdx = selectedAnswers[q.id];
      return chosenIdx !== null && q.options[chosenIdx].correct;
    });

    setEvaluated(true);
    const timeSpent = Math.max(15, Math.round((Date.now() - startTimeRef.current) / 1000));

    if (isAllCorrect) {
      sounds.playSuccess();
      setPassed(true);
      const score = currentAttempts === 1 ? 100 : currentAttempts === 2 ? 85 : 70;
      setFeedback(`BOSS TRIAL CONQUERED! All diagnostic evaluations verified. Machine Learning Island status set to COMPLETED (+${score} PTS).`);
      onComplete(score, timeSpent);
    } else {
      sounds.playError();
      setFeedback('Diagnostic failure: Review the highlighted feedback below and re-evaluate.');
    }
  };

  const handleReset = () => {
    sounds.playClick();
    setSelectedAnswers({ 1: null, 2: null, 3: null });
    setEvaluated(false);
    setFeedback(null);
  };

  return (
    <div className="space-y-6">
      {/* Zone Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 glass-card rounded-xl border-amber-500/30 glow-amber">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zone 04 • The Lighthouse (Boss Trial)</span>
            </div>
            <h2 className="font-cinzel text-lg font-bold text-white">
              The Grand Predictor Diagnostic
            </h2>
          </div>
        </div>

        {/* Live HUD */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3 py-1.5 bg-slate-950/80 rounded-xl border border-slate-800 text-slate-300">
            Attempts: <strong className="text-white">{attempts}</strong>
          </div>
          <div className="px-3 py-1.5 bg-slate-950/80 rounded-xl border border-slate-800 text-slate-300">
            Time: <strong className="text-cyan-300">{elapsedSec}s</strong>
          </div>
          {passed && (
            <div className="px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ISLAND MASTERED</span>
            </div>
          )}
        </div>
      </div>

      {/* Boss Trial Questions */}
      <div className="space-y-6">
        {QUESTIONS.map((q) => {
          const chosenIdx = selectedAnswers[q.id];

          return (
            <div key={q.id} className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
                  {q.category}
                </span>
                {evaluated && chosenIdx !== null && (
                  q.options[chosenIdx].correct ? (
                    <span className="flex items-center gap-1 text-xs font-mono text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> Passed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-mono text-rose-400">
                      <AlertTriangle className="w-4 h-4" /> Failed
                    </span>
                  )
                )}
              </div>

              <p className="text-slate-200 text-sm leading-relaxed">
                {q.scenario}
              </p>

              {/* Special Matrix for Question 3 */}
              {q.id === 3 && (
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 max-w-md mx-auto my-2 space-y-2">
                  <div className="text-[11px] font-mono uppercase text-slate-400 text-center font-bold">
                    Confusion Matrix: Submerged Rock Sensor
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-center">
                    <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg">
                      <div className="text-emerald-400 font-bold text-base">92</div>
                      <div className="text-[10px] text-slate-400">True Positive (TP)</div>
                      <div className="text-[9px] text-slate-500">Rocks Correctly Alerted</div>
                    </div>
                    <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-lg">
                      <div className="text-rose-400 font-bold text-base">8</div>
                      <div className="text-[10px] text-slate-400">False Negative (FN)</div>
                      <div className="text-[9px] text-rose-300 font-bold">Lethal Missed Rocks!</div>
                    </div>
                    <div className="p-2.5 bg-amber-950/30 border border-amber-500/30 rounded-lg">
                      <div className="text-amber-400 font-bold text-base">35</div>
                      <div className="text-[10px] text-slate-400">False Positive (FP)</div>
                      <div className="text-[9px] text-slate-500">False Alarms (Clear Water)</div>
                    </div>
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                      <div className="text-slate-200 font-bold text-base">865</div>
                      <div className="text-[10px] text-slate-400">True Negative (TN)</div>
                      <div className="text-[9px] text-slate-500">Clear Water Navigated</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-1 gap-2.5 pt-1">
                {q.options.map((opt, optIdx) => {
                  const isSelected = chosenIdx === optIdx;
                  const isCorrect = evaluated && opt.correct;
                  const isWrongSelected = evaluated && isSelected && !opt.correct;

                  return (
                    <div key={opt.label} className="space-y-1.5">
                      <button
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        disabled={passed}
                        className={`w-full p-3.5 rounded-xl border font-mono text-xs text-left transition-all flex items-start gap-3 ${
                          isCorrect
                            ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 ring-1 ring-emerald-500/50'
                            : isWrongSelected
                            ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                            : isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 ring-1 ring-cyan-500/40'
                            : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          isSelected ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {opt.label}
                        </span>
                        <span className="leading-relaxed">{opt.text}</span>
                      </button>

                      {/* Diagnostic Feedback */}
                      {evaluated && isSelected && (
                        <div className={`p-2.5 rounded-lg text-[11px] font-mono leading-relaxed ${
                          opt.correct
                            ? 'bg-emerald-950/40 border border-emerald-900/40 text-emerald-300'
                            : 'bg-rose-950/40 border border-rose-900/40 text-rose-300'
                        }`}>
                          {opt.feedback}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action / Boss Victory Banner */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
        {feedback && (
          <div className={`p-4 rounded-xl border font-mono text-xs leading-relaxed ${
            passed
              ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
          }`}>
            {feedback}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {!passed ? (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleReset}
                className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 rounded-xl transition-all"
                title="Reset Selections"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleSubmitBossTrial}
                className="flex-1 sm:flex-none px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl font-mono text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2"
              >
                <Cpu className="w-4 h-4" />
                <span>SUBMIT BOSS DIAGNOSTICS</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3 w-full justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Relic Secured: <strong>The Matrix of Foresight</strong></span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={onOpenReport}
                  className="flex-1 sm:flex-none px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-xl font-mono text-xs font-semibold transition-all shadow-md"
                >
                  VIEW MASTERY REPORT
                </button>
                <button
                  onClick={onContinueToIsland2}
                  className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl font-mono text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
                >
                  <span>CONTINUE TO ISLAND 2 (THE MIRROR)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
