import React, { useEffect, useRef } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { handleTileClick } from "@/lib/gameLogic";
import { GridTile, SeedType } from "@/lib/gameTypes";

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
  // Determine tile background and content
  // Always use grass as the base tile color
  let bgColor = "bg-[color:var(--resource-grass)]";
  let content = null;
  
  if (tile.type === 'field') {
    switch (tile.fieldType) {
      case 'plantio':
        // Choose the right background color based on field state
        if (tile.fieldState === 'prepared') {
          bgColor = "bg-[color:var(--resource-soil-prepared)]";
        } else if (tile.fieldState === 'watered') {
          bgColor = "bg-[color:var(--resource-soil-watered)]";
        } else {
          bgColor = "bg-[color:var(--resource-soil)]";
        }
        
        // Set the appropriate emoji based on growth stage
        if (tile.planted) {
          // Handle different growth stages
          if (tile.harvestable) {
            // Fully grown and ready to harvest - show actual crop emoji
            content = seedMap[tile.planted]?.emoji || '🌾';
          } else if (tile.growthStage && tile.growthStage > 75) {
            // Almost ready - show mature plant
            content = '🌾';
          } else if (tile.growthStage && tile.growthStage > 35) {
            // Growing - show medium growth
            content = '🌿';
          } else {
            // Just planted - show seedling
            content = '🌱';
          }
        } else if (tile.fieldState === 'prepared' || tile.fieldState === 'watered') {
          // Field is being prepared or watered but not planted yet
          content = '';  // Empty prepared/watered field
        } else {
          content = '';  // Empty normal field
        }
        break;
      case 'agua':
        bgColor = "bg-[color:var(--resource-water)]";
        break;
      case 'pasto':
        bgColor = "bg-[color:var(--resource-pasture)]";
        break;
    }
  } else if (tile.resource) {
    switch (tile.resource) {
      case 'tree':
        content = '🌲';
        break;
      case 'bigTree':
        content = '🌳';
        break;
      case 'rock':
        content = '🪨';
        break;
    }
  } else if (tile.structure) {
    switch (tile.structure) {
      case 'lumberjackHouse':
        content = '🏡';
        break;
      case 'minerHouse':
        content = '🏚';
        break;
      case 'storage':
        content = '🏦';
        break;
      case 'farmerHouse':
        content = '🏘️';
        break;
      case 'waterWell':
        content = '⛲';
        break;
    }
  }

  // Show construction emoji if it exists on the tile
  // This is set when fields are first placed and during preparation
  const showConstruction = tile.constructionEmoji !== undefined;
  
  return (
    <div
      className={`tile-transition relative w-[var(--tile-size)] h-[var(--tile-size)] ${bgColor} border border-green-200 rounded-lg cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95`}
      data-x={tile.x}
      data-y={tile.y}
      onClick={() => onClick(tile)}
    >
      {showConstruction && (
        <div className="text-2xl pointer-events-none animate-pulse-custom">{tile.constructionEmoji}</div>
      )}
      
      {!showConstruction && content && (
        <div className="text-2xl pointer-events-none">{content}</div>
      )}
      
      {/* Progress bars removed */}
    </div>
  );
};

const GameGrid: React.FC = () => {
  const { gridTiles, agents, seedMap } = useGameState();
  const gridRef = useRef<HTMLDivElement>(null);

  const handleTileClicked = (tile: GridTile) => {
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
        </div>
      </div>
    </div>
  );
};

export default GameGrid;
