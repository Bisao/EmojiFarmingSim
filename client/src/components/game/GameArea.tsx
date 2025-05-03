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
    <div className="flex-1 flex flex-col gap-4 max-w-full overflow-hidden bg-amber-50/90 dark:bg-amber-900/30 backdrop-blur-sm rounded-2xl p-4 shadow-xl border-2 border-amber-300/80" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zm20.97 0l9.315 9.314-1.414 1.414L34.828 0h2.83zM22.344 0L13.03 9.314l1.414 1.414L25.172 0h-2.83zM32 0l12.142 12.142-1.414 1.414L30 .828 17.272 13.556l-1.414-1.414L28 0h4zM.284 0l28 28-1.414 1.414L0 2.544V0h.284zM0 5.373l25.456 25.455-1.414 1.415L0 8.2V5.374zm0 5.656l22.627 22.627-1.414 1.414L0 13.86v-2.83zm0 5.656l19.8 19.8-1.415 1.413L0 19.514v-2.83zm0 5.657l16.97 16.97-1.414 1.415L0 25.172v-2.83zM0 28l14.142 14.142-1.414 1.414L0 30.828V28zm0 5.657L11.314 44.97 9.9 46.386l-9.9-9.9v-2.828zm0 5.657L8.485 47.8 7.07 49.212 0 42.143v-2.83zm0 5.657l5.657 5.657-1.414 1.415L0 47.8v-2.83zm0 5.657l2.828 2.83-1.414 1.413L0 53.456v-2.83zM54.627 60L30 35.373 5.373 60H8.2L30 38.2 51.8 60h2.827zm-5.656 0L30 41.03 11.03 60h2.828L30 43.858 46.142 60h2.83zm-5.656 0L30 46.686 16.686 60h2.83L30 49.515 40.485 60h2.83zm-5.657 0L30 52.343 22.344 60h2.83L30 55.172 34.828 60h2.83zM32 60l-2-2-2 2h4zM59.716 0l-28 28 1.414 1.414L60 2.544V0h-.284zM60 5.373L34.544 30.828l1.414 1.415L60 8.2V5.374zm0 5.656L37.373 33.656l1.414 1.414L60 13.86v-2.83zm0 5.656l-19.8 19.8 1.415 1.413L60 19.514v-2.83zm0 5.657l-16.97 16.97 1.414 1.415L60 25.172v-2.83zM60 28L45.858 42.142l1.414 1.414L60 30.828V28zm0 5.657L48.686 44.97l1.415 1.415 9.9-9.9v-2.828zm0 5.657L51.515 47.8l1.414 1.412 7.07-7.069v-2.83zm0 5.657l-5.657 5.657 1.414 1.415L60 47.8v-2.83zm0 5.657l-2.828 2.83 1.414 1.413L60 53.456v-2.83zM39.9 16.385l1.414-1.414L30 3.658 18.686 14.97l1.415 1.415 9.9-9.9 9.9 9.9zm-2.83 2.828l1.415-1.414L30 9.313 21.515 17.8l1.414 1.413L30 11.8l7.07 7.414v-.002zm-2.827 2.83l1.414-1.416L30 14.97l-5.657 5.657 1.414 1.415L30 17.8l4.243 4.242zm-2.83 2.827l1.415-1.414L30 20.626l-2.828 2.83 1.414 1.414L30 23.456l1.414 1.414zM56.87 59.414L58.284 58 30 29.716 1.716 58l1.414 1.414L30 32.544l26.87 26.87z' fill='%23fbbf24' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`
    }}>
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