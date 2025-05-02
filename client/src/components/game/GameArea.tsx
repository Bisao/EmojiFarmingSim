import React, { useState } from "react";
import { motion } from "framer-motion";
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
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg p-3 flex items-center justify-between gap-2 sticky top-0 z-50"
        >
          <div className="flex gap-3">
            <motion.div whileTap={{ scale: 0.95 }} className="flex items-center gap-1.5 bg-muted/30 px-3 py-1.5 rounded-lg">
              <span className="text-xl">🪙</span>
              <span className="font-semibold">{resources.coins}</span>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }} className="flex items-center gap-1.5 bg-muted/30 px-3 py-1.5 rounded-lg">
              <span className="text-xl">🪵</span>
              <span className="font-semibold">{resources.wood}</span>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }} className="flex items-center gap-1.5 bg-muted/30 px-3 py-1.5 rounded-lg">
              <span className="text-xl">🪨</span>
              <span className="font-semibold">{resources.stone}</span>
            </motion.div>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="bg-primary/10 hover:bg-primary/20 active:bg-primary/30 p-2 rounded-lg transition-colors" 
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </motion.button>
        </motion.div>
      )}
      
      {/* Mobile navigation menu */}
      {isMobile && mobileMenuVisible && <MobileMenu onClose={() => setMobileMenuVisible(false)} />}
      
      {/* Game grid container */}
      <GameGrid />
      
      {/* Game log */}
      <GameLog />
    </div>
  );
};

export default GameArea;
