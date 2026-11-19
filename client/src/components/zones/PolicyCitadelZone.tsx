import React, { useState, useRef } from 'react';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Trophy, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, 
  Compass, ShieldAlert, Award, Layers, Zap, Calculator 
} from 'lucide-react';
import { ZoneTelemetry } from '../../types';

interface PolicyCitadelZoneProps {
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
    id: 'rl_bq1',
    topic: 'Reward Engineering & Specification Gaming',
    title: 'Trial 1: The Infinite Regatta Turbo-Loop',
    scenario: 'An autonomous vessel trained with reinforcement learning was rewarded +1 point whenever it passed near a floating turbo-buoy and +100 points for crossing the regatta finish line. During live sea trials, instead of racing to the finish line, the vessel entered an endless tight loop circling a cluster of three turbo-buoys indefinitely to accumulate infinite points. What is this failure mode and its principled engineering remedy?',
    options: [
      {
        id: 'opt1',
        text: 'Reward Hacking (Specification Gaming): The proxy reward was misaligned with the true goal; resolve by making turbo-buoys single-use (consumed upon collection), adding a per-step time penalty (-0.1/step), or applying potential-based reward shaping F(s, s\') = γΦ(s\') - Φ(s) which mathematically preserves the optimal policy.',
        rationale: 'Correct! Reward hacking occurs when an agent exploits loopholes in a proxy reward function to maximize return without fulfilling the human designer’s true objective. Potential-based reward shaping guarantees policy invariance while guiding exploration.',
        isCorrect: true
      },
      {
        id: 'opt2',
        text: 'Neural Tensor Saturation: The model ran out of floating-point registers; resolve by switching to float64 precision.',
        rationale: 'Incorrect. The model is behaving rationally according to the objective it was given; the defect is in the reward function, not hardware precision.',
        isCorrect: false
      },
      {
        id: 'opt3',
        text: 'Increase the turbo-buoy reward to +1,000 to encourage faster driving toward the finish line.',
        rationale: 'Incorrect. Increasing the buoy reward makes looping even more lucrative compared to the finish line, worsening the behavior.',
        isCorrect: false
      },
      {
        id: 'opt4',
        text: 'Disregard the reward function and manually hardcode the rudder steering angles with an if-statement.',
        rationale: 'Incorrect. Hardcoding abandons reinforcement learning rather than designing an aligned Markov Decision Process.',
        isCorrect: false
      }
    ]
  },
  {
    id: 'rl_bq2',
    topic: 'Algorithmic Selection: Value-Based vs. Policy Gradients',
    title: 'Trial 2: Continuous 7-DOF Robotic Arm Control',
    scenario: 'Your engineering team must automate a 7-degree-of-freedom robotic cargo arm. Each joint is actuated by continuous electric torque voltages τ ∈ [-5.0 Nm, +5.0 Nm]. Why is standard Deep Q-Networks (DQN) fundamentally unsuited for this continuous control problem, and why is an Actor-Critic Policy Gradient architecture (such as PPO or Soft Actor-Critic) preferred?',
    options: [
      {
        id: 'opt1',
        text: 'DQN requires evaluating max_a Q(s, a) across all actions at every step, which is computationally intractable in continuous action spaces without combinatorial discretization; Actor-Critic methods directly parameterize continuous probability distributions (e.g. Gaussian mean μ and variance σ) for continuous action outputs.',
        rationale: 'Correct! Finding the argmax of a non-convex Q-function over a 7-dimensional continuous space at 60Hz is intractable. Policy gradient / actor-critic methods output continuous action parameters directly through policy network heads.',
        isCorrect: true
      },
      {
        id: 'opt2',
        text: 'DQN cannot run with convolutional or dense layers in modern deep learning frameworks.',
        rationale: 'Incorrect. DQN uses dense and convolutional layers routinely; its limitation is the discrete argmax requirement.',
        isCorrect: false
      },
      {
        id: 'opt3',
        text: 'Policy gradient methods only work on board games like Chess, while DQN is reserved for robotics.',
        rationale: 'Incorrect. The opposite is true: DQN conquered discrete Atari games, while Actor-Critic (PPO/SAC) dominates continuous robotics.',
        isCorrect: false
      },
      {
        id: 'opt4',
        text: 'Continuous motors can only be governed by PID controllers and cannot use reinforcement learning.',
        rationale: 'Incorrect. Deep RL (PPO/SAC) is widely deployed for robotic manipulation, quadrupedal locomotion, and industrial control.',
        isCorrect: false
      }
    ]
  },
  {
    id: 'rl_bq3',
    topic: 'Bellman Optimality Temporal Difference Update',
    title: 'Trial 3: Exact Numerical Bellman Calculation',
    scenario: 'An autonomous agent is in state s and executes action a. The current Q-table entry is Q(s, a) = 4.0. It receives an immediate reward r = 2.0 and transitions to state s\'. In state s\', the Q-values for candidate actions are Q(s\', a1) = 5.0, Q(s\', a2) = 10.0, and Q(s\', a3) = 6.0. Given learning rate α = 0.5 and discount factor γ = 0.8, calculate the exact updated entry Q(s, a) using the Bellman TD equation: Q(s, a) ← Q(s, a) + α [r + γ max_a\' Q(s\', a\') - Q(s, a)]. What is the updated Q(s, a)?',
    options: [
      {
        id: 'opt1',
        text: '7.0 (max Q\' = 10.0; Target = 2.0 + 0.8 × 10.0 = 10.0; TD Error = 10.0 - 4.0 = 6.0; New Q = 4.0 + 0.5 × 6.0 = 7.0)',
        rationale: 'Correct! Exactly right: max Q(s\', a\') = 10.0. The discounted target is 2.0 + 0.8(10.0) = 10.0. The TD error is 10.0 - 4.0 = 6.0. The step update is 4.0 + 0.5(6.0) = 7.0.',
        isCorrect: true
      },
      {
        id: 'opt2',
        text: '4.8 (Target = 2.0 + 0.8 × 5.0 = 6.0; New Q = 4.0 + 0.5 × 1.6 = 4.8)',
        rationale: 'Incorrect. Q-learning uses max_a\' Q(s\', a\'), which is 10.0, not 5.0.',
        isCorrect: false
      },
      {
        id: 'opt3',
        text: '10.0 (The entry immediately overwrites to match the maximum next state Q-value).',
        rationale: 'Incorrect. The update is scaled by learning rate α = 0.5; it does not replace the old estimate instantaneously.',
        isCorrect: false
      },
      {
        id: 'opt4',
        text: '5.5 (Average of all candidate next-state Q-values).',
        rationale: 'Incorrect. Q-learning evaluates the max action (off-policy Bellman optimality), not the average (expected SARSA).',
        isCorrect: false
      }
    ]
  }
];

