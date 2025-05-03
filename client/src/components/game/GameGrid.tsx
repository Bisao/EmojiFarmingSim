import React, { useEffect, useRef, useState } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { handleTileClick, createNewAgent } from "@/lib/gameLogic";
import { GridTile, SeedType } from "@/lib/gameTypes";
import SeedSelectionBalloon from "./SeedSelectionBalloon";

interface AgentProps {
  type: 'lumber' | 'miner' | 'farmer';
  x: number;
  y: number;
  state: string;
}

const Agent: React.FC<AgentProps> = ({ type, x, y, state }) => {
  // Determine animation class based on state
  let animationClass = '';

  // Determine if the agent should be visible based on state
  // Hide agent emoji when they're inside buildings (waiting, resting, or storing)
  const isInBuilding = state === 'waiting' || state === 'resting' || state === 'storing';

  switch (state) {
    case 'idle':
      animationClass = 'animate-wiggle';
      break;
    case 'moving':
      animationClass = 'animate-bounce-slow';
      break;
    case 'working':
      animationClass = 'animate-bounce-slow';
      break;
    case 'preparing':
      animationClass = 'animate-bounce-slow';
      break;
    case 'watering':
      animationClass = 'animate-bounce-slow';
      break;
    case 'harvesting':
      animationClass = 'animate-bounce-slow';
      break;
    case 'planting':
      animationClass = 'animate-bounce-slow';
      break;
    case 'gettingWater':
      animationClass = 'animate-bounce-slow';
      break;
    case 'gettingSeed':
      animationClass = 'animate-bounce-slow';
      break;
    case 'returning':
      animationClass = 'animate-bounce-slow';
      break;
    case 'storing':
      animationClass = 'animate-wiggle';
      break;
    case 'resting':
      animationClass = 'animate-pulse-custom';
      break;
    case 'waiting':
      animationClass = 'animate-pulse-custom';
      break;
  }

  // Calculate the position, accounting for the gap between tiles
  const gapSize = 4; // This should match the gap in your CSS (--tile-gap)
  const tileSize = 50; // This should match --tile-size

  // Position in the grid, accounting for gaps between tiles
  const posX = x * (tileSize + gapSize);
  const posY = y * (tileSize + gapSize);

  return (
    <div 
      id={`agent-${type}`}
      className="agent-move agent z-10 absolute" 
      style={{ 
        left: `${posX}px`, 
        top: `${posY}px`,
        width: `${tileSize}px`,
        height: `${tileSize}px`
      }}
      data-state={state}
      data-x={x}
      data-y={y}
    >
      {!isInBuilding && (
        <div className={`text-2xl ${animationClass}`}>
          {type === 'lumber' ? '🧑🏼‍🦰' : type === 'miner' ? '👴🏼' : '👨‍🌾'}
        </div>
      )}
    </div>
  );
};

