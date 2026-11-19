import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { useOdysseyReport, ConceptItem, DomainBreakdown } from '../hooks/useOdysseyReport';
import { AIMentorService, MentorDebrief, OracleTutorAnswer } from '../services/aiMentorService';
import { 
  Trophy, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Printer, 
  Sparkles, Clock, Compass, Cpu, Eye, MessageSquareCode, 
  BookOpen, ShieldCheck, HelpCircle, Layers, Download, RotateCcw, 
  Send, ExternalLink, Zap, ChevronRight, Activity, Flame, ShieldAlert, Award, FileCode, Check 
} from 'lucide-react';

export const FinalReportView: React.FC = () => {
  const { profile, telemetry, isDemoMode, toggleDemoMode, resetGame, navigateTo } = useGame();

  // 1. Telemetry Aggregation & Diagnostic Hook
  const report = useOdysseyReport(telemetry, isDemoMode);

  // 2. AI Mentor Service Integration
  const mentorService = useMemo(() => AIMentorService.getInstance(), []);
  const [mentorStatus, setMentorStatus] = useState(mentorService.getStatus());
  const [debrief, setDebrief] = useState<MentorDebrief>(() => mentorService.generateDeterministicDebrief(report));
  const [loadingDebrief, setLoadingDebrief] = useState<boolean>(false);

  // 3. Interactive "Ask the Oracle" State
  const [tutorQuestion, setTutorQuestion] = useState<string>('');
  const [tutorLoading, setTutorLoading] = useState<boolean>(false);
  const [tutorHistory, setTutorHistory] = useState<OracleTutorAnswer[]>([]);
  const [activeWeakConcept, setActiveWeakConcept] = useState<ConceptItem | null>(null);

  // 4. Reset Confirmation State
  const [showResetDialog, setShowResetDialog] = useState<boolean>(false);

  // Subscribe to AI Mentor Service status updates
  useEffect(() => {
    const unsub = mentorService.subscribe(() => {
      setMentorStatus(mentorService.getStatus());
    });
    return unsub;
  }, [mentorService]);

  // Update debrief whenever report updates
  useEffect(() => {
    setDebrief(mentorService.generateDeterministicDebrief(report));
    if (report.weakestConcepts.length > 0) {
      setActiveWeakConcept(report.weakestConcepts[0]);
    }
  }, [report, mentorService]);

  // Initial celebratory fireworks if high mastery achieved
  useEffect(() => {
    if (report.masteryPct >= 80) {
      sounds.playFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#a855f7', '#f59e0b', '#10b981', '#f43f5e', '#6366f1']
      });
    }
  }, [report.masteryPct]);

  // Generate deeper neural critique with model
  const handleGenerateNeuralCritique = async () => {
    sounds.playClick();
    setLoadingDebrief(true);
    try {
      const result = await mentorService.generateNeuralDebrief(report);
      setDebrief(result);
      sounds.playSuccess();
    } catch (e) {
      console.error('Neural critique failed:', e);
      sounds.playError();
    } finally {
      setLoadingDebrief(false);
    }
  };

  // Submit question to Ask the Oracle tutor
  const handleAskOracle = async (questionText: string) => {
    if (!questionText || questionText.trim().length === 0) return;
    sounds.playClick();
    setTutorLoading(true);

    try {
      const answer = await mentorService.askOracleTutor(
        questionText,
        report,
        activeWeakConcept || report.weakestConcepts[0]
      );
      setTutorHistory((prev) => [answer, ...prev]);
      setTutorQuestion('');
      sounds.playSelect();
    } catch (e) {
      console.error('Tutor query failed:', e);
      sounds.playError();
    } finally {
      setTutorLoading(false);
    }
  };

  // Print or export to PDF
  const handlePrint = () => {
    sounds.playClick();
    window.print();
  };

  // Export Telemetry JSON
  const handleExportJson = () => {
    sounds.playClick();
    const exportData = {
      player: profile?.name || 'Explorer',
      timestamp: new Date().toISOString(),
      masteryScorePct: report.masteryPct,
      rankTitle: report.rankTitle,
      learningProfile: report.learningProfile,
      telemetry: telemetry,
      domains: report.domainBreakdowns,
      strongestConcepts: report.strongestConcepts,
      weakestConcepts: report.weakestConcepts
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `odyssey_mastery_report_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    sounds.playSuccess();
  };

  // Reset voyage with confirmation
  const handleConfirmReset = async () => {
    sounds.playClick();
    await resetGame();
    setShowResetDialog(false);
    navigateTo('landing');
  };

  // Pre-populated suggested query chips based on user's actual weak areas
  const suggestedQueries = useMemo(() => {
    const w1 = report.weakestConcepts[0];
    const s1 = report.strongestConcepts[0];
    const s2 = report.strongestConcepts[1];

    const chips: string[] = [];
    if (w1) {
      chips.push(`Why did I struggle on ${w1.shortTitle}? Give me a 3-step mental model.`);
      chips.push(`How do I prevent ${w1.shortTitle}'s failure mode in production ML?`);
    }
    if (s1 && s2) {
      chips.push(`How can I combine ${s1.shortTitle} with ${s2.shortTitle} in a capstone project?`);
    } else if (s1) {
      chips.push(`What is an intuitive geometric explanation for ${s1.shortTitle}?`);
    }
    return chips;
  }, [report]);

  const islandIconMap: Record<string, any> = {
    machine_learning: Cpu,
    deep_learning: Sparkles,
    computer_vision: Eye,
    nlp: MessageSquareCode,
    reinforcement_learning: Compass,
    island_6: BookOpen
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Print Stylesheet for clean academic PDF export */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print, header, nav, button {
            display: none !important;
          }
          .glass-panel, .glass-card {
            background: white !important;
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            color: black !important;
          }
          h1, h2, h3, h4, span, div, p {
            color: #0f172a !important;
            text-shadow: none !important;
          }
          .print-break {
            page-break-after: always;
          }
        }
      `}</style>

      {/* Top Controls Bar & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel px-6 py-4 rounded-2xl border-slate-800 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('map')}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Return to World Map"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                Island 07 • The Oracle Citadel
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                • Final Mastery Dossier
              </span>
            </div>
            <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>Odyssey Master Executive Report</span>
            </h1>
          </div>
        </div>

        {/* Demo Mode Toggle & Global Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {report.hasIncompleteIslands && (
            <button
              onClick={toggleDemoMode}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono border transition-all flex items-center gap-1.5 ${
                isDemoMode
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/50'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
              title="Toggle between viewing your genuine user progress vs. full simulated 6-island voyage data"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isDemoMode ? 'Simulating Full Voyage' : 'Preview Full Voyage (Demo)'}</span>
            </button>
          )}

          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors text-xs font-mono flex items-center gap-1.5"
            title="Export Telemetry JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors text-xs font-mono flex items-center gap-1.5"
            title="Print or Save Official Report as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={() => setShowResetDialog(true)}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 transition-colors"
            title="Reset Voyage"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Demo Notification Banner if active */}
      {isDemoMode && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl flex items-center justify-between text-xs font-mono text-amber-300 no-print">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Simulation Mode Active:</strong> Displaying benchmark performance across all archipelago islands. Click "Preview Full Voyage" above to toggle back to your live progress.
            </span>
          </div>
          <button
            onClick={toggleDemoMode}
            className="text-[10px] uppercase font-bold underline hover:text-amber-200 shrink-0 ml-2"
          >
            View Live
          </button>
        </div>
      )}

      {/* SECTION 1: HERO BANNER — ODYSSEY COMPLETION & RANK CREST */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-yellow-500/30 glow-gold space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-950/60 border border-yellow-500/30 text-yellow-300 text-xs font-mono uppercase tracking-widest shadow-[0_0_12px_rgba(234,179,8,0.25)]">
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              <span>Verified Navigator: {profile?.name || 'Explorer'}</span>
            </div>

            <h2 className="font-cinzel text-3xl sm:text-4xl font-black text-white">
              <span className="bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                {report.rankTitle}
              </span>
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm font-light max-w-2xl leading-relaxed">
              {report.rankDescription}
            </p>
          </div>

          {/* Master Radial Mastery Dial */}
          <div className="flex items-center gap-5 bg-slate-950/90 p-5 rounded-2xl border border-yellow-500/30 shadow-xl shrink-0">
            {/* SVG Circular Gauge */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#masteryGrad)"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * report.masteryPct) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="masteryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                <span className="text-lg font-black text-white leading-none">
                  {report.masteryPct}%
                </span>
                <span className="text-[8px] text-slate-400 uppercase mt-0.5">Score</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-yellow-400 font-bold">
                Mastery Index
              </div>
              <div className="font-mono text-2xl font-black text-white">
                {report.totalScore.toLocaleString()}
                <span className="text-xs text-slate-400 font-normal ml-1">/ {report.maxPossibleScore}</span>
              </div>
              <div className="text-[10px] font-mono text-emerald-400">
                {report.completedZones} of {report.totalZones} Zones Cleared
              </div>
            </div>
          </div>
        </div>

        {/* 4 Executive KPI Stat Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-xl border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Voyage Time</span>
            </div>
            <div className="font-mono text-xl font-bold text-white">
              {report.timeFormatted}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Active checkpoint time</div>
          </div>

          <div className="glass-card p-4 rounded-xl border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>First-Try Accuracy</span>
            </div>
            <div className="font-mono text-xl font-bold text-emerald-400">
              {report.learningProfile.firstTryRate}%
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Checkpoints cleared on Try 1</div>
          </div>

          <div className="glass-card p-4 rounded-xl border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Islands Mastered</span>
            </div>
            <div className="font-mono text-xl font-bold text-amber-300">
              {report.completedIslands} / {report.totalIslands}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Archipelago trial hubs</div>
          </div>

          <div className="glass-card p-4 rounded-xl border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>Learning Archetype</span>
            </div>
            <div className="font-mono text-sm font-bold text-purple-300 truncate">
              {report.learningProfile.archetype}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {report.learningProfile.tagline}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: VISUAL MASTERY PROFILE — DOMAIN COMPARISON & ZONE HEATMAP */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>Architectural Domain Analysis</span>
            </div>
            <h3 className="font-cinzel text-xl font-bold text-white">
              Domain Proficiency &amp; Checkpoint Telemetry
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {report.domainBreakdowns.length} Evaluated AI Disciplines
          </span>
        </div>

        {/* Multi-Domain Comparison Bars */}
        <div className="space-y-4">
          {report.domainBreakdowns.map((domain) => {
            const Icon = islandIconMap[domain.islandKey] || Cpu;
            return (
              <div
                key={domain.islandKey}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-2 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${domain.hexColor}20`, color: domain.hexColor, border: `1px solid ${domain.hexColor}40` }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-slate-400 uppercase">
                        Island 0{domain.num} • {domain.domain}
                      </div>
                      <div className="font-cinzel font-bold text-sm text-white">
                        {domain.title}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right">
                      <span className="text-slate-400">Score: </span>
                      <strong className="text-white">{domain.score} pts</strong>
                      <span className="text-slate-500"> ({domain.scorePct}%)</span>
                    </div>

                    <div className="hidden md:block text-right text-slate-400">
                      <span>Time: </span>
                      <strong className="text-slate-200">{domain.timeFormatted}</strong>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400">First-Try: </span>
                      <strong className={domain.firstTryAccuracyPct >= 75 ? 'text-emerald-400' : 'text-amber-400'}>
                        {domain.firstTryAccuracyPct}%
                      </strong>
                    </div>

                    <button
                      onClick={() => navigateTo(domain.viewKey)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 text-[11px] font-mono transition-colors flex items-center gap-1 no-print"
                      title={`Jump to ${domain.title}`}
                    >
                      <span>Revisit</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${domain.scorePct}%`,
                      backgroundColor: domain.hexColor,
                      boxShadow: `0 0 10px ${domain.hexColor}60`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Checkpoint Status Heatmap Grid */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase tracking-wider font-semibold">Granular Checkpoint Heatmap Matrix</span>
            <span>{report.completedZones} of {report.totalZones} cleared</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {report.allConceptsRanked.map((c) => {
              let borderClass = 'border-slate-800 bg-slate-950/40 text-slate-500';
              let badgeColor = 'text-slate-500 bg-slate-900';

              if (c.completed) {
                if (c.attempts === 1 && c.score >= 90) {
                  borderClass = 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300';
                  badgeColor = 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40';
                } else if (c.attempts >= 3 || c.score < 80) {
                  borderClass = 'border-amber-500/40 bg-amber-950/20 text-amber-300';
                  badgeColor = 'text-amber-400 bg-amber-950/80 border-amber-500/40';
                } else {
                  borderClass = 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300';
                  badgeColor = 'text-cyan-400 bg-cyan-950/80 border-cyan-500/40';
                }
              }

              return (
                <div
                  key={c.zoneKey}
                  onClick={() => navigateTo(c.islandView)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 hover:scale-[1.02] ${borderClass}`}
                  title={`${c.title} • ${c.attempts} attempt(s) • Click to open`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="text-slate-400 truncate max-w-[80px]">{c.islandTitle}</span>
                      {c.completed ? (
                        <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold ${badgeColor}`}>
                          {c.attempts === 1 ? '1st try' : `${c.attempts} tries`}
                        </span>
                      ) : (
                        <span className="text-slate-600">Locked</span>
                      )}
                    </div>
                    <div className="font-bold text-xs text-white line-clamp-1">
                      {c.shortTitle}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">{c.timeSpentSec}s</span>
                    <span className="font-bold text-white">{c.score} pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 3: DIAGNOSTIC MATRIX — STRONGEST CONCEPTS VS BLIND SPOTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Demonstrated Strongest Concepts */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border-emerald-500/30 glow-emerald space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-cinzel font-bold text-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Top Demonstrated Strengths</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40 font-semibold">
              High First-Try Mastery
            </span>
          </div>

          <p className="text-slate-300 text-xs font-light leading-relaxed">
            Concepts verified on the initial attempt with high calibration precision (&ge; 85%) and rapid convergence.
          </p>

          <div className="space-y-3.5 pt-1">
            {report.strongestConcepts.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-emerald-950/25 border border-emerald-500/35 rounded-2xl space-y-2.5 transition-all hover:border-emerald-400"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      {item.islandTitle} • Checkpoint
                    </span>
                    <h4 className="font-bold text-white text-sm font-cinzel">
                      {item.title}
                    </h4>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-300 text-base">
                      {item.score} PTS
                    </div>
                    <div className="text-[9px] font-mono text-emerald-400">1st Attempt Pass</div>
                  </div>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed font-light">
                  {item.coreConcept}
                </div>

                {/* Related Skills Proven */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.relatedSkills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Weakest Concepts / Blind Spots & Actionable Remedies */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border-amber-500/30 glow-amber space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2 text-amber-400 font-cinzel font-bold text-lg">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>Targeted Growth Areas &amp; Blind Spots</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40 font-semibold">
              Actionable Remedies
            </span>
          </div>

          <p className="text-slate-300 text-xs font-light leading-relaxed">
            Checkpoints exhibiting multiple verification attempts (&ge; 2) or score variance, tagged with direct remediation cues.
          </p>

          <div className="space-y-3.5 pt-1">
            {report.weakestConcepts.length > 0 ? (
              report.weakestConcepts.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-amber-950/25 border border-amber-500/35 rounded-2xl space-y-2.5 transition-all hover:border-amber-400"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">
                        {item.islandTitle} • Review Recommended
                      </span>
                      <h4 className="font-bold text-white text-sm font-cinzel">
                        {item.title}
                      </h4>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-amber-300 text-base">
                        {item.attempts} Attempts
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">{item.score} PTS Awarded</div>
                    </div>
                  </div>

                  <div className="text-xs text-amber-200/90 bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30 space-y-1">
                    <div className="font-bold font-mono text-[10px] text-amber-400 uppercase tracking-wider">
                      ⚠️ Misconception Tested:
                    </div>
                    <div>{item.misconceptionTested}</div>
                  </div>

                  <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 space-y-1 font-light">
                    <div className="font-bold font-mono text-[10px] text-cyan-400 uppercase tracking-wider">
                      💡 Targeted Remediation:
                    </div>
                    <div>{item.remediationCue}</div>
                  </div>

                  {/* Revisit Zone Action Button */}
                  <div className="pt-1 flex items-center justify-end no-print">
                    <button
                      onClick={() => navigateTo(item.islandView)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <span>Revisit Zone ({item.shortTitle})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-cinzel text-base font-bold text-white">
                  Zero Critical Blind Spots Detected
                </h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Every evaluated checkpoint was solved cleanly with rapid convergence across the Archipelago.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: AI MENTOR DEBRIEF & "ASK THE ORACLE" TUTOR */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-purple-500/30 glow-purple space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>In-Browser Neural Intelligence Debrief</span>
            </div>
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>The Oracle's Personal AI Debrief</span>
            </h3>
          </div>

          {/* Model Status & Neural Generation Trigger */}
          <div className="flex items-center gap-2 no-print">
            <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-purple-300 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${mentorStatus.status === 'downloading' || loadingDebrief ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              <span>{mentorStatus.statusMessage}</span>
            </div>

            <button
              onClick={handleGenerateNeuralCritique}
              disabled={loadingDebrief}
              className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-mono transition-all flex items-center gap-1.5 disabled:opacity-50"
              title="Run inference via browser-based pre-trained Qwen2.5 / SmolLM model"
            >
              <Zap className={`w-3.5 h-3.5 text-purple-400 ${loadingDebrief ? 'animate-spin' : ''}`} />
              <span>{loadingDebrief ? 'Inferring...' : 'Regenerate Neural Critique'}</span>
            </button>
          </div>
        </div>

        {/* 3-Part Mentor Narrative Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Voyage Verdict */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-purple-500/30 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-purple-400 font-bold">
              <span>🌟</span>
              <span>Voyage Verdict</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
              {debrief.verdict}
            </p>
          </div>

          {/* Card 2: Priority Focus Area */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-amber-400 font-bold">
              <span>🎯</span>
              <span>Priority Focus Area</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
              {debrief.priorityFocus}
            </p>
          </div>

          {/* Card 3: Recommended Capstone Project */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-cyan-500/30 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-400 font-bold">
              <span>🚀</span>
              <span>Recommended Capstone Project</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
              {debrief.recommendedProject}
            </p>
          </div>
        </div>

        {/* INTERACTIVE "ASK THE ORACLE" WEAK-CONCEPT TUTOR */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Interactive "Ask the Oracle" AI Tutor</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Inquire about your specific weak zones or ask for concrete architectural intuition.
              </p>
            </div>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-500/40">
              Context-Aware Reasoning
            </span>
          </div>

          {/* Pre-populated Suggested Query Chips */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Suggested Telemetry Questions:</div>
            <div className="flex flex-wrap gap-2">
              {suggestedQueries.map((query, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => {
                    setTutorQuestion(query);
                    handleAskOracle(query);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 text-xs font-mono text-left transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>{query}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input & Ask Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskOracle(tutorQuestion);
            }}
            className="flex items-center gap-2 pt-2"
          >
            <input
              type="text"
              value={tutorQuestion}
              onChange={(e) => setTutorQuestion(e.target.value)}
              placeholder="Ask the Oracle a concept question (e.g., 'Explain the bias-variance tradeoff simply')..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-sm text-white placeholder-slate-500 outline-none transition-colors font-mono text-xs"
            />
            <button
              type="submit"
              disabled={tutorLoading || !tutorQuestion.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 disabled:opacity-40 transition-all shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{tutorLoading ? 'Thinking...' : 'Ask Oracle'}</span>
            </button>
          </form>

          {/* Conversation History */}
          {tutorHistory.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              {tutorHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400">
                    <span className="font-bold flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" />
                      Q: "{item.question}"
                    </span>
                    <span className="text-slate-500">{item.timestamp}</span>
                  </div>

                  <div className="text-xs text-slate-200 leading-relaxed font-light whitespace-pre-line pl-2 border-l-2 border-cyan-500/40">
                    {item.answer}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 5: OFFICIAL GRADUATION CERTIFICATE & ACTIONS BAR */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border-yellow-500/40 glow-gold text-center space-y-6">
        <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-yellow-500/20 via-amber-500/20 to-cyan-500/20 border border-yellow-500/40 text-yellow-400 mb-1">
          <Trophy className="w-12 h-12" />
        </div>

        <div className="space-y-2 max-w-2xl mx-auto">
          <div className="text-xs font-mono uppercase tracking-widest text-yellow-400 font-bold">
            Odyssey Artificial Intelligence Accreditation
          </div>
          <h3 className="font-cinzel text-3xl sm:text-4xl font-black text-white">
            Certificate of Archipelago Mastery
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
            This certifies that <strong>{profile?.name || 'Explorer'}</strong> has autonomously journeyed across the Odyssey challenge archipelago, validating empirical proficiency in Machine Learning, Deep Neural Networks, Computer Vision, Attention-Based NLP, and Deep Reinforcement Learning.
          </p>
        </div>

        {/* Certificate Credential Bar */}
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Final Score</div>
            <div className="font-bold text-white text-sm">{report.totalScore} PTS</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Mastery Index</div>
            <div className="font-bold text-emerald-400 text-sm">{report.masteryPct}%</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Rank Attained</div>
            <div className="font-bold text-amber-300 text-sm truncate">{report.rankTitle}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 no-print">
          <button
            onClick={handlePrint}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-slate-950 font-bold font-mono text-xs hover:brightness-110 transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)] flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>DOWNLOAD / PRINT OFFICIAL CERTIFICATE</span>
          </button>

          <button
            onClick={() => navigateTo('map')}
            className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700 transition-all flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>RETURN TO WORLD MAP</span>
          </button>
        </div>
      </div>

      {/* Reset Voyage Confirmation Modal */}
      {showResetDialog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-6 rounded-2xl border-rose-500/40 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-cinzel text-lg font-bold text-white">Reset Odyssey Voyage?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              This will erase all active checkpoint progress, scores, and unlocked relics across all islands. You will restart from the stranded shoreline of Island 1.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetDialog(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono shadow-md"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
