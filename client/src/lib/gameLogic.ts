import { GridTile, SeedType, ResourceType } from "./gameTypes";
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
  updateResourceRespawn();
  updateAgents();
}

// Update resource respawn timers
function updateResourceRespawn() {
  const { gridTiles, updateTile, addLogMessage } = getState();
  
  gridTiles.forEach(tile => {
    // Check for tiles with respawn timers
    if (tile.respawnTimer !== undefined && tile.respawnTimer > 0) {
      const newTimer = tile.respawnTimer - 1;
      
      // If timer reaches 0, respawn the resource
      if (newTimer <= 0) {
        const originalResource = getOriginalResourceType(tile.x, tile.y);
        if (originalResource) {
          updateTile({
            ...tile,
            resource: originalResource,
            respawnTimer: undefined
          });
          
          const resourceEmoji = originalResource === 'tree' ? '🌲' : 
                               originalResource === 'bigTree' ? '🌳' : '🪨';
          
          addLogMessage(`${resourceEmoji} Um recurso reapareceu no mapa!`, "✨");
        } else {
          // Clear the timer if no original resource
          updateTile({
            ...tile,
            respawnTimer: undefined
          });
        }
      } else {
        // Update the timer
        updateTile({
          ...tile,
          respawnTimer: newTimer
        });
      }
    }
  });
}

// Determine what resource originally was on a tile
// This is a placeholder - in a real game, you'd have this information 
// stored or would use a noise function to generate consistent resources
function getOriginalResourceType(x: number, y: number): ResourceType | undefined {
  // Simple pseudo-random determination based on coordinates
  const hash = (x * 31 + y * 17) % 100;
  
  if (hash < 10) return undefined; // Some tiles remain empty
  if (hash < 40) return 'tree';
  if (hash < 50) return 'bigTree';
  if (hash < 75) return 'rock';
  
  return undefined;
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
  // Update agent positions and state
  updateLumberjack();
  updateMiner();
  
  // Log agent positions for debugging
  const { agents } = getState();
  console.log(`Lumber: x=${agents.lumber.x}, y=${agents.lumber.y}, state=${agents.lumber.state}`);
  console.log(`Miner: x=${agents.miner.x}, y=${agents.miner.y}, state=${agents.miner.state}`);
}

// Get the house tile for an agent
function getHouseForAgent(agentType: 'lumber' | 'miner') {
  const { gridTiles } = getState();
  const structureType = agentType === 'lumber' ? 'lumberjackHouse' : 'minerHouse';
  return gridTiles.find(tile => tile.structure === structureType);
}

// Get the storage tile
function getStorageTile() {
  const { gridTiles } = getState();
  return gridTiles.find(tile => tile.structure === 'storage');
}

// Find nearest resource of a type
function findNearestResource(x: number, y: number, resourceType: string[]) {
  const { gridTiles } = getState();
  
  // Filter tiles with the specified resource type
  const resourceTiles = gridTiles.filter(tile => 
    tile.resource && resourceType.includes(tile.resource)
  );
  
  if (resourceTiles.length === 0) return null;
  
  // Calculate distances
  const tilesWithDistance = resourceTiles.map(tile => {
    const distance = Math.sqrt(Math.pow(tile.x - x, 2) + Math.pow(tile.y - y, 2));
    return { tile, distance };
  });
  
  // Sort by distance
  tilesWithDistance.sort((a, b) => a.distance - b.distance);
  
  // Return the nearest
  return tilesWithDistance[0].tile;
}

// Calculate simple path between two points
function calculatePath(startX: number, startY: number, endX: number, endY: number) {
  // Simple direct path for now
  return [{ x: endX, y: endY }];
}