const Tile: React.FC<{ 
  tile: GridTile; 
  onClick: (tile: GridTile) => void;
  seedMap: Record<SeedType, { emoji: string, cost: number, growthTime: number }>;
}> = ({ tile, onClick, seedMap }) => {
  // Get content emoji based on tile type
  const getContentEmoji = () => {
    // Resources
    if (tile.resource) {
      if (tile.resource === 'tree') return '🌲';
      if (tile.resource === 'bigTree') return '🌳';
      if (tile.resource === 'rock') return '🪨';
    }

    // Structures
    if (tile.structure) {
      switch (tile.structure) {
        case 'lumberjackHouse': return '🏡';
        case 'minerHouse': return '🏚';
        case 'storage': return '🏦';
        case 'farmerHouse': return '🏘️';
        case 'waterWell': return '⛲';
        case 'pickupTruck': return '🛻';
        case 'tractor': return '🚜';
      }
    }

    // Fields with planted crops
    if (tile.type === 'field' && tile.fieldType === 'plantio' && tile.planted) {
      if (tile.harvestable) {
        // Fully grown and ready to harvest
        return seedMap[tile.planted]?.emoji || '🌾';
      } else if (tile.growthStage && tile.growthStage > 75) {
        // Almost ready
        return '🌾';
      } else if (tile.growthStage && tile.growthStage > 35) {
        // Growing
        return '🌿';
      } else {
        // Just planted
        return '🌱';
      }
    }

    // Other field types
    if (tile.type === 'field') {
      switch (tile.fieldType) {
        case 'agua': return null; // Just use background color
        case 'pasto': return null; // Just use background color
      }
    }

    return null;
  };

  // Get background color based on tile type
  const getBackgroundColor = () => {
    if (tile.type === 'field') {
      switch (tile.fieldType) {
        case 'plantio': return "bg-[color:var(--resource-grass)]";
        case 'agua': return "bg-[color:var(--resource-water)]";
        case 'pasto': return "bg-[color:var(--resource-pasture)]";
      }
    }

    return "bg-[color:var(--resource-grass)]"; // Default
  };

  // Get field state emoji for soil
  const getFieldStateEmoji = () => {
    if (tile.type === 'field' && tile.fieldType === 'plantio') {
      if (tile.fieldState === 'prepared') {
        return '🟧'; // Prepared planting soil
      } else if (tile.fieldState === 'watered') {
        return '🟫'; // Watered planting soil
      }
    }

    return null;
  };

  const contentEmoji = getContentEmoji();
  const bgColor = getBackgroundColor();
  const fieldStateEmoji = getFieldStateEmoji();
  const showConstruction = tile.constructionEmoji !== undefined;

  return (
    <div
      className={`tile-transition relative w-[var(--tile-size)] h-[var(--tile-size)] ${bgColor} border border-green-200 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95`}
      data-x={tile.x}
      data-y={tile.y}
      onClick={() => onClick(tile)}
    >
      {/* Field state emoji (shown as background) */}
      {fieldStateEmoji && (
        <div className="absolute inset-0 flex items-center justify-center text-4xl pointer-events-none">
          {fieldStateEmoji}
        </div>
      )}

      {/* Construction emoji or content emoji (shown above field state) */}
      {showConstruction && (
        <div className="text-2xl pointer-events-none animate-pulse-custom z-10">{tile.constructionEmoji}</div>
      )}

      {!showConstruction && contentEmoji && (
        <div className="text-2xl pointer-events-none z-10">{contentEmoji}</div>
      )}
      {tile.resourceEmoji && (
        <span 
          className="absolute inset-0 flex items-center justify-center text-2xl z-10"
          style={{ transform: `scale(${tile.resourceScale || 0.2})` }} //Added scale for emoji
        >
          {tile.resourceEmoji}
        </span>
      )}
    </div>
  );
};

