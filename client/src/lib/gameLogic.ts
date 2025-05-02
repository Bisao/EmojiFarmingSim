import { GridTile, SeedType, ResourceType } from "./gameTypes";
import { useGameStateContext } from "./gameState";

// Create a state instance to be used by game logic functions
let gameStateInstance: ReturnType<typeof useGameStateContext> | null = null;

// Function to set the game state instance from a component
export function setGameStateInstance(
  instance: ReturnType<typeof useGameStateContext>,
) {
  gameStateInstance = instance;
}

// Error handling utilities
function handleError(error: Error, context: string) {
  console.error(`Error in ${context}:`, error);
  getState().addLogMessage(`Erro: ${error.message}`, "⚠️");
}

// Wrap critical functions with error handling

// Performance monitoring
const perfMetrics = {
  pathfinding: 0,
  stateUpdates: 0,
  resourceLookups: 0,
};

function logPerformance() {
  console.debug("Performance metrics:", perfMetrics);
}

// Reset metrics every minute
setInterval(() => {
  Object.keys(perfMetrics).forEach(
    (key) => (perfMetrics[key as keyof typeof perfMetrics] = 0),
  );
}, 60000);

function safeUpdateAgent(type: string, update: Partial<Agent>) {
  try {
    getState().updateAgent(type, update);
  } catch (error) {
    handleError(error as Error, "updateAgent");
  }
}

// Get access to game state and its methods
const getState = () => {
  if (!gameStateInstance) {
    throw new Error(
      "Game state instance not set. Call setGameStateInstance first.",
    );
  }
  return gameStateInstance;
};

// Helper function to determine if we should show NPC messages
// Only show messages when agents are working or storing resources
function shouldShowNpcMessage(agentState: string): boolean {
  return agentState === "working" || agentState === "storing";
}

// Handle tile click
export function handleTileClick(tile: GridTile) {
  const {
    selected,
    setSelected,
    resources,
    structureMap,
    fieldMap,
    seedMap,
    addLogMessage,
    updateResources,
    updateTile,
  } = getState();

  // If nothing is selected, just show info about the tile
  if (!selected) {
    if (tile.resource) {
      addLogMessage(`Recurso: ${getTileEmoji(tile)}`, "");
    } else if (tile.structure === "waterWell" && tile.waterWell) {
      addLogMessage(
        `Poço de água: ${tile.waterWell.buckets}/${tile.waterWell.maxBuckets} baldes de água disponíveis`,
        "💧",
      );
    } else if (tile.structure) {
      addLogMessage(
        `Estrutura: ${structureMap[tile.structure].emoji} ${structureMap[tile.structure].name}`,
        "",
      );
    } else if (tile.type === "field") {
      const fieldInfo = fieldMap[tile.fieldType || "plantio"];
      addLogMessage(`Campo: ${fieldInfo.emoji || "🌱"} ${fieldInfo.name}`, "");
    } else {
      addLogMessage("Selecione algo para construir ou plantar.", "");
    }
    return;
  }

  // Handle structure placement
  if (selected.type === "structure") {
    const structure = structureMap[selected.key];

    // Check if tile is empty
    if (tile.resource || tile.structure || tile.type) {
      addLogMessage("Este local já está ocupado. Escolha outro local.", "⚠️");
      return;
    }

    // Check if player has enough resources
    if (
      resources.coins < structure.cost.coins ||
      resources.wood < structure.cost.wood ||
      resources.stone < structure.cost.stone
    ) {
      addLogMessage("Recursos insuficientes para construir.", "❌");
      addLogMessage(
        `Necessário: ${structure.cost.wood} madeira, ${structure.cost.stone} pedra, ${structure.cost.coins} moedas`,
        "📋",
      );
      return;
    }

    // Place structure
    let updatedTile = {
      ...tile,
      structure: selected.key as any,
    };

    if (selected.key === "waterWell") {
      updatedTile = initializeWaterWell(updatedTile);
    }

    updateTile(updatedTile);

    // Deduct resources
    updateResources({
      coins: resources.coins - structure.cost.coins,
      wood: resources.wood - structure.cost.wood,
      stone: resources.stone - structure.cost.stone,
    });

    // Create an NPC if this is a house
    if (
      selected.key === "lumberjackHouse" ||
      selected.key === "minerHouse" ||
      selected.key === "farmerHouse"
    ) {
      createNewAgent(selected.key, tile);
    }

    addLogMessage(
      `${structure.emoji} ${structure.name} construído com sucesso!`,
      "🏗️",
    );
    setSelected(null);

    return;
  }

  // Handle field placement
  if (selected.type === "field") {
    const field = fieldMap[selected.key];

    // Check if tile is empty
    if (tile.resource || tile.structure || tile.type) {
      addLogMessage("Este local já está ocupado. Escolha outro local.", "⚠️");
      return;
    }

    // Check if player has enough coins
    if (resources.coins < field.cost.coins) {
      addLogMessage("Moedas insuficientes para criar o campo.", "❌");
      addLogMessage(`Necessário: ${field.cost.coins} moedas.`, "📋");
      return;
    }

    // Place field with construction emoji 🚧 as specified
    updateTile({
      ...tile,
      type: "field",
      fieldType: selected.key as any,
      fieldState: "normal",
      constructionEmoji: "🚧", // Add construction emoji when field is first placed
    });

    // Deduct coins
    updateResources({
      coins: resources.coins - field.cost.coins,
    });

    addLogMessage(
      `${field.emoji || "🌱"} ${field.name} criado com sucesso!`,
      "🌱",
    );
    setSelected(null);

    return;
  }

  // Handle planting seeds
  if (selected.type === "seed") {
    const seedType = selected.key as SeedType;
    const seed = seedMap[seedType];

    // Check if tile is a plantio field
    if (tile.type !== "field" || tile.fieldType !== "plantio") {
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
      harvestable: false,
    });

    // Deduct seed
    const updatedSeeds = { ...resources.seeds };
    updatedSeeds[seedType] -= 1;

    updateResources({
      seeds: updatedSeeds,
    });

    addLogMessage(
      `${seed.emoji} Sementes de ${seedType} plantadas com sucesso!`,
      "🌱",
    );
    setSelected(null);

    return;
  }
}

// Helper function to get random respawn time between 2-4 minutes
function getRandomRespawnTime() {
  // 2-4 minutes (1200-2400 ticks at 10 ticks/second)
  return Math.floor(Math.random() * (2400 - 1200 + 1)) + 1200;
}

// Buy structure
export function buyStructure(key: string) {
  const {
    structureMap,
    resources,
    updateResources,
    addLogMessage,
    setSelected,
  } = getState();

  const structure = structureMap[key];

  // Check if player has enough resources
  if (
    resources.coins < structure.cost.coins ||
    resources.wood < structure.cost.wood ||
    resources.stone < structure.cost.stone
  ) {
    addLogMessage("Moedas insuficientes para comprar esta estrutura.", "❌");
    addLogMessage(
      `Necessário: ${structure.cost.wood} madeira, ${structure.cost.stone} pedra, ${structure.cost.coins} moedas.`,
      "📋",
    );
    return;
  }

  setSelected({ type: "structure", key });
  addLogMessage(`Selecione um local para construir ${structure.name}.`, "🏗️");
  addLogMessage(
    `Necessário: ${structure.cost.wood} madeira, ${structure.cost.stone} pedra, ${structure.cost.coins} moedas.`,
    "📋",
  );
}

// Buy field
export function buyField(key: string) {
  const { fieldMap, resources, updateResources, addLogMessage, setSelected } =
    getState();

  const field = fieldMap[key];

  // Check if player has enough coins
  if (resources.coins < field.cost.coins) {
    addLogMessage("Moedas insuficientes para comprar este campo.", "❌");
    addLogMessage(`Necessário: ${field.cost.coins} moedas.`, "📋");
    return;
  }

  setSelected({ type: "field", key });
  addLogMessage(`Selecione um local para criar ${field.name}.`, "🌱");
  addLogMessage(`Necessário: ${field.cost.coins} moedas.`, "📋");
}

// Buy seeds
export function buySeed(key: string) {
  const { seedMap, resources, updateResources, addLogMessage, gridTiles } = getState();

  // Check if storage exists
  const storage = gridTiles.find(tile => tile.structure === "storage");
  if (!storage) {
    addLogMessage("Você precisa construir um armazém primeiro!", "⚠️");
    return;
  }

  const seed = seedMap[key as SeedType];

  // Check if player has enough coins
  if (resources.coins < seed.cost) {
    addLogMessage("Moedas insuficientes para comprar estas sementes.", "❌");
    addLogMessage(`Necessário: ${seed.cost} moedas.`, "📋");
    return;
  }

  // Buy 10 seeds at once
  const updatedSeeds = { ...resources.seeds };
  updatedSeeds[key as SeedType] += 10;

  updateResources({
    coins: resources.coins - seed.cost,
    seeds: updatedSeeds,
  });

  addLogMessage(`Comprou 10 sementes ${seed.emoji}.`, "🛒");
}

