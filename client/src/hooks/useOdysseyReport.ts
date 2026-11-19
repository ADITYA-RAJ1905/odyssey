import { useMemo } from 'react';
import { PlayerTelemetry, ZoneTelemetry } from '../types';
import { MOCK_DEMO_TELEMETRY } from '../utils/telemetryDefaults';
import { 
  ZONE_METADATA_REGISTRY, 
  ISLAND_METADATA_REGISTRY, 
  ZoneMetadata, 
  IslandMetadata 
} from '../utils/islandMetadata';

export interface DomainBreakdown {
  islandKey: string;
  num: number;
  title: string;
  domain: string;
  relicName: string;
  viewKey: any;
  accentColor: string;
  hexColor: string;
  status: 'locked' | 'in_progress' | 'completed';
  score: number;
  maxScore: number;
  scorePct: number;
  totalTimeSec: number;
  timeFormatted: string;
  completedZones: number;
  totalZones: number;
  firstTryCount: number;
  firstTryAccuracyPct: number;
  zones: Array<{
    zoneKey: string;
    title: string;
    shortTitle: string;
    score: number;
    attempts: number;
    timeSpentSec: number;
    completed: boolean;
  }>;
}

export interface ConceptItem {
  zoneKey: string;
  title: string;
  shortTitle: string;
  islandKey: string;
  islandTitle: string;
  islandView: any;
  score: number;
  attempts: number;
  timeSpentSec: number;
  completed: boolean;
  coreConcept: string;
  misconceptionTested: string;
  remediationCue: string;
  relatedSkills: string[];
}

export interface LearningProfile {
  archetype: 'Precision Sprinter' | 'Methodical Explorer' | 'Resilient Debugger' | 'Adaptive Pioneer';
  tagline: string;
  description: string;
  firstTryRate: number; // 0–100%
  avgZoneTimeSec: number;
  bossTrialResilience: number; // 0–100%
}

export interface OdysseyReportStats {
  masteryPct: number;
  totalScore: number;
  maxPossibleScore: number;
  totalTimeSec: number;
  timeFormatted: string;
  completedZones: number;
  totalZones: number;
  completedIslands: number;
  totalIslands: number;
  rankTitle: string;
  rankDescription: string;
  learningProfile: LearningProfile;
  domainBreakdowns: DomainBreakdown[];
  strongestConcepts: ConceptItem[];
  weakestConcepts: ConceptItem[];
  allConceptsRanked: ConceptItem[];
  isDemoMode: boolean;
  hasIncompleteIslands: boolean;
}

