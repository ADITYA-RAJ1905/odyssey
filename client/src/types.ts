export interface Relic {
  id: string;
  name: string;
  desc: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  current_island: number;
  conquered_islands: number[];
  island_scores: {
    ml: number;
    dl: number;
    cv: number;
    nlp: number;
    rl: number;
    rag?: number;
  };
  total_score: number;
  streak: number;
  relics: Relic[];
  rank_title: string;
  home_unlocked: boolean;
}

export type IslandKey = 'ml' | 'dl' | 'cv' | 'nlp' | 'rl' | 'rag';
export type ViewType = 'landing' | 'map' | 'ml' | 'dl' | 'cv' | 'nlp' | 'rl' | 'rag' | 'home' | 'report';

export type IslandStatus = 'locked' | 'in_progress' | 'completed';

export interface ZoneTelemetry {
  completed: boolean;
  attempts: number;
  score: number; // 0–100
  timeSpentSec: number;
}

export interface MLZones {
  shoreline: ZoneTelemetry;
  ridge: ZoneTelemetry;
  swamp: ZoneTelemetry;
  lighthouse: ZoneTelemetry;
  [zoneId: string]: ZoneTelemetry;
}

export interface DLZones {
  perceptron_bay: ZoneTelemetry;
  conv_canyon: ZoneTelemetry;
  vision_observatory: ZoneTelemetry;
  neural_citadel: ZoneTelemetry;
  [zoneId: string]: ZoneTelemetry;
}

export interface CVZones {
  pixel_harbor: ZoneTelemetry;
  segmentation_reef: ZoneTelemetry;
  clip_lighthouse: ZoneTelemetry;
  vision_citadel: ZoneTelemetry;
  [zoneId: string]: ZoneTelemetry;
}

export interface NLPZones {
  token_port: ZoneTelemetry;
  embedding_lagoon: ZoneTelemetry;
  sentiment_gorge: ZoneTelemetry;
  transformer_citadel: ZoneTelemetry;
  [zoneId: string]: ZoneTelemetry;
}

export interface RLZones {
  bandit_cove: ZoneTelemetry;
  q_value_maze: ZoneTelemetry;
  cartpole_arena: ZoneTelemetry;
  policy_citadel: ZoneTelemetry;
  [zoneId: string]: ZoneTelemetry;
}

export interface GenericZones {
  [zoneId: string]: ZoneTelemetry;
}

export interface IslandTelemetry<Z = Record<string, ZoneTelemetry>> {
  status: IslandStatus;
  title: string;
  domain: string;
  zones: Z;
}

export interface PlayerTelemetry {
  currentIsland: number;
  islands: {
    machine_learning: IslandTelemetry<MLZones>;
    deep_learning: IslandTelemetry<DLZones>;
    computer_vision: IslandTelemetry<CVZones>;
    nlp: IslandTelemetry<NLPZones>;
    reinforcement_learning: IslandTelemetry<RLZones>;
    island_2?: IslandTelemetry<DLZones | GenericZones>;
    island_3?: IslandTelemetry<CVZones | GenericZones>;
    island_4?: IslandTelemetry<NLPZones | GenericZones>;
    island_5?: IslandTelemetry<RLZones | GenericZones>;
    island_6: IslandTelemetry<GenericZones>;
  };
}

export interface ScoreResult {
  points_awarded: number;
  base_points?: number;
  time_bonus?: number;
  streak_multiplier?: number;
  new_streak?: number;
  accuracy_pct?: number;
  error_pct?: number;
}

// ML Island
export interface MLLoanSample {
  id: string;
  difficulty: string;
  story: string;
  display_features: Record<string, string>;
  features: number[];
  explanation?: string;
}

export interface MLHouseSample {
  id: string;
  difficulty: string;
  title: string;
  display_features: Record<string, string>;
  features: number[];
  actual_price: number;
  acceptable_range: [number, number];
}

export interface MLAnomalySample {
  id: string;
  difficulty: string;
  story: string;
  transactions: Array<{
    id: string;
    merchant: string;
    amount: string;
    time: string;
    location: string;
    features: number[];
  }>;
  explanation: string;
}

export interface MLChallenge {
  challenge_type: 'loan' | 'house' | 'anomaly';
  sub_title: string;
  data: any;
}

// DL Island
export interface DLChallenge {
  challenge_id: string;
  id: string;
  difficulty: string;
  story: string;
  facial_cues: string;
  portrait_type: string;
  accent_color: string;
  expression_summary: string;
}

// CV Island
export interface CVElement {
  type: string;
  color: string;
  label?: string;
  box?: [number, number, number, number];
}

export interface CVChallenge {
  id: string;
  difficulty: string;
  title: string;
  description: string;
  scene_type: string;
  svg_elements: CVElement[];
  question: string;
  question_type: 'count' | 'boolean' | 'classification';
  options: string[];
  total_objects: number;
}

export interface CVObjectBox {
  label: string;
  box: [number, number, number, number];
  confidence: number;
  is_target: boolean;
}

// NLP Island
export interface NLPChallenge {
  id: string;
  category: 'sentiment' | 'emotion' | 'intent' | 'sarcasm';
  difficulty: string;
  title: string;
  text: string;
  options: string[];
}

// RL Island
export interface RLState {
  difficulty: string;
  map_name: string;
  grid_size: number;
  player_pos: [number, number];
  extraction_pos: [number, number];
  beacon_pos: [number, number];
  tiles: string[][];
  hazards: Array<{ pos: [number, number]; type: string; penalty: number }>;
  health: number;
  food: number;
  water: number;
  turn: number;
  max_turns: number;
  beacon_collected: boolean;
  status: 'ACTIVE' | 'WON' | 'DIED' | 'TIMEOUT';
  current_q_values: Record<string, number>;
  recommended_action: string;
  turns_history: Array<{
    turn: number;
    action: string;
    optimal_action: string;
    is_policy_match: boolean;
    q_difference: number;
    q_values: Record<string, number>;
    events: string[];
  }>;
  policy_matches: number;
  total_decisions: number;
}

// RAG Island
export interface RAGPreset {
  id: string;
  title: string;
  category: string;
  url: string;
  desc: string;
}

export interface RAGQuestion {
  id: string;
  type: string;
  question: string;
  options: string[];
  snippet: string;
  chunk_id: string;
}

export interface RAGIngestResult {
  status: string;
  url: string;
  title: string;
  doc_id: string;
  chunks_count: number;
  total_words: number;
  questions: RAGQuestion[];
  sample_chunks: string[];
}

export interface RAGEvalResult {
  is_correct: boolean;
  player_answer: string;
  correct_answer: string;
  similarity_score: number;
  retrieved_chunk_id: string;
  retrieved_chunk_text: string;
  snippet: string;
  explanation: string;
  source_url: string;
  score_result?: ScoreResult;
}

