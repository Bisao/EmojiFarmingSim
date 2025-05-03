import React, { useState } from "react";
import { motion } from "framer-motion";
import GameGrid from "./GameGrid";
import GameLog from "./GameLog";
import MobileMenu from "./MobileMenu";
import { useGameState } from "@/hooks/use-game-state";
import { useMobile } from "@/hooks/use-mobile";

const GameArea: React.FC = () => {
  const { resources, selected, setSelected } = useGameState();
  const isMobile = useMobile();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const isStoreOpen = selected?.type === 'store';
  const [storageTab, setStorageTab] = useState<'resources' | 'crops' | 'seeds'>('resources');

  const toggleMobileMenu = () => {
    setMobileMenuVisible(!mobileMenuVisible);
  };

  return (
    <div className="flex-1 flex flex-col gap-4 max-w-full overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-amber-200/50">
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
      {isMobile && mobileMenuVisible && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <MobileMenu onClose={() => setMobileMenuVisible(false)} />
        </div>
      )}

      {/* Game grid container */}
      <div className="relative">
        <GameGrid />

        {/* Storage panel will be shown when storage is selected */}
        {selected && !mobileMenuVisible && selected.type === 'storage' && (
          <div className="absolute inset-4 bg-[#FFF8E1]/95 dark:bg-gray-900/95 backdrop-blur rounded-xl shadow-xl z-20 p-4 overflow-auto border-2 border-amber-200/50">
            <button 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSelected(null)}
            >
              ✕
            </button>
            
            <div className="space-y-6">
              <div className="store-tabs">
                <button className="store-tab store-tab-active">🪵 Recursos</button>
                <button className="store-tab store-tab-inactive">🌾 Colheitas</button>
                <button className="store-tab store-tab-inactive">🌱 Sementes</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="item-card">
                  <div className="item-info">
                    <span className="item-icon">🪵</span>
                    <span className="item-name">Madeira</span>
                  </div>
                  <div className="item-action">
                    <span className="text-sm font-medium">{resources.wood}</span>
                  </div>
                </div>

                <div className="item-card">
                  <div className="item-info">
                    <span className="item-icon">🪨</span>
                    <span className="item-name">Pedra</span>
                  </div>
                  <div className="item-action">
                    <span className="text-sm font-medium">{resources.stone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Game log */}
      <GameLog />
    </div>
  );
};

export default GameArea;