// Sell resource
export function sellResource(resource: "wood" | "stone") {
  const { resources, updateResources, addLogMessage, gridTiles } = getState();

  // Check if storage exists
  const storage = gridTiles.find(tile => tile.structure === "storage");
  if (!storage) {
    addLogMessage("Você precisa de um armazém para vender recursos!", "⚠️");
    return;
  }

  const prices = {
    wood: 5,
    stone: 8,
  };

  // Check if player has at least 10 of the resource
  if (resources[resource] < 10) {
    addLogMessage(
      `Você precisa de pelo menos 10 ${resource === "wood" ? "madeiras" : "pedras"} para vender.`,
      "❌",
    );
    return;
  }

  // Sell batch of 10 units
  const batchPrice = prices[resource] * 10;
  updateResources({
    coins: resources.coins + batchPrice,
    [resource]: resources[resource] - 10,
  });

  const emoji = resource === "wood" ? "🪵" : "🪨";
  addLogMessage(`Vendeu 10 ${emoji} por ${batchPrice} moedas.`, "💰");
}

// Sell crop
export function sellCrop(crop: string) {
  const { resources, seedMap, updateResources, addLogMessage, gridTiles } = getState();

  // Check if storage exists
  const storage = gridTiles.find(tile => tile.structure === "storage");
  if (!storage) {
    addLogMessage("Você precisa de um armazém para vender colheitas!", "⚠️");
    return;
  }

  // Check if player has at least 10 of the crop
  if (resources.crops[crop as SeedType] < 10) {
    addLogMessage(
      `Você precisa de pelo menos 10 ${seedMap[crop as SeedType].emoji} para vender.`,
      "❌",
    );
    return;
  }

  // Calculate price (2x the seed cost) for 10 units
  const batchPrice = seedMap[crop as SeedType].cost * 2 * 10;

  // Sell 10 units
  const updatedCrops = { ...resources.crops };
  updatedCrops[crop as SeedType] -= 10;

  updateResources({
    coins: resources.coins + batchPrice,
    crops: updatedCrops,
  });

  addLogMessage(
    `Vendeu 10 ${seedMap[crop as SeedType].emoji} por ${batchPrice} moedas.`,
    "💰",
  );
}

// Helper to get emoji for resource tile
function getTileEmoji(tile: GridTile): string {
  if (tile.resource === "tree") return "🌲";
  if (tile.resource === "bigTree") return "🌳";
  if (tile.resource === "rock") return "🪨";
  return "";
}

// Game tick - to be called by a timer for game logic updates
export function gameTick() {
  updateGrowth();
  updateResourceRespawn();
  updateAgents();
  updateWaterWells();
  updateFarmer();
  checkMissingStructures();
}

// Update resource respawn timers
function updateResourceRespawn() {
  const { gridTiles, updateTile, addLogMessage } = getState();

  gridTiles.forEach((tile) => {
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
            respawnTimer: undefined,
            resourceEmoji: originalResource === 'rock' ? '🪨' : '🪵',
            resourceScale: '40%'
          });

          const resourceEmoji =
            originalResource === "tree"
              ? "🌲"
              : originalResource === "bigTree"
                ? "🌳"
                : "🪨";

          addLogMessage(
            `${resourceEmoji} Um recurso reapareceu no mapa!`,
            "✨",
          );
        } else {
          // Clear the timer if no original resource
          updateTile({
            ...tile,
            respawnTimer: undefined,
          });
        }
      } else {
        // Update the timer
        updateTile({
          ...tile,
          respawnTimer: newTimer,
        });
      }
    }
  });
}

// Determine what resource originally was on a tile
// This is a placeholder - in a real game, you'd have this information
// stored or would use a noise function to generate consistent resources
function getOriginalResourceType(
  x: number,
  y: number,
): ResourceType | undefined {
  // Simple pseudo-random determination based on coordinates
  const hash = (x * 31 + y * 17) % 100;

  if (hash < 10) return undefined; // Some tiles remain empty
  if (hash < 40) return "tree";
  if (hash < 50) return "bigTree";
  if (hash < 75) return "rock";

  return undefined;
}

// Update plant growth and water timers
function updateGrowth() {
  const { gridTiles, seedMap, updateTile } = getState();

  gridTiles.forEach((tile) => {
    // Skip tiles that are not fields
    if (tile.type !== "field" || tile.fieldType !== "plantio") {
      return;
    }

    // Handle water timer for watered fields
    if (tile.fieldState === "watered" && tile.waterTimer) {
      const newWaterTimer = tile.waterTimer - 1;

      if (newWaterTimer <= 0) {
        // Water has dried up, field returns to prepared state
        updateTile({
          ...tile,
          fieldState: "prepared",
          waterTimer: undefined,
        });

        const { addLogMessage } = getState();
        addLogMessage(`A água secou em um campo.`, "💧");
      } else {
        // Update water timer
        updateTile({
          ...tile,
          waterTimer: newWaterTimer,
        });
      }
    }

    // Handle plant growth for fields with plants
    if (
      tile.planted &&
      tile.growthStage !== undefined &&
      tile.growthStage < 100
    ) {
      // Define growth stages and their timings
      // Stage 1: Seedling (🌱) - 0-35% - 35 seconds
      // Stage 2: Medium (🌿) - 35-100% - 20 seconds
      // Total growth time: 55 seconds

      let growthIncrement;
      let growthMessage = "";
      let previousStage = "";
      let currentStage = "";

      // Determine current growth stage for messaging
      if (tile.growthStage < 35) {
        previousStage = "seedling";
        growthIncrement = 0.1; // 0.1% per tick, reaches 35% in 350 ticks (35 seconds)
      } else {
        previousStage = "growing";
        growthIncrement = 0.325; // 0.325% per tick, reaches 100% from 35% in 200 ticks (20 seconds)
      }

      const newGrowthStage = Math.min(100, tile.growthStage + growthIncrement);

      // Determine if we're crossing a growth threshold
      if (tile.growthStage < 35 && newGrowthStage >= 35) {
        currentStage = "growing";
        growthMessage = `${seedMap[tile.planted].emoji} A planta está crescendo bem!`;
      } else if (newGrowthStage >= 100 && tile.growthStage < 100) {
        currentStage = "harvestable";
        growthMessage = `${seedMap[tile.planted].emoji} Colheita de ${tile.planted} está pronta!`;
      }

      // Update the tile with new growth stage
      updateTile({
        ...tile,
        growthStage: newGrowthStage,
        harvestable: newGrowthStage >= 100,
      });

      // Log growth stage transition if applicable
      if (growthMessage) {
        const { addLogMessage } = getState();
        addLogMessage(growthMessage, "🌾");
      }
    }
  });
}

// Update agent actions
function updateAgents() {
  // Update agent positions and state
  updateLumberjack();
  updateMiner();

  // We no longer log the agent positions and states in the console
}

// Get the house tile for an agent
// Get all houses for a specific agent type
function getAllHousesForAgent(
  agentType: "lumber" | "miner" | "farmer",
): GridTile[] {
  const { gridTiles } = getState();
  let structureType: string;

  if (agentType === "lumber") {
    structureType = "lumberjackHouse";
  } else if (agentType === "miner") {
    structureType = "minerHouse";
  } else {
    structureType = "farmerHouse";
  }

  return gridTiles.filter((tile) => tile.structure === structureType);
}

// Get a single house for an agent (typically used for returning home)
function getHouseForAgent(
  agentType: "lumber" | "miner" | "farmer",
  targetX?: number,
  targetY?: number,
) {
  const houses = getAllHousesForAgent(agentType);

  // If no houses, return undefined
  if (houses.length === 0) {
    return undefined;
  }

  // If target coordinates are provided, return the closest house to the target
  if (targetX !== undefined && targetY !== undefined) {
    // Calculate distance from each house to the target
    const housesWithDistance = houses.map((house) => {
      const dx = house.x - targetX;
      const dy = house.y - targetY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return { house, distance };
    });

    // Sort by distance (ascending)
    housesWithDistance.sort((a, b) => a.distance - b.distance);

    // Return the closest house
    return housesWithDistance[0].house;
  }

  // If no target provided, return the first house
  return houses[0];
}

