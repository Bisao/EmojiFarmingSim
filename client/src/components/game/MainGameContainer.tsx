
import React from "react";
import GameHeader from "./GameHeader";
import GameArea from "./GameArea";
import { useMobile } from "@/hooks/use-mobile";
import { useGameState } from "@/hooks/use-game-state";
import MobileMenu from "./MobileMenu";

const MainGameContainer: React.FC = () => {
  const isMobile = useMobile();
  const { setSelected } = useGameState();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FFF8E1] to-[#FFE082] dark:from-[#4A148C] dark:to-[#311B92]">
      {/* Top bar with game name and player info */}
      <div className="bg-[#FFA726] text-white px-7 h-[56px] shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3 relative">
          <span className="text-3xl flower-animation">🌻</span>
          <h1 className="text-xl font-bold font-display z-10">Emoji Farming</h1>
          <span className="text-3xl bee-fly-animation absolute">🐝</span>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-[#FB8C00]/50 rounded-lg transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <span className="text-2xl">{mobileMenuOpen ? "✕" : "≡"}</span>
          </button>
        </div>
      </div>
      
      <main className="flex-1 p-4 overflow-hidden container mx-auto max-w-7xl relative">
        {mobileMenuOpen && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <MobileMenu onClose={() => setMobileMenuOpen(false)} />
          </div>
        )}
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
