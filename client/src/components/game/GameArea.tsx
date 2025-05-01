import React, { useState } from "react";
import GameGrid from "./GameGrid";
import GameLog from "./GameLog";
import MobileMenu from "./MobileMenu";
import { useGameState } from "@/hooks/use-game-state";
import { useMobile } from "@/hooks/use-mobile";

const GameArea: React.FC = () => {
  const { resources } = useGameState();
  const isMobile = useMobile();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuVisible(!mobileMenuVisible);
  };

  return (
    <div className="flex-1 flex flex-col gap-4 max-w-full overflow-hidden">
      {/* Mobile resources bar (only visible on small screens) */}
      {isMobile && (
        <div className="bg-card rounded-xl shadow-md p-2 flex justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xl">🪙</span>
            <span className="font-semibold">{resources.coins}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xl">🪵</span>
            <span className="font-semibold">{resources.wood}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xl">🪨</span>
            <span className="font-semibold">{resources.stone}</span>
          </div>
          <button 
            className="text-primary hover:text-primary-dark" 
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      )}
      
      {/* Mobile navigation menu */}
      {isMobile && mobileMenuVisible && <MobileMenu />}
      
      {/* Game grid container */}
      <GameGrid />
      
      {/* Game log */}
      <GameLog />
    </div>
  );
};

export default GameArea;
