import React from 'react';
import { SeedType } from '@/lib/gameTypes';
import { useGameState } from '@/hooks/use-game-state';

interface SeedSelectionBalloonProps {
  position: { x: number, y: number };
  onSelect: (seedType: SeedType) => void;
  onClose: () => void;
}

const SeedSelectionBalloon: React.FC<SeedSelectionBalloonProps> = ({ position, onSelect, onClose }) => {
  const { resources, seedMap } = useGameState();

  // Filter only seeds that are available
  const availableSeeds = Object.entries(resources.seeds)
    .filter(([_, count]) => count > 0)
    .map(([seedType, count]) => ({
      type: seedType as SeedType,
      count,
      emoji: seedMap[seedType as SeedType].emoji,
    }));

  if (availableSeeds.length === 0) {
    return (
      <div 
        className="absolute z-50 bg-card dark:bg-card p-3 rounded-lg shadow-lg border border-border"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`, 
          transform: 'translate(-50%, -50%)',
          minWidth: '200px'
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-sm">Sem sementes!</h3>
          <button 
            onClick={onClose}
            className="text-sm font-bold text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <p className="text-sm">Você não tem sementes disponíveis. Compre sementes na loja.</p>
        <div className="w-4 h-4 bg-card dark:bg-card rotate-45 absolute -bottom-2 left-1/2 transform -translate-x-1/2 border-r border-b border-border"></div>
      </div>
    );
  }

  return (
    <div 
      className="absolute z-50 bg-card dark:bg-card p-3 rounded-lg shadow-lg border border-border"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`, 
        transform: 'translate(-50%, -50%)',
        minWidth: '200px',
        maxWidth: '90%',
        maxHeight: '90%',
        overflowY: 'auto'
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Escolha uma semente:</h3>
        <button 
          onClick={onClose}
          className="text-sm font-bold text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {availableSeeds.map((seed) => (
          <button
            key={seed.type}
            className="flex items-center justify-between w-full p-2 bg-muted rounded-lg hover:bg-primary hover:text-white transition-colors"
            onClick={() => onSelect(seed.type)}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{seed.emoji}</span>
              <span className="text-sm font-medium capitalize">{seed.type}</span>
            </div>
            <span className="text-xs">{seed.count}</span>
          </button>
        ))}
      </div>
      <div className="w-4 h-4 bg-card dark:bg-card rotate-45 absolute -bottom-2 left-1/2 transform -translate-x-1/2 border-r border-b border-border"></div>
    </div>
  );
};

export default SeedSelectionBalloon;