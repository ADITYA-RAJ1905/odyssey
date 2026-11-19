import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/audio';
import { 
  CartPoleEnvironment, CartPoleNeuralPolicy, CartPoleState, 
  X_THRESHOLD, THETA_THRESHOLD_DEG, THETA_THRESHOLD_RAD 
} from '../../services/cartPoleRLService';
import { 
  CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Cpu, 
  Play, Pause, RotateCcw, Sliders, TrendingUp, Award, Zap, Activity 
} from 'lucide-react';
import { ZoneTelemetry } from '../../types';

interface CartPoleArenaZoneProps {
  telemetry: ZoneTelemetry;
  onComplete: (score: number, timeSpentSec: number) => void;
  onAdvance: () => void;
}

export const CartPoleArenaZone: React.FC<CartPoleArenaZoneProps> = ({
  telemetry,
  onComplete,
  onAdvance
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulation Environment & Policy
  const envRef = useRef<CartPoleEnvironment>(new CartPoleEnvironment());
  const policyRef = useRef<CartPoleNeuralPolicy>(new CartPoleNeuralPolicy());

  // Control Modes: 'pretrained' | 'manual' | 'training'
  const [controlMode, setControlMode] = useState<'pretrained' | 'manual' | 'training'>('pretrained');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Live Telemetry from Physics
  const [currentState, setCurrentState] = useState<CartPoleState>({
    x: 0,
    xDot: 0,
    theta: 0,
    thetaDot: 0,
    isDone: false,
    stepCount: 0
  });
  const [actionProbs, setActionProbs] = useState<[number, number]>([0.5, 0.5]);
  const [currentAction, setCurrentAction] = useState<number>(0); // 0: Left, 1: Right

  // Training Mode Parameters
  const [learningRate, setLearningRate] = useState<number>(0.01);
  const [rewardShaping, setRewardShaping] = useState<'standard' | 'centered'>('centered');
  const [isTrainingBatch, setIsTrainingBatch] = useState<boolean>(false);
  const [trainingHistory, setTrainingHistory] = useState<number[]>([18, 25, 42, 68, 95, 140, 185, 220]);
  const [bestSurvivalFrames, setBestSurvivalFrames] = useState<number>(telemetry.score || 0);

  const startTimeRef = useRef<number>(Date.now());
  const [attempts, setAttempts] = useState<number>(telemetry.attempts || 0);

  // Manual input state
  const manualActionRef = useRef<number>(0);

  // Initialize or mode change
  useEffect(() => {
    if (controlMode === 'pretrained') {
      policyRef.current.initPretrainedWeights();
      envRef.current.reset();
      setIsPlaying(true);
    } else if (controlMode === 'manual') {
      envRef.current.reset();
      setIsPlaying(true);
    }
  }, [controlMode]);

  // Keyboard listeners for Manual mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (controlMode !== 'manual') return;
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        manualActionRef.current = 0;
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        manualActionRef.current = 1;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [controlMode]);

  // Main 60fps Physics & Render Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      if (isPlaying && !isTrainingBatch) {
        const env = envRef.current;
        const policy = policyRef.current;
        const cur = env.getState();

        if (cur.isDone) {
          // Reset when fallen
          env.reset();
        } else {
          let chosenAction = 0;
          let probs: [number, number] = [0.5, 0.5];

          if (controlMode === 'manual') {
            chosenAction = manualActionRef.current;
            probs = chosenAction === 0 ? [0.95, 0.05] : [0.05, 0.95];
          } else {
            const pred = policy.predictAction(cur);
            chosenAction = pred.action;
            probs = pred.probs;
          }

          const stepResult = env.step(chosenAction, rewardShaping);
          setCurrentState(stepResult.state);
          setActionProbs(probs);
          setCurrentAction(chosenAction);

          if (stepResult.state.stepCount > bestSurvivalFrames) {
            setBestSurvivalFrames(stepResult.state.stepCount);
            if (stepResult.state.stepCount >= 150 && !telemetry.completed) {
              const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
              onComplete(100, elapsed);
            }
          }
        }
      }

      // Draw onto canvas
      drawCanvas();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, controlMode, isTrainingBatch, bestSurvivalFrames, rewardShaping, telemetry.completed]);

  // Render CartPole onto HTML5 Canvas
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#020617'; // slate-950
    ctx.fillRect(0, 0, width, height);

    // Track baseline (y = 200)
    const trackY = height * 0.75;
    ctx.strokeStyle = '#334155'; // slate-700
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, trackY);
    ctx.lineTo(width - 30, trackY);
    ctx.stroke();

    // Limit boundary markers (+- 2.4)
    const scaleX = (width - 80) / (2 * X_THRESHOLD);
    const centerX = width / 2;

    ctx.fillStyle = '#f43f5e'; // rose-500
    ctx.fillRect(centerX - X_THRESHOLD * scaleX - 2, trackY - 12, 4, 24);
    ctx.fillRect(centerX + X_THRESHOLD * scaleX - 2, trackY - 12, 4, 24);

    // Current Cart position
    const cartWidth = 60;
    const cartHeight = 32;
    const cartX = centerX + currentState.x * scaleX - cartWidth / 2;
    const cartY = trackY - cartHeight / 2;

    // Draw Cart
    ctx.fillStyle = controlMode === 'pretrained' ? '#6366f1' : controlMode === 'manual' ? '#06b6d4' : '#10b981';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cartX, cartY, cartWidth, cartHeight, 6);
    ctx.fill();
    ctx.stroke();

    // Cart Wheels
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cartX + 14, trackY + 8, 7, 0, Math.PI * 2);
    ctx.arc(cartX + cartWidth - 14, trackY + 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pivot Axle point
    const pivotX = cartX + cartWidth / 2;
    const pivotY = cartY + 6;

    // Pole
    const poleLengthPx = 110;
    const tipX = pivotX + poleLengthPx * Math.sin(currentState.theta);
    const tipY = pivotY - poleLengthPx * Math.cos(currentState.theta);

    // Pole color: turns amber/red when angle approaches 15 deg
    const angleRatio = Math.abs(currentState.theta) / THETA_THRESHOLD_RAD;
    ctx.strokeStyle = angleRatio > 0.8 ? '#f43f5e' : angleRatio > 0.5 ? '#f59e0b' : '#38bdf8';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    // Pivot joint circle
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Tip marker
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(tipX, tipY, 4, 0, Math.PI * 2);
    ctx.fill();
  };

  // Run live browser policy training batch
  const handleTrainBatch = async (episodes: number) => {
    sounds.playRadar();
    setIsTrainingBatch(true);
    setAttempts((prev) => prev + 1);

    const rewards = await policyRef.current.trainEpisodes(
      episodes,
      envRef.current,
      learningRate,
      0.99,
      rewardShaping,
      (ep, r) => {
        if (ep % 5 === 0) {
          setTrainingHistory((prev) => [...prev.slice(-30), r]);
        }
      }
    );

    setIsTrainingBatch(false);
    const maxRew = Math.max(...rewards);
    if (maxRew > bestSurvivalFrames) {
      setBestSurvivalFrames(maxRew);
    }

    if (maxRew >= 150) {
      sounds.playSuccess();
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      onComplete(100, elapsed);
    }
  };

  const isChallengePassed = telemetry.completed || bestSurvivalFrames >= 150;

  return (
    <div className="space-y-6">
      {/* Zone Header */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-500/30 glow-indigo space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-indigo-400">
                Zone 03 · Reinforcement Learning · Deep Neural Policy
              </div>
              <h2 className="font-cinzel text-2xl font-bold text-white">
                CartPole Arena: TensorFlow.js Neural Policy Gradient
              </h2>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-700">
            <button
              onClick={() => { sounds.playClick(); setControlMode('pretrained'); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                controlMode === 'pretrained'
                  ? 'bg-indigo-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Pre-Trained Policy
            </button>
            <button
              onClick={() => { sounds.playClick(); setControlMode('manual'); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                controlMode === 'manual'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Manual Control
            </button>
            <button
              onClick={() => { sounds.playClick(); setControlMode('training'); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                controlMode === 'training'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3. Live Browser Training
              {isChallengePassed && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Canvas Simulator */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-400" />
                CartPole-v1 Continuous State Simulation
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Surviving: {currentState.stepCount} frames
                </span>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => envRef.current.reset()}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                  title="Reset Episode"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="rounded-xl overflow-hidden border border-slate-800 shadow-inner flex justify-center bg-slate-950">
              <canvas
                ref={canvasRef}
                width={500}
                height={260}
                className="w-full max-w-[500px] h-[260px]"
              />
            </div>

            {/* Manual Controls bar if in manual mode */}
            {controlMode === 'manual' && (
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-3">
                <span className="text-xs font-mono text-cyan-300">
                  Use Arrow Keys or Buttons to Balance:
                </span>
                <div className="flex gap-2">
                  <button
                    onMouseDown={() => (manualActionRef.current = 0)}
                    className="px-4 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-mono font-bold text-white active:bg-cyan-500 active:text-slate-950"
                  >
                    ← PUSH LEFT
                  </button>
                  <button
                    onMouseDown={() => (manualActionRef.current = 1)}
                    className="px-4 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-mono font-bold text-white active:bg-cyan-500 active:text-slate-950"
                  >
                    PUSH RIGHT →
                  </button>
                </div>
              </div>
            )}

            {/* State Vector Meters */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Cart X</div>
                <div className="text-xs font-bold text-slate-200">{currentState.x.toFixed(2)} m</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Velocity ẋ</div>
                <div className="text-xs font-bold text-slate-200">{currentState.xDot.toFixed(2)} m/s</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Angle θ</div>
                <div className={`text-xs font-bold ${Math.abs(currentState.theta) > 0.15 ? 'text-rose-400' : 'text-emerald-300'}`}>
                  {((currentState.theta * 180) / Math.PI).toFixed(1)}°
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Ang Vel θ̇</div>
                <div className="text-xs font-bold text-slate-200">{currentState.thetaDot.toFixed(2)} r/s</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Neural Network Action Probabilities & Live Training */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-4">
            <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              Neural Policy Network (tf.sequential MLP)
            </h3>

            {/* Action Probabilities */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Softmax Action Probabilities P(a|s):
              </span>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-indigo-400 font-bold">P(Action 0: LEFT)</span>
                    <span className="text-indigo-300">{(actionProbs[0] * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-150"
                      style={{ width: `${actionProbs[0] * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-cyan-400 font-bold">P(Action 1: RIGHT)</span>
                    <span className="text-cyan-300">{(actionProbs[1] * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 transition-all duration-150"
                      style={{ width: `${actionProbs[1] * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Training Controls */}
            {controlMode === 'training' && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300">Reward Shaping Function:</span>
                  <select
                    value={rewardShaping}
                    onChange={(e) => setRewardShaping(e.target.value as any)}
                    className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono"
                  >
                    <option value="centered">Center-Track Penalty</option>
                    <option value="standard">Standard (+1/step)</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleTrainBatch(25)}
                    disabled={isTrainingBatch}
                    className="flex-1 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/50 hover:bg-emerald-500/30 text-emerald-300 font-mono text-xs font-bold transition-all disabled:opacity-40"
                  >
                    {isTrainingBatch ? 'Training in tf.js...' : 'Train 25 Episodes'}
                  </button>
                  <button
                    onClick={() => {
                      policyRef.current.resetToRandom();
                      setTrainingHistory([10]);
                      setBestSurvivalFrames(0);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors text-xs font-mono"
                    title="Reset Weights to Random"
                  >
                    Reset Weights
                  </button>
                </div>
              </div>
            )}

            {/* Episode Reward History Curve */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Episode Reward Curve:</span>
                <span className="text-emerald-400 font-bold">Best: {bestSurvivalFrames} frames</span>
              </div>
              <div className="h-16 rounded-xl bg-slate-950 border border-slate-800 p-2 flex items-end gap-1">
                {trainingHistory.map((val, idx) => {
                  const barHeight = Math.min(100, Math.max(8, (val / 200) * 100));
                  return (
                    <div
                      key={idx}
                      className="flex-1 bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-t transition-all"
                      style={{ height: `${barHeight}%` }}
                      title={`Episode ${idx + 1}: ${val} frames`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Advance Bar */}
      <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-300 space-y-1">
          <div className="font-mono font-bold text-white flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-400" />
            Zone 3 Unlock Gate Objective:
          </div>
          <p className="text-slate-400">
            Stabilize the CartPole dynamical system for at least <strong>150+ frames</strong> using the pre-trained or trained neural policy.
          </p>
        </div>

        {isChallengePassed ? (
          <button
            onClick={() => { sounds.playClick(); onAdvance(); }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 font-mono text-xs font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 shrink-0"
          >
            Advance to Zone 4: The Policy Citadel
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-xs font-mono text-amber-400 font-bold">
            Current Best: {bestSurvivalFrames} / 150 frames required
          </div>
        )}
      </div>
    </div>
  );
};
