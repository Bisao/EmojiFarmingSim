import { GridTile, SeedType } from "./gameTypes";
import { useGameStateContext } from "./gameState";

// Create a state instance to be used by game logic functions
let gameStateInstance: ReturnType<typeof useGameStateContext> | null = null;

// Function to set the game state instance from a component
export function setGameStateInstance(instance: ReturnType<typeof useGameStateContext>) {
  gameStateInstance = instance;
}

// Get access to game state and its methods
const getState = () => {
  if (!gameStateInstance) {
    throw new Error("Game state instance not set. Call setGameStateInstance first.");
  }
  return gameStateInstance;
};

// Handle tile click
export function handleTileClick(tile: GridTile) {
  const { selected, setSelected, resources, structureMap, fieldMap, seedMap, addLogMessage, updateResources, updateTile } = getState();
  
  // If nothing is selected, just show info about the tile
  if (!selected) {
    if (tile.resource) {
      addLogMessage(`Recurso: ${getTileEmoji(tile)}`, "");
    } else if (tile.structure) {
      addLogMessage(`Estrutura: ${structureMap[tile.structure].emoji} ${structureMap[tile.structure].name}`, "");
    } else if (tile.type === 'field') {
      const fieldInfo = fieldMap[tile.fieldType || 'plantio'];
      addLogMessage(`Campo: ${fieldInfo.emoji || '🌱'} ${fieldInfo.name}`, "");
    } else {
      addLogMessage("Selecione algo para construir ou plantar.", "");
    }
    return;
  }

  // Handle structure placement
  if (selected.type === 'structure') {
    const structure = structureMap[selected.key];
    
    // Check if tile is empty
    if (tile.resource || tile.structure || tile.type) {
      addLogMessage("Este local já está ocupado.", "⚠️");
      return;
    }
    
    // Check if player has enough resources
    if (resources.coins < structure.cost.coins || 
        resources.wood < structure.cost.wood || 
        resources.stone < structure.cost.stone) {
      addLogMessage("Recursos insuficientes para construir.", "❌");
      return;
    }
    
    // Place structure
    updateTile({
      ...tile,
      structure: selected.key as any,
    });
    
    // Deduct resources
    updateResources({
      coins: resources.coins - structure.cost.coins,
      wood: resources.wood - structure.cost.wood,
      stone: resources.stone - structure.cost.stone
    });
    
    addLogMessage(`${structure.emoji} ${structure.name} construído com sucesso!`, "🏗️");
    setSelected(null);
    
    return;
  }
  
  // Handle field placement
  if (selected.type === 'field') {
    const field = fieldMap[selected.key];
    
    // Check if tile is empty
    if (tile.resource || tile.structure || tile.type) {
      addLogMessage("Este local já está ocupado.", "⚠️");
      return;
    }
    
    // Check if player has enough coins
    if (resources.coins < field.cost.coins) {
      addLogMessage("Moedas insuficientes para criar o campo.", "❌");
      return;
    }
    
    // Place field
    updateTile({
      ...tile,
      type: 'field',
      fieldType: selected.key as any
    });
    
    // Deduct coins
    updateResources({
      coins: resources.coins - field.cost.coins
    });
    
    addLogMessage(`${field.emoji || '🌱'} ${field.name} criado com sucesso!`, "🌱");
    setSelected(null);
    
    return;
  }
  
  // Handle planting seeds
  if (selected.type === 'seed') {
    const seedType = selected.key as SeedType;
    const seed = seedMap[seedType];
    
    // Check if tile is a plantio field
    if (tile.type !== 'field' || tile.fieldType !== 'plantio') {
      addLogMessage("Você só pode plantar em um Campo de Plantio.", "⚠️");
      return;
    }
    
    // Check if field is already planted
    if (tile.planted) {
      addLogMessage("Este campo já está plantado.", "⚠️");
      return;
    }
    
    // Check if player has seeds
    if (resources.seeds[seedType] <= 0) {
      addLogMessage(`Você não tem sementes de ${seed.emoji}.`, "❌");
      return;
    }
    
    // Plant seed
    updateTile({
      ...tile,
      planted: seedType,
      growthStage: 0,
      harvestable: false
    });
    
    // Deduct seed
    const updatedSeeds = { ...resources.seeds };
    updatedSeeds[seedType] -= 1;
    
    updateResources({
      seeds: updatedSeeds
    });
    
    addLogMessage(`${seed.emoji} Sementes de ${seedType} plantadas com sucesso!`, "🌱");
    setSelected(null);
    
    return;
  }
}

