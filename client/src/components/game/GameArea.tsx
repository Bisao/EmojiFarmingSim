import React, { useState } from "react";
import { motion } from "framer-motion";
import GameGrid from "./GameGrid";
import { sellResource, sellCrop, seedMap } from "@/lib/gameLogic";
import GameLog from "./GameLog";
import MobileMenu from "./MobileMenu";
import { useMobile } from "@/hooks/use-mobile";
import { useGameState } from "@/hooks/use-game-state";

const GameArea: React.FC = () => {
  const { resources, selected, setSelected } = useGameState();
  const isMobile = useMobile();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [storageTab, setStorageTab] = useState<'resources' | 'crops' | 'seeds'>('resources');
  const isStoreOpen = selected?.type === 'store';

  const toggleMobileMenu = () => {
    setMobileMenuVisible(!mobileMenuVisible);
  };

  return (
    <div className="flex-1 flex flex-col gap-4 max-w-full overflow-hidden bg-amber-50/90 dark:bg-amber-900/30 backdrop-blur-sm rounded-2xl p-4 shadow-xl border-2 border-amber-300/80" style={{backgroundImage: 'linear-gradient(30deg, rgba(245,158,11,0.1) 12%, transparent 12.5%, transparent 87%, rgba(245,158,11,0.1) 87.5%, rgba(245,158,11,0.1)), linear-gradient(150deg, rgba(245,158,11,0.1) 12%, transparent 12.5%, transparent 87%, rgba(245,158,11,0.1) 87.5%, rgba(245,158,11,0.1)), linear-gradient(30deg, rgba(245,158,11,0.1) 12%, transparent 12.5%, transparent 87%, rgba(245,158,11,0.1) 87.5%, rgba(245,158,11,0.1)), linear-gradient(150deg, rgba(245,158,11,0.1) 12%, transparent 12.5%, transparent 87%, rgba(245,158,11,0.1) 87.5%, rgba(245,158,11,0.1))', backgroundSize: '80px 140px'}}>
      {/* Mobile resources bar (only visible on small screens) */}
      {isMobile && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg p-3 flex items-center justify-between gap-2 sticky top-0 z-50"
        >
          <div className="flex gap-3">
            <motion.div whileTap={{ scale: 0.95 }} className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-800/50 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-700">
              <span className="text-xl">🪙</span>
              <span className="font-semibold">{resources.coins}</span>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }} className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-800/50 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-700">
              <span className="text-xl">🪵</span>
              <span className="font-semibold">{resources.wood}</span>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }} className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-800/50 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-700">
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
              <div className="flex gap-2 p-2 bg-amber-100 rounded-xl">
                <button 
                  className={`btn-hexagon px-4 py-2 flex items-center gap-2 font-medium transition-colors ${
                    storageTab === 'resources' 
                    ? 'bg-amber-400 text-amber-900' 
                    : 'bg-amber-200 text-amber-700 hover:bg-amber-300'
                  }`}
                  onClick={() => setStorageTab('resources')}
                >
                  🐝 Recursos
                </button>
                <button 
                  className={`btn-hexagon px-4 py-2 flex items-center gap-2 font-medium transition-colors ${
                    storageTab === 'crops' 
                    ? 'bg-amber-400 text-amber-900' 
                    : 'bg-amber-200 text-amber-700 hover:bg-amber-300'
                  }`}
                  onClick={() => setStorageTab('crops')}
                >
                  🍯 Colheitas
                </button>
                <button 
                  className={`btn-hexagon px-4 py-2 flex items-center gap-2 font-medium transition-colors ${
                    storageTab === 'seeds' 
                    ? 'bg-amber-400 text-amber-900' 
                    : 'bg-amber-200 text-amber-700 hover:bg-amber-300'
                  }`}
                  onClick={() => setStorageTab('seeds')}
                >
                  🌼 Sementes
                </button>
              </div>

              {storageTab === 'resources' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="item-card">
                    <div className="item-info">
                      <span className="item-icon">🪵</span>
                      <span className="item-name">Madeira</span>
                    </div>
                    <div className="item-action">
                      <span className="text-sm font-medium">{resources.wood}</span>
                      {resources.wood >= 10 && (
                        <button 
                          onClick={() => sellResource('wood')}
                          className="px-2 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                        >
                          Vender 10
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="item-card">
                    <div className="item-info">
                      <span className="item-icon">🪨</span>
                      <span className="item-name">Pedra</span>
                    </div>
                    <div className="item-action">
                      <span className="text-sm font-medium">{resources.stone}</span>
                      {resources.stone >= 10 && (
                        <button 
                          onClick={() => sellResource('stone')}
                          className="px-2 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                        >
                          Vender 10
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {storageTab === 'crops' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(resources.crops).map(([crop, amount]) => (
                    <div key={crop} className="item-card">
                      <div className="item-info">
                        <span className="item-icon">{seedMap[crop].emoji}</span>
                        <span className="item-name">{crop}</span>
                      </div>
                      <div className="item-action">
                        <span className="text-sm font-medium">{amount}</span>
                        <button 
                          onClick={() => sellCrop(crop)}
                          className={`px-2 py-1 ${amount >= 10 ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'} text-white rounded-md text-sm`}
                          disabled={amount < 10}
                        >
                          Vender 10
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {storageTab === 'seeds' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(resources.seeds).map(([seed, amount]) => (
                    <div key={seed} className="item-card">
                      <div className="item-info">
                        <span className="item-icon">{seedMap[seed].emoji}</span>
                        <span className="item-name">{seed}</span>
                      </div>
                      <div className="item-action">
                        <span className="text-sm font-medium">{amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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