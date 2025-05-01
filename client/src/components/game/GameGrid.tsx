import React, { useEffect, useRef, useState } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { handleTileClick } from "@/lib/gameLogic";
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
      {/* Removed status message below the NPC */}
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
      switch (tile.resource) {
        case 'tree': return '🌲';
        case 'bigTree': return '🌳';
        case 'rock': return '🪨';
      }
    }
    
    // Structures
    if (tile.structure) {
      switch (tile.structure) {
        case 'lumberjackHouse': return '🏡';
        case 'minerHouse': return '🏚';
        case 'storage': return '🏦';
        case 'farmerHouse': return '🏘️';
        case 'waterWell': return '⛲';
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
      className={`tile-transition relative w-[var(--tile-size)] h-[var(--tile-size)] ${bgColor} border border-green-200 rounded-lg cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95`}
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
    </div>
  );
};

const GameGrid: React.FC = () => {
  const { gridTiles, agents, seedMap, updateTile, resources, updateResources, addLogMessage, setSelected } = useGameState();
  const gridRef = useRef<HTMLDivElement>(null);
  const [balloonPosition, setBalloonPosition] = useState<{ x: number, y: number } | null>(null);
  const [selectedTile, setSelectedTile] = useState<GridTile | null>(null);
  
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
    // Check if the tile is a watered planting field
    if (tile.type === 'field' && tile.fieldType === 'plantio' && tile.fieldState === 'watered' && !tile.planted) {
      // Check if user has any seeds
      const hasSeeds = Object.values(resources.seeds).some(count => count > 0);
      
      if (hasSeeds) {
        // Calculate the position for the balloon
        const tileSize = 50; // Should match --tile-size
        const gapSize = 4;   // Should match --tile-gap
        const posX = tile.x * (tileSize + gapSize) + tileSize / 2;
        const posY = tile.y * (tileSize + gapSize);
        
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
    handleTileClick(tile);
  };

  return (
    <div className="relative bg-green-100 dark:bg-green-900 rounded-xl shadow-md p-3 overflow-auto flex-1 max-h-[calc(100vh-200px)]">
      <div className="flex flex-col items-center justify-center h-full">
        <div id="game-grid" className="relative" ref={gridRef}>
          {gridTiles.map((tile, index) => (
            <Tile 
              key={`${tile.x}-${tile.y}`} 
              tile={tile} 
              onClick={handleTileClicked}
              seedMap={seedMap}
            />
          ))}
          
          <Agent 
            type="lumber" 
            x={agents.lumber.x} 
            y={agents.lumber.y} 
            state={agents.lumber.state}
          />
          
          <Agent 
            type="miner" 
            x={agents.miner.x} 
            y={agents.miner.y} 
            state={agents.miner.state}
          />
          
          <Agent 
            type="farmer" 
            x={agents.farmer.x} 
            y={agents.farmer.y} 
            state={agents.farmer.state}
          />
          
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
    </div>
  );
};

export default GameGrid;