// Track farmer IDs for each house
let nextFarmerID = 1;
const farmerHouses = new Map(); // Maps house coordinates to farmer IDs

// Create a new agent when a house is built
export function createNewAgent(structureType: string, tile: GridTile) {
  const { updateAgent, addLogMessage } = getState();

  let agentType: "lumber" | "miner" | "farmer";
  let emoji: string;

  if (structureType === "lumberjackHouse") {
    agentType = "lumber";
    emoji = "🧑🏼‍🦰";
  } else if (structureType === "minerHouse") {
    agentType = "miner";
    emoji = "👴🏼";
  } else if (structureType === "farmerHouse") {
    agentType = "farmer";
    emoji = "👨‍🌾";
    // Assign unique ID to farmer and track their house
    const farmerID = nextFarmerID++;
    farmerHouses.set(`${tile.x},${tile.y}`, farmerID);
  } else {
    return; // Not a house that spawns an agent
  }

  // Create new agent at the house location
  updateAgent(agentType, {
    x: tile.x,
    y: tile.y,
    state: "waiting",
    timer: 0,
    target: null,
    path: [],
    ...(agentType === "farmer"
      ? {
          farmerID: farmerHouses.get(`${tile.x},${tile.y}`),
          homeX: tile.x,
          homeY: tile.y,
        }
      : {}),
  });

  if (agentType === "farmer") {
    addLogMessage(
      `Fazendeiro ${farmerHouses.get(`${tile.x},${tile.y}`)} foi contratado e está esperando em sua casa.`,
      "🏠",
    );
  } else {
    addLogMessage(
      `Um novo ${emoji} foi contratado e está esperando em sua casa.`,
      "🏠",
    );
  }
}

// Get the water well tile
function getWaterWellTile() {
  const { gridTiles } = getState();
  return gridTiles.find((tile) => tile.structure === "waterWell");
}

// Get the storage tile
function getStorageTile() {
  const { gridTiles } = getState();
  return gridTiles.find((tile) => tile.structure === "storage");
}

// Find nearest resource of a type
const resourceCache = new Map<string, GridTile>();

function findNearestResource(x: number, y: number, resourceType: string[]) {
  const cacheKey = `${x},${y},${resourceType.join(",")}`;
  if (resourceCache.has(cacheKey)) {
    return resourceCache.get(cacheKey)!;
  }

  const { gridTiles } = getState();

  // Filter tiles with the specified resource type
  const resourceTiles = gridTiles.filter(
    (tile) => tile.resource && resourceType.includes(tile.resource),
  );

  if (resourceTiles.length === 0) return null;

  // Calculate distances
  const tilesWithDistance = resourceTiles.map((tile) => {
    const distance = Math.sqrt(
      Math.pow(tile.x - x, 2) + Math.pow(tile.y - y, 2),
    );
    return { tile, distance };
  });

  // Sort by distance
  tilesWithDistance.sort((a, b) => a.distance - b.distance);

  // Return the nearest
  return tilesWithDistance[0].tile;
}

// Calculate simple path between two points
function calculatePath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) {
  const path: { x: number; y: number }[] = [];
  let currentX = startX;
  let currentY = startY;

  while (currentX !== endX || currentY !== endY) {
    if (currentX < endX) currentX++;
    else if (currentX > endX) currentX--;

    if (currentY < endY) currentY++;
    else if (currentY > endY) currentY--;

    path.push({ x: currentX, y: currentY });
  }

  return path;
}

// Update lumberjack agent
function updateLumberjack() {
  const {
    agents,
    gridTiles,
    updateAgent,
    updateResources,
    resources,
    addLogMessage,
  } = getState();
  const lumber = agents.lumber;

  // Skip if lumber agent doesn't exist yet
  if (!lumber) return;

  // Handle waiting state (initial state in house)
  if (lumber.state === "waiting") {
    const newTimer = lumber.timer + 1;

    // Check if there's a storage building
    const storage = getStorageTile();
    if (!storage) {
      updateAgent("lumber", {
        timer: newTimer,
      });
      return;
    }

    // Wait for 5 seconds (50 ticks) before leaving house
    if (newTimer >= 50) {
      updateAgent("lumber", {
        state: "idle",
        timer: 0,
      });
      // Only show important messages - state changes aren't important enough
    } else {
      updateAgent("lumber", {
        timer: newTimer,
      });
    }
    return;
  }

  // Handle idle state - find a tree to cut
  if (lumber.state === "idle") {
    const nearestTree = findNearestResource(lumber.x, lumber.y, [
      "tree",
      "bigTree",
    ]);

    if (nearestTree) {
      // Set target as the tree
      updateAgent("lumber", {
        state: "moving",
        target: nearestTree,
        path: calculatePath(lumber.x, lumber.y, nearestTree.x, nearestTree.y),
      });

      // Going to work message removed - only show messages when working or storing
    } else {
      // No trees available, return to house to rest
      const house = getHouseForAgent("lumber");
      if (house) {
        updateAgent("lumber", {
          state: "returning",
          target: house,
          path: calculatePath(lumber.x, lumber.y, house.x, house.y),
        });
        // No trees message removed - only show messages when working or storing
      }
    }
  }

  // Handle moving state - move towards target
  else if (lumber.state === "moving" && lumber.target) {
    // Move towards the target more slowly (move only every 25 ticks)
    const shouldMove = lumber.timer % 25 === 0;
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
      updateAgent("lumber", {
        x: lumber.target.x,
        y: lumber.target.y,
        state: "working",
        timer: 0,
      });

      addLogMessage("O lenhador está cortando madeira.", "🧑🏼‍🦰");
    } else {
      updateAgent("lumber", {
        x: newX,
        y: newY,
        timer: newTimer,
      });
    }
  }

  // Handle working state - cut the tree
  else if (lumber.state === "working" && lumber.target) {
    const newTimer = lumber.timer + 1;

    // Working takes 15 seconds (150 ticks at 10 ticks/second)
    if (newTimer >= 150) {
      // Verify the agent is on the same tile as the target
      // And the tree is still there on the current tile
      const exactMatch =
        lumber.x === lumber.target.x && lumber.y === lumber.target.y;
      if (!exactMatch) {
        // Agent is not exactly on the target tile, return to idle
        updateAgent("lumber", {
          state: "idle",
          target: null,
          timer: 0,
          path: [],
        });
        addLogMessage(
          "O lenhador precisa estar exatamente no mesmo local que a árvore.",
          "⚠️",
        );
        return;
      }

      const currentTile = gridTiles.find(
        (tile) =>
          tile.x === lumber.x &&
          tile.y === lumber.y &&
          (tile.resource === "tree" || tile.resource === "bigTree"),
      );

      if (currentTile) {
        const { updateTile } = getState();

        // Clear the resource and set a random respawn timer between 2-4 minutes
        updateTile({
          ...currentTile,
          resource: undefined,
          respawnTimer: getRandomRespawnTime(),
          resourceEmoji: currentTile.resource === 'rock' ? '🪨' : '🪵',
          resourceScale: '40%'
        });

        // Calculate wood amount
        const woodAmount = currentTile.resource === "bigTree" ? 3 : 1;

        // Now head to storage to deposit wood
        const storageTile = getStorageTile();
        if (storageTile) {
          updateAgent("lumber", {
            state: "storing",
            target: storageTile,
            path: calculatePath(
              lumber.x,
              lumber.y,
              storageTile.x,
              storageTile.y,
            ),
            timer: 0,
          });

          addLogMessage(
            `O lenhador coletou ${woodAmount} madeiras e está indo para o armazém.`,
            "🪵",
          );
        } else {
          // If no storage, just update resources directly
          updateResources({
            wood: resources.wood + woodAmount,
          });

          // Return to idle state
          updateAgent("lumber", {
            state: "idle",
            target: null,
            timer: 0,
            path: [],
          });

          addLogMessage(`O lenhador coletou ${woodAmount} madeiras.`, "🪵");
        }
      } else {
        // Tree is gone, return to idle
        updateAgent("lumber", {
          state: "idle",
          target: null,
          timer: 0,
          path: [],
        });
      }
    } else {
      updateAgent("lumber", {
        timer: newTimer,
      });
    }
  }

  // Handle storing state - move to storage
  else if (lumber.state === "storing" && lumber.target) {
    // Move towards the storage more slowly (move only every 25 ticks)
    const shouldMove = lumber.timer % 25 === 0;
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
      if (lumber.timer < 20) {
        // 2 seconds (20 ticks at 10 ticks/second)
        updateAgent("lumber", {
          x: lumber.target.x,
          y: lumber.target.y,
          timer: newTimer,
        });
        return;
      }

      // After 2 seconds (20 ticks), store the wood
      const woodAmount = 1; // Basic wood amount, could be variable
      updateResources({
        wood: resources.wood + woodAmount,
      });

      // After storing, look for more work rather than returning home
      updateAgent("lumber", {
        x: lumber.target.x,
        y: lumber.target.y,
        state: "idle",
        target: null,
        timer: 0,
        path: [],
      });

      addLogMessage(
        "O lenhador guardou a madeira e está procurando mais árvores.",
        "🧑🏼‍🦰",
      );
    } else {
      updateAgent("lumber", {
        x: newX,
        y: newY,
        timer: newTimer,
      });
    }
  }

  // Handle returning state - move back to house
  else if (lumber.state === "returning" && lumber.target) {
    // Move towards home more slowly (move only every 25 ticks)
    const shouldMove = lumber.timer % 25 === 0;
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
      updateAgent("lumber", {
        x: lumber.target.x,
        y: lumber.target.y,
        state: "resting",
        target: null,
        timer: 0,
      });

      // Resting message removed - only show messages when working or storing
    } else {
      updateAgent("lumber", {
        x: newX,
        y: newY,
        timer: newTimer,
      });
    }
  }

  // Handle resting state - rest in house for a while
  else if (lumber.state === "resting") {
    const newTimer = lumber.timer + 1;

    // Rest for 5 seconds (50 ticks at 10 ticks/second)
    if (newTimer >= 50) {
      updateAgent("lumber", {
        state: "idle",
        timer: 0,
      });

      // Done resting message removed - only show messages when working or storing
    } else {
      updateAgent("lumber", {
        timer: newTimer,
      });
    }
  }
}

