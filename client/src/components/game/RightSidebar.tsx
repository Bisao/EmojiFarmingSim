import React, { useState } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { buyField, buySeed, sellResource, sellCrop } from "@/lib/gameLogic";
import { SeedType } from "@/lib/gameTypes";

const RightSidebar: React.FC = () => {
  const { 
    resources, 
    fieldMap, 
    seedMap, 
    selected, 
    setSelected, 
    addLogMessage 
  } = useGameState();
  
  const [storageTab, setStorageTab] = useState<'resources' | 'crops' | 'seeds'>('resources');
  const [fieldsTab, setFieldsTab] = useState<'fields'>('fields');
  const [seedsShopTab, setSeedsShopTab] = useState<'seeds'>('seeds');

  const handleFieldSelect = (key: string) => {
    if (selected?.type === "field" && selected.key === key) {
      setSelected(null);
      addLogMessage("Seleção cancelada.", "");
    } else {
      setSelected({ type: "field", key });
      addLogMessage(`Selecionado ${fieldMap[key].name}`, "");
    }
  };

  const handleBuySeed = (key: string) => {
    buySeed(key);
  };

  const handleSellResource = (resource: 'wood' | 'stone') => {
    sellResource(resource);
  };

  const handleSellCrop = (crop: string) => {
    sellCrop(crop);
  };

  return (
    <aside className="flex flex-col gap-4 w-48 md:w-56 overflow-y-auto">
      {/* Fields panel */}
      <section className="bg-card rounded-xl shadow-md p-3 flex flex-col gap-2" id="shop-fields">
        <h3 className="font-display text-lg font-bold text-primary-dark border-b border-muted pb-1">
          Campos
        </h3>
        <div className="space-y-1" id="fields-panel">
          {/* Tab navigation */}
          <div className="flex border-b mb-2">
            <button 
              className={`px-2 py-1 font-medium text-sm border-b-2 border-primary text-primary transition-colors`}
              onClick={() => setFieldsTab('fields')}
            >
              Campos
            </button>
          </div>
          
          {/* Fields tab */}
          <div className="max-h-48 overflow-y-auto pr-1">
            {Object.entries(fieldMap).map(([key, field]) => (
              <button 
                key={key}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors w-full ${
                  selected?.type === "field" && selected.key === key
                    ? "bg-primary text-white"
                    : "bg-muted hover:bg-primary hover:text-white"
                }`}
                onClick={() => handleFieldSelect(key)}
              >
                <span className={`w-6 h-6 rounded-md`} style={{ backgroundColor: field.color }}></span>
                <div className="flex-1 text-left">
                  <div>{field.name}</div>
                  <div className="text-xs flex items-center">
                    <span>{field.cost.coins}</span>
                    <span className="text-xs">🪙</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* Seeds panel */}
      <section className="bg-card rounded-xl shadow-md p-3 flex flex-col gap-2" id="shop-seeds">
        <h3 className="font-display text-lg font-bold text-primary-dark border-b border-muted pb-1">
          Sementes
        </h3>
        <div className="space-y-1" id="seeds-shop-panel">
          {/* Tab navigation */}
          <div className="flex border-b mb-2">
            <button 
              className={`px-2 py-1 font-medium text-sm border-b-2 border-primary text-primary transition-colors`}
              onClick={() => setSeedsShopTab('seeds')}
            >
              Comprar
            </button>
          </div>
          
          {/* Seeds shop tab */}
          <div className="max-h-48 overflow-y-auto pr-1">
            {Object.entries(seedMap).map(([key, seed]) => (
              <div key={key} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{seed.emoji}</span>
                  <span className="text-sm font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">{seed.cost}🪙</span>
                  <button 
                    className="bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hover:bg-primary-dark transition-colors"
                    onClick={() => handleBuySeed(key)}
                    aria-label={`Buy ${key} seeds`}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
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
              <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🪵</span>
                  <span className="text-sm font-medium">{resources.wood}</span>
                </div>
                <button 
                  className="flex items-center gap-1 text-xs bg-accent text-primary-dark px-2 py-1 rounded-lg hover:bg-accent-dark transition-colors"
                  onClick={() => handleSellResource('wood')}
                  disabled={resources.wood === 0}
                >
                  <span>5🪙</span>
                  <span>🛒</span>
                </button>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🪨</span>
                  <span className="text-sm font-medium">{resources.stone}</span>
                </div>
                <button 
                  className="flex items-center gap-1 text-xs bg-accent text-primary-dark px-2 py-1 rounded-lg hover:bg-accent-dark transition-colors"
                  onClick={() => handleSellResource('stone')}
                  disabled={resources.stone === 0}
                >
                  <span>8🪙</span>
                  <span>🛒</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Crops tab */}
          {storageTab === 'crops' && (
            <div className="max-h-48 overflow-y-auto pr-1">
              {Object.entries(resources.crops).map(([key, amount]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{seedMap[key as SeedType]?.emoji || '🌱'}</span>
                    <span className="text-sm font-medium">{amount}</span>
                  </div>
                  <button 
                    className="flex items-center gap-1 text-xs bg-accent text-primary-dark px-2 py-1 rounded-lg hover:bg-accent-dark transition-colors"
                    onClick={() => handleSellCrop(key)}
                    disabled={amount === 0}
                  >
                    <span>{seedMap[key as SeedType]?.cost * 2 || 10}🪙</span>
                    <span>🛒</span>
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Seeds tab */}
          {storageTab === 'seeds' && (
            <div className="max-h-48 overflow-y-auto pr-1">
              {Object.entries(resources.seeds).map(([key, amount]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{seedMap[key as SeedType]?.emoji || '🌱'}</span>
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
