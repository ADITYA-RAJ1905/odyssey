import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { OceanBackground } from './components/OceanBackground';
import { Navbar } from './components/Navbar';
import { LandingView } from './views/LandingView';
import { WorldMapView } from './views/WorldMapView';
import { MLIslandView } from './views/MLIslandView';
import { DLIslandView } from './views/DLIslandView';
import { CVIslandView } from './views/CVIslandView';
import { NLPIslandView } from './views/NLPIslandView';
import { RLIslandView } from './views/RLIslandView';
import { RAGIslandView } from './views/RAGIslandView';
import { HomeIslandView } from './views/HomeIslandView';
import { FinalReportView } from './views/FinalReportView';

const MainViewRouter: React.FC = () => {
  const { currentView } = useGame();

  switch (currentView) {
    case 'landing':
      return <LandingView />;
    case 'map':
      return <WorldMapView />;
    case 'ml':
      return <MLIslandView />;
    case 'dl':
      return <DLIslandView />;
    case 'cv':
      return <CVIslandView />;
    case 'nlp':
      return <NLPIslandView />;
    case 'rl':
      return <RLIslandView />;
    case 'rag':
      return <RAGIslandView />;
    case 'home':
    case 'report':
      return <FinalReportView />;
    default:
      return <LandingView />;
  }
};

export const App: React.FC = () => {
  return (
    <GameProvider>
      <div className="relative min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans">
        <OceanBackground />
        <Navbar />
        <main className="relative z-10 flex-1 flex flex-col">
          <MainViewRouter />
        </main>
      </div>
    </GameProvider>
  );
};

export default App;