// Update miner agent
function updateMiner() {
  const {
    agents,
    gridTiles,
    updateAgent,
    updateResources,
    resources,
    addLogMessage,
  } = getState();
  const miner = agents.miner;

  // Skip if miner agent doesn't exist yet
  if (!miner) return;

  // Handle waiting state (initial state in house)
  if (miner.state === "waiting") {
    const newTimer = miner.timer + 1;

    // Check if there's a storage building
    const storage = getStorageTile();
    if (!storage) {
      updateAgent("miner", {
        timer: newTimer,
      });
      return;
    }

    // Wait for 10 seconds (100 ticks) before leaving house
    if (newTimer >= 100) {
      updateAgent("miner", {
        state: "idle",
        timer: 0,
      });
      // Only show important messages - state changes aren't important enough
    } else {
      updateAgent("miner", {
        timer: newTimer,
      });
    }
    return;
  }

  // Handle idle state - find a rock to mine
  if (miner.state === "idle") {
    const nearestRock = findNearestResource(miner.x, miner.y, ["rock"]);

    if (nearestRock) {
      // Set target as the rock
      updateAgent("miner", {
        state: "moving",
        target: nearestRock,
        path: calculatePath(miner.x, miner.y, nearestRock.x, nearestRock.y),
      });

      // Going to work message removed - only show messages when working or storing
    } else {
      // No rocks available, return to house to rest
      const house = getHouseForAgent("miner");
      if (house) {
        updateAgent("miner", {
          state: "returning",
          target: house,
          path: calculatePath(miner.x, miner.y, house.x, house.y),
        });
        // No rocks message removed - only show messages when working or storing
      }
    }
  }

  // Handle moving state - move towards target
  else if (miner.state === "moving" && miner.target) {
    // Move towards the target more slowly (move only every 25 ticks)
    const shouldMove = miner.timer % 25 === 0;
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
      updateAgent("miner", {
        x: miner.target.x,
        y: miner.target.y,
        state: "working",
        timer: 0,
      });

      addLogMessage("O minerador está extraindo pedra.", "👴🏼");
    } else {
      updateAgent("miner", {
        x: newX,
        y: newY,
        timer: newTimer,
      });
    }
  }

  // Handle working state - mine the rock
  else if (miner.state === "working" && miner.target) {
    const newTimer = miner.timer + 1;

    // Working takes 15 seconds (150 ticks at 10 ticks/second)
    if (newTimer >= 150) {
      // Verify the agent is on the same tile as the target
      // And the rock is still there on the current tile
      const exactMatch =
        miner.x === miner.target.x && miner.y === miner.target.y;
      if (!exactMatch) {
        // Agent is not exactly on the target tile, return to idle
        updateAgent("miner", {
          state: "idle",
          target: null,
          timer: 0,
          path: [],
        });
        addLogMessage(
          "O minerador precisa estar exatamente no mesmo local que a pedra.",
          "⚠️",
        );
        return;
      }

      const currentTile = gridTiles.find(
        (tile) =>
          tile.x === miner.x && miner.y === miner.y && tile.resource === "rock",
      );

      if (currentTile) {
        const { updateTile } = getState();

        // Clear the resource and set a random respawn timer between 2-4 minutes
        updateTile({
          ...currentTile,
          resource: undefined,
          respawnTimer: getRandomRespawnTime(),
          resourceEmoji: currentTile.resource === 'rock' ? '🪨' : '🪵',
          resourceScale: '40%'
        });

        // Calculate stone amount
        const stoneAmount = 2;

        // Now head to storage to deposit stone
        const storageTile = getStorageTile();
        if (storageTile) {
          updateAgent("miner", {
            state: "storing",
            target: storageTile,
            path: calculatePath(miner.x, miner.y, storageTile.x, storageTile.y),
            timer: 0,
          });

          addLogMessage(
            `O minerador coletou ${stoneAmount} pedras e está indo para o armazém.`,
            "🪨",
          );
        } else {
          // If no storage, just update resources directly
          updateResources({
            stone: resources.stone + stoneAmount,
          });

          // Return to idle state
          updateAgent("miner", {
            state: "idle",
            target: null,
            timer: 0,
            path: [],
          });

          addLogMessage(`O minerador coletou ${stoneAmount} pedras.`, "🪨");
        }
      } else {
        // Rock is gone, return to idle
        updateAgent("miner", {
          state: "idle",
          target: null,
          timer: 0,
          path: [],
        });
      }
    } else {
      updateAgent("miner", {
        timer: newTimer,
      });
    }
  }

  // Handle storing state - move to storage
  else if (miner.state === "storing" && miner.target) {
    // Move towards the storage more slowly (move only every 25 ticks)
    const shouldMove = miner.timer % 25 === 0;
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
      if (miner.timer < 20) {
        // 2 seconds (20 ticks at 10 ticks/second)
        updateAgent("miner", {
          x: miner.target.x,
          y: miner.target.y,
          timer: newTimer,
        });
        return;
      }

      // After 2 seconds (20 ticks), store the stone
      const stoneAmount = 2; // Basic stone amount
      updateResources({
        stone: resources.stone + stoneAmount,
      });

      // After storing, look for more work rather than returning home
      updateAgent("miner", {
        x: miner.target.x,
        y: miner.target.y,
        state: "idle",
        target: null,
        timer: 0,
        path: [],
      });

      addLogMessage(
        "O minerador guardou as pedras e está procurando mais rochas.",
        "👴🏼",
      );
    } else {
      updateAgent("miner", {
        x: newX,
        y: newY,
        timer: newTimer,
      });
    }
  }

  // Handle returning state - move back to house
  else if (miner.state === "returning" && miner.target) {
    // Move towards home more slowly (move only every 25 ticks)
    const shouldMove = miner.timer % 25 === 0;
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
      updateAgent("miner", {
        x: miner.target.x,
        y: miner.target.y,
        state: "resting",
        target: null,
        timer: 0,
      });

      // Resting message removed - only show messages when working or storing
    } else {
      updateAgent("miner", {
        x: newX,
        y: newY,
        timer: newTimer,
      });
    }
  }

  // Handle resting state - rest in house for a while
  else if (miner.state === "resting") {
    const newTimer = miner.timer + 1;

    // Rest for 5 seconds (50 ticks at 10 ticks/second)
    if (newTimer >= 50) {
      updateAgent("miner", {
        state: "idle",
        timer: 0,
      });

      // Done resting message removed - only show messages when working or storing
    } else {
      updateAgent("miner", {
        timer: newTimer,
      });
    }
  }
}

