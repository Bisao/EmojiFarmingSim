
import React from "react";
import GameHeader from "./GameHeader";
import GameArea from "./GameArea";
import { useMobile } from "@/hooks/use-mobile";
import { useGameState } from "@/hooks/use-game-state";

const MainGameContainer: React.FC = () => {
  const isMobile = useMobile();
  const { setSelected } = useGameState();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FFF8E1] to-[#FFE082] dark:from-[#4A148C] dark:to-[#311B92]">
      {/* Top bar with game name and player info */}
      <div className="bg-[#FFA726] text-white p-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3 relative">
          <span className="text-3xl flower-animation">🌻</span>
          <h1 className="text-xl font-bold font-display z-10">Emoji Farming</h1>
          <span className="text-3xl bee-fly-animation absolute">🐝</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#FB8C00]/50 px-3 py-1.5 rounded-lg">
            <span className="text-xl">🪙</span>
            <span className="font-medium">100,250</span>
          </div>
        </div>
      </div>
      
      <main className="flex-1 p-4 overflow-hidden container mx-auto max-w-7xl">
        <GameArea />
        
        {/* Store button fixed in bottom right with honey theme */}
        <button 
          onClick={() => setSelected({ type: 'store', key: null })}
          className="fixed bottom-6 right-6 w-16 h-16 bg-[#FFA726] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#FB8C00] transition-colors z-50 border-4 border-[#FFE082]"
          aria-label="Open store"
        >
          <span className="text-3xl">🛍️</span>
        </button>
      </main>
    </div>
  );
};

export default MainGameContainer;
