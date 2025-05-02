export type ResourceType = 'tree' | 'bigTree' | 'rock';
export type StructureType = 'lumberjackHouse' | 'minerHouse' | 'storage' | 'farmerHouse' | 'waterWell' | 'pickupTruck' | 'tractor';

export interface WaterWell {
  buckets: number;
  maxBuckets: number;
  generationTimer: number;
}
export type FieldType = 'plantio' | 'agua' | 'pasto';
export type SeedType = 'wheat' | 'corn' | 'carrot' | 'potato' | 'tomato';
export type FieldState = 'normal' | 'prepared' | 'watered';
export type AgentState = 'idle' | 'moving' | 'working' | 'returning' | 'storing' | 'resting' | 'waiting' | 'preparing' | 'watering' | 'planting' | 'harvesting' | 'gettingWater' | 'gettingSeed' | 'collectingWater' | 'irrigating';
export type SelectionType = { type: 'structure' | 'field' | 'seed' | 'remove', key: string } | null;
export type RemovalConfirmation = {
  type: 'structure' | 'resource';
  x: number;
  y: number;
  cost?: number;
  refund?: number;
} | null;
export type ActivePanelType = 'structures' | 'fields' | 'seeds' | 'storage' | 'status' | 'options' | null;

export interface Structure {
  name: string;
  cost: {
    wood: number;
    stone: number;
    coins: number;
  };
  emoji: string;
}

export interface Field {
  name: string;
  cost: {
    coins: number;
  };
  color: string;
  emoji: string;
}

export interface Seed {
  emoji: string;
  cost: number;
  growthTime: number; // in seconds
}

export interface GridTile {
  x: number;
  y: number;
  resource?: ResourceType;
  structure?: StructureType;
  type?: 'field';
  fieldType?: FieldType;
  fieldState?: FieldState;
  waterTimer?: number; // Timer for watered state (2 minutes)
  planted?: SeedType;
  growthStage?: number; // 0-100
  harvestable?: boolean;
  respawnTimer?: number; // Timer for resource respawn
  constructionEmoji?: string; // Emoji to show during construction (🚧)
  selectedSeed?: SeedType; // Selected seed type for this field
  waterWell?: WaterWell; // Water well state
  farmerEmoji?: string; // Current farmer action emoji
  resourceEmoji?: string; // Resource collection emoji
  resourceScale?: string; // Scale of the resource emoji
}

export interface Agent {
  x: number;
  y: number;
  state: AgentState;
  timer: number;
  target: GridTile | null;
  path: {x: number, y: number}[];
  carryingCrop?: SeedType;
  seedSelectionTimer?: number; // Timer for waiting for seed selection
}

export interface Agent {
  x: number;
  y: number;
  state: AgentState;
  timer: number;
  target: GridTile | null;
  path: {x: number, y: number}[];
  carryingCrop?: SeedType;  // Track the crop type that the farmer is carrying
  farmerID?: number;        // Unique ID for each farmer
  homeX?: number;           // Home house X coordinate
  homeY?: number;           // Home house Y coordinate
}

export interface Resources {
  coins: number;
  wood: number;
  stone: number;
  seeds: Record<SeedType, number>;
  crops: Record<SeedType, number>;
}

export interface LogMessage {
  text: string;
  timestamp: string;
  icon: string;
}

export interface GameState {
  resources: Resources;
  gridTiles: GridTile[];
  agents: {
    lumber: Agent;
    miner: Agent;
    farmer: Agent;
  };
  selected: SelectionType;
  structureMap: Record<string, Structure>;
  fieldMap: Record<string, Field>;
  seedMap: Record<SeedType, Seed>;
  logMessages: LogMessage[];
  tutorialVisible: boolean;
  soundEnabled: boolean;
  activePanel: ActivePanelType;
}
