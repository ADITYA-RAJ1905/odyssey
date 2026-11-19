import React, { useState, useRef } from 'react';
import { sounds } from '../../utils/audio';
import { 
  CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Coins, 
  HelpCircle, RefreshCw, Play, Sliders, TrendingUp, ShieldAlert, Award 
} from 'lucide-react';
import { ZoneTelemetry } from '../../types';

interface BanditCoveZoneProps {
  telemetry: ZoneTelemetry;
  onComplete: (score: number, timeSpentSec: number) => void;
  onAdvance: () => void;
}

interface ChestArm {
  id: number;
  name: string;
  color: string;
  borderClass: string;
  bgClass: string;
  trueProbability: number; // Hidden ground truth
  pulls: number;
  wins: number;
  estimatedValue: number;
}

const INITIAL_CHESTS: ChestArm[] = [
  { id: 0, name: 'Bronze Casket', color: 'text-amber-600', borderClass: 'border-amber-700/50', bgClass: 'bg-amber-950/40', trueProbability: 0.25, pulls: 0, wins: 0, estimatedValue: 0 },
  { id: 1, name: 'Silver Coffer', color: 'text-slate-300', borderClass: 'border-slate-500/50', bgClass: 'bg-slate-900/60', trueProbability: 0.65, pulls: 0, wins: 0, estimatedValue: 0 },
  { id: 2, name: 'Gilded Vault', color: 'text-yellow-400', borderClass: 'border-yellow-500/50', bgClass: 'bg-yellow-950/40', trueProbability: 0.40, pulls: 0, wins: 0, estimatedValue: 0 },
  { id: 3, name: 'Obsidian Reliquary', color: 'text-indigo-400', borderClass: 'border-indigo-500/50', bgClass: 'bg-indigo-950/50', trueProbability: 0.85, pulls: 0, wins: 0, estimatedValue: 0 }
];