const GameGrid: React.FC = () => {
  const { gridTiles, agents, seedMap, resources, updateTile, updateResources, addLogMessage, setSelected, selected, structureMap, fieldMap } = useGameState();
  const gridRef = useRef<HTMLDivElement>(null);
  const [balloonPosition, setBalloonPosition] = useState<{ x: number, y: number } | null>(null);
  const [selectedTile, setSelectedTile] = useState<GridTile | null>(null);
  const [removalConfirmation, setRemovalConfirmation] = useState<RemovalConfirmation>(null);

  const handleRemoval = (confirmed: boolean) => {
    if (!removalConfirmation || !confirmed) {
      setRemovalConfirmation(null);
      return;
    }

    const tile = gridTiles.find(t => t.x === removalConfirmation.x && t.y === removalConfirmation.y);
    if (!tile) return;

    if (removalConfirmation.type === 'structure') {
      const structure = structureMap[tile.structure!];
      const refund = Math.floor(structure.cost.coins * 0.3);
      updateResources({
        coins: resources.coins + refund
      });
      updateTile({
        ...tile,
        structure: undefined
      });
      addLogMessage(`Estrutura removida! Você recebeu ${refund} moedas de reembolso.`, "💰");
    } else if (removalConfirmation.type === 'resource') {
      if (resources.coins < removalConfirmation.cost!) {
        addLogMessage("Moedas insuficientes para remover este recurso.", "❌");
        return;
      }
      updateResources({
        coins: resources.coins - removalConfirmation.cost!
      });
      updateTile({
        ...tile,
        resource: undefined,
        respawnTimer: undefined
      });
      addLogMessage(`Recurso removido por ${removalConfirmation.cost} moedas.`, "💰");
    }

    setRemovalConfirmation(null);
  };
  const [storeTab, setStoreTab] = useState<'structures' | 'fields' | 'vehicles'>('structures');

  // Handle seed selection from the balloon
  const handleSeedSelect = (seedType: SeedType) => {
    if (selectedTile) {
      // Plant the seed
      updateTile({
        ...selectedTile,
        planted: seedType,
        growthStage: 0,
        harvestable: false
      });

      // Deduct seed from inventory
      const updatedSeeds = { ...resources.seeds };
      updatedSeeds[seedType] -= 1;

      updateResources({
        seeds: updatedSeeds
      });

      addLogMessage(`${seedMap[seedType].emoji} Sementes de ${seedType} plantadas com sucesso!`, "🌱");
    }

    // Close the balloon
    setBalloonPosition(null);
    setSelectedTile(null);
  };

  // Handle closing the balloon without selection
  const handleCloseBalloon = () => {
    setBalloonPosition(null);
    setSelectedTile(null);
  };

  const handleTileClicked = (tile: GridTile) => {
    // Handle store item placement
    if (selected?.type === 'structure') {
      const structure = structureMap[selected.key];
      if (!structure) {
        addLogMessage("Estrutura inválida selecionada.", "⚠️");
        return;
      }

      // Check if tile is empty
      if (tile.resource || tile.structure || tile.type) {
        addLogMessage("Este local já está ocupado. Escolha outro local.", "⚠️");
        return;
      }

      // Check if player has enough resources
      if (resources.coins < structure.cost.coins || 
          resources.wood < structure.cost.wood || 
          resources.stone < structure.cost.stone) {
        addLogMessage("Recursos insuficientes para construir!", "❌");
        return;
      }

      // Update tile first
      updateTile({
        ...tile,
        structure: selected.key as any
      });

      // Then deduct resources
      updateResources({
        coins: resources.coins - structure.cost.coins,
        wood: resources.wood - structure.cost.wood,
        stone: resources.stone - structure.cost.stone
      });

      // Create NPC if this is a house
      if (selected.key === "lumberjackHouse" || 
          selected.key === "minerHouse" || 
          selected.key === "farmerHouse") {
        createNewAgent(selected.key, tile);
      }

      // Handle special cases like water well
      if (selected.key === "waterWell") {
        updateTile({
          ...tile,
          structure: selected.key as any,
          waterWell: {
            buckets: 0,
            maxBuckets: 5,
            generationTimer: 30
          }
        });
      }

      addLogMessage(`${structure.emoji} ${structure.name} construído com sucesso!`, "🏗️");
      setSelected(null);
      return;

      // Deduct all required resources
      updateResources({
        coins: resources.coins - structure.cost.coins,
        wood: resources.wood - structure.cost.wood,
        stone: resources.stone - structure.cost.stone
      });

      // Create an NPC if this is a house
      if (selected.key === "lumberjackHouse" || 
          selected.key === "minerHouse" || 
          selected.key === "farmerHouse") {
        createNewAgent(selected.key, tile);
      }

      addLogMessage(`${structure.emoji} ${structure.name} construído!`, "🏗️");
      setSelected(null);
      return;
    }

    // Handle existing tile interactions
    if (tile.structure || tile.resource) {
      const removalCost = tile.resource === 'tree' || tile.resource === 'bigTree' ? 3000 : 
                         tile.resource === 'rock' ? 5000 : 0;
      const structureRefund = tile.structure ? Math.floor(structureMap[tile.structure].cost.coins * 0.3) : 0;

      setRemovalConfirmation({
        type: tile.structure ? 'structure' : 'resource',
        x: tile.x,
        y: tile.y,
        cost: removalCost,
        refund: structureRefund
      });
      return;
    }
    // Check if the tile is a watered planting field
    if (tile.type === 'field' && tile.fieldType === 'plantio' && tile.fieldState === 'watered' && !tile.planted) {
      // Check if user has any seeds
      const hasSeeds = Object.values(resources.seeds).some(count => count > 0);

      if (hasSeeds) {
        // Calculate the position for the balloon
        const tileSize = 50; // Should match --tile-size
        const gapSize = 4;   // Should match --tile-gap
        const posX = tile.x * (tileSize + gapSize) + tileSize / 2;
        const posY = tile.y * (tileSize + gapSize) + tileSize / 2;

        // Show the seed selection balloon
        setBalloonPosition({ x: posX, y: posY });
        setSelectedTile(tile);

        // Don't proceed with normal click handling
        return;
      } else {
        // No seeds available
        addLogMessage("Você não tem sementes disponíveis. Compre sementes na loja.", "❌");
      }
    }

    // For all other tiles, use the normal click handler
    handleTileClick(tile, setSelected); // Added setSelected to handle closing the store on tile selection
  };


  const handleStructureSelect = (key: string) => {
    setSelected({ type: "structure", key });
    setStoreTab('structures'); // Reset store tab
  };

  const handleFieldSelect = (key: string) => {
    setSelected({ type: "field", key });
  };

  const isStoreOpen = selected?.type === "store";

  return (
    <div className="relative bg-green-100 dark:bg-green-900 rounded-xl shadow-md p-3 overflow-auto flex-1 max-h-[calc(100vh-200px)]">
      {isStoreOpen && (
        <div className="absolute inset-4 bg-card/95 backdrop-blur rounded-xl shadow-xl z-20 p-4 overflow-auto">
          <button 
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={() => setSelected(null)}
          >
            ✕
          </button>
          <div className="flex mb-4">
            <button 
              className={`px-4 py-2 rounded-lg mr-2 ${storeTab === 'structures' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setStoreTab('structures')}
            >
              Estruturas
            </button>
            <button 
              className={`px-4 py-2 rounded-lg mr-2 ${storeTab === 'fields' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setStoreTab('fields')}
            >
              Terrenos
            </button>
            <button 
              className={`px-4 py-2 rounded-lg mr-2 ${storeTab === 'seeds' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setStoreTab('seeds')}
            >
              Sementes
            </button>
            <button 
              className={`px-4 py-2 rounded-lg mr-2 ${storeTab === 'vehicles' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setStoreTab('vehicles')}
            >
              Veículos
            </button>
            <button 
              className={`px-4 py-2 rounded-lg ${storeTab === 'resources' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setStoreTab('resources')}
            >
              Recursos
            </button>
          </div>
          {storeTab === 'structures' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
              {Object.entries(structureMap).map(([key, structure]) => (
                <div key={key} className="item-card">
                  <div className="item-info">
                    <span className="item-icon">{structure.emoji}</span>
                    <span className="item-name">{structure.name}</span>
                  </div>
                  <div className="item-action">
                    <span className="text-xs text-gray-500">{structure.cost.coins}🪙</span>
                    <button 
                      className="action-button"
                      onClick={() => {
                        handleStructureSelect(key);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {storeTab === 'fields' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
              {Object.entries(fieldMap).map(([key, field]) => (
                <div key={key} className="item-card">
                  <div className="item-info">
                    <span className="item-icon">{field.emoji || '🟫'}</span>
                    <span className="item-name">{field.name}</span>
                  </div>
                  <div className="item-action">
                    <span className="text-xs text-gray-500">{field.cost.coins}🪙</span>
                    <button 
                      className="action-button"
                      onClick={() => {
                        handleFieldSelect(key);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {storeTab === 'seeds' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
              {Object.entries(seedMap).map(([key, seed]) => (
                <div key={key} className="item-card">
                  <div className="item-info">
                    <span className="item-icon">{seed.emoji}</span>
                    <span className="item-name">{key} (10x)</span>
                  </div>
                  <div className="item-action">
                    <span className="text-xs text-gray-500">{seed.cost}🪙</span>
                    <button 
                      className="action-button"
                      onClick={() => {
                        if (resources.coins >= seed.cost) {
                          const updatedSeeds = { ...resources.seeds };
                          updatedSeeds[key] = (updatedSeeds[key] || 0) + 10;
                          updateResources({
                            coins: resources.coins - seed.cost,
                            seeds: updatedSeeds
                          });
                          addLogMessage(`Comprou 10 sementes de ${key} por ${seed.cost} moedas.`, seed.emoji);
                        } else {
                          addLogMessage("Moedas insuficientes!", "❌");
                        }
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {storeTab === 'vehicles' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
              <div className="item-card">
                <div className="item-info">
                  <span className="item-icon">🛻</span>
                  <span className="item-name">Pickup Truck</span>
                </div>
                <div className="item-action">
                  <span className="text-xs text-gray-500">1000🪙</span>
                  <button 
                    className="action-button"
                    onClick={() => {
                      handleStructureSelect('pickupTruck');
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="item-card">
                <div className="item-info">
                  <span className="item-icon">🚜</span>
                  <span className="item-name">Tractor</span>
                </div>
                <div className="item-action">
                  <span className="text-xs text-gray-500">2000🪙</span>
                  <button 
                    className="action-button"
                    onClick={() => {
                      handleStructureSelect('tractor');
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
          {storeTab === 'resources' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
              <div className="item-card">
                <div className="item-info">
                  <span className="item-icon">🪵</span>
                  <span className="item-name">Madeira (10x)</span>
                </div>
                <div className="item-action">
                  <span className="text-xs text-gray-500">50🪙</span>
                  <button 
                    className="action-button"
                    onClick={() => {
                      if (resources.coins >= 50) {
                        updateResources({
                          coins: resources.coins - 50,
                          wood: resources.wood + 10
                        });
                        addLogMessage("Comprou 10 madeiras por 50 moedas.", "🪵");
                      } else {
                        addLogMessage("Moedas insuficientes!", "❌");
                      }
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="item-card">
                <div className="item-info">
                  <span className="item-icon">🪨</span>
                  <span className="item-name">Pedra (10x)</span>
                </div>
                <div className="item-action">
                  <span className="text-xs text-gray-500">80🪙</span>
                  <button 
                    className="action-button"
                    onClick={() => {
                      if (resources.coins >= 80) {
                        updateResources({
                          coins: resources.coins - 80,
                          stone: resources.stone + 10
                        });
                        addLogMessage("Comprou 10 pedras por 80 moedas.", "🪨");
                      } else {
                        addLogMessage("Moedas insuficientes!", "❌");
                      }
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="game-grid-container">
        <div id="game-grid" className="relative" ref={gridRef}>
          {gridTiles.map((tile, index) => (
            <Tile 
              key={`${tile.x}-${tile.y}`} 
              tile={tile} 
              onClick={handleTileClicked}
              seedMap={seedMap}
            />
          ))}

          {agents.lumber && (
            <Agent 
              type="lumber" 
              x={agents.lumber.x} 
              y={agents.lumber.y} 
              state={agents.lumber.state}
            />
          )}

          {agents.miner && (
            <Agent 
              type="miner" 
              x={agents.miner.x} 
              y={agents.miner.y} 
              state={agents.miner.state}
            />
          )}

          {agents.farmer && (
            <Agent 
              type="farmer" 
              x={agents.farmer.x} 
              y={agents.farmer.y} 
              state={agents.farmer.state}
            />
          )}

          {/* Seed Selection Balloon */}
          {balloonPosition && (
            <SeedSelectionBalloon 
              position={balloonPosition}
              onSelect={handleSeedSelect}
              onClose={handleCloseBalloon}
            />
          )}
        </div>
      </div>
      {removalConfirmation && removalConfirmation.type && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
          <div className="absolute bg-card p-4 rounded-lg shadow-lg max-w-sm" style={{
            left: `${removalConfirmation.x * (80 + 4)}px`,
            top: `${removalConfirmation.y * (80 + 4)}px`,
          }}>
            <h3 className="text-lg font-bold mb-2">
              {removalConfirmation.type === 'structure' ? 'Remover estrutura?' : 'Remover recurso?'}
            </h3>
            <p className="mb-4">
              {removalConfirmation.type === 'structure' 
                ? `Você receberá ${removalConfirmation.refund} moedas de reembolso.`
                : `Custo: ${removalConfirmation.cost} moedas. O recurso não reaparecerá.`}
            </p>
            <div className="flex justify-end gap-2">
              <button 
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={() => handleRemoval(true)}
              >
                Confirmar
              </button>
              <button 
                className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
                onClick={() => handleRemoval(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameGrid;