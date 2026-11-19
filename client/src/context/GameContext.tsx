import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlayerProfile, PlayerTelemetry, ViewType } from '../types';
import { sounds } from '../utils/audio';
import { loadTelemetry, saveTelemetry, DEFAULT_TELEMETRY, MOCK_DEMO_TELEMETRY } from '../utils/telemetryDefaults';

interface GameContextType {
  profile: PlayerProfile | null;
  currentView: ViewType;
  loading: boolean;
  soundEnabled: boolean;
  telemetry: PlayerTelemetry;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  toggleAudio: () => void;
  navigateTo: (view: ViewType) => void;
  refreshProfile: () => Promise<void>;
  conquerIsland: (islandNum: number) => Promise<void>;
  resetGame: () => Promise<void>;
  recordZoneAttempt: (
    islandId: keyof PlayerTelemetry['islands'],
    zoneKey: string,
    score: number,
    timeSpentSec: number
  ) => void;
  completeZone: (
    islandId: keyof PlayerTelemetry['islands'],
    zoneKey: string,
    score: number,
    timeSpentSec: number
  ) => void;
  completeIsland: (islandId: keyof PlayerTelemetry['islands']) => void;
  resetTelemetry: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(sounds.isEnabled());
  const [telemetry, setTelemetry] = useState<PlayerTelemetry>(() => loadTelemetry());
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const refreshProfile = async () => {
    try {
      const res = await fetch('/api/game/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error('Failed to load player profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  // Sync telemetry changes to localStorage
  useEffect(() => {
    saveTelemetry(telemetry);
  }, [telemetry]);

  const navigateTo = (view: ViewType) => {
    sounds.playClick();
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleAudio = () => {
    const nextState = sounds.toggle();
    setSoundEnabled(nextState);
  };

  const toggleDemoMode = () => {
    sounds.playClick();
    setIsDemoMode((prev) => !prev);
  };

  const recordZoneAttempt = (
    islandId: keyof PlayerTelemetry['islands'],
    zoneKey: string,
    score: number,
    timeSpentSec: number
  ) => {
    setTelemetry((prev) => {
      const targetIsland = prev.islands[islandId];
      if (!targetIsland) return prev;
      const currentZone = (targetIsland.zones as any)[zoneKey] || {
        completed: false,
        attempts: 0,
        score: 0,
        timeSpentSec: 0
      };

      const updatedZone = {
        ...currentZone,
        attempts: currentZone.attempts + 1,
        score: Math.max(currentZone.score, score),
        timeSpentSec: currentZone.timeSpentSec + timeSpentSec
      };

      const updated = {
        ...prev,
        islands: {
          ...prev.islands,
          [islandId]: {
            ...targetIsland,
            status: targetIsland.status === 'locked' ? 'in_progress' : targetIsland.status,
            zones: {
              ...targetIsland.zones,
              [zoneKey]: updatedZone
            }
          }
        }
      };
      return updated;
    });
  };

  const completeZone = (
    islandId: keyof PlayerTelemetry['islands'],
    zoneKey: string,
    score: number,
    timeSpentSec: number
  ) => {
    setTelemetry((prev) => {
      const targetIsland = prev.islands[islandId];
      if (!targetIsland) return prev;
      const currentZone = (targetIsland.zones as any)[zoneKey] || {
        completed: false,
        attempts: 0,
        score: 0,
        timeSpentSec: 0
      };

      const updatedZone = {
        ...currentZone,
        completed: true,
        attempts: currentZone.attempts + 1,
        score: Math.max(currentZone.score, score),
        timeSpentSec: currentZone.timeSpentSec + timeSpentSec
      };

      const updated = {
        ...prev,
        islands: {
          ...prev.islands,
          [islandId]: {
            ...targetIsland,
            status: targetIsland.status === 'locked' ? 'in_progress' : targetIsland.status,
            zones: {
              ...targetIsland.zones,
              [zoneKey]: updatedZone
            }
          }
        }
      };
      return updated;
    });
  };

  const completeIsland = (islandId: keyof PlayerTelemetry['islands']) => {
    setTelemetry((prev) => {
      const islandKeys: (keyof PlayerTelemetry['islands'])[] = [
        'machine_learning',
        'deep_learning',
        'computer_vision',
        'nlp',
        'reinforcement_learning',
        'island_6'
      ];
      // Normalize aliases
      const normalizedIslandId = (
        islandId === 'island_2' ? 'deep_learning' :
        islandId === 'island_3' ? 'computer_vision' :
        islandId === 'island_4' ? 'nlp' :
        islandId === 'island_5' ? 'reinforcement_learning' :
        islandId
      ) as keyof PlayerTelemetry['islands'];
      const currentIndex = islandKeys.indexOf(normalizedIslandId);
      const nextIslandId = currentIndex !== -1 && currentIndex < islandKeys.length - 1 ? islandKeys[currentIndex + 1] : null;

      const updatedIslands = { ...prev.islands };
      if (updatedIslands[normalizedIslandId]) {
        updatedIslands[normalizedIslandId] = {
          ...updatedIslands[normalizedIslandId],
          status: 'completed'
        } as any;
      }
      if (normalizedIslandId === 'deep_learning' && updatedIslands.island_2) {
        updatedIslands.island_2 = {
          ...updatedIslands.island_2,
          status: 'completed'
        } as any;
      }
      if (normalizedIslandId === 'computer_vision' && updatedIslands.island_3) {
        updatedIslands.island_3 = {
          ...updatedIslands.island_3,
          status: 'completed'
        } as any;
      }
      if (normalizedIslandId === 'nlp' && updatedIslands.island_4) {
        updatedIslands.island_4 = {
          ...updatedIslands.island_4,
          status: 'completed'
        } as any;
      }
      if (normalizedIslandId === 'reinforcement_learning' && updatedIslands.island_5) {
        updatedIslands.island_5 = {
          ...updatedIslands.island_5,
          status: 'completed'
        } as any;
      }

      if (nextIslandId && updatedIslands[nextIslandId] && updatedIslands[nextIslandId].status === 'locked') {
        updatedIslands[nextIslandId] = {
          ...updatedIslands[nextIslandId],
          status: 'in_progress'
        } as any;
      }

      return {
        ...prev,
        currentIsland: Math.min(6, (currentIndex !== -1 ? currentIndex + 2 : prev.currentIsland)),
        islands: updatedIslands
      };
    });
  };

  const resetTelemetry = () => {
    setTelemetry(DEFAULT_TELEMETRY);
    saveTelemetry(DEFAULT_TELEMETRY);
  };

  const conquerIsland = async (islandNum: number) => {
    try {
      const res = await fetch('/api/game/conquer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ island_num: islandNum })
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        sounds.playRelic();

        // Also update telemetry island status
        if (islandNum === 1) completeIsland('machine_learning');
        else if (islandNum === 2) completeIsland('island_2');
        else if (islandNum === 3) completeIsland('island_3');
        else if (islandNum === 4) completeIsland('nlp');
        else if (islandNum === 5) completeIsland('reinforcement_learning');
        else if (islandNum === 6) completeIsland('island_6');
      }
    } catch (err) {
      console.error('Error conquering island:', err);
    }
  };

  const resetGame = async () => {
    try {
      sounds.playClick();
      resetTelemetry();
      const res = await fetch('/api/game/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: 'default' })
      });
      if (res.ok) {
        const resetProf = await res.json();
        setProfile(resetProf);
        setCurrentView('landing');
      }
    } catch (err) {
      console.error('Error resetting game:', err);
    }
  };

  return (
    <GameContext.Provider
      value={{
        profile,
        currentView,
        loading,
        soundEnabled,
        telemetry,
        isDemoMode,
        toggleDemoMode,
        toggleAudio,
        navigateTo,
        refreshProfile,
        conquerIsland,
        resetGame,
        recordZoneAttempt,
        completeZone,
        completeIsland,
        resetTelemetry
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
};