export const BanditCoveZone: React.FC<BanditCoveZoneProps> = ({
  telemetry,
  onComplete,
  onAdvance
}) => {
  const [activeTab, setActiveTab] = useState<'sandbox' | 'test'>('sandbox');

  // Bandit Sandbox State
  const [chests, setChests] = useState<ChestArm[]>(INITIAL_CHESTS);
  const [epsilon, setEpsilon] = useState<number>(0.15); // 0.0 to 1.0
  const [totalPulls, setTotalPulls] = useState<number>(0);
  const [totalWins, setTotalWins] = useState<number>(0);
  const [cumulativeRegret, setCumulativeRegret] = useState<number>(0);
  const [lastPulledChest, setLastPulledChest] = useState<number | null>(null);
  const [lastResultWin, setLastResultWin] = useState<boolean | null>(null);
  const [revealTrueValues, setRevealTrueValues] = useState<boolean>(false);

  // Test Gate State
  const [testAnswers, setTestAnswers] = useState<{
    q1: string | null;
    q2: string | null;
    q3: string | null;
  }>({ q1: null, q2: null, q3: null });
  const [testSubmitted, setTestSubmitted] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const [attempts, setAttempts] = useState<number>(telemetry.attempts || 0);

  // Execute a single pull on chest index
  const pullChest = (chestIdx: number) => {
    sounds.playClick();
    const chest = chests[chestIdx];
    const isWin = Math.random() < chest.trueProbability;

    if (isWin) {
      sounds.playSuccess();
    }

    setLastPulledChest(chestIdx);
    setLastResultWin(isWin);

    // Theoretical best arm is Chest 3 (0.85)
    const maxPossibleProb = 0.85;
    const regret = maxPossibleProb - chest.trueProbability;

    setChests((prev) => {
      const copy = [...prev];
      const target = { ...copy[chestIdx] };
      target.pulls += 1;
      if (isWin) target.wins += 1;
      target.estimatedValue = Math.round((target.wins / target.pulls) * 100) / 100;
      copy[chestIdx] = target;
      return copy;
    });

    setTotalPulls((prev) => prev + 1);
    if (isWin) setTotalWins((prev) => prev + 1);
    setCumulativeRegret((prev) => Math.round((prev + regret) * 100) / 100);
  };

  // Run batch epsilon-greedy pulls
  const runEpsilonGreedyBatch = (count: number = 100) => {
    sounds.playRadar();
    const currentChests = [...chests.map((c) => ({ ...c }))];
    let newWins = 0;
    let newRegret = 0;
    const maxPossibleProb = 0.85;

    for (let i = 0; i < count; i++) {
      let chosenIdx = 0;

      // Epsilon-greedy selection
      if (Math.random() < epsilon) {
        // Explore: random arm
        chosenIdx = Math.floor(Math.random() * currentChests.length);
      } else {
        // Exploit: best empirical arm (or random if all 0)
        let bestVal = -1;
        const bestCandidates: number[] = [];
        currentChests.forEach((c, idx) => {
          if (c.estimatedValue > bestVal) {
            bestVal = c.estimatedValue;
            bestCandidates.length = 0;
            bestCandidates.push(idx);
          } else if (c.estimatedValue === bestVal) {
            bestCandidates.push(idx);
          }
        });
        chosenIdx = bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
      }

      const chest = currentChests[chosenIdx];
      const isWin = Math.random() < chest.trueProbability;
      chest.pulls += 1;
      if (isWin) {
        chest.wins += 1;
        newWins += 1;
      }
      chest.estimatedValue = Math.round((chest.wins / chest.pulls) * 100) / 100;
      newRegret += maxPossibleProb - chest.trueProbability;
    }

    setChests(currentChests);
    setTotalPulls((prev) => prev + count);
    setTotalWins((prev) => prev + newWins);
    setCumulativeRegret((prev) => Math.round((prev + newRegret) * 100) / 100);
  };

  const handleResetBandit = () => {
    sounds.playClick();
    setChests(INITIAL_CHESTS.map((c) => ({ ...c })));
    setTotalPulls(0);
    setTotalWins(0);
    setCumulativeRegret(0);
    setLastPulledChest(null);
    setLastResultWin(null);
  };

  // Test Gate verification
  const handleTestSubmit = () => {
    sounds.playClick();
    setTestSubmitted(true);
    setAttempts((prev) => prev + 1);

    const isQ1Correct = testAnswers.q1 === 'a';
    const isQ2Correct = testAnswers.q2 === 'a';
    const isQ3Correct = testAnswers.q3 === 'a';

    const allCorrect = isQ1Correct && isQ2Correct && isQ3Correct;

    if (allCorrect) {
      sounds.playSuccess();
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      const score = Math.max(70, 100 - attempts * 10);
      onComplete(score, elapsed);
    } else {
      sounds.playError();
    }
  };

  const isZoneCompleted = telemetry.completed || (testSubmitted && testAnswers.q1 === 'a' && testAnswers.q2 === 'a' && testAnswers.q3 === 'a');

  return (
    <div className="space-y-6">
      {/* Zone Header */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-500/30 glow-indigo space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-indigo-400">
                Zone 01 · Reinforcement Learning
              </div>
              <h2 className="font-cinzel text-2xl font-bold text-white">
                Bandit Cove: Exploration vs. Exploitation Dilemma
              </h2>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-700">
            <button
              onClick={() => { sounds.playClick(); setActiveTab('sandbox'); }}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'sandbox'
                  ? 'bg-indigo-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Multi-Armed Bandit Sandbox
            </button>
            <button
              onClick={() => { sounds.playClick(); setActiveTab('test'); }}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'test'
                  ? 'bg-indigo-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Tradeoff Diagnostics Gate
              {isZoneCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'sandbox' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: 4 Chest Arms */}
          <div className="lg:col-span-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {chests.map((chest) => {
                const isSelected = lastPulledChest === chest.id;
                return (
                  <div
                    key={chest.id}
                    className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${chest.bgClass} ${chest.borderClass} ${
                      isSelected ? 'ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/20' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-cinzel font-bold text-base ${chest.color}`}>
                          {chest.name}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/40 text-slate-300">
                          Arm #{chest.id + 1}
                        </span>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-400">Estimated Value Q(a):</span>
                          <span className="text-white font-bold">
                            {chest.pulls > 0 ? (chest.estimatedValue * 100).toFixed(0) + '%' : '0%'}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                            style={{ width: `${chest.estimatedValue * 100}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
                          <span>Pulls: {chest.pulls}</span>
                          <span>Wins: {chest.wins}</span>
                        </div>

                        {revealTrueValues && (
                          <div className="pt-2 border-t border-slate-800/80 flex justify-between text-[11px] font-mono text-emerald-400">
                            <span>True Distribution:</span>
                            <span className="font-bold">{(chest.trueProbability * 100).toFixed(0)}% Win Rate</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-800/60">
                      <button
                        onClick={() => pullChest(chest.id)}
                        className="w-full py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-400 text-slate-200 hover:text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Coins className="w-3.5 h-3.5 text-yellow-400" />
                        Pull Arm #{chest.id + 1}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Last Action Notification Banner */}
            {lastPulledChest !== null && (
              <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono ${
                lastResultWin
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}>
                <span>
                  Arm #{lastPulledChest + 1} ({chests[lastPulledChest].name}) was pulled.
                </span>
                <span className="font-bold text-sm">
                  {lastResultWin ? '✨ GOLD ACQUIRED (+1)' : '❌ EMPTY CHEST (0)'}
                </span>
              </div>
            )}
          </div>

          {/* Right: Epsilon Slider & Metrics */}
          <div className="lg:col-span-4 space-y-5">
            <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  Epsilon Policy (ε-Greedy)
                </span>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  ε = {epsilon.toFixed(2)}
                </span>
              </div>

              <div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={epsilon}
                  onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>0.0 (Pure Exploit)</span>
                  <span>0.5 (Balanced)</span>
                  <span>1.0 (Pure Explore)</span>
                </div>
              </div>

              {/* Batch Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => runEpsilonGreedyBatch(100)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 font-mono text-xs font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20"
                >
                  <Play className="w-4 h-4" />
                  Simulate 100 ε-Greedy Pulls
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRevealTrueValues(!revealTrueValues)}
                    className="flex-1 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
                  >
                    {revealTrueValues ? 'Hide True Probabilities' : 'Reveal Hidden Truth'}
                  </button>
                  <button
                    onClick={handleResetBandit}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Reset Simulator"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cumulative Telemetry Metrics */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Total Pulls:</span>
                  <span className="text-white font-bold">{totalPulls}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Total Gold Won:</span>
                  <span className="text-emerald-400 font-bold">{totalWins}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Empirical Win Rate:</span>
                  <span className="text-cyan-400 font-bold">
                    {totalPulls > 0 ? ((totalWins / totalPulls) * 100).toFixed(1) + '%' : '0%'}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Cumulative Regret:</span>
                  <span className="text-rose-400 font-bold">-{cumulativeRegret.toFixed(1)} gold</span>
                </div>
              </div>
            </div>

            {/* Theory Card */}
            <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
              <div className="font-mono text-indigo-400 font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                The Regret Tradeoff
              </div>
              <p>
                When <code className="text-indigo-300">ε = 0</code>, the agent exploits greedily: it might test Chest 2, get lucky once, and never try Chest 4 (which has an 85% win rate).
              </p>
              <p>
                When <code className="text-indigo-300">ε = 1</code>, it wastes 75% of pulls on known inferior chests. A decaying schedule <code className="text-indigo-300">ε_t = 1/√t</code> achieves sub-linear regret.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Test Gate View */
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-5">
            <div>
              <h3 className="font-cinzel text-xl font-bold text-white mb-1">
                Zone 1 Unlock Gate: Deployment Strategy Diagnostics
              </h3>
              <p className="text-xs text-slate-400">
                Select the mathematically optimal exploration policy for each real-world deployment scenario to unlock Zone 2.
              </p>
            </div>

            {/* Q1: Clinical drug trials */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold text-indigo-400">
                Scenario 1 of 3: Clinical Drug Trials on Terminal Patients
              </span>
              <p className="text-sm text-slate-200">
                When conducting adaptive clinical trials on critically ill patients where administering an ineffective drug increases mortality, which policy balance is ethically and mathematically mandatory?
              </p>
              <div className="space-y-2 text-xs">
                {[
                  {
                    id: 'a',
                    text: 'Adaptive exploration with rapidly decaying epsilon (or Thompson Sampling) that minimizes regret by dynamically shifting patient allocation toward proven effective treatments while avoiding inferior arms.'
                  },
                  {
                    id: 'b',
                    text: 'Pure uniform random exploration (ε = 1.0) permanently across all candidate molecules regardless of patient outcomes.'
                  },
                  {
                    id: 'c',
                    text: 'Pure greedy exploitation (ε = 0.0) permanently locked onto the very first chemical tested on Day 1.'
                  }
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      testAnswers.q1 === opt.id
                        ? 'bg-indigo-500/15 border-indigo-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="q1"
                      checked={testAnswers.q1 === opt.id}
                      onChange={() => setTestAnswers((prev) => ({ ...prev, q1: opt.id }))}
                      className="mt-0.5 accent-indigo-500"
                    />
                    <span>{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Q2: E-commerce A/B testing */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold text-indigo-400">
                Scenario 2 of 3: High-Volume Production Checkout A/B Testing
              </span>
              <p className="text-sm text-slate-200">
                An archipelago trading post processes 500,000 transactions daily. The engineering team has 4 new checkout flows to test without jeopardizing business cash flow. What is the optimal epsilon setup?
              </p>
              <div className="space-y-2 text-xs">
                {[
                  {
                    id: 'a',
                    text: 'Low exploration (ε ≈ 0.05 – 0.10) where 90-95% of traffic flows to the established high-converting design, while 5-10% continuously samples candidate variants to establish statistical significance.'
                  },
                  {
                    id: 'b',
                    text: '100% exploration (ε = 1.0) during peak weekend traffic.'
                  },
                  {
                    id: 'c',
                    text: 'Disable all telemetry and pick the variant preferred by the senior executive.'
                  }
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      testAnswers.q2 === opt.id
                        ? 'bg-indigo-500/15 border-indigo-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="q2"
                      checked={testAnswers.q2 === opt.id}
                      onChange={() => setTestAnswers((prev) => ({ ...prev, q2: opt.id }))}
                      className="mt-0.5 accent-indigo-500"
                    />
                    <span>{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Q3: Finite horizon last night */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold text-indigo-400">
                Scenario 3 of 3: Finite Horizon & The "Last Night in Town" Principle
              </span>
              <p className="text-sm text-slate-200">
                You are stranded on an island for only one remaining night before rescue arrives. Tonight is your final dinner opportunity. What is the mathematically rational policy for your remaining single step?
              </p>
              <div className="space-y-2 text-xs">
                {[
                  {
                    id: 'a',
                    text: 'Pure exploitation (ε = 0.0): With zero remaining future steps to amortize exploratory learning, the optimal expected utility comes from selecting the highest known reward option discovered so far.'
                  },
                  {
                    id: 'b',
                    text: 'Maximum exploration (ε = 1.0): Since it is the last day, exploration has infinite future value.'
                  },
                  {
                    id: 'c',
                    text: 'Never make a decision and skip dinner entirely.'
                  }
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      testAnswers.q3 === opt.id
                        ? 'bg-indigo-500/15 border-indigo-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="q3"
                      checked={testAnswers.q3 === opt.id}
                      onChange={() => setTestAnswers((prev) => ({ ...prev, q3: opt.id }))}
                      className="mt-0.5 accent-indigo-500"
                    />
                    <span>{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit & Status Bar */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={handleTestSubmit}
                disabled={!testAnswers.q1 || !testAnswers.q2 || !testAnswers.q3}
                className="px-6 py-2.5 rounded-xl bg-indigo-500 text-slate-950 font-mono text-sm font-bold hover:bg-indigo-400 disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                Validate Strategy Diagnostics
              </button>

              {testSubmitted && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  {testAnswers.q1 === 'a' && testAnswers.q2 === 'a' && testAnswers.q3 === 'a' ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      All 3 scenarios verified! Zone 2 Unlocked.
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      One or more answers are incorrect. Review and retry!
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Advance to Zone 2 Button */}
            {isZoneCompleted && (
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => { sounds.playClick(); onAdvance(); }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 font-mono text-sm font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  Advance to Zone 2: Q-Value Maze
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