// Buy structure
export function buyStructure(key: string) {
  const { structureMap, resources, updateResources, addLogMessage, setSelected } = getState();
  
  const structure = structureMap[key];
  
  // Check if player has enough resources
  if (resources.coins < structure.cost.coins) {
    addLogMessage("Moedas insuficientes para comprar esta estrutura.", "❌");
    return;
  }
  
  setSelected({ type: 'structure', key });
  addLogMessage(`Selecione um local para construir ${structure.name}.`, "🏗️");
}

// Buy field
export function buyField(key: string) {
  const { fieldMap, resources, updateResources, addLogMessage, setSelected } = getState();
  
  const field = fieldMap[key];
  
  // Check if player has enough coins
  if (resources.coins < field.cost.coins) {
    addLogMessage("Moedas insuficientes para comprar este campo.", "❌");
    return;
  }
  
  setSelected({ type: 'field', key });
  addLogMessage(`Selecione um local para criar ${field.name}.`, "🌱");
}

// Buy seeds
export function buySeed(key: string) {
  const { seedMap, resources, updateResources, addLogMessage } = getState();
  
  const seed = seedMap[key as SeedType];
  
  // Check if player has enough coins
  if (resources.coins < seed.cost) {
    addLogMessage("Moedas insuficientes para comprar estas sementes.", "❌");
    return;
  }
  
  // Buy 10 seeds at once
  const updatedSeeds = { ...resources.seeds };
  updatedSeeds[key as SeedType] += 10;
  
  updateResources({
    coins: resources.coins - seed.cost,
    seeds: updatedSeeds
  });
  
  addLogMessage(`Comprou 10 sementes ${seed.emoji}.`, "🛒");
}

// Sell resource
export function sellResource(resource: 'wood' | 'stone') {
  const { resources, updateResources, addLogMessage } = getState();
  
  const prices = {
    wood: 5,
    stone: 8
  };
  
  // Check if player has the resource
  if (resources[resource] <= 0) {
    addLogMessage(`Você não tem ${resource === 'wood' ? 'madeira' : 'pedra'} para vender.`, "❌");
    return;
  }
  
  // Sell one unit
  updateResources({
    coins: resources.coins + prices[resource],
    [resource]: resources[resource] - 1
  });
  
  const emoji = resource === 'wood' ? '🪵' : '🪨';
  addLogMessage(`Vendeu 1 ${emoji} por ${prices[resource]} moedas.`, "💰");
}

// Sell crop
export function sellCrop(crop: string) {
  const { resources, seedMap, updateResources, addLogMessage } = getState();
  
  // Check if player has the crop
  if (resources.crops[crop as SeedType] <= 0) {
    addLogMessage(`Você não tem colheitas de ${seedMap[crop as SeedType].emoji} para vender.`, "❌");
    return;
  }
  
  // Calculate price (2x the seed cost)
  const price = seedMap[crop as SeedType].cost * 2;
  
  // Sell one unit
  const updatedCrops = { ...resources.crops };
  updatedCrops[crop as SeedType] -= 1;
  
  updateResources({
    coins: resources.coins + price,
    crops: updatedCrops
  });
  
  addLogMessage(`Vendeu 1 ${seedMap[crop as SeedType].emoji} por ${price} moedas.`, "💰");
}

