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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <MobileMenu onClose={() => setMobileMenuVisible(false)} />
        </div>
      )}

      {/* Game grid container */}
      <div className="relative">
        <GameGrid />

        {/* Central panels */}
        {selected && selected.type !== 'store' && (
          <div className="absolute inset-4 bg-[#FFF8E1]/95 dark:bg-gray-900/95 backdrop-blur rounded-xl shadow-xl z-20 p-4 overflow-auto border-2 border-amber-200/50">
            <button 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSelected(null)}
            >
              ✕
            </button>
            {selected.type === 'storage' && (
              <div className="h-full">
                <h2 className="text-xl font-bold mb-4">Armazém</h2>
                <div className="flex border-b mb-2">
                  <button 
                    className={`px-2 py-1 font-medium text-sm border-b-2 ${storageTab === 'resources' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
                    onClick={() => setStorageTab('resources')}
                  >
                    Recursos
                  </button>
                  <button 
                    className={`px-2 py-1 font-medium text-sm border-b-2 ${storageTab === 'crops' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
                    onClick={() => setStorageTab('crops')}
                  >
                    Colheitas
                  </button>
                  <button 
                    className={`px-2 py-1 font-medium text-sm border-b-2 ${storageTab === 'seeds' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
                    onClick={() => setStorageTab('seeds')}
                  >
                    Sementes
                  </button>
                </div>
                {storageTab === 'resources' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🪵</span>
                        <span className="text-sm font-medium">{resources.wood}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">5🪙</span>
                        <button className="bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                          🛒
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🪨</span>
                        <span className="text-sm font-medium">{resources.stone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">8🪙</span>
                        <button className="bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                          🛒
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {storageTab === 'crops' && (
                  <div className="space-y-2">
                    {[
                      { type: 'wheat', emoji: '🌾' },
                      { type: 'corn', emoji: '🌾' },
                      { type: 'carrot', emoji: '🥕' },
                      { type: 'potato', emoji: '🥔' },
                      { type: 'tomato', emoji: '🍅' }
                    ].map(({ type, emoji }) => (
                      <div key={type} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{emoji}</span>
                          <span className="text-sm font-medium">{resources.crops[type] || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">10🪙</span>
                          <button className="bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                            🛒
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {storageTab === 'seeds' && (
                  <div className="space-y-2">
                    {[
                      { type: 'wheat', emoji: '🌾' },
                      { type: 'corn', emoji: '🌾' },
                      { type: 'carrot', emoji: '🥕' },
                      { type: 'potato', emoji: '🥔' },
                      { type: 'tomato', emoji: '🍅' }
                    ].map(({ type, emoji }) => (
                      <div key={type} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{emoji}</span>
                          <span className="text-sm font-medium">{resources.seeds[type] || 0}</span>
                        </div>
                        <div className="text-xs text-gray-500 px-2">
                          {(resources.seeds[type] || 0) > 0 ? 'Disponível' : 'Esgotado'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {selected.type === 'resources' && (
              <div className="h-full">
                <h2 className="text-xl font-bold mb-4">Recursos</h2>
                {/* Resources content */}
              </div>
            )}
            {selected.type === 'status' && (
              <div className="h-full">
                <h2 className="text-xl font-bold mb-4">Status</h2>
                {/* Status content */}
              </div>
            )}
            {selected.type === 'options' && (
              <div className="h-full">
                <h2 className="text-xl font-bold mb-4">Opções</h2>
                {/* Options content */}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Game log */}
      <GameLog />
    </div>
  );
};

export default GameArea;