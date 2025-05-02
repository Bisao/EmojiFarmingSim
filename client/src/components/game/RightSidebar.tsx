import React, { useState } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { sellResource, sellCrop } from "@/lib/gameLogic";
import { SeedType } from "@/lib/gameTypes";

const RightSidebar: React.FC = () => {
  const { 
    resources, 
    addLogMessage,
    gridTiles 
  } = useGameState();

  const [storageTab, setStorageTab] = useState<'resources' | 'crops' | 'seeds' | 'store'>('resources');

  const handleBuyResource = (type: 'wood' | 'stone' | 'nails', cost: number) => {
    const storage = gridTiles.find(tile => tile.structure === 'storage');
    if (!storage) {
      addLogMessage("Você precisa construir um armazém primeiro!", "⚠️");
      return;
    }

    if (resources.coins < cost) {
      addLogMessage("Moedas insuficientes!", "❌");
      return;
    }

    const amounts = {
      wood: { amount: 10, price: 50 },
      stone: { amount: 10, price: 80 },
      nails: { amount: 10, price: 30 }
    };

    if (type === 'nails') {
      // Implement nails later if needed
      return;
    }

    updateResources({
      coins: resources.coins - cost,
      [type]: resources[type] + amounts[type].amount
    });

    addLogMessage(`Comprou ${amounts[type].amount} ${type === 'wood' ? '🪵' : '🪨'} por ${cost} moedas`, "💰");
  };

  const handleSellResource = (resource: 'wood' | 'stone') => {
    sellResource(resource);
  };

  const handleSellCrop = (crop: string) => {
    sellCrop(crop);
  };

  return (
    <aside className="flex flex-col gap-4 w-64 md:w-72 overflow-y-auto p-2">
      {/* Storage panel */}
      <section className="bg-card rounded-xl shadow-md p-3 flex flex-col gap-2" id="shop-harvest">
        <h3 className="font-display text-lg font-bold text-primary-dark border-b border-muted pb-1">
          Armazém
        </h3>
        <div className="space-y-1" id="storage-panel">
          {/* Tab navigation */}
          <div className="flex border-b mb-2">
            <button 
              className={`px-2 py-1 font-medium text-sm border-b-2 ${
                storageTab === 'resources' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-primary'
              } transition-colors`}
              onClick={() => setStorageTab('resources')}
            >
              Recursos
            </button>
            
            <button 
              className={`px-2 py-1 font-medium text-sm border-b-2 ${
                storageTab === 'crops' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-primary'
              } transition-colors`}
              onClick={() => setStorageTab('crops')}
            >
              Colheitas
            </button>
            <button 
              className={`px-2 py-1 font-medium text-sm border-b-2 ${
                storageTab === 'seeds' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-primary'
              } transition-colors`}
              onClick={() => setStorageTab('seeds')}
            >
              Sementes
            </button>
          </div>

          {/* Resources tab */}
          {storageTab === 'resources' && (
            <div className="max-h-48 overflow-y-auto pr-1">
              <div className="flex items-center justify-between p-2 bg-muted rounded-lg mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🪵</span>
                  <span className="text-sm font-medium">{resources.wood}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">5🪙</span>
                  <button 
                    className="bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hover:bg-primary-dark transition-colors"
                    onClick={() => handleSellResource('wood')}
                    disabled={resources.wood < 10}
                    aria-label="Sell wood"
                  >
                    🛒
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded-lg mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🪨</span>
                  <span className="text-sm font-medium">{resources.stone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">8🪙</span>
                  <button 
                    className="bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hover:bg-primary-dark transition-colors"
                    onClick={() => handleSellResource('stone')}
                    disabled={resources.stone < 10}
                    aria-label="Sell stone"
                  >
                    🛒
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Crops tab */}
          {storageTab === 'crops' && (
            <div className="max-h-48 overflow-y-auto pr-1">
              {Object.entries(resources.crops).map(([key, amount]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-muted rounded-lg mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{key === 'wheat' ? '🌾' : key === 'corn' ? '🌽' : '🥕'}</span>
                    <span className="text-sm font-medium">{amount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">10🪙</span>
                    <button 
                      className="bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hover:bg-primary-dark transition-colors"
                      onClick={() => handleSellCrop(key)}
                      disabled={amount < 10}
                      aria-label={`Sell ${key}`}
                    >
                      🛒
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Store tab */}
          {storageTab === 'store' && (
            <div className="max-h-48 overflow-y-auto pr-1">
              <div className="flex items-center justify-between p-2 bg-muted rounded-lg mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🪵</span>
                  <span className="text-sm font-medium">Madeira (10)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">50🪙</span>
                  <button 
                    className="bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hover:bg-primary-dark transition-colors"
                    onClick={() => handleBuyResource('wood', 50)}
                    aria-label="Buy wood"
                  >
                    🛒
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded-lg mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🪨</span>
                  <span className="text-sm font-medium">Pedra (10)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">80🪙</span>
                  <button 
                    className="bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hover:bg-primary-dark transition-colors"
                    onClick={() => handleBuyResource('stone', 80)}
                    aria-label="Buy stone"
                  >
                    🛒
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Seeds tab */}
          {storageTab === 'seeds' && (
            <div className="max-h-48 overflow-y-auto pr-1">
              {Object.entries(resources.seeds).map(([key, amount]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-muted rounded-lg mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{key === 'wheat' ? '🌾' : key === 'corn' ? '🌽' : '🥕'}</span>
                    <span className="text-sm font-medium">{amount}</span>
                  </div>
                  <div className="text-xs text-gray-500 px-2">
                    {amount > 0 ? 'Disponível' : 'Esgotado'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </aside>
  );
};

export default RightSidebar;