// Helper to get emoji for resource tile
function getTileEmoji(tile: GridTile): string {
  if (tile.resource === 'tree') return '🌲';
  if (tile.resource === 'bigTree') return '🌳';
  if (tile.resource === 'rock') return '🪨';
  return '';
}

// Game tick - to be called by a timer for game logic updates
export function gameTick() {
  updateGrowth();
  updateAgents();
}

// Update plant growth
function updateGrowth() {
  const { gridTiles, seedMap, updateTile } = getState();
  
  gridTiles.forEach(tile => {
    if (tile.type === 'field' && tile.fieldType === 'plantio' && tile.planted && tile.growthStage !== undefined && tile.growthStage < 100) {
      // Increase growth by a small amount each tick
      const newGrowthStage = Math.min(100, tile.growthStage + 1);
      
      updateTile({
        ...tile,
        growthStage: newGrowthStage,
        harvestable: newGrowthStage >= 100
      });
      
      // If fully grown, log it
      if (newGrowthStage >= 100 && tile.growthStage < 100) {
        const { addLogMessage } = getState();
        addLogMessage(`${seedMap[tile.planted].emoji} Colheita de ${tile.planted} está pronta!`, "🌾");
      }
    }
  });
}

// Update agent actions
function updateAgents() {
  updateLumberjack();
  updateMiner();
}

// Update lumberjack agent
function updateLumberjack() {
  const { agents, gridTiles, updateAgent, updateResources, resources, addLogMessage } = getState();
  const lumber = agents.lumber;
  
  // If idle, find a tree to cut
  if (lumber.state === 'idle') {
    const trees = gridTiles.filter(tile => 
      tile.resource === 'tree' || tile.resource === 'bigTree'
    );
    
    if (trees.length > 0) {
      // Pick a random tree
      const targetTree = trees[Math.floor(Math.random() * trees.length)];
      
      // Move to tree
      updateAgent('lumber', {
        state: 'moving',
        target: targetTree,
        // Simple "path" - just the target coordinates
        path: [{ x: targetTree.x, y: targetTree.y }]
      });
      
      addLogMessage("O lenhador está indo cortar uma árvore.", "🧑🏼‍🦰");
    }
  }
  // If moving, update position
  else if (lumber.state === 'moving' && lumber.target) {
    const targetX = lumber.target.x * 50;
    const targetY = lumber.target.y * 50;
    
    // Simple movement: move directly towards target
    let newX = lumber.x;
    let newY = lumber.y;
    
    if (lumber.x < targetX) newX += 5;
    else if (lumber.x > targetX) newX -= 5;
    
    if (lumber.y < targetY) newY += 5;
    else if (lumber.y > targetY) newY -= 5;
    
    // Check if arrived at target
    const arrived = Math.abs(newX - targetX) < 5 && Math.abs(newY - targetY) < 5;
    
    if (arrived) {
      updateAgent('lumber', {
        x: targetX,
        y: targetY,
        state: 'working',
        timer: 0
      });
      
      addLogMessage("O lenhador está cortando madeira.", "🧑🏼‍🦰");
    } else {
      updateAgent('lumber', {
        x: newX,
        y: newY
      });
    }
  }
  // If working, update progress
  else if (lumber.state === 'working' && lumber.target) {
    const newTimer = lumber.timer + 1;
    
    // Working takes 50 ticks
    if (newTimer >= 50) {
      // Remove the tree and add wood
      const targetTile = gridTiles.find(
        tile => tile.x === lumber.target?.x && tile.y === lumber.target?.y
      );
      
      if (targetTile && (targetTile.resource === 'tree' || targetTile.resource === 'bigTree')) {
        const { updateTile } = getState();
        
        // Clear the resource
        updateTile({
          ...targetTile,
          resource: undefined
        });
        
        // Add wood based on tree type
        const woodAmount = targetTile.resource === 'bigTree' ? 3 : 1;
        
        updateResources({
          wood: resources.wood + woodAmount
        });
        
        addLogMessage(`O lenhador coletou ${woodAmount} madeiras.`, "🪵");
      }
      
      // Return to idle state
      updateAgent('lumber', {
        state: 'idle',
        target: null,
        timer: 0,
        path: []
      });
    } else {
      updateAgent('lumber', {
        timer: newTimer
      });
    }
  }
}

