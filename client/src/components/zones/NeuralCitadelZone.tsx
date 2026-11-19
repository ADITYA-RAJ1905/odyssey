import React, { useState, useRef } from 'react';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Trophy, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, 
  Cpu, ShieldAlert, Award, Compass, Layers 
} from 'lucide-react';
import { ZoneTelemetry } from '../../types';

interface NeuralCitadelZoneProps {
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
    id: 'bq1',
    topic: 'Gradient Dynamics & Vanishing Gradients',
    title: 'Trial 1: The Stalled 50-Layer Deep Network',
    scenario: 'You deploy a 50-layer deep feedforward neural network initialized with Sigmoid activation functions throughout. By Epoch 2, the loss ceases to decrease entirely. Backpropagation inspection reveals gradient magnitudes in the earliest 10 layers are on the order of 10⁻⁸, while output layer gradients remain active. What architectural intervention resolves this stagnation?',
    options: [
      {
        id: 'opt1',
        text: 'Replace Sigmoid activations with non-saturating ReLU and incorporate ResNet-style identity skip connections (y = F(x) + x).',
        rationale: 'Correct! The derivative of Sigmoid tops out at 0.25, causing exponential gradient decay across 50 layers (0.25⁵⁰ ≈ 0). ReLU avoids saturation for positive inputs, and identity skip connections create unimpeded gradient highways.',
        isCorrect: true
      },
      {
        id: 'opt2',
        text: 'Scale the learning rate by a factor of 1000 to force weight updates through the saturated activations.',
        rationale: 'Incorrect. Exploding gradients in later layers will occur while earlier layers remain saturated at extreme asymptotic bounds.',
        isCorrect: false
      },
      {
        id: 'opt3',
        text: 'Stack an additional 20 Sigmoid layers to increase the representational capacity of the model.',
        rationale: 'Incorrect. Increasing depth worsens gradient vanishing exponentially.',
        isCorrect: false
      },
      {
        id: 'opt4',
        text: 'Apply heavy L1 weight regularization to zero out early layer synapses completely.',
        rationale: 'Incorrect. L1 penalty induces weight sparsity, further stripping early layers of representational capacity.',
        isCorrect: false
      }
    ]
  },
  {
    id: 'bq2',
    topic: 'Architectural Inductive Bias',
    title: 'Trial 2: Selecting Architecture for High-Res Spatial Reconnaissance',
    scenario: 'Your navigation system must classify coastal terrain hazards from 2048 × 2048 multi-channel satellite images. An engineer proposes flattening the image into a 12-million-dimensional vector and passing it into a deep Multi-Layer Perceptron (MLP). Why does a Convolutional Neural Network (CNN) or Vision Transformer vastly outperform the MLP?',
    options: [
      {
        id: 'opt1',
        text: 'MLPs require too much GPU memory to perform basic vector addition.',
        rationale: 'Incorrect. Memory is dominated by matrix multiplications, but this is not the foundational algorithmic reason.',
        isCorrect: false
      },
      {
        id: 'opt2',
        text: 'CNNs utilize translation equivariance and local spatial weight-sharing, preserving 2D topological adjacency while preventing catastrophic parameter explosion.',
        rationale: 'Correct! Flattening a 2048x2048 image destroys spatial neighborhood correlations and creates billions of unshared dense weights. Convolutional filters slide shared weights across space regardless of where the object appears.',
        isCorrect: true
      },
      {
        id: 'opt3',
        text: 'MLP activation functions cannot process floating-point pixel intensities.',
        rationale: 'Incorrect. Dense layers process floating point tensors identically to convolution layers.',
        isCorrect: false
      },
      {
        id: 'opt4',
        text: 'CNNs completely eliminate the need for training data by using fixed edge filters.',
        rationale: 'Incorrect. CNN filter weights are learned through backpropagation gradient descent.',
        isCorrect: false
      }
    ]
  },
  {
    id: 'bq3',
    topic: 'Layer Dimension & Feature Geometry',
    title: 'Trial 3: Exact Spatial Dimension Calculation',
    scenario: 'A square input tensor of dimensions 32 × 32 (with 3 channels) is fed into a Convolutional layer with Kernel size K = 5 × 5, Stride S = 1, and Padding P = 0. The resulting feature map is immediately passed into a 2 × 2 Max-Pooling layer with Stride S = 2. Using the spatial formula O = ⌊(W - K + 2P)/S⌋ + 1, what is the final output spatial resolution?',
    options: [
      {
        id: 'opt1',
        text: '16 × 16',
        rationale: 'Incorrect. Check your convolution dimension before pooling.',
        isCorrect: false
      },
      {
        id: 'opt2',
        text: '14 × 14',
        rationale: 'Correct! Conv stage: (32 - 5 + 0)/1 + 1 = 28 × 28. MaxPool stage: 28 / 2 = 14 × 14 spatial resolution.',
        isCorrect: true
      },
      {
        id: 'opt3',
        text: '28 × 28',
        rationale: 'Incorrect. 28 × 28 is the intermediate resolution before the 2x2 Max-Pooling step.',
        isCorrect: false
      },
      {
        id: 'opt4',
        text: '12 × 12',
        rationale: 'Incorrect. Arithmetic miscalculation in the receptive field step.',
        isCorrect: false
      }
    ]
  }
];

export const NeuralCitadelZone: React.FC<NeuralCitadelZoneProps> = ({
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
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-purple-500/40 glow-purple space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono uppercase tracking-widest">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
              <span>Zone 04 • Apex Evaluation Gate</span>
            </div>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-black text-white mt-1 flex items-center gap-2">
              <Cpu className="w-7 h-7 text-purple-400" />
              <span>The Neural Citadel: Boss Diagnostic Trial</span>
            </h2>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-mono uppercase text-slate-400">Mastery Gate</div>
            <div className="font-mono text-sm font-bold text-purple-300">
              {correctCount} / {BOSS_QUESTIONS.length} Diagnostic Trials Solved
            </div>
          </div>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed max-w-3xl">
          You stand before the central computational sanctum of the Deep Learning realm. To synthesize the <strong>Prismatic Mirror</strong> and unlock Island 3, you must solve three rigorous production architecture diagnostics concerning gradient vanishing, spatial inductive bias, and receptive field tensor geometry.
        </p>
      </div>

      {/* Relic Acquired Victory Card */}
      {relicUnlocked && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-purple-950/80 border-2 border-purple-400/80 shadow-[0_0_30px_rgba(168,85,247,0.4)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.6)]">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-mono text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Deep Learning Domain Conquered</span>
              </div>
              <h3 className="font-cinzel text-2xl font-bold text-white mt-0.5">
                Relic Claimed: The Prismatic Mirror
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                The Prismatic Mirror refracts multi-layer neural attention, unlocking perception into feature embeddings and granting passage to Island 3 (The Observer / Computer Vision).
              </p>
            </div>
          </div>

          <button
            onClick={onAdvance}
            className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-xl shadow-purple-600/40 flex items-center justify-center gap-2"
          >
            <span>Proceed to Island 3 (The Observer)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3 Diagnostic Questions */}
      <div className="space-y-6">
        {BOSS_QUESTIONS.map((q, idx) => {
          const selectedOptId = selectedAnswers[q.id];
          const hasAnswered = !!selectedOptId;

          return (
            <div
              key={q.id}
              className="glass-panel p-6 sm:p-7 rounded-2xl border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-mono font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">
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
                    borderStyle = 'border-purple-500 bg-purple-950/40 text-white shadow-md';
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
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
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
