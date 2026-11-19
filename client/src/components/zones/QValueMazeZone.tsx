import React, { useState, useRef, useEffect } from 'react';
import { sounds } from '../../utils/audio';
import { 
  CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Compass, 
  Grid, Play, RefreshCw, Sliders, Flame, Trophy, Navigation, Target 
} from 'lucide-react';
import { ZoneTelemetry } from '../../types';

interface QValueMazeZoneProps {
  telemetry: ZoneTelemetry;
  onComplete: (score: number, timeSpentSec: number) => void;
  onAdvance: () => void;
}

const GRID_SIZE = 5;
const ACTIONS = [
  { id: 0, name: 'UP', dx: 0, dy: -1, symbol: '↑' },
  { id: 1, name: 'RIGHT', dx: 1, dy: 0, symbol: '→' },
  { id: 2, name: 'DOWN', dx: 0, dy: 1, symbol: '↓' },
  { id: 3, name: 'LEFT', dx: -1, dy: 0, symbol: '←' }
];

// Lava tiles that inflict -10 reward
const LAVA_TILES = new Set(['1,2', '2,2', '2,3', '3,1']);
const GOAL_TILE = '4,4';
const START_TILE = '0,0';

export const QValueMazeZone: React.FC<QValueMazeZoneProps> = ({
  telemetry,
  onComplete,
  onAdvance
}) => {
  const [activeTab, setActiveTab] = useState<'sandbox' | 'challenge'>('sandbox');

  // Hyperparameters
  const [gamma, setGamma] = useState<number>(0.92); // Discount factor
  const [alpha, setAlpha] = useState<number>(0.2); // Learning rate
  const [epsilon, setEpsilon] = useState<number>(0.2); // Exploration in training

  // Q-Table: Map of "x,y" -> [qUp, qRight, qDown, qLeft]
  const [qTable, setQTable] = useState<Record<string, number[]>>(() => initQTable());
  const [totalEpisodesTrained, setTotalEpisodesTrained] = useState<number>(0);

  // Agent Trajectory Simulation
  const [agentPos, setAgentPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [simulationPath, setSimulationPath] = useState<Array<{ x: number; y: number }>>([{ x: 0, y: 0 }]);
  const [simReward, setSimReward] = useState<number>(0);
  const [simStatus, setSimStatus] = useState<'idle' | 'running' | 'success' | 'lava' | 'timeout'>('idle');

  // Last Bellman Step Information
  const [lastBellman, setLastBellman] = useState<{
    state: string;
    actionName: string;
    reward: number;
    oldQ: number;
    maxNextQ: number;
    newQ: number;
  } | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const [attempts, setAttempts] = useState<number>(telemetry.attempts || 0);

  function initQTable(): Record<string, number[]> {
    const table: Record<string, number[]> = {};
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        table[`${x},${y}`] = [0.0, 0.0, 0.0, 0.0];
      }
    }
    return table;
  }

  const handleResetQTable = () => {
    sounds.playClick();
    setQTable(initQTable());
    setTotalEpisodesTrained(0);
    setAgentPos({ x: 0, y: 0 });
    setSimulationPath([{ x: 0, y: 0 }]);
    setSimReward(0);
    setSimStatus('idle');
    setLastBellman(null);
  };

  // Perform single Q-learning transition step
  const stepQLearning = (currentX: number, currentY: number, curQ: Record<string, number[]>) => {
    const stateKey = `${currentX},${currentY}`;
    const qValues = curQ[stateKey] || [0, 0, 0, 0];

    // Pick action using epsilon-greedy
    let actionIdx = 0;
    if (Math.random() < epsilon) {
      actionIdx = Math.floor(Math.random() * 4);
    } else {
      let maxQ = -Infinity;
      qValues.forEach((val, idx) => {
        if (val > maxQ) {
          maxQ = val;
          actionIdx = idx;
        }
      });
    }

    const action = ACTIONS[actionIdx];
    const nextX = Math.max(0, Math.min(GRID_SIZE - 1, currentX + action.dx));
    const nextY = Math.max(0, Math.min(GRID_SIZE - 1, currentY + action.dy));
    const nextKey = `${nextX},${nextY}`;

    // Environment Reward
    let reward = -0.1; // small movement penalty
    let isTerminal = false;

    if (nextKey === GOAL_TILE) {
      reward = 10.0;
      isTerminal = true;
    } else if (LAVA_TILES.has(nextKey)) {
      reward = -10.0;
      isTerminal = true;
    }

    // Bellman update: Q(s,a) = Q(s,a) + alpha * [reward + gamma * max_a' Q(s',a') - Q(s,a)]
    const oldQ = qValues[actionIdx];
    const nextQValues = curQ[nextKey] || [0, 0, 0, 0];
    const maxNextQ = isTerminal ? 0 : Math.max(...nextQValues);

    const tdTarget = reward + gamma * maxNextQ;
    const tdError = tdTarget - oldQ;
    const newQ = Math.round((oldQ + alpha * tdError) * 100) / 100;

    curQ[stateKey][actionIdx] = newQ;

    setLastBellman({
      state: `(${currentX}, ${currentY})`,
      actionName: action.name,
      reward,
      oldQ,
      maxNextQ: Math.round(maxNextQ * 100) / 100,
      newQ
    });

    return { nextX, nextY, isTerminal, reward };
  };

  // Train batch episodes
  const trainEpisodes = (episodesCount: number) => {
    sounds.playRadar();
    const copyQ = JSON.parse(JSON.stringify(qTable));

    for (let ep = 0; ep < episodesCount; ep++) {
      let curX = 0;
      let curY = 0;

      for (let step = 0; step < 50; step++) {
        const res = stepQLearning(curX, curY, copyQ);
        curX = res.nextX;
        curY = res.nextY;
        if (res.isTerminal) break;
      }
    }

    setQTable(copyQ);
    setTotalEpisodesTrained((prev) => prev + episodesCount);
  };

  // Run the greedy policy from Start to Goal
  const runGreedySimulation = () => {
    sounds.playClick();
    setSimStatus('running');
    let x = 0;
    let y = 0;
    let cumReward = 0;
    const path = [{ x, y }];

    for (let step = 0; step < 30; step++) {
      const stateKey = `${x},${y}`;
      if (stateKey === GOAL_TILE) {
        setSimStatus('success');
        sounds.playSuccess();
        break;
      }
      if (LAVA_TILES.has(stateKey) && path.length > 1) {
        setSimStatus('lava');
        sounds.playError();
        break;
      }

      // Pick greedy action
      const qVals = qTable[stateKey] || [0, 0, 0, 0];
      let bestActIdx = 0;
      let maxQ = -Infinity;
      qVals.forEach((val, idx) => {
        if (val > maxQ) {
          maxQ = val;
          bestActIdx = idx;
        }
      });

      const act = ACTIONS[bestActIdx];
      x = Math.max(0, Math.min(GRID_SIZE - 1, x + act.dx));
      y = Math.max(0, Math.min(GRID_SIZE - 1, y + act.dy));
      path.push({ x, y });

      const nextKey = `${x},${y}`;
      if (nextKey === GOAL_TILE) {
        cumReward += 10.0;
        setSimStatus('success');
        sounds.playSuccess();
        break;
      } else if (LAVA_TILES.has(nextKey)) {
        cumReward -= 10.0;
        setSimStatus('lava');
        sounds.playError();
        break;
      } else {
        cumReward -= 0.1;
      }
    }

    setAgentPos({ x, y });
    setSimulationPath(path);
    const finalScore = Math.round(cumReward * 10) / 10;
    setSimReward(finalScore);

    // If passed challenge (reached goal with > 8.5 reward)
    if (finalScore >= 8.5) {
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      const score = Math.min(100, Math.round(finalScore * 10));
      onComplete(score, elapsed);
    }
  };

  const isChallengePassed = telemetry.completed || (simStatus === 'success' && simReward >= 8.5);

  return (
    <div className="space-y-6">
      {/* Zone Header */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-500/30 glow-indigo space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
              <Grid className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-indigo-400">
                Zone 02 · Reinforcement Learning
              </div>
              <h2 className="font-cinzel text-2xl font-bold text-white">
                Q-Value Maze: Markov Decision Process & Bellman Optimality
              </h2>
            </div>
          </div>

          {/* Stepper Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-700">
            <button
              onClick={() => { sounds.playClick(); setActiveTab('sandbox'); }}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'sandbox'
                  ? 'bg-indigo-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. GridWorld Q-Learning Sandbox
            </button>
            <button
              onClick={() => { sounds.playClick(); setActiveTab('challenge'); }}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'challenge'
                  ? 'bg-indigo-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Navigation Challenge Gate
              {isChallengePassed && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 5x5 Grid Display */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-indigo-400" />
                5×5 Discretized State Space S
              </span>
              <span className="text-xs font-mono text-indigo-300">
                Trained: {totalEpisodesTrained} Episodes
              </span>
            </div>

            {/* Grid Cells */}
            <div className="grid grid-cols-5 gap-2 p-3 bg-slate-950/90 rounded-2xl border border-slate-800 aspect-square max-w-[460px] mx-auto">
              {Array.from({ length: GRID_SIZE }).map((_, y) =>
                Array.from({ length: GRID_SIZE }).map((_, x) => {
                  const key = `${x},${y}`;
                  const isStart = key === START_TILE;
                  const isGoal = key === GOAL_TILE;
                  const isLava = LAVA_TILES.has(key);
                  const isAgentHere = agentPos.x === x && agentPos.y === y;
                  const isPath = simulationPath.some((p) => p.x === x && p.y === y);

                  const qVals = qTable[key] || [0, 0, 0, 0];
                  let bestActionIdx = 0;
                  let maxVal = -Infinity;
                  qVals.forEach((v, idx) => {
                    if (v > maxVal) {
                      maxVal = v;
                      bestActionIdx = idx;
                    }
                  });
                  const arrow = maxVal > 0 || maxVal < 0 ? ACTIONS[bestActionIdx].symbol : '·';

                  return (
                    <div
                      key={key}
                      className={`relative rounded-xl border flex flex-col justify-between p-1.5 transition-all text-center ${
                        isAgentHere
                          ? 'ring-2 ring-cyan-400 bg-cyan-950/60 border-cyan-400 z-10'
                          : isGoal
                          ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-500/10'
                          : isLava
                          ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                          : isPath
                          ? 'bg-indigo-950/40 border-indigo-500/40'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                      }`}
                    >
                      {/* Top Label */}
                      <div className="flex justify-between items-center text-[9px] font-mono leading-none">
                        <span className="opacity-60">{x},{y}</span>
                        {isGoal && <span className="text-emerald-400 font-bold">+10</span>}
                        {isLava && <Flame className="w-3 h-3 text-rose-400" />}
                        {isStart && <span className="text-cyan-400 font-bold">START</span>}
                      </div>

                      {/* Center Policy Arrow */}
                      <div className="my-auto font-mono text-base font-bold text-white flex items-center justify-center">
                        {isGoal ? '★' : isLava ? '☠' : arrow}
                      </div>

                      {/* Max Q Value Footer */}
                      <div className="text-[9px] font-mono opacity-80 truncate">
                        {isGoal ? 'GOAL' : isLava ? 'LAVA' : maxVal !== 0 ? maxVal.toFixed(1) : '0.0'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Grid Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-cyan-400" /> Start (0,0)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-400" /> Goal (+10)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500" /> Lava Hazard (-10)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500" /> Policy Vector
              </span>
            </div>
          </div>
        </div>

        {/* Right: Controls & Bellman Formula */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-4">
            <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              MDP & Bellman Hyperparameters
            </h3>

            {/* Gamma Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Discount Factor (γ):</span>
                <span className="text-indigo-400 font-bold">{gamma.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.99"
                step="0.05"
                value={gamma}
                onChange={(e) => setGamma(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0.10 (Myopic Short-term)</span>
                <span>0.99 (Far-sighted Goal)</span>
              </div>
            </div>

            {/* Alpha & Epsilon */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1">Learning Rate (α)</span>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.05"
                  value={alpha}
                  onChange={(e) => setAlpha(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <span className="text-[10px] font-mono text-slate-300 block text-right">{alpha.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1">Explore (ε)</span>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.05"
                  value={epsilon}
                  onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <span className="text-[10px] font-mono text-slate-300 block text-right">{epsilon.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => stepQLearning(agentPos.x, agentPos.y, qTable)}
                  className="py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-400 text-xs font-mono text-slate-200 hover:text-white transition-all"
                >
                  1 Step
                </button>
                <button
                  onClick={() => trainEpisodes(10)}
                  className="py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-400 text-xs font-mono text-slate-200 hover:text-white transition-all"
                >
                  +10 Ep
                </button>
                <button
                  onClick={() => trainEpisodes(100)}
                  className="py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/50 hover:bg-indigo-500/30 text-xs font-mono text-indigo-300 font-bold transition-all"
                >
                  +100 Ep
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={runGreedySimulation}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 font-mono text-xs font-bold hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20"
                >
                  <Play className="w-3.5 h-3.5" />
                  Test Greedy Policy from (0,0)
                </button>
                <button
                  onClick={handleResetQTable}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Reset Q-Table"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Simulation Status Card */}
            {simStatus !== 'idle' && (
              <div className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
                simStatus === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : simStatus === 'lava'
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}>
                <span>
                  Path: {simulationPath.length} steps | Reward: {simReward}
                </span>
                <span className="font-bold">
                  {simStatus === 'success' ? 'GOAL REACHED! ★' : simStatus === 'lava' ? 'FELL IN LAVA ☠' : 'RUNNING...'}
                </span>
              </div>
            )}
          </div>

          {/* Bellman Equation Breakdown */}
          <div className="glass-panel p-4 rounded-2xl border-slate-800 space-y-2 text-xs leading-relaxed">
            <div className="font-mono text-indigo-400 font-bold flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              Bellman Optimality TD Update
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 text-center">
              Q(s, a) ← Q(s, a) + α [r + γ max_a' Q(s', a') - Q(s, a)]
            </div>
            {lastBellman && (
              <div className="p-2.5 rounded-xl bg-slate-900/60 text-[10px] font-mono text-slate-400 space-y-1">
                <div>State: {lastBellman.state} · Action: {lastBellman.actionName}</div>
                <div>r: {lastBellman.reward} · Old Q: {lastBellman.oldQ} · max Q': {lastBellman.maxNextQ}</div>
                <div className="text-indigo-300 font-bold">New Q(s, a): {lastBellman.newQ}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Challenge Advance Bar */}
      <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-300 space-y-1">
          <div className="font-mono font-bold text-white flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-400" />
            Zone 2 Unlock Gate Objective:
          </div>
          <p className="text-slate-400">
            Train the Q-table with sufficient discount factor (γ ≥ 0.85) so the policy reaches the goal with cumulative score <strong>&gt; 8.5</strong>.
          </p>
        </div>

        {isChallengePassed ? (
          <button
            onClick={() => { sounds.playClick(); onAdvance(); }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 font-mono text-xs font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 shrink-0"
          >
            Advance to Zone 3: CartPole Arena
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={runGreedySimulation}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/40 text-indigo-300 font-mono text-xs font-bold hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            Test Path & Validate Gate
          </button>
        )}
      </div>
    </div>
  );
};
