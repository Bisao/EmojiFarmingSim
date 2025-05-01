import React from "react";
import { useGameState } from "@/hooks/use-game-state";

const MobileMenu: React.FC = () => {
  const { setActivePanel } = useGameState();

  const handlePanelSelect = (panel: string) => {
    setActivePanel(panel);
  };

  return (
    <div className="md:hidden bg-card rounded-xl shadow-md p-3 flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        <button 
          className="p-2 bg-muted rounded-lg flex flex-col items-center transition-colors hover:bg-primary hover:text-white"
          onClick={() => handlePanelSelect('structures')}
        >
          <span className="text-xl">🏡</span>
          <span className="text-xs">Estruturas</span>
        </button>
        <button 
          className="p-2 bg-muted rounded-lg flex flex-col items-center transition-colors hover:bg-primary hover:text-white"
          onClick={() => handlePanelSelect('fields')}
        >
          <span className="text-xl">🌱</span>
          <span className="text-xs">Campos</span>
        </button>
        <button 
          className="p-2 bg-muted rounded-lg flex flex-col items-center transition-colors hover:bg-primary hover:text-white"
          onClick={() => handlePanelSelect('seeds')}
        >
          <span className="text-xl">🌾</span>
          <span className="text-xs">Sementes</span>
        </button>
        <button 
          className="p-2 bg-muted rounded-lg flex flex-col items-center transition-colors hover:bg-primary hover:text-white"
          onClick={() => handlePanelSelect('storage')}
        >
          <span className="text-xl">🏦</span>
          <span className="text-xs">Armazém</span>
        </button>
        <button 
          className="p-2 bg-muted rounded-lg flex flex-col items-center transition-colors hover:bg-primary hover:text-white"
          onClick={() => handlePanelSelect('status')}
        >
          <span className="text-xl">📊</span>
          <span className="text-xs">Status</span>
        </button>
        <button 
          className="p-2 bg-muted rounded-lg flex flex-col items-center transition-colors hover:bg-primary hover:text-white"
          onClick={() => handlePanelSelect('options')}
        >
          <span className="text-xl">⚙️</span>
          <span className="text-xs">Opções</span>
        </button>
      </div>
    </div>
  );
};

export default MobileMenu;