// Update lumberjack agent
function updateLumberjack() {
  const { agents, gridTiles, updateAgent, updateResources, resources, addLogMessage } = getState();
  const lumber = agents.lumber;
  
  // Handle waiting state (initial state in house)
  if (lumber.state === 'waiting') {
    const newTimer = lumber.timer + 1;
    
    // Wait for 10 seconds (100 ticks) before leaving house
    if (newTimer >= 100) {
      updateAgent('lumber', {
        state: 'idle',
        timer: 0
      });
      addLogMessage("O lenhador saiu de casa para trabalhar.", "🧑🏼‍🦰");
    } else {
      updateAgent('lumber', {
        timer: newTimer
      });
    }
    return;
  }
  
  // Handle idle state - find a tree to cut
  if (lumber.state === 'idle') {
    const nearestTree = findNearestResource(lumber.x, lumber.y, ['tree', 'bigTree']);
    
    if (nearestTree) {
      // Set target as the tree
      updateAgent('lumber', {
        state: 'moving',
        target: nearestTree,
        path: calculatePath(lumber.x, lumber.y, nearestTree.x, nearestTree.y)
      });
      
      addLogMessage("O lenhador está indo cortar uma árvore.", "🧑🏼‍🦰");
    } else {
      // No trees available, return to house to rest
      const house = getHouseForAgent('lumber');
      if (house) {
        updateAgent('lumber', {
          state: 'returning',
          target: house,
          path: calculatePath(lumber.x, lumber.y, house.x, house.y)
        });
        addLogMessage("Sem árvores para cortar. O lenhador está voltando para casa.", "🧑🏼‍🦰");
      }
    }
  }
  
  // Handle moving state - move towards target
  else if (lumber.state === 'moving' && lumber.target) {
    // Move towards the target more slowly (move only every 15 ticks)
    const shouldMove = lumber.timer % 15 === 0;
    let newX = lumber.x;
    let newY = lumber.y;
    
    if (shouldMove) {
      if (lumber.x < lumber.target.x) newX += 1;
      else if (lumber.x > lumber.target.x) newX -= 1;
      
      if (lumber.y < lumber.target.y) newY += 1;
      else if (lumber.y > lumber.target.y) newY -= 1;
    }
    
    // Increment the timer for movement cooldown
    const newTimer = lumber.timer + 1;
    
    // Check if arrived at target
    const arrived = newX === lumber.target.x && newY === lumber.target.y;
    
    if (arrived) {
      // Start working on collecting the resource
      updateAgent('lumber', {
        x: lumber.target.x,
        y: lumber.target.y,
        state: 'working',
        timer: 0
      });
      
      addLogMessage("O lenhador está cortando madeira.", "🧑🏼‍🦰");
    } else {
      updateAgent('lumber', {
        x: newX,
        y: newY,
        timer: newTimer
      });
    }
  }
  
  // Handle working state - cut the tree
  else if (lumber.state === 'working' && lumber.target) {
    const newTimer = lumber.timer + 1;
    
    // Working takes 15 seconds (150 ticks at 10 ticks/second)
    if (newTimer >= 150) {
      // Verify the agent is on the same tile as the target
      // And the tree is still there on the current tile
      const exactMatch = lumber.x === lumber.target.x && lumber.y === lumber.target.y;
      if (!exactMatch) {
        // Agent is not exactly on the target tile, return to idle
        updateAgent('lumber', {
          state: 'idle',
          target: null,
          timer: 0,
          path: []
        });
        addLogMessage("O lenhador precisa estar exatamente no mesmo local que a árvore.", "⚠️");
        return;
      }
      
      const currentTile = gridTiles.find(
        tile => tile.x === lumber.x && tile.y === lumber.y && 
                (tile.resource === 'tree' || tile.resource === 'bigTree')
      );
      
      if (currentTile) {
        const { updateTile } = getState();
        
        // Clear the resource and set respawn timer (45 seconds = 450 ticks at 10 ticks/second)
        updateTile({
          ...currentTile,
          resource: undefined,
          respawnTimer: 450
        });
        
        // Calculate wood amount
        const woodAmount = currentTile.resource === 'bigTree' ? 3 : 1;
        
        // Now head to storage to deposit wood
        const storageTile = getStorageTile();
        if (storageTile) {
          updateAgent('lumber', {
            state: 'storing',
            target: storageTile,
            path: calculatePath(lumber.x, lumber.y, storageTile.x, storageTile.y),
            timer: 0
          });
          
          addLogMessage(`O lenhador coletou ${woodAmount} madeiras e está indo para o armazém.`, "🪵");
        } else {
          // If no storage, just update resources directly
          updateResources({
            wood: resources.wood + woodAmount
          });
          
          // Return to idle state
          updateAgent('lumber', {
            state: 'idle',
            target: null,
            timer: 0,
            path: []
          });
          
          addLogMessage(`O lenhador coletou ${woodAmount} madeiras.`, "🪵");
        }
      } else {
        // Tree is gone, return to idle
        updateAgent('lumber', {
          state: 'idle',
          target: null,
          timer: 0,
          path: []
        });
      }
    } else {
      updateAgent('lumber', {
        timer: newTimer
      });
    }
  }
  
  // Handle storing state - move to storage
  else if (lumber.state === 'storing' && lumber.target) {
    // Move towards the storage more slowly (move only every 15 ticks)
    const shouldMove = lumber.timer % 15 === 0;
    let newX = lumber.x;
    let newY = lumber.y;
    
    if (shouldMove) {
      if (lumber.x < lumber.target.x) newX += 1;
      else if (lumber.x > lumber.target.x) newX -= 1;
      
      if (lumber.y < lumber.target.y) newY += 1;
      else if (lumber.y > lumber.target.y) newY -= 1;
    }
    
    // Increment the timer for movement cooldown
    const newTimer = lumber.timer + 1;
    
    // Check if arrived at storage
    const arrived = newX === lumber.target.x && newY === lumber.target.y;
    
    if (arrived) {
      // If just arrived, start the storing timer
      if (lumber.timer < 50) {
        updateAgent('lumber', {
          x: lumber.target.x,
          y: lumber.target.y,
          timer: newTimer
        });
        return;
      }
      
      // After 5 seconds (50 ticks), store the wood
      const woodAmount = 1; // Basic wood amount, could be variable
      updateResources({
        wood: resources.wood + woodAmount
      });
      
      // Find home to return to
      const house = getHouseForAgent('lumber');
      if (house) {
        updateAgent('lumber', {
          x: lumber.target.x,
          y: lumber.target.y,
          state: 'returning',
          target: house,
          path: calculatePath(lumber.target.x, lumber.target.y, house.x, house.y),
          timer: 0
        });
        
        addLogMessage("O lenhador guardou a madeira e está retornando para casa.", "🧑🏼‍🦰");
      } else {
        // No house, go back to idle
        updateAgent('lumber', {
          x: lumber.target.x,
          y: lumber.target.y,
          state: 'idle',
          target: null,
          timer: 0,
          path: []
        });
      }
    } else {
      updateAgent('lumber', {
        x: newX,
        y: newY,
        timer: newTimer
      });
    }
  }
  
  // Handle returning state - move back to house
  else if (lumber.state === 'returning' && lumber.target) {
    // Move towards home more slowly (move only every 15 ticks)
    const shouldMove = lumber.timer % 15 === 0;
    let newX = lumber.x;
    let newY = lumber.y;
    
    if (shouldMove) {
      if (lumber.x < lumber.target.x) newX += 1;
      else if (lumber.x > lumber.target.x) newX -= 1;
      
      if (lumber.y < lumber.target.y) newY += 1;
      else if (lumber.y > lumber.target.y) newY -= 1;
    }
    
    // Increment the timer for movement cooldown
    const newTimer = lumber.timer + 1;
    
    // Check if arrived at house
    const arrived = newX === lumber.target.x && newY === lumber.target.y;
    
    if (arrived) {
      // Rest in the house
      updateAgent('lumber', {
        x: lumber.target.x,
        y: lumber.target.y,
        state: 'resting',
        target: null,
        timer: 0
      });
      
      addLogMessage("O lenhador chegou em casa e está descansando.", "🧑🏼‍🦰");
    } else {
      updateAgent('lumber', {
        x: newX,
        y: newY,
        timer: newTimer
      });
    }
  }
  
  // Handle resting state - rest in house for a while
  else if (lumber.state === 'resting') {
    const newTimer = lumber.timer + 1;
    
    // Rest for 30 ticks
    if (newTimer >= 30) {
      updateAgent('lumber', {
        state: 'idle',
        timer: 0
      });
      
      addLogMessage("O lenhador terminou de descansar e voltou ao trabalho.", "🧑🏼‍🦰");
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
  
  // Handle waiting state (initial state in house)
  if (miner.state === 'waiting') {
    const newTimer = miner.timer + 1;
    
    // Wait for 10 seconds (100 ticks) before leaving house
    if (newTimer >= 100) {
      updateAgent('miner', {
        state: 'idle',
        timer: 0
      });
      addLogMessage("O minerador saiu de casa para trabalhar.", "👴🏼");
    } else {
      updateAgent('miner', {
        timer: newTimer
      });
    }
    return;
  }
  
  // Handle idle state - find a rock to mine
  if (miner.state === 'idle') {
    const nearestRock = findNearestResource(miner.x, miner.y, ['rock']);
    
    if (nearestRock) {
      // Set target as the rock
      updateAgent('miner', {
        state: 'moving',
        target: nearestRock,
        path: calculatePath(miner.x, miner.y, nearestRock.x, nearestRock.y)
      });
      
      addLogMessage("O minerador está indo minerar uma pedra.", "👴🏼");
    } else {
      // No rocks available, return to house to rest
      const house = getHouseForAgent('miner');
      if (house) {
        updateAgent('miner', {
          state: 'returning',
          target: house,
          path: calculatePath(miner.x, miner.y, house.x, house.y)
        });
        addLogMessage("Sem pedras para minerar. O minerador está voltando para casa.", "👴🏼");
      }
    }
  }
  
  // Handle moving state - move towards target
  else if (miner.state === 'moving' && miner.target) {
    // Move towards the target more slowly (move only every 15 ticks)
    const shouldMove = miner.timer % 15 === 0;
    let newX = miner.x;
    let newY = miner.y;
    
    if (shouldMove) {
      if (miner.x < miner.target.x) newX += 1;
      else if (miner.x > miner.target.x) newX -= 1;
      
      if (miner.y < miner.target.y) newY += 1;
      else if (miner.y > miner.target.y) newY -= 1;
    }
    
    // Increment the timer for movement cooldown
    const newTimer = miner.timer + 1;
    
    // Check if arrived at target
    const arrived = newX === miner.target.x && newY === miner.target.y;
    
    if (arrived) {
      // Start working on collecting the resource
      updateAgent('miner', {
        x: miner.target.x,
        y: miner.target.y,
        state: 'working',
        timer: 0
      });
      
      addLogMessage("O minerador está extraindo pedra.", "👴🏼");
    } else {
      updateAgent('miner', {
        x: newX,
        y: newY,
        timer: newTimer
      });
    }
  }
  
  // Handle working state - mine the rock
  else if (miner.state === 'working' && miner.target) {
    const newTimer = miner.timer + 1;
    
    // Working takes 15 seconds (150 ticks at 10 ticks/second)
    if (newTimer >= 150) {
      // Verify the agent is on the same tile as the target
      // And the rock is still there on the current tile
      const exactMatch = miner.x === miner.target.x && miner.y === miner.target.y;
      if (!exactMatch) {
        // Agent is not exactly on the target tile, return to idle
        updateAgent('miner', {
          state: 'idle',
          target: null,
          timer: 0,
          path: []
        });
        addLogMessage("O minerador precisa estar exatamente no mesmo local que a pedra.", "⚠️");
        return;
      }
      
      const currentTile = gridTiles.find(
        tile => tile.x === miner.x && tile.y === miner.y && tile.resource === 'rock'
      );
      
      if (currentTile) {
        const { updateTile } = getState();
        
        // Clear the resource and set respawn timer (45 seconds = 450 ticks at 10 ticks/second)
        updateTile({
          ...currentTile,
          resource: undefined,
          respawnTimer: 450
        });
        
        // Calculate stone amount
        const stoneAmount = 2;
        
        // Now head to storage to deposit stone
        const storageTile = getStorageTile();
        if (storageTile) {
          updateAgent('miner', {
            state: 'storing',
            target: storageTile,
            path: calculatePath(miner.x, miner.y, storageTile.x, storageTile.y),
            timer: 0
          });
          
          addLogMessage(`O minerador coletou ${stoneAmount} pedras e está indo para o armazém.`, "🪨");
        } else {
          // If no storage, just update resources directly
          updateResources({
            stone: resources.stone + stoneAmount
          });
          
          // Return to idle state
          updateAgent('miner', {
            state: 'idle',
            target: null,
            timer: 0,
            path: []
          });
          
          addLogMessage(`O minerador coletou ${stoneAmount} pedras.`, "🪨");
        }
      } else {
        // Rock is gone, return to idle
        updateAgent('miner', {
          state: 'idle',
          target: null,
          timer: 0,
          path: []
        });
      }
    } else {
      updateAgent('miner', {
        timer: newTimer
      });
    }
  }
  
  // Handle storing state - move to storage
  else if (miner.state === 'storing' && miner.target) {
    // Move towards the storage more slowly (move only every 15 ticks)
    const shouldMove = miner.timer % 15 === 0;
    let newX = miner.x;
    let newY = miner.y;
    
    if (shouldMove) {
      if (miner.x < miner.target.x) newX += 1;
      else if (miner.x > miner.target.x) newX -= 1;
      
      if (miner.y < miner.target.y) newY += 1;
      else if (miner.y > miner.target.y) newY -= 1;
    }
    
    // Increment the timer for movement cooldown
    const newTimer = miner.timer + 1;
    
    // Check if arrived at storage
    const arrived = newX === miner.target.x && newY === miner.target.y;
    
    if (arrived) {
      // If just arrived, start the storing timer
      if (miner.timer < 50) {
        updateAgent('miner', {
          x: miner.target.x,
          y: miner.target.y,
          timer: newTimer
        });
        return;
      }
      
      // After 5 seconds (50 ticks), store the stone
      const stoneAmount = 2; // Basic stone amount
      updateResources({
        stone: resources.stone + stoneAmount
      });
      
      // Find home to return to
      const house = getHouseForAgent('miner');
      if (house) {
        updateAgent('miner', {
          x: miner.target.x,
          y: miner.target.y,
          state: 'returning',
          target: house,
          path: calculatePath(miner.target.x, miner.target.y, house.x, house.y),
          timer: 0
        });
        
        addLogMessage("O minerador guardou as pedras e está retornando para casa.", "👴🏼");
      } else {
        // No house, go back to idle
        updateAgent('miner', {
          x: miner.target.x,
          y: miner.target.y,
          state: 'idle',
          target: null,
          timer: 0,
          path: []
        });
      }
    } else {
      updateAgent('miner', {
        x: newX,
        y: newY,
        timer: newTimer
      });
    }
  }
  
  // Handle returning state - move back to house
  else if (miner.state === 'returning' && miner.target) {
    // Move towards home more slowly (move only every 15 ticks)
    const shouldMove = miner.timer % 15 === 0;
    let newX = miner.x;
    let newY = miner.y;
    
    if (shouldMove) {
      if (miner.x < miner.target.x) newX += 1;
      else if (miner.x > miner.target.x) newX -= 1;
      
      if (miner.y < miner.target.y) newY += 1;
      else if (miner.y > miner.target.y) newY -= 1;
    }
    
    // Increment the timer for movement cooldown
    const newTimer = miner.timer + 1;
    
    // Check if arrived at house
    const arrived = newX === miner.target.x && newY === miner.target.y;
    
    if (arrived) {
      // Rest in the house
      updateAgent('miner', {
        x: miner.target.x,
        y: miner.target.y,
        state: 'resting',
        target: null,
        timer: 0
      });
      
      addLogMessage("O minerador chegou em casa e está descansando.", "👴🏼");
    } else {
      updateAgent('miner', {
        x: newX,
        y: newY,
        timer: newTimer
      });
    }
  }
  
  // Handle resting state - rest in house for a while
  else if (miner.state === 'resting') {
    const newTimer = miner.timer + 1;
    
    // Rest for 30 ticks
    if (newTimer >= 30) {
      updateAgent('miner', {
        state: 'idle',
        timer: 0
      });
      
      addLogMessage("O minerador terminou de descansar e voltou ao trabalho.", "👴🏼");
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