// Additional function for harvesting crops
export function harvestCrop(tile: GridTile) {
  // Validate the tile has a harvestable crop
  if (tile.type !== "field" || !tile.planted || !tile.harvestable) {
    return;
  }

  const { resources, seedMap, updateResources, updateTile, addLogMessage } =
    getState();

  // Generate a random amount of crops (2-5)
  const cropAmount = Math.floor(Math.random() * 4) + 2; // 2 to 5

  // Add the crops to the player's inventory
  const updatedCrops = { ...resources.crops };
  updatedCrops[tile.planted] += cropAmount;

  // Also give a chance to get bonus seeds (40% chance)
  const seedChance = Math.random();
  const seedAmount = seedChance < 0.4 ? Math.floor(Math.random() * 2) + 1 : 0; // 1-2 seeds if lucky

  let updatedSeeds = { ...resources.seeds };
  if (seedAmount > 0) {
    updatedSeeds[tile.planted] += seedAmount;
  }

  // Update resources
  updateResources({
    crops: updatedCrops,
    seeds: seedAmount > 0 ? updatedSeeds : undefined,
  });

  // Reset field to normal state
  updateTile({
    ...tile,
    planted: undefined,
    growthStage: undefined,
    harvestable: false,
    fieldState: "normal", // Reset field state after harvest
  });

  // Log appropriate messages
  addLogMessage(
    `Colheu ${cropAmount} ${seedMap[tile.planted].emoji} com sucesso!`,
    "✂️",
  );

  if (seedAmount > 0) {
    addLogMessage(`Você também conseguiu ${seedAmount} sementes extra!`, "🌱");
  }
}

