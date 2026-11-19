import { PlayerTelemetry } from '../types';

export const TELEMETRY_STORAGE_KEY = 'odyssey_player_telemetry';

export const DEFAULT_TELEMETRY: PlayerTelemetry = {
  currentIsland: 1,
  islands: {
    machine_learning: {
      status: 'in_progress',
      title: 'The Predictor',
      domain: 'Machine Learning',
      zones: {
        shoreline: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        ridge: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        swamp: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        lighthouse: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }
      }
    },
    deep_learning: {
      status: 'in_progress',
      title: 'The Mirror',
      domain: 'Deep Learning',
      zones: {
        perceptron_bay: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        conv_canyon: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        vision_observatory: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        neural_citadel: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }
      }
    },
    island_2: {
      status: 'in_progress',
      title: 'The Mirror',
      domain: 'Deep Learning',
      zones: {
        perceptron_bay: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        conv_canyon: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        vision_observatory: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        neural_citadel: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }
      }
    },
    computer_vision: {
      status: 'in_progress',
      title: 'The Observer',
      domain: 'Computer Vision',
      zones: {
        pixel_harbor: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        segmentation_reef: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        clip_lighthouse: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        vision_citadel: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }
      }
    },
    nlp: {
      status: 'in_progress',
      title: 'The Voices',
      domain: 'Natural Language Processing',
      zones: {
        token_port: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        embedding_lagoon: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        sentiment_gorge: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        transformer_citadel: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }
      }
    },
    reinforcement_learning: {
      status: 'in_progress',
      title: 'The Decision',
      domain: 'Reinforcement Learning',
      zones: {
        bandit_cove: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        q_value_maze: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        cartpole_arena: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        policy_citadel: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }
      }
    },
    island_3: {
      status: 'in_progress',
      title: 'The Observer',
      domain: 'Computer Vision',
      zones: {
        pixel_harbor: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        segmentation_reef: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        clip_lighthouse: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        vision_citadel: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }
      }
    },
    island_4: {
      status: 'in_progress',
      title: 'The Voices',
      domain: 'Natural Language Processing',
      zones: {
        token_port: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        embedding_lagoon: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        sentiment_gorge: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        transformer_citadel: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }
      }
    },
    island_5: {
      status: 'in_progress',
      title: 'The Decision',
      domain: 'Reinforcement Learning',
      zones: {
        bandit_cove: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        q_value_maze: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        cartpole_arena: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        policy_citadel: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }
      }
    },
    island_6: {
      status: 'in_progress',
      title: 'The Archive',
      domain: 'RAG & Vector Retrieval',
      zones: {
        url_chunking: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 },
        faiss_grounding: { completed: false, attempts: 0, score: 0, timeSpentSec: 0 }
      }
    }
  }
};

export const MOCK_DEMO_TELEMETRY: PlayerTelemetry = {
  currentIsland: 6,
  islands: {
    machine_learning: {
      status: 'completed',
      title: 'The Predictor',
      domain: 'Machine Learning',
      zones: {
        shoreline: { completed: true, attempts: 1, score: 95, timeSpentSec: 42 },
        ridge: { completed: true, attempts: 1, score: 92, timeSpentSec: 68 },
        swamp: { completed: true, attempts: 3, score: 72, timeSpentSec: 115 },
        lighthouse: { completed: true, attempts: 1, score: 100, timeSpentSec: 54 }
      }
    },
    deep_learning: {
      status: 'completed',
      title: 'The Mirror',
      domain: 'Deep Learning',
      zones: {
        perceptron_bay: { completed: true, attempts: 1, score: 95, timeSpentSec: 45 },
        conv_canyon: { completed: true, attempts: 1, score: 90, timeSpentSec: 62 },
        vision_observatory: { completed: true, attempts: 2, score: 88, timeSpentSec: 95 },
        neural_citadel: { completed: true, attempts: 1, score: 100, timeSpentSec: 50 }
      }
    },
    computer_vision: {
      status: 'completed',
      title: 'The Observer',
      domain: 'Computer Vision',
      zones: {
        pixel_harbor: { completed: true, attempts: 1, score: 94, timeSpentSec: 42 },
        segmentation_reef: { completed: true, attempts: 2, score: 88, timeSpentSec: 65 },
        clip_lighthouse: { completed: true, attempts: 1, score: 92, timeSpentSec: 58 },
        vision_citadel: { completed: true, attempts: 1, score: 100, timeSpentSec: 48 }
      }
    },
    island_2: {
      status: 'completed',
      title: 'The Mirror',
      domain: 'Deep Learning',
      zones: {
        perceptron_bay: { completed: true, attempts: 1, score: 95, timeSpentSec: 45 },
        conv_canyon: { completed: true, attempts: 1, score: 90, timeSpentSec: 62 },
        vision_observatory: { completed: true, attempts: 2, score: 88, timeSpentSec: 95 },
        neural_citadel: { completed: true, attempts: 1, score: 100, timeSpentSec: 50 }
      }
    },
    island_3: {
      status: 'completed',
      title: 'The Observer',
      domain: 'Computer Vision',
      zones: {
        pixel_harbor: { completed: true, attempts: 1, score: 94, timeSpentSec: 42 },
        segmentation_reef: { completed: true, attempts: 2, score: 88, timeSpentSec: 65 },
        clip_lighthouse: { completed: true, attempts: 1, score: 92, timeSpentSec: 58 },
        vision_citadel: { completed: true, attempts: 1, score: 100, timeSpentSec: 48 }
      }
    },
    nlp: {
      status: 'completed',
      title: 'The Voices',
      domain: 'Natural Language Processing',
      zones: {
        token_port: { completed: true, attempts: 1, score: 96, timeSpentSec: 38 },
        embedding_lagoon: { completed: true, attempts: 1, score: 92, timeSpentSec: 54 },
        sentiment_gorge: { completed: true, attempts: 2, score: 88, timeSpentSec: 72 },
        transformer_citadel: { completed: true, attempts: 1, score: 100, timeSpentSec: 46 }
      }
    },
    island_4: {
      status: 'completed',
      title: 'The Voices',
      domain: 'Natural Language Processing',
      zones: {
        token_port: { completed: true, attempts: 1, score: 96, timeSpentSec: 38 },
        embedding_lagoon: { completed: true, attempts: 1, score: 92, timeSpentSec: 54 },
        sentiment_gorge: { completed: true, attempts: 2, score: 88, timeSpentSec: 72 },
        transformer_citadel: { completed: true, attempts: 1, score: 100, timeSpentSec: 46 }
      }
    },
    reinforcement_learning: {
      status: 'completed',
      title: 'The Decision',
      domain: 'Reinforcement Learning',
      zones: {
        bandit_cove: { completed: true, attempts: 1, score: 95, timeSpentSec: 42 },
        q_value_maze: { completed: true, attempts: 1, score: 92, timeSpentSec: 64 },
        cartpole_arena: { completed: true, attempts: 2, score: 94, timeSpentSec: 88 },
        policy_citadel: { completed: true, attempts: 1, score: 100, timeSpentSec: 46 }
      }
    },
    island_5: {
      status: 'completed',
      title: 'The Decision',
      domain: 'Reinforcement Learning',
      zones: {
        bandit_cove: { completed: true, attempts: 1, score: 95, timeSpentSec: 42 },
        q_value_maze: { completed: true, attempts: 1, score: 92, timeSpentSec: 64 },
        cartpole_arena: { completed: true, attempts: 2, score: 94, timeSpentSec: 88 },
        policy_citadel: { completed: true, attempts: 1, score: 100, timeSpentSec: 46 }
      }
    },
    island_6: {
      status: 'completed',
      title: 'The Archive',
      domain: 'RAG & Vector Retrieval',
      zones: {
        url_chunking: { completed: true, attempts: 1, score: 100, timeSpentSec: 45 },
        faiss_grounding: { completed: true, attempts: 1, score: 96, timeSpentSec: 62 }
      }
    }
  }
};