// Update miner agent
function updateMiner() {
  const { agents, gridTiles, updateAgent, updateResources, resources, addLogMessage } = getState();
  const miner = agents.miner;
  
  // If idle, find a rock to mine
  if (miner.state === 'idle') {
    const rocks = gridTiles.filter(tile => tile.resource === 'rock');
    
    if (rocks.length > 0) {
      // Pick a random rock
      const targetRock = rocks[Math.floor(Math.random() * rocks.length)];
      
      // Move to rock
      updateAgent('miner', {
        state: 'moving',
        target: targetRock,
        // Simple "path" - just the target coordinates
        path: [{ x: targetRock.x, y: targetRock.y }]
      });
      
      addLogMessage("O minerador está indo minerar uma pedra.", "👴🏼");
    }
  }
  // If moving, update position
  else if (miner.state === 'moving' && miner.target) {
    const targetX = miner.target.x * 50;
    const targetY = miner.target.y * 50;
    
    // Simple movement: move directly towards target
    let newX = miner.x;
    let newY = miner.y;
    
    if (miner.x < targetX) newX += 5;
    else if (miner.x > targetX) newX -= 5;
    
    if (miner.y < targetY) newY += 5;
    else if (miner.y > targetY) newY -= 5;
    
    // Check if arrived at target
    const arrived = Math.abs(newX - targetX) < 5 && Math.abs(newY - targetY) < 5;
    
    if (arrived) {
      updateAgent('miner', {
        x: targetX,
        y: targetY,
        state: 'working',
        timer: 0
      });
      
      addLogMessage("O minerador está extraindo pedra.", "👴🏼");
    } else {
      updateAgent('miner', {
        x: newX,
        y: newY
      });
    }
  }
  // If working, update progress
  else if (miner.state === 'working' && miner.target) {
    const newTimer = miner.timer + 1;
    
    // Working takes 70 ticks (mining is slower than woodcutting)
    if (newTimer >= 70) {
      // Remove the rock and add stone
      const targetTile = gridTiles.find(
        tile => tile.x === miner.target?.x && tile.y === miner.target?.y
      );
      
      if (targetTile && targetTile.resource === 'rock') {
        const { updateTile } = getState();
        
        // Clear the resource
        updateTile({
          ...targetTile,
          resource: undefined
        });
        
        // Add stone
        updateResources({
          stone: resources.stone + 2
        });
        
        addLogMessage("O minerador coletou 2 pedras.", "🪨");
      }
      
      // Return to idle state
      updateAgent('miner', {
        state: 'idle',
        target: null,
        timer: 0,
        path: []
      });
    } else {
      updateAgent('miner', {
        timer: newTimer
      });
    }
  }
}

// Additional function for harvesting crops
export function harvestCrop(tile: GridTile) {
  if (tile.type !== 'field' || !tile.planted || !tile.harvestable) {
    return;
  }
  
  const { resources, seedMap, updateResources, updateTile, addLogMessage } = getState();
  
  // Add to crops
  const updatedCrops = { ...resources.crops };
  updatedCrops[tile.planted] += 1;
  
  updateResources({
    crops: updatedCrops
  });
  
  // Reset field
  updateTile({
    ...tile,
    planted: undefined,
    growthStage: undefined,
    harvestable: false
  });
  
  addLogMessage(`Colheu 1 ${seedMap[tile.planted].emoji} com sucesso!`, "✂️");
}
