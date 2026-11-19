import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/audio';
import { CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Sparkles, Layers, Target, Compass } from 'lucide-react';
import { ZoneTelemetry } from '../../types';

interface ShorelineZoneProps {
  telemetry: ZoneTelemetry;
  onComplete: (score: number, timeSpentSec: number) => void;
  onAdvance: () => void;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  correctType: 'supervised' | 'unsupervised';
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1',
    title: 'Predicting Coastal House Prices',
    description: 'Estimating property market prices using historical sales data with labeled square footage, location ratings, and actual sale prices.',
    correctType: 'supervised',
    explanation: 'Uses labeled historical target prices (Continuous Output Y), making it Supervised Regression.'
  },
  {
    id: 's2',
    title: 'Grouping Archipelago Merchant Vessels',
    description: 'Partitioning thousands of unidentified cargo ships into behavioral cohorts based solely on speed, draft depth, and trade route coordinates without pre-assigned classes.',
    correctType: 'unsupervised',
    explanation: 'Discovers natural clusters in feature space X without prior target labels, making it Unsupervised Clustering.'
  },
  {
    id: 's3',
    title: 'Detecting Distress SOS Radio Spam',
    description: 'Classifying incoming naval transmissions as genuine SOS broadcasts or radio noise based on a database of verified historical operator transcripts.',
    correctType: 'supervised',
    explanation: 'Trains on labeled categories (Distress vs Noise Target Y), making it Supervised Binary Classification.'
  },
  {
    id: 's4',
    title: 'Discovering Anomalous Seismic Sensor Jitters',
    description: 'Isolating rare, unfamiliar underwater volcanic vibrations from ambient ocean acoustic signals where no labeled eruption catalogue exists.',
    correctType: 'unsupervised',
    explanation: 'Identifies statistical outliers based on density deviations without prior anomaly labels, making it Unsupervised Anomaly Detection.'
  }
];