// Update farmer agent
function updateFarmer() {
  const {
    agents,
    gridTiles,
    updateAgent,
    updateResources,
    resources,
    updateTile,
    addLogMessage,
    seedMap,
  } = getState();
  const farmer = agents.farmer;

  // Skip if farmer agent doesn't exist yet
  if (!farmer) return;

  // Handle waiting state (initial state in house)
  if (farmer.state === "waiting") {
    const newTimer = farmer.timer + 1;

    // First check if there's a storage building
    const storage = getStorageTile();
    if (!storage) {
      updateAgent("farmer", {
        timer: newTimer,
      });
      return;
    }

    // Check if there are conditions for the farmer to leave the house
    // Based on requirements: only leave if there's a planting plot, selected seed, or harvestable resource

    // Check for harvestable crops (highest priority)
    const fieldToHarvest = findFieldForHarvesting();

    // Check for watered fields ready for planting if we have seeds
    const hasSeeds = Object.values(resources.seeds).some((count) => count > 0);
    const fieldToPlant = hasSeeds ? findWateredFieldForPlanting() : null;

    // Check for fields that need preparation
    const fieldToPrepare = findFieldForFarmer();

    // Only change state to idle if there's actual work to do
    if (fieldToHarvest || fieldToPlant || fieldToPrepare) {
      // There's work to do - transition to idle state to handle the work
      // Check if this farmer is the closest one to the work and hasn't been claimed
      let isClosestFarmer = true;
      let targetField = fieldToHarvest || fieldToPlant || fieldToPrepare;

      if (targetField) {
        const closestHouse = getHouseForAgent(
          "farmer",
          targetField.x,
          targetField.y,
        );
        // A farmer only works on fields closest to their house
        isClosestFarmer =
          closestHouse &&
          closestHouse.x === farmer.x &&
          closestHouse.y === farmer.y;

        // Skip if field is already being worked on by another farmer
        const otherFarmers = Object.values(agents).filter(
          (a) =>
            a !== farmer &&
            a.target &&
            a.target.x === targetField.x &&
            a.target.y === targetField.y,
        );
        if (otherFarmers.length > 0) {
          isClosestFarmer = false;
        }
      }

      if (isClosestFarmer) {
        updateAgent("farmer", {
          state: "idle",
          timer: 0,
        });
      } else {
        // Not the closest farmer, keep waiting
        updateAgent("farmer", {
          timer: newTimer,
        });
      }
    } else {
      // No work to do - continue waiting in the house
      updateAgent("farmer", {
        timer: newTimer,
      });
    }
    return;
  }

  // Handle idle state - find a field to work on or a crop to harvest
  if (farmer.state === "idle") {
    // First priority: Check for harvestable crops
    const fieldToHarvest = findFieldForHarvesting();
    if (fieldToHarvest) {
      updateAgent("farmer", {
        state: "moving",
        target: fieldToHarvest,
        path: calculatePath(
          farmer.x,
          farmer.y,
          fieldToHarvest.x,
          fieldToHarvest.y,
        ),
      });
      // Going to work message removed - only show messages when working or storing
      return;
    }

    // Second priority: Check for watered fields that need planting
    if (Object.values(resources.seeds).some((count) => count > 0)) {
      const fieldToPlant = findWateredFieldForPlanting();
      if (fieldToPlant) {
        updateAgent("farmer", {
          state: "moving",
          target: fieldToPlant,
          path: calculatePath(
            farmer.x,
            farmer.y,
            fieldToPlant.x,
            fieldToPlant.y,
          ),
        });
        // Going to work message removed - only show messages when working or storing
        return;
      }
    }

    // Third priority: Check for fields that need preparation or watering
    const fieldToPrepare = findFieldForFarmer();
    if (fieldToPrepare) {
      updateAgent("farmer", {
        state: "moving",
        target: fieldToPrepare,
        path: calculatePath(
          farmer.x,
          farmer.y,
          fieldToPrepare.x,
          fieldToPrepare.y,
        ),
      });
      // Going to work message removed - only show messages when working or storing
      return;
    }

    // If nothing to do, return to house
    const house = getHouseForAgent("farmer");
    if (house) {
      updateAgent("farmer", {
        state: "returning",
        target: house,
        path: calculatePath(farmer.x, farmer.y, house.x, house.y),
      });
      // No tasks message removed - only show messages when working or storing
    }
  }

  // Handle moving state - move towards target
  else if (farmer.state === "moving" && farmer.target) {
    // Move towards the target more slowly (move only every 25 ticks)
    const shouldMove = farmer.timer % 25 === 0;
    let newX = farmer.x;
    let newY = farmer.y;

    if (shouldMove) {
      if (farmer.x < farmer.target.x) newX += 1;
      else if (farmer.x > farmer.target.x) newX -= 1;

      if (farmer.y < farmer.target.y) newY += 1;
      else if (farmer.y > farmer.target.y) newY -= 1;
    }

    // Increment the timer for movement cooldown
    const newTimer = farmer.timer + 1;

    // Check if arrived at target
    const arrived = newX === farmer.target.x && newY === farmer.target.y;

    if (arrived) {
      // Check what to do based on the state of the target tile
      const currentTile = gridTiles.find(
        (tile) => tile.x === farmer.target!.x && tile.y === farmer.target!.y,
      );

      if (!currentTile) {
        // Invalid target, go back to idle
        updateAgent("farmer", {
          state: "idle",
          target: null,
          timer: 0,
          path: [],
        });
        return;
      }

      // If it's a field for harvesting
      if (
        currentTile.type === "field" &&
        currentTile.planted &&
        currentTile.harvestable
      ) {
        updateAgent("farmer", {
          x: farmer.target.x,
          y: farmer.target.y,
          state: "harvesting",
          timer: 0,
        });
        addLogMessage("O agricultor está colhendo a plantação.", "👨‍🌾");
      }
      // If it's a field for planting (watered and empty)
      else if (
        currentTile.type === "field" &&
        currentTile.fieldState === "watered" &&
        !currentTile.planted
      ) {
        updateAgent("farmer", {
          x: farmer.target.x,
          y: farmer.target.y,
          state: "gettingSeed",
          timer: 0,
        });
        addLogMessage("O agricultor está buscando sementes.", "👨‍🌾");
      }
      // If it's a field for preparing
      else if (
        currentTile.type === "field" &&
        currentTile.fieldType === "plantio" &&
        (!currentTile.fieldState || currentTile.fieldState === "normal")
      ) {
        updateAgent("farmer", {
          x: farmer.target.x,
          y: farmer.target.y,
          state: "preparing",
          timer: 0,
        });
        addLogMessage("O agricultor está preparando o campo.", "👨‍🌾");
      } else {
        // Target is not valid anymore, go back to idle
        updateAgent("farmer", {
          x: newX,
          y: newY,
          state: "idle",
          target: null,
          timer: 0,
          path: [],
        });
      }
    } else {
      updateAgent("farmer", {
        x: newX,
        y: newY,
        timer: newTimer,
      });
    }
  }

  // Handle preparing state - prepare the field
  else if (farmer.state === "preparing" && farmer.target) {
    const newTimer = farmer.timer + 1;

    // Preparing takes 10 seconds (100 ticks) as specified
    if (newTimer >= 100) {
      const currentTile = gridTiles.find(
        (tile) =>
          tile.x === farmer.x &&
          tile.y === farmer.y &&
          tile.type === "field" &&
          tile.fieldType === "plantio",
      );

      if (currentTile) {
        // After preparing, update the field state
        updateTile({
          ...currentTile,
          fieldState: "prepared",
          constructionEmoji: "🟧", // Orange square for prepared field
          farmerEmoji: undefined,
        });

        // After preparing, go get water
        const wellTile = getWaterWellTile();
        if (wellTile) {
          updateAgent("farmer", {
            state: "gettingWater",
            target: wellTile,
            path: calculatePath(farmer.x, farmer.y, wellTile.x, wellTile.y),
            timer: 0,
          });
          addLogMessage(
            "O agricultor preparou o campo e está indo buscar água.",
            "👨‍🌾",
          );
        } else {
          // No water well, go back to idle
          updateAgent("farmer", {
            state: "idle",
            target: null,
            timer: 0,
            path: [],
          });
          addLogMessage("Não há poço de água para o agricultor usar.", "⚠️");
        }
      } else {
        // Field is no longer valid, go back to idle
        updateAgent("farmer", {
          state: "idle",
          target: null,
          timer: 0,
          path: [],
        });
      }
    } else {
      // Get the current tile
      const currentTile = gridTiles.find(
        (tile) => tile.x === farmer.x && tile.y === farmer.y,
      );

      if (currentTile) {
        // Alternate between 🔨 and 🪚 every second (10 ticks)
        const preparationEmoji =
          Math.floor(newTimer / 10) % 2 === 0 ? "🔨" : "🪚";
        updateTile({
          ...currentTile,
          farmerEmoji: preparationEmoji,
        });
      }

      updateAgent("farmer", {
        timer: newTimer,
      });
    }
  }

  // Handle getting water - move to water well
  else if (farmer.state === "gettingWater" && farmer.target) {
    // Move towards the water well more slowly (move only every 25 ticks)
    const shouldMove = farmer.timer % 25 === 0;
    let newX = farmer.x;
    let newY = farmer.y;

    if (shouldMove) {
      if (farmer.x < farmer.target.x) newX += 1;
      else if (farmer.x > farmer.target.x) newX -= 1;

      if (farmer.y < farmer.target.y) newY += 1;
      else if (farmer.y > farmer.target.y) newY -= 1;
    }

    // Increment the timer for movement cooldown
    const newTimer = farmer.timer + 1;

    // Check if arrived at water well
    const arrived = newX === farmer.target.x && newY === farmer.target.y;

    if (arrived) {
      // If just arrived, start the collecting timer
      if (farmer.timer < 30) {
        // 3 seconds (30 ticks)
        updateAgent("farmer", {
          x: farmer.target.x,
          y: farmer.target.y,
          timer: newTimer,
        });
        return;
      }

      // After collecting water, find a prepared field to water
      const fieldToWater = gridTiles.find(
        (tile) =>
          tile.type === "field" &&
          tile.fieldType === "plantio" &&
          tile.fieldState === "prepared",
      );

      if (fieldToWater) {
        updateAgent("farmer", {
          state: "watering",
          target: fieldToWater,
          path: calculatePath(
            farmer.target.x,
            farmer.target.y,
            fieldToWater.x,
            fieldToWater.y,
          ),
          timer: 0,
        });
        addLogMessage(
          "O agricultor coletou água e está indo regar o campo.",
          "💧",
        );
      } else {
        // No field to water, go back to idle
        updateAgent("farmer", {
          state: "idle",
          target: null,
          timer: 0,
          path: [],
        });
      }
    } else {
      updateAgent("farmer", {
        x: newX,
        y: newY,
        timer: newTimer,
      });
    }
  }

  // Handle watering - move to field and water it
  else if (farmer.state === "watering" && farmer.target) {
    // Move towards the field more slowly (move only every 15 ticks)
    const shouldMove = farmer.timer % 25 === 0;
    let newX = farmer.x;
    let newY = farmer.y;

    if (shouldMove) {
      if (farmer.x < farmer.target.x) newX += 1;
      else if (farmer.x > farmer.target.x) newX -= 1;

      if (farmer.y < farmer.target.y) newY += 1;
      else if (farmer.y > farmer.target.y) newY -= 1;
    }

    // Increment the timer for movement cooldown
    const newTimer = farmer.timer + 1;

    // Check if arrived at field
    const arrived = newX === farmer.target.x && newY === farmer.target.y;

    if (arrived) {
      // If just arrived, start the watering timer
      if (farmer.timer < 50) {
        // 5 seconds (50 ticks) as specified
        updateAgent("farmer", {
          x: farmer.target.x,
          y: farmer.target.y,
          timer: newTimer,
        });
        return;
      }

      // After watering, update the field state
      const currentTile = gridTiles.find(
        (tile) =>
          tile.x === farmer.target!.x &&
          tile.y === farmer.target!.y &&
          tile.type === "field" &&
          tile.fieldType === "plantio",
      );

      if (currentTile) {
        // Update field to watered state with brown square and timer
        updateTile({
          ...currentTile,
          fieldState: "watered",
          constructionEmoji: "🟫", // Brown square for watered field
          waterTimer: 1200,
        });

        // After watering, go back to idle to check for next tasks
        updateAgent("farmer", {
          state: "idle",
          target: null,
          timer: 0,
          path: [],
        });
        addLogMessage(
          "O agricultor regou o campo. Agora está pronto para plantio.",
          "💧",
        );
      } else {
        // Field is no longer valid, go back to idle
        updateAgent("farmer", {
          state: "idle",
          target: null,
          timer: 0,
          path: [],
        });
      }
    } else {
      updateAgent("farmer", {
        x: newX,
        y: newY,
        timer: newTimer,
      });
    }
  }

  // Handle getting seed - go to storage to get seeds
  else if (farmer.state === "gettingSeed") {
    // Select the best seed to plant based on:
    // 1. Growth time (faster is better)
    // 2. Value (higher is better)
    // 3. Quantity available (more is better)
    let seedToPlant: SeedType | null = null;

    const availableSeeds = Object.entries(resources.seeds)
      .filter(([_, count]) => count > 0)
      .map(([seedType, count]) => ({
        type: seedType as SeedType,
        count,
        growthTime: seedMap[seedType as SeedType].growthTime,
        value: seedMap[seedType as SeedType].cost * 2, // Selling price
        // Calculate a score: higher value, faster growth, more quantity = better
        score:
          (seedMap[seedType as SeedType].cost * 2) /
            seedMap[seedType as SeedType].growthTime +
          (count > 5 ? 2 : 0),
      }))
      .sort((a, b) => b.score - a.score); // Sort by score descending

    if (availableSeeds.length > 0) {
      seedToPlant = availableSeeds[0].type;
    }

    if (!seedToPlant) {
      // No seeds available, go back to idle
      updateAgent("farmer", {
        state: "idle",
        target: null,
        timer: 0,
        path: [],
      });
      addLogMessage("O agricultor não tem sementes para plantar.", "⚠️");
      return;
    }

    // If we just entered this state, go to storage to get seed
    if (farmer.timer === 0) {
      const storageTile = getStorageTile();
      if (storageTile) {
        updateAgent("farmer", {
          state: "gettingSeed",
          target: storageTile,
          path: calculatePath(farmer.x, farmer.y, storageTile.x, storageTile.y),
          timer: 1,
        });
        // Going to work message removed - only show messages when working or storing
      } else {
        // No storage, go back to idle
        updateAgent("farmer", {
          state: "idle",
          timer: 0,
          path: [],
        });
        addLogMessage("Não há armazém para o agricultor pegar sementes.", "⚠️");
      }
      return;
    }

    // Move towards the storage more slowly (move only every 15 ticks)
    const shouldMove = farmer.timer % 25 === 0;
    let newX = farmer.x;
    let newY = farmer.y;

    if (shouldMove && farmer.target) {
      if (farmer.x < farmer.target.x) newX += 1;
      else if (farmer.x > farmer.target.x) newX -= 1;

      if (farmer.y < farmer.target.y) newY += 1;
      else if (farmer.y > farmer.target.y) newY -= 1;
    }

    // Check if arrived at storage
    const arrived =
      farmer.target && newX === farmer.target.x && newY === farmer.target.y;

    if (arrived) {
      // If just arrived, start the getting seed timer
      if (farmer.timer < 100) {
        //        // 10 seconds (100 ticks) as specified
        updateAgent("farmer", {
          x: newX,
          y: newY,
          timer: newTimer,
        });
        return;
      }

      // After getting seed, find a watered field to plant
      const fieldToPlant = findWateredFieldForPlanting();

      if (fieldToPlant) {
        updateAgent("farmer", {
          state: "planting",
          target: fieldToPlant,
          path: calculatePath(newX, newY, fieldToPlant.x, fieldToPlant.y),
          timer: 0,
        });
        addLogMessage(
          `O agricultor pegou sementes ${seedMap[seedToPlant].emoji} e está indo plantar.`,
          "🌱",
        );
      } else {
        // No field to plant, go back to idle
        updateAgent("farmer", {
          state: "idle",
          target: null,
          timer: 0,
          path: [],
        });
      }
    } else {
      updateAgent("farmer", {
        x: newX,
        y: newY,
        timer: newTimer,
      });
    }
  }

  // Handle planting - move to field and plant seed
  else if (farmer.state === "planting" && farmer.target) {
    // Check if the field has a designated seed type
    const fieldTile = gridTiles.find(
      (tile) => tile.x === farmer.target!.x && tile.y === farmer.target!.y,
    );

    let seedToPlant: SeedType | null = null;

    if (fieldTile?.selectedSeed) {
      // Use the designated seed if available
      if (resources.seeds[fieldTile.selectedSeed] > 0) {
        seedToPlant = fieldTile.selectedSeed;
      }
    } else {
      // Wait for 10 seconds for seed selection as specified
      if (farmer.seedSelectionTimer === undefined) {
        updateAgent("farmer", {
          seedSelectionTimer: 100, // 10 seconds (100 ticks)
        });
        addLogMessage(
          "O agricultor está esperando a seleção da semente.",
          "⏳",
        );
        return;
      }

      const newTimer = (farmer.seedSelectionTimer || 0) - 1;

      if (newTimer > 0) {
        // Check if a seed was selected during waiting
        const updatedFieldTile = gridTiles.find(
          (tile) => tile.x === farmer.target!.x && tile.y === farmer.target!.y,
        );

        if (
          updatedFieldTile?.selectedSeed &&
          resources.seeds[updatedFieldTile.selectedSeed] > 0
        ) {
          // Seed was selected, proceed with planting
          seedToPlant = updatedFieldTile.selectedSeed;
        } else {
          updateAgent("farmer", {
            seedSelectionTimer: newTimer,
          });
          return;
        }
      } else {
        // Time's up, no seed selected
        updateAgent("farmer", {
          state: "idle",
          target: null,
          timer: 0,
          path: [],
          seedSelectionTimer: undefined,
        });
        addLogMessage(
          "Nenhuma semente selecionada. O agricultor procurará outra tarefa.",
          "⚠️",
        );
        return;
      }
    }

    if (!seedToPlant) {
      // No seeds available, go back to idle
      updateAgent("farmer", {
        state: "idle",
        target: null,
        timer: 0,
        path: [],
      });
      addLogMessage("O agricultor não tem sementes para plantar.", "⚠️");
      return;
    }

    // Move towards the field more slowly (move only every 15 ticks)
    const shouldMove = farmer.timer % 25 === 0;
    let newX = farmer.x;
    let newY = farmer.y;

    if (shouldMove) {
      if (farmer.x < farmer.target.x) newX += 1;
      else if (farmer.x > farmer.target.x) newX -= 1;

      if (farmer.y < farmer.target.y) newY += 1;
      else if (farmer.y > farmer.target.y) newY -= 1;
    }

    // Increment the timer for movement cooldown
    const newTimer = farmer.timer + 1;

    // Check if arrived at field
    const arrived = newX === farmer.target.x && newY === farmer.target.y;

    if (arrived) {
      // If just arrived, start the planting timer
      if (farmer.timer < 40) {
        // 4 seconds (40 ticks)
        updateAgent("farmer", {
          x: farmer.target.x,
          y: farmer.target.y,
          timer: newTimer,
        });
        return;
      }

      // After planting, update the field
      const currentTile = gridTiles.find(
        (tile) =>
          tile.x === farmer.target!.x &&
          tile.y === farmer.target!.y &&
          tile.type === "field" &&
          tile.fieldType === "plantio" &&
          tile.fieldState === "watered",
      );

      if (currentTile && seedToPlant) {
        // Update seed inventory
        const updatedSeeds = { ...resources.seeds };
        updatedSeeds[seedToPlant] -= 1;

        updateResources({
          seeds: updatedSeeds,
        });

        // Update field with planted seed
        updateTile({
          ...currentTile,
          planted: seedToPlant,
          growthStage: 0,
          harvestable: false,
        });

        // After planting, go back to idle to check for next tasks
        updateAgent("farmer", {
          state: "idle",
          target: null,
          timer: 0,
          path: [],
        });
        addLogMessage(
          `O agricultor plantou sementes de ${seedToPlant} ${seedMap[seedToPlant].emoji}.`,
          "🌱",
        );
      } else {
        // Field is no longer valid, go back to idle
        updateAgent("farmer", {
          state: "idle",
          target: null,
          timer: 0,
          path: [],
        });
      }
    } else {
      updateAgent("farmer", {
        x: newX,
        y: newY,
        timer: newTimer,
      });
    }
  }

  // Handle harvesting - harvest the crop
  else if (farmer.state === "harvesting" && farmer.target) {
    const newTimer = farmer.timer + 1;

    // Show harvesting emoji during the process
    const currentTile = gridTiles.find(
      (tile) => tile.x === farmer.x && tile.y === farmer.y,
    );
    if (currentTile) {
      updateTile({
        ...currentTile,
        farmerEmoji: "🧺",
      });
    }

    // Harvesting takes 5 seconds (50 ticks)
    if (newTimer >= 50) {
      const currentTile = gridTiles.find(
        (tile) =>
          tile.x === farmer.x &&
          tile.y === farmer.y &&
          tile.type === "field" &&
          tile.planted &&
          tile.harvestable,
      );

      if (currentTile && currentTile.planted) {
        const seedType = currentTile.planted;

        // Clear the tile for replanting
        updateTile({
          ...currentTile,
          planted: undefined,
          growthStage: undefined,
          harvestable: false,
          fieldState: "normal", // Reset field state after harvest
        });

        // Now head to storage to deposit the crop
        const storageTile = getStorageTile();
        if (storageTile) {
          updateAgent("farmer", {
            state: "storing",
            target: storageTile,
            path: calculatePath(
              farmer.x,
              farmer.y,
              storageTile.x,
              storageTile.y,
            ),
            timer: 0,
            carryingCrop: seedType, // Track what crop the farmer is carrying
          });

          addLogMessage(
            `O agricultor colheu ${seedType} ${seedMap[seedType].emoji} e está indo para o armazém.`,
            "🌾",
          );
        } else {
          // If no storage, just update resources directly
          const updatedCrops = { ...resources.crops };

          // Generate a random harvest amount between 2-5 crops as specified
          const harvestAmount = Math.floor(Math.random() * 4) + 2; // Random number between 2-5
          updatedCrops[seedType] =
            (updatedCrops[seedType] || 0) + harvestAmount;

          // Also give a chance to get bonus seeds (40% chance)
          const seedChance = Math.random();
          const seedAmount =
            seedChance < 0.4 ? Math.floor(Math.random() * 2) + 1 : 0; // 1-2 seeds if lucky

          let updatedSeeds = { ...resources.seeds };
          if (seedAmount > 0) {
            updatedSeeds[seedType] = (updatedSeeds[seedType] || 0) + seedAmount;
          }

          // Update resources with harvested crop and possibly bonus seeds
          updateResources({
            crops: updatedCrops,
            seeds: seedAmount > 0 ? updatedSeeds : undefined,
          });

          // If bonus seeds were generated, show a message
          if (seedAmount > 0) {
            addLogMessage(
              `O agricultor encontrou ${seedAmount} sementes extras de ${seedType}!`,
              "🌱",
            );
          }

          // Return to idle state
          updateAgent("farmer", {
            state: "idle",
            target: null,
            timer: 0,
            path: [],
            carryingCrop: undefined,
          });

          addLogMessage(
            `O agricultor colheu ${seedType} ${seedMap[seedType].emoji}.`,
            "🌾",
          );
        }
      } else {
        // Crop is gone, return to idle
        updateAgent("farmer", {
          state: "idle",
          target: null,
          timer: 0,
          path: [],
        });
      }
    } else {
      updateAgent("farmer", {
        timer: newTimer,
      });
    }
  }

  // Handle storing - store the crop
  else if (farmer.state === "storing" && farmer.target) {
    // Move towards the storage more slowly (move only every 15 ticks)
    const shouldMove = farmer.timer % 25 === 0;
    let newX = farmer.x;
    let newY = farmer.y;

    if (shouldMove) {
      if (farmer.x < farmer.target.x) newX += 1;
      else if (farmer.x > farmer.target.x) newX -= 1;

      if (farmer.y < farmer.target.y) newY += 1;
      else if (farmer.y > farmer.target.y) newY -= 1;
    }

    // Increment the timer for movement cooldown
    const newTimer = farmer.timer + 1;

    // Check if arrived at storage
    const arrived = newX === farmer.target.x && newY === farmer.target.y;

    if (arrived) {
      // If just arrived, start the storing timer
      if (farmer.timer < 50) {
        // 5 seconds (50 ticks)
        // Show storing emoji
        const currentTile = gridTiles.find(
          (tile) => tile.x === farmer.x && tile.y === farmer.y,
        );
        if (currentTile) {
          updateTile({
            ...currentTile,
            farmerEmoji: "📦",
          });
        }
        updateAgent("farmer", {
          x: farmer.target.x,
          y: farmer.target.y,
          timer: newTimer,
        });
        return;
      }

      // Get the crop the farmer is carrying
      const updatedCrops = { ...resources.crops };

      // Store the actual crop the farmer is carrying
      const storedCrop = farmer.carryingCrop || "wheat"; // Default to wheat if somehow undefined

      // Generate a random harvest amount between 2-5 crops as specified
      const harvestAmount = Math.floor(Math.random() * 4) + 2; // Random number between 2-5
      updatedCrops[storedCrop] =
        (updatedCrops[storedCrop] || 0) + harvestAmount;

      // Also give a chance to get bonus seeds (40% chance)
      const seedChance = Math.random();
      const seedAmount =
        seedChance < 0.4 ? Math.floor(Math.random() * 2) + 1 : 0; // 1-2 seeds if lucky

      let updatedSeeds = { ...resources.seeds };
      if (seedAmount > 0) {
        updatedSeeds[storedCrop] = (updatedSeeds[storedCrop] || 0) + seedAmount;
      }

      // Update resources with stored crop and possibly bonus seeds
      updateResources({
        crops: updatedCrops,
        seeds: seedAmount > 0 ? updatedSeeds : undefined,
      });

      // If bonus seeds were generated, show a message
      if (seedAmount > 0) {
        addLogMessage(
          `O agricultor encontrou ${seedAmount} sementes extras de ${storedCrop}!`,
          "🌱",
        );
      }

      // After storing, check if there are seeds and fields available for planting
      // If yes, continue working; if no, return home
      const hasSeeds = Object.values(resources.seeds).some(
        (count) => count > 0,
      );
      const hasFieldForPlanting = findWateredFieldForPlanting();
      const hasFieldToWater = findFieldForFarmer();

      if (hasSeeds && (hasFieldForPlanting || hasFieldToWater)) {
        // Continue working - stay in idle state to pick up next task
        updateAgent("farmer", {
          x: farmer.target.x,
          y: farmer.target.y,
          state: "idle",
          target: null,
          timer: 0,
          path: [],
          carryingCrop: undefined, // No longer carrying anything
        });
      } else {
        // No more work to do, return home
        const house = getHouseForAgent("farmer");
        if (house) {
          updateAgent("farmer", {
            x: farmer.target.x,
            y: farmer.target.y,
            state: "returning",
            target: house,
            path: calculatePath(
              farmer.target.x,
              farmer.target.y,
              house.x,
              house.y,
            ),
            timer: 0,
            carryingCrop: undefined,
          });
          addLogMessage(
            "Não há mais trabalho para fazer. O agricultor está retornando para casa.",
            "👨‍🌾",
          );
        } else {
          // No house to return to, just stay idle
          updateAgent("farmer", {
            x: farmer.target.x,
            y: farmer.target.y,
            state: "idle",
            target: null,
            timer: 0,
            path: [],
            carryingCrop: undefined,
          });
        }
      }

      addLogMessage(
        `O agricultor guardou ${storedCrop} ${seedMap[storedCrop]?.emoji || "🌾"} no armazém.`,
        "👨‍🌾",
      );
    } else {
      updateAgent("farmer", {
        x: newX,
        y: newY,
        timer: newTimer,
      });
    }
  }

  // Handle returning state - move back to house
  else if (farmer.state === "returning" && farmer.target) {
    // Move towards home more slowly (move only every 15 ticks)
    const shouldMove = farmer.timer % 25 === 0;
    let newX = farmer.x;
    let newY = farmer.y;

    if (shouldMove) {
      if (farmer.x < farmer.target.x) newX += 1;
      else if (farmer.x > farmer.target.x) newX -= 1;

      if (farmer.y < farmer.target.y) newY += 1;
      else if (farmer.y > farmer.target.y) newY -= 1;
    }

    // Increment the timer for movement cooldown
    const newTimer = farmer.timer + 1;

    // Check if arrived at house
    const arrived = newX === farmer.target.x && newY === farmer.target.y;

    if (arrived) {
      // Rest in the house
      updateAgent("farmer", {
        x: farmer.target.x,
        y: farmer.target.y,
        state: "resting",
        target: null,
        timer: 0,
      });

      // Resting message removed - only show messages when working or storing
    } else {
      updateAgent("farmer", {
        x: newX,
        y: newY,
        timer: newTimer,
      });
    }
  }

  // Handle resting state - rest in house for a while
  else if (farmer.state === "resting") {
    const newTimer = farmer.timer + 1;

    // Rest for 5 seconds (50 ticks)
    if (newTimer >= 50) {
      updateAgent("farmer", {
        state: "idle",
        timer: 0,
      });

      // Done resting message removed - only show messages when working or storing
    } else {
      updateAgent("farmer", {
        timer: newTimer,
      });
    }
  }
}

