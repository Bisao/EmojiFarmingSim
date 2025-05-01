import React, { useEffect, useRef } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { handleTileClick } from "@/lib/gameLogic";
import { GridTile, SeedType } from "@/lib/gameTypes";

interface AgentProps {
  type: 'lumber' | 'miner';
  x: number;
  y: number;
  state: string;
}

const Agent: React.FC<AgentProps> = ({ type, x, y, state }) => {
  // Determine animation class based on state
  let animationClass = '';
  let showProgressBar = false;
  
  switch (state) {
    case 'idle':
      animationClass = 'animate-wiggle';
      break;
    case 'moving':
      animationClass = 'animate-bounce-slow';
      break;
    case 'working':
      animationClass = 'animate-bounce-slow';
      showProgressBar = true;
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
      <div className={`text-2xl ${animationClass}`}>
        {type === 'lumber' ? '🧑🏼‍🦰' : '👴🏼'}
      </div>
      {showProgressBar && (
        <div 
          className="mt-1 w-4/5 h-1.5 bg-gray-200 rounded-full overflow-hidden"
          id={`${type}-progress`}
        >
          <div className="h-full bg-accent w-0 progress-bar"></div>
        </div>
      )}
      <div className="text-xs font-bold opacity-70 mt-1">
        {state.charAt(0).toUpperCase() + state.slice(1)}
      </div>
    </div>
  );
};

const Tile: React.FC<{ 
  tile: GridTile; 
  onClick: (tile: GridTile) => void;
  seedMap: Record<SeedType, { emoji: string, cost: number, growthTime: number }>;
}> = ({ tile, onClick, seedMap }) => {
  // Determine tile background and content
  let bgColor = "bg-[color:var(--resource-grass)]";
  let content = null;
  
  if (tile.type === 'field') {
    switch (tile.fieldType) {
      case 'plantio':
        bgColor = "bg-[color:var(--resource-soil)]";
        content = tile.planted ? seedMap[tile.planted]?.emoji || '🌱' : '';
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
    }
  }

  return (
    <div
      className={`tile-transition relative w-[var(--tile-size)] h-[var(--tile-size)] ${bgColor} border border-green-200 rounded-lg cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95`}
      data-x={tile.x}
      data-y={tile.y}
      onClick={() => onClick(tile)}
    >
      {content && <div className="text-2xl pointer-events-none">{content}</div>}
      {tile.growthStage !== undefined && tile.growthStage < 100 && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4/5 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary" 
            style={{ width: `${tile.growthStage}%` }}
          ></div>
        </div>
      )}
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
    <div className="relative bg-card rounded-xl shadow-md p-3 overflow-auto flex-1 max-h-[calc(100vh-200px)]">
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
        </div>
      </div>
    </div>
  );
};

export default GameGrid;