export const PolicyCitadelZone: React.FC<PolicyCitadelZoneProps> = ({
  telemetry,
  onComplete,
  onAdvance
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [answersState, setAnswersState] = useState<Record<number, boolean>>({});
  const [trialCompleted, setTrialCompleted] = useState<boolean>(telemetry.completed || false);

  const startTimeRef = useRef<number>(Date.now());
  const [attempts, setAttempts] = useState<number>(telemetry.attempts || 0);

  const currentQ = BOSS_QUESTIONS[currentQuestionIndex];
  const selectedOption = currentQ.options.find((o) => o.id === selectedOptionId);

  const handleSubmitQuestion = () => {
    if (!selectedOptionId) return;
    sounds.playClick();
    setSubmitted(true);

    const isCorrect = selectedOption?.isCorrect || false;
    setAnswersState((prev) => ({ ...prev, [currentQuestionIndex]: isCorrect }));

    if (isCorrect) {
      sounds.playSuccess();
    } else {
      sounds.playError();
      setAttempts((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    sounds.playClick();
    setSelectedOptionId(null);
    setSubmitted(false);

    if (currentQuestionIndex < BOSS_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Trial complete!
      setTrialCompleted(true);
      sounds.playRelic();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      const score = Math.max(80, 100 - attempts * 5);
      onComplete(score, elapsed);
    }
  };

  const handleRetryQuestion = () => {
    sounds.playClick();
    setSelectedOptionId(null);
    setSubmitted(false);
  };

  return (
    <div className="space-y-6">
      {/* Zone Header */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-500/30 glow-indigo space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-indigo-400">
                Zone 04 · Reinforcement Learning · Boss Diagnostic Trial
              </div>
              <h2 className="font-cinzel text-2xl font-bold text-white">
                The Policy Citadel: Reward Alignment & Bellman Dynamics
              </h2>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center gap-2">
            {BOSS_QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center transition-all ${
                  trialCompleted || answersState[i]
                    ? 'bg-indigo-500 text-slate-950 font-bold shadow-md shadow-indigo-500/30'
                    : i === currentQuestionIndex
                    ? 'bg-indigo-500/20 border border-indigo-400 text-indigo-300 ring-2 ring-indigo-400/40'
                    : 'bg-slate-900 border border-slate-800 text-slate-500'
                }`}
              >
                {trialCompleted || answersState[i] ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {!trialCompleted ? (
        /* Question Trial Interface */
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-5">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                {currentQ.topic}
              </span>
              <span className="text-xs font-mono text-slate-500">
                Diagnostic {currentQuestionIndex + 1} of {BOSS_QUESTIONS.length}
              </span>
            </div>

            {/* Question Details */}
            <div>
              <h3 className="font-cinzel text-xl font-bold text-white mb-2">
                {currentQ.title}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                {currentQ.scenario}
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                let borderClass = 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-300';

                if (submitted) {
                  if (opt.isCorrect) {
                    borderClass = 'border-emerald-500 bg-emerald-500/15 text-white';
                  } else if (isSelected && !opt.isCorrect) {
                    borderClass = 'border-rose-500 bg-rose-500/15 text-rose-200';
                  }
                } else if (isSelected) {
                  borderClass = 'border-indigo-500 bg-indigo-500/10 text-white';
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (!submitted) {
                        sounds.playClick();
                        setSelectedOptionId(opt.id);
                      }
                    }}
                    disabled={submitted}
                    className={`w-full text-left p-4 rounded-xl border transition-all text-xs leading-relaxed flex items-start gap-3 ${borderClass}`}
                  >
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px] font-bold">
                      {opt.id.slice(-1).toUpperCase()}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback & Rationale */}
            {submitted && selectedOption && (
              <div
                className={`p-4 rounded-xl border space-y-2 text-xs leading-relaxed animate-in fade-in duration-200 ${
                  selectedOption.isCorrect
                    ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/50 border-rose-500/50 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold font-mono">
                  {selectedOption.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Diagnostic Confirmed
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Diagnostic Inconclusive
                    </>
                  )}
                </div>
                <p>{selectedOption.rationale}</p>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-xs font-mono text-slate-500">
                Attempts: {attempts}
              </span>

              <div className="flex items-center gap-3">
                {!submitted ? (
                  <button
                    onClick={handleSubmitQuestion}
                    disabled={!selectedOptionId}
                    className="px-6 py-2.5 rounded-xl bg-indigo-500 text-slate-950 font-mono text-xs font-bold hover:bg-indigo-400 disabled:opacity-40 disabled:pointer-events-none transition-all"
                  >
                    Submit Diagnostic
                  </button>
                ) : selectedOption?.isCorrect ? (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-indigo-500 text-slate-950 font-mono text-xs font-bold hover:bg-indigo-400 transition-all flex items-center gap-1.5"
                  >
                    {currentQuestionIndex < BOSS_QUESTIONS.length - 1 ? (
                      <>
                        Next Trial
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Complete Island 5 Boss Trial
                        <Trophy className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleRetryQuestion}
                    className="px-6 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs font-bold hover:bg-slate-700 transition-all"
                  >
                    Retry Trial
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Victory & Relic Screen */
        <div className="max-w-2xl mx-auto glass-panel p-8 rounded-3xl border-indigo-500/40 glow-indigo text-center space-y-6">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/40 text-indigo-400 mb-2">
            <Trophy className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-widest text-indigo-400">
              Boss Trial Mastered · Island 5 Conquered
            </div>
            <h3 className="font-cinzel text-3xl font-bold text-white">
              The Compass of Optimality Secured
            </h3>
            <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              You have conquered Multi-Armed Bandits, Markov Decision Processes, Bellman TD equations, and deep neural policy gradients in TensorFlow.js. Only the final island remains before you reach Home.
            </p>
          </div>

          {/* Relic Card */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-indigo-500/30 max-w-md mx-auto text-left flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 shrink-0">
              <Compass className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
                Ancient Relic Conferred
              </div>
              <div className="font-cinzel text-lg font-bold text-white">
                The Compass of Optimality
              </div>
              <div className="text-xs text-slate-400">
                Points inexorably toward the Bellman-optimal path of survival and convergence.
              </div>
            </div>
          </div>

          {/* Navigation Action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => { sounds.playClick(); onAdvance(); }}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 font-mono text-sm font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              Set Sail for Island 6: The Archive (RAG)
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