export function loadTelemetry(): PlayerTelemetry {
  try {
    const raw = localStorage.getItem(TELEMETRY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);

      const loaded: PlayerTelemetry = {
        ...DEFAULT_TELEMETRY,
        ...parsed,
        islands: {
          ...DEFAULT_TELEMETRY.islands,
          ...(parsed.islands || {}),
          machine_learning: {
            ...DEFAULT_TELEMETRY.islands.machine_learning,
            ...(parsed.islands?.machine_learning || {}),
            zones: {
              ...DEFAULT_TELEMETRY.islands.machine_learning.zones,
              ...(parsed.islands?.machine_learning?.zones || {})
            }
          },
          deep_learning: {
            ...DEFAULT_TELEMETRY.islands.deep_learning,
            ...(parsed.islands?.deep_learning || parsed.islands?.island_2 || {}),
            zones: {
              ...DEFAULT_TELEMETRY.islands.deep_learning.zones,
              ...(parsed.islands?.deep_learning?.zones || parsed.islands?.island_2?.zones || {})
            }
          },
          computer_vision: {
            ...DEFAULT_TELEMETRY.islands.computer_vision,
            ...(parsed.islands?.computer_vision || parsed.islands?.island_3 || {}),
            zones: {
              ...DEFAULT_TELEMETRY.islands.computer_vision.zones,
              ...(parsed.islands?.computer_vision?.zones || parsed.islands?.island_3?.zones || {})
            }
          },
          nlp: {
            ...DEFAULT_TELEMETRY.islands.nlp,
            ...(parsed.islands?.nlp || parsed.islands?.island_4 || {}),
            zones: {
              ...DEFAULT_TELEMETRY.islands.nlp.zones,
              ...(parsed.islands?.nlp?.zones || parsed.islands?.island_4?.zones || {})
            }
          },
          reinforcement_learning: {
            ...DEFAULT_TELEMETRY.islands.reinforcement_learning,
            ...(parsed.islands?.reinforcement_learning || parsed.islands?.island_5 || {}),
            zones: {
              ...DEFAULT_TELEMETRY.islands.reinforcement_learning.zones,
              ...(parsed.islands?.reinforcement_learning?.zones || parsed.islands?.island_5?.zones || {})
            }
          }
        }
      };

      // Ensure all islands are unlocked (open accessibility across all islands)
      Object.keys(loaded.islands).forEach((key) => {
        const island = (loaded.islands as any)[key];
        if (island && island.status === 'locked') {
          island.status = 'in_progress';
        }
      });

      return loaded;
    }
  } catch (e) {
    console.warn('Failed to load telemetry from localStorage:', e);
  }
  return DEFAULT_TELEMETRY;
}

export function saveTelemetry(telemetry: PlayerTelemetry): void {
  try {
    localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(telemetry));
  } catch (e) {
    console.warn('Failed to save telemetry to localStorage:', e);
  }
}