export function useOdysseyReport(
  telemetry: PlayerTelemetry,
  isDemoMode: boolean
): OdysseyReportStats {
  return useMemo(() => {
    // 1. Resolve Active Telemetry: If demo mode, blend real completed progress with mock data
    const activeIslands: Record<string, any> = {};

    // Canonical list of islands we inspect in order
    const candidateKeys = [
      'machine_learning',
      'deep_learning',
      'computer_vision',
      'nlp',
      'reinforcement_learning',
      'island_6'
    ];

    let hasIncomplete = false;

    candidateKeys.forEach((key) => {
      // Find actual user data for this key (or alias like island_2, island_3, etc.)
      let userIslandData = (telemetry.islands as any)[key];
      if (!userIslandData) {
        if (key === 'deep_learning') userIslandData = (telemetry.islands as any).island_2;
        if (key === 'computer_vision') userIslandData = (telemetry.islands as any).island_3;
        if (key === 'nlp') userIslandData = (telemetry.islands as any).island_4;
        if (key === 'reinforcement_learning') userIslandData = (telemetry.islands as any).island_5;
      }

      const mockIslandData = (MOCK_DEMO_TELEMETRY.islands as any)[key] ||
        (key === 'nlp' ? (MOCK_DEMO_TELEMETRY.islands as any).island_4 : null) ||
        (key === 'reinforcement_learning' ? (MOCK_DEMO_TELEMETRY.islands as any).island_5 : null);

      // Check if user has active progress in this island
      let userHasProgress = false;
      if (userIslandData && userIslandData.zones) {
        userHasProgress = Object.values(userIslandData.zones).some((z: any) => z.attempts > 0 || z.completed);
      }

      if (!userHasProgress || userIslandData?.status !== 'completed') {
        hasIncomplete = true;
      }

      if (isDemoMode) {
        // Use user's data if they finished it; otherwise use mock benchmark data
        if (userHasProgress && userIslandData?.status === 'completed') {
          activeIslands[key] = userIslandData;
        } else {
          activeIslands[key] = mockIslandData || userIslandData;
        }
      } else {
        // Live mode: use user's genuine progress
        activeIslands[key] = userIslandData || mockIslandData;
      }
    });

    // 2. Aggregate Domains & Zones
    let totalScore = 0;
    let maxPossibleScore = 0;
    let totalTimeSec = 0;
    let completedZones = 0;
    let totalZones = 0;
    let completedIslands = 0;
    let firstTryTotal = 0;
    let bossTrialScoreSum = 0;
    let bossTrialCount = 0;

    const allConcepts: ConceptItem[] = [];
    const domainBreakdowns: DomainBreakdown[] = [];

    // Dynamically iterate over all active islands present
    Object.entries(activeIslands).forEach(([islandKey, islandData]) => {
      if (!islandData) return;

      const meta: IslandMetadata = ISLAND_METADATA_REGISTRY[islandKey] || {
        islandKey,
        canonicalKey: islandKey,
        num: domainBreakdowns.length + 1,
        title: islandData.title || islandKey,
        domain: islandData.domain || 'Applied Artificial Intelligence',
        relicName: 'Island Relic',
        viewKey: 'map',
        accentColor: 'cyan',
        hexColor: '#06b6d4',
        zones: Object.keys(islandData.zones || {})
      };

      const isCompleted = islandData.status === 'completed';
      if (isCompleted) completedIslands += 1;

      let islandScore = 0;
      let islandMaxScore = 0;
      let islandTimeSec = 0;
      let islandCompletedZones = 0;
      let islandFirstTry = 0;

      const zoneList: DomainBreakdown['zones'] = [];

      Object.entries(islandData.zones || {}).forEach(([zoneKey, zRaw]: [string, any]) => {
        const z = zRaw as ZoneTelemetry;
        totalZones += 1;
        islandMaxScore += 100;
        maxPossibleScore += 100;
        totalTimeSec += z.timeSpentSec || 0;
        islandTimeSec += z.timeSpentSec || 0;

        if (z.completed) {
          completedZones += 1;
          islandCompletedZones += 1;
          totalScore += z.score;
          islandScore += z.score;
        }

        if (z.completed && z.attempts === 1) {
          firstTryTotal += 1;
          islandFirstTry += 1;
        }

        // Check if this is a boss trial (lighthouse, neural_citadel, vision_citadel, transformer_citadel, policy_citadel)
        if (zoneKey.includes('citadel') || zoneKey === 'lighthouse') {
          bossTrialCount += 1;
          if (z.completed) {
            bossTrialScoreSum += z.score;
          }
        }

        const zMeta: ZoneMetadata = ZONE_METADATA_REGISTRY[zoneKey] || {
          zoneKey,
          title: zoneKey.replace(/_/g, ' '),
          shortTitle: zoneKey.replace(/_/g, ' '),
          islandKey,
          islandTitle: meta.title,
          islandView: meta.viewKey,
          coreConcept: 'Core domain problem formulation and algorithmic evaluation.',
          misconceptionTested: 'Parameter instability and evaluation metric miscalibration.',
          remediationCue: 'Review foundational domain theory and calibrate hyperparameters against holdout sets.',
          relatedSkills: ['Model Evaluation', 'Hyperparameter Calibration']
        };

        const conceptItem: ConceptItem = {
          zoneKey,
          title: zMeta.title,
          shortTitle: zMeta.shortTitle,
          islandKey,
          islandTitle: meta.title,
          islandView: zMeta.islandView,
          score: z.score || 0,
          attempts: z.attempts || 0,
          timeSpentSec: z.timeSpentSec || 0,
          completed: z.completed || false,
          coreConcept: zMeta.coreConcept,
          misconceptionTested: zMeta.misconceptionTested,
          remediationCue: zMeta.remediationCue,
          relatedSkills: zMeta.relatedSkills
        };

        allConcepts.push(conceptItem);

        zoneList.push({
          zoneKey,
          title: zMeta.title,
          shortTitle: zMeta.shortTitle,
          score: z.score || 0,
          attempts: z.attempts || 0,
          timeSpentSec: z.timeSpentSec || 0,
          completed: z.completed || false
        });
      });

      const islandScorePct = islandMaxScore > 0 ? Math.round((islandScore / islandMaxScore) * 100) : 0;
      const firstTryPct = zoneList.length > 0 ? Math.round((islandFirstTry / zoneList.length) * 100) : 0;
      const mins = Math.floor(islandTimeSec / 60);
      const secs = islandTimeSec % 60;

      domainBreakdowns.push({
        islandKey,
        num: meta.num,
        title: meta.title,
        domain: meta.domain,
        relicName: meta.relicName,
        viewKey: meta.viewKey,
        accentColor: meta.accentColor,
        hexColor: meta.hexColor,
        status: islandData.status || 'locked',
        score: islandScore,
        maxScore: islandMaxScore,
        scorePct: islandScorePct,
        totalTimeSec: islandTimeSec,
        timeFormatted: `${mins}m ${secs}s`,
        completedZones: islandCompletedZones,
        totalZones: zoneList.length,
        firstTryCount: islandFirstTry,
        firstTryAccuracyPct: firstTryPct,
        zones: zoneList
      });
    });

    // 3. Compute Overall Mastery Percentage & Rank
    const masteryPct = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    let rankTitle = 'Algorithmic Apprentice';
    let rankDescription = 'Initiating journey across the fundamental paradigms of statistical inference and model architectures.';

    if (masteryPct >= 90) {
      rankTitle = 'Grand Architect of Intelligence';
      rankDescription = 'Comprehensive high-precision mastery across supervised modeling, deep neural vision, self-attention, and optimal policy control.';
    } else if (masteryPct >= 75) {
      rankTitle = 'AI Systems Navigator';
      rankDescription = 'Robust practical proficiency across modern computer vision, embedding geometry, and reinforcement learning environments.';
    } else if (masteryPct >= 60) {
      rankTitle = 'Probabilistic Voyager';
      rankDescription = 'Solid grasp of core model training dynamics with opportunities to refine regularization and multi-agent control.';
    }

    // 4. Learning Profile Archetype Calculation
    const firstTryRate = completedZones > 0 ? Math.round((firstTryTotal / completedZones) * 100) : 0;
    const avgZoneTimeSec = completedZones > 0 ? Math.round(totalTimeSec / completedZones) : 0;
    const bossTrialResilience = bossTrialCount > 0 ? Math.round(bossTrialScoreSum / (bossTrialCount * 100) * 100) : 100;

    // Determine personality archetype
    let archetype: LearningProfile['archetype'] = 'Adaptive Pioneer';
    let tagline = 'Balanced exploration across perceptual and decision paradigms';
    let description = 'Exhibits steady iterative calibration with consistent recovery across both perception models and control environments.';

    const multiAttemptZones = allConcepts.filter((c) => c.attempts >= 2 && c.completed).length;

    if (firstTryRate >= 75 && avgZoneTimeSec <= 65) {
      archetype = 'Precision Sprinter';
      tagline = 'Rapid analytical intuition and high first-try convergence';
      description = 'Achieves near-instant parameter calibration on initial attempts, solving complex loss surfaces and architectural gates swiftly.';
    } else if (multiAttemptZones >= 2 && bossTrialResilience >= 90) {
      archetype = 'Resilient Debugger';
      tagline = 'Deep persistence through iterative parameter tuning and error diagnosis';
      description = 'Willing to test edge-case hypotheses and explore multiple calibrations, culminating in flawless high-stakes Boss Trial scores.';
    } else if (avgZoneTimeSec > 70) {
      archetype = 'Methodical Explorer';
      tagline = 'Exhaustive sandbox investigation and careful empirical evaluation';
      description = 'Takes deliberate time to inspect live weights, feature maps, and cosine embeddings thoroughly before committing to verification gates.';
    }

    const learningProfile: LearningProfile = {
      archetype,
      tagline,
      description,
      firstTryRate,
      avgZoneTimeSec,
      bossTrialResilience
    };

    // 5. Concept-Level Strengths & Weaknesses Classifier
    // Sort all concepts by a composite score:
    // Strongest: completed = true, attempts = 1, high score (>= 85), fast time
    const completedConcepts = allConcepts.filter((c) => c.completed);

    const strongestCandidates = [...completedConcepts].sort((a, b) => {
      // 1 attempt first
      if (a.attempts !== b.attempts) return a.attempts - b.attempts;
      // then higher score
      if (b.score !== a.score) return b.score - a.score;
      // then faster time
      return a.timeSpentSec - b.timeSpentSec;
    });

    const strongestConcepts = strongestCandidates.slice(0, 3);

    // Weakest Concepts / Blind Spots:
    // Criteria: completed or attempted, high attempts (>= 2) or lowest score
    const weaknessCandidates = [...allConcepts]
      .filter((c) => c.attempts > 0)
      .sort((a, b) => {
        // More attempts = weaker / more struggle
        if (b.attempts !== a.attempts) return b.attempts - a.attempts;
        // Lower score = weaker
        if (a.score !== b.score) return a.score - b.score;
        // Longer time spent
        return b.timeSpentSec - a.timeSpentSec;
      });

    // Pick top 3 distinct from strongest if possible
    const strongestKeySet = new Set(strongestConcepts.map((s) => s.zoneKey));
    let weakestConcepts = weaknessCandidates.filter((w) => !strongestKeySet.has(w.zoneKey)).slice(0, 3);
    if (weakestConcepts.length === 0 && weaknessCandidates.length > 0) {
      weakestConcepts = weaknessCandidates.slice(0, 3);
    }

    // Format total expedition time
    const mins = Math.floor(totalTimeSec / 60);
    const secs = totalTimeSec % 60;
    const timeFormatted = `${mins}m ${secs}s`;

    return {
      masteryPct,
      totalScore,
      maxPossibleScore,
      totalTimeSec,
      timeFormatted,
      completedZones,
      totalZones,
      completedIslands,
      totalIslands: domainBreakdowns.length,
      rankTitle,
      rankDescription,
      learningProfile,
      domainBreakdowns,
      strongestConcepts,
      weakestConcepts,
      allConceptsRanked: allConcepts,
      isDemoMode,
      hasIncompleteIslands: hasIncomplete
    };
  }, [telemetry, isDemoMode]);
}