// Initialize water well when placed
export function initializeWaterWell(tile: GridTile): GridTile {
  return {
    ...tile,
    waterWell: {
      buckets: 0,
      maxBuckets: 5,
      generationTimer: 30, // 3 seconds at 10 ticks/second
    },
  };
}

// Update water wells
function updateWaterWells() {
  const { gridTiles, updateTile, addLogMessage } = getState();

  // Only process wells that need updates
  const activeWells = gridTiles.filter(
    (tile) =>
      tile.structure === "waterWell" &&
      tile.waterWell &&
      tile.waterWell.buckets < tile.waterWell.maxBuckets,
  );

  activeWells.forEach((tile) => {
    if (tile.structure === "waterWell" && tile.waterWell) {
      if (tile.waterWell.buckets < tile.waterWell.maxBuckets) {
        const newTimer = tile.waterWell.generationTimer - 1;

        if (newTimer <= 0) {
          // Generate a new bucket
          const newBuckets = tile.waterWell.buckets + 1;
          updateTile({
            ...tile,
            waterWell: {
              ...tile.waterWell,
              buckets: newBuckets,
              generationTimer: 30, // Reset timer
            },
          });

          if (newBuckets === tile.waterWell.maxBuckets) {
            addLogMessage("Um poço de água está cheio!", "💧");
          }
        } else {
          updateTile({
            ...tile,
            waterWell: {
              ...tile.waterWell,
              generationTimer: newTimer,
            },
          });
        }
      }
    }
  });
}