export const ShorelineZone: React.FC<ShorelineZoneProps> = ({ telemetry, onComplete, onAdvance }) => {
  const [activeTab, setActiveTab] = useState<'teach' | 'test'>('teach');
  
  // Teach Sandbox State
  const [teachMode, setTeachMode] = useState<'supervised' | 'unsupervised'>('supervised');
  const [clusteringActive, setClusteringActive] = useState(false);

  // Test Gate State
  const [answers, setAnswers] = useState<Record<string, 'supervised' | 'unsupervised' | null>>({
    s1: null,
    s2: null,
    s3: null,
    s4: null
  });
  const [evaluated, setEvaluated] = useState(false);
  const [passed, setPassed] = useState(telemetry.completed);
  const [attempts, setAttempts] = useState(telemetry.attempts);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Time tracker
  const startTimeRef = useRef<number>(Date.now());
  const [elapsedSec, setElapsedSec] = useState<number>(telemetry.timeSpentSec || 0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectAnswer = (id: string, type: 'supervised' | 'unsupervised') => {
    if (passed) return;
    sounds.playClick();
    setAnswers((prev) => ({ ...prev, [id]: type }));
    setEvaluated(false);
  };

  const handleSubmitTest = () => {
    // Verify all 4 are answered
    const unanswered = Object.values(answers).some((val) => val === null);
    if (unanswered) {
      setFeedback('Please classify all 4 operational scenarios before verifying.');
      sounds.playError();
      return;
    }

    const currentAttempts = attempts + 1;
    setAttempts(currentAttempts);

    const isAllCorrect = SCENARIOS.every((sc) => answers[sc.id] === sc.correctType);
    setEvaluated(true);

    const timeSpent = Math.max(15, Math.round((Date.now() - startTimeRef.current) / 1000));

    if (isAllCorrect) {
      sounds.playSuccess();
      setPassed(true);
      // Calculate score: 100 for 1st attempt, 85 for 2nd, 70 for 3rd+
      const calculatedScore = currentAttempts === 1 ? 100 : currentAttempts === 2 ? 85 : 70;
      setFeedback(`Outstanding navigation! All 4 scenarios correctly sorted. Gate unlocked (+${calculatedScore} PTS).`);
      onComplete(calculatedScore, timeSpent);
    } else {
      sounds.playError();
      setFeedback('Variance detected: Some scenarios were misclassified. Review the diagnostic cues below and retry.');
    }
  };

  const handleResetTest = () => {
    sounds.playClick();
    setAnswers({ s1: null, s2: null, s3: null, s4: null });
    setEvaluated(false);
    setFeedback(null);
  };

  return (
    <div className="space-y-6">
      {/* Zone Header / Stepper Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 glass-card rounded-xl border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">
              Zone 01 • The Shoreline
            </div>
            <h2 className="font-cinzel text-lg font-bold text-white">
              Supervised vs. Unsupervised Learning
            </h2>
          </div>
        </div>

        {/* Navigation Mode Pill */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => { setActiveTab('teach'); sounds.playClick(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'teach'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Teach Sandbox</span>
          </button>
          <button
            onClick={() => { setActiveTab('test'); sounds.playClick(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'test'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>2. Gate Test</span>
            {passed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
          </button>
        </div>
      </div>

      {/* --- TAB 1: TEACH SANDBOX --- */}
      {activeTab === 'teach' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Visual Demonstrator Plane */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Interactive Feature Plane (Sensor X₁ vs X₂)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setTeachMode('supervised'); setClusteringActive(false); sounds.playClick(); }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    teachMode === 'supervised'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  Supervised (Labeled)
                </button>
                <button
                  onClick={() => { setTeachMode('unsupervised'); sounds.playClick(); }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    teachMode === 'unsupervised'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  Unsupervised (Clustering)
                </button>
              </div>
            </div>

            {/* SVG Visualizer */}
            <div className="relative w-full h-64 bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden radar-grid flex items-center justify-center p-2">
              <svg className="w-full h-full" viewBox="0 0 400 240">
                {/* Axes */}
                <line x1="30" y1="210" x2="380" y2="210" stroke="#334155" strokeWidth="1.5" />
                <line x1="30" y1="20" x2="30" y2="210" stroke="#334155" strokeWidth="1.5" />
                <text x="375" y="225" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="end">Feature X₁ (Speed)</text>
                <text x="35" y="25" fill="#64748b" fontSize="10" fontFamily="monospace">Feature X₂ (Draft)</text>

                {/* SUPERVISED MODE: Clear Boundary & Color Labeled Points */}
                {teachMode === 'supervised' && (
                  <>
                    {/* Linear Decision Boundary */}
                    <line x1="60" y1="200" x2="340" y2="40" stroke="#06b6d4" strokeWidth="2" strokeDasharray="5,5" />
                    <text x="210" y="115" fill="#06b6d4" fontSize="10" fontFamily="monospace" transform="rotate(-30 210 115)">
                      Decision Boundary f(X) = Y
                    </text>

                    {/* Class A: Merchant Vessels (Cyan Circles) */}
                    <circle cx="80" cy="160" r="7" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="110" cy="140" r="7" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="130" cy="180" r="7" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="160" cy="155" r="7" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="100" cy="190" r="7" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />

                    {/* Class B: Coastal Reefs (Emerald Diamonds) */}
                    <polygon points="260,60 268,70 260,80 252,70" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                    <polygon points="300,50 308,60 300,70 292,60" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                    <polygon points="320,90 328,100 320,110 312,100" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                    <polygon points="280,85 288,95 280,105 272,95" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                    <polygon points="340,75 348,85 340,95 332,85" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                  </>
                )}

                {/* UNSUPERVISED MODE: Unlabeled Points & K-Means Clusters */}
                {teachMode === 'unsupervised' && (
                  <>
                    {/* Points without labels (Slate Circles) */}
                    <circle cx="80" cy="160" r="7" fill={clusteringActive ? "#a855f7" : "#64748b"} stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="110" cy="140" r="7" fill={clusteringActive ? "#a855f7" : "#64748b"} stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="130" cy="180" r="7" fill={clusteringActive ? "#a855f7" : "#64748b"} stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="160" cy="155" r="7" fill={clusteringActive ? "#a855f7" : "#64748b"} stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="100" cy="190" r="7" fill={clusteringActive ? "#a855f7" : "#64748b"} stroke="#ffffff" strokeWidth="1.5" />

                    <circle cx="260" cy="70" r="7" fill={clusteringActive ? "#ec4899" : "#64748b"} stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="300" cy="60" r="7" fill={clusteringActive ? "#ec4899" : "#64748b"} stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="320" cy="100" r="7" fill={clusteringActive ? "#ec4899" : "#64748b"} stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="280" cy="95" r="7" fill={clusteringActive ? "#ec4899" : "#64748b"} stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="340" cy="85" r="7" fill={clusteringActive ? "#ec4899" : "#64748b"} stroke="#ffffff" strokeWidth="1.5" />

                    {clusteringActive && (
                      <>
                        {/* Centroid 1 */}
                        <circle cx="116" cy="165" r="45" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3,3" />
                        <circle cx="116" cy="165" r="4" fill="#a855f7" />
                        <text x="116" y="150" fill="#c084fc" fontSize="9" fontFamily="monospace" textAnchor="middle">Centroid μ₁</text>

                        {/* Centroid 2 */}
                        <circle cx="300" cy="82" r="48" fill="none" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="3,3" />
                        <circle cx="300" cy="82" r="4" fill="#ec4899" />
                        <text x="300" y="68" fill="#f472b6" fontSize="9" fontFamily="monospace" textAnchor="middle">Centroid μ₂</text>
                      </>
                    )}
                  </>
                )}
              </svg>
            </div>

            {/* Sandbox Controls */}
            {teachMode === 'unsupervised' && (
              <div className="flex items-center justify-between p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl">
                <span className="text-xs font-mono text-purple-300">
                  {clusteringActive ? 'K-Means Converged: 2 Latent Clusters Discovered' : 'Data is currently unpartitioned (no target labels)'}
                </span>
                <button
                  onClick={() => { setClusteringActive(!clusteringActive); sounds.playRadar(); }}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-md"
                >
                  {clusteringActive ? 'Reset Data' : 'Run K-Means Clustering'}
                </button>
              </div>
            )}
          </div>

          {/* Theoretical Core & Proceed CTA */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>The Core Algorithmic Divide</span>
              </div>

              {teachMode === 'supervised' ? (
                <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                  <h3 className="text-base font-bold text-white font-cinzel">
                    Supervised Learning: Learning with Ground Truth
                  </h3>
                  <p>
                    The algorithm is provided paired training examples <code className="text-cyan-300">(X, Y)</code>, where <code className="text-cyan-300">X</code> represents features (e.g. speed, vessel draft) and <code className="text-cyan-300">Y</code> is the known ground-truth target.
                  </p>
                  <ul className="space-y-1 text-slate-400 pl-3 list-disc">
                    <li><strong className="text-slate-200">Classification:</strong> Discrete target (e.g. Navigable vs. Submerged Hazard).</li>
                    <li><strong className="text-slate-200">Regression:</strong> Continuous numerical target (e.g. Fuel usage, Arrival time).</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                  <h3 className="text-base font-bold text-white font-cinzel">
                    Unsupervised Learning: Discovering Hidden Structure
                  </h3>
                  <p>
                    The algorithm receives only input features <code className="text-purple-300">X</code> with <strong className="text-purple-200">zero ground-truth labels</strong>. It discovers patterns by computing geometric distances, variance, or density manifolds.
                  </p>
                  <ul className="space-y-1 text-slate-400 pl-3 list-disc">
                    <li><strong className="text-slate-200">Clustering:</strong> Grouping similar samples (K-Means, DBSCAN).</li>
                    <li><strong className="text-slate-200">Anomaly Detection:</strong> Isolating rare outliers with low density.</li>
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={() => { setActiveTab('test'); sounds.playSelect(); }}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl font-mono text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
            >
              <span>PROCEED TO GATE TEST CHALLENGE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 2: GATE TEST --- */}
      {activeTab === 'test' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-cinzel text-xl font-bold text-white">
                The Shoreline Gate Trial: Scenario Sorter
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Classify all 4 real-world operational problems into Supervised or Unsupervised Learning.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">Attempts: <strong className="text-white">{attempts}</strong></span>
              <span className="text-slate-400">Elapsed: <strong className="text-cyan-300">{elapsedSec}s</strong></span>
            </div>
          </div>

          {/* Scenario Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCENARIOS.map((sc, idx) => {
              const selected = answers[sc.id];
              const isCorrect = evaluated && selected === sc.correctType;
              const isWrong = evaluated && selected !== sc.correctType;

              return (
                <div
                  key={sc.id}
                  className={`p-4 rounded-xl border transition-all glass-card space-y-3 ${
                    isCorrect
                      ? 'border-emerald-500/60 bg-emerald-950/20'
                      : isWrong
                      ? 'border-rose-500/60 bg-rose-950/20'
                      : selected
                      ? 'border-cyan-500/40 bg-slate-900/60'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">
                      Problem 0{idx + 1}
                    </span>
                    {evaluated && (
                      isCorrect ? (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" /> Misclassified
                        </span>
                      )
                    )}
                  </div>

                  <h4 className="font-bold text-slate-100 text-sm">
                    {sc.title}
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {sc.description}
                  </p>

                  {/* Decision Toggle Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleSelectAnswer(sc.id, 'supervised')}
                      disabled={passed}
                      className={`py-2 px-3 rounded-lg font-mono text-xs font-medium border transition-all ${
                        selected === 'supervised'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-500/40'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Supervised (X → Y)
                    </button>
                    <button
                      onClick={() => handleSelectAnswer(sc.id, 'unsupervised')}
                      disabled={passed}
                      className={`py-2 px-3 rounded-lg font-mono text-xs font-medium border transition-all ${
                        selected === 'unsupervised'
                          ? 'bg-purple-500/20 border-purple-400 text-purple-300 ring-1 ring-purple-500/40'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Unsupervised (Pattern in X)
                    </button>
                  </div>

                  {/* Explanation upon failure */}
                  {isWrong && (
                    <div className="p-2 bg-rose-950/40 border border-rose-900/40 rounded-lg text-[11px] font-mono text-rose-300">
                      💡 Diagnostic: {sc.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Feedback & Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="text-xs font-mono text-slate-300">
              {feedback ? (
                <span className={passed ? 'text-emerald-400' : 'text-amber-400'}>
                  {feedback}
                </span>
              ) : (
                <span className="text-slate-500">
                  Select your classification for each scenario, then verify.
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!passed ? (
                <>
                  <button
                    onClick={handleResetTest}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 transition-colors"
                    title="Clear Selections"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSubmitTest}
                    className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl font-mono text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    VERIFY CLASSIFICATIONS
                  </button>
                </>
              ) : (
                <button
                  onClick={onAdvance}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl font-mono text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
                >
                  <span>ADVANCE TO ZONE 2: THE RIDGE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