// Helper function to find a field that needs preparation
function findFieldForFarmer(): GridTile | null {
  const { gridTiles } = getState();
  return gridTiles.find(
    (tile) =>
      tile.type === "field" &&
      tile.fieldType === "plantio" &&
      (tile.fieldState === "normal" || !tile.fieldState),
  );
}

// Helper function to find a watered field ready for planting
function findWateredFieldForPlanting(): GridTile | null {
  const { gridTiles } = getState();
  return gridTiles.find(
    (tile) =>
      tile.type === "field" &&
      tile.fieldType === "plantio" &&
      tile.fieldState === "watered" &&
      !tile.planted,
  );
}

// Helper function to find a field with a harvestable crop
function findFieldForHarvesting(): GridTile | null {
  const { gridTiles } = getState();
  return gridTiles.find(
    (tile) => tile.type === "field" && tile.planted && tile.harvestable,
  );
}

// Check for missing structures and notify
let lastNotificationTime = 0;
function checkMissingStructures() {
  const { gridTiles, addLogMessage } = getState();
  const currentTime = Date.now();

  // Only check every 10 seconds
  if (currentTime - lastNotificationTime < 10000) return;

  const storage = gridTiles.find(tile => tile.structure === 'storage');
  const waterWell = gridTiles.find(tile => tile.structure === 'waterWell');

  if (!storage) {
    addLogMessage("⚠️ Construa um armazém para que os NPCs possam guardar recursos!", "🏦");
  }

  const farmerHouse = gridTiles.find(tile => tile.structure === 'farmerHouse');
  if (farmerHouse && !waterWell) {
    addLogMessage("⚠️ Construa um poço de água para que o fazendeiro possa regar as plantações!", "⛲");
  }

  lastNotificationTime = currentTime;
}