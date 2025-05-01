import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { 
  GameState, 
  LogMessage, 
  SelectionType, 
  GridTile,
  ResourceType,
  Agent,
  ActivePanelType
} from './gameTypes';

// Define initial state
const initialGridTiles: GridTile[] = [];
const cols = 8, rows = 7;

// Generate initial grid
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    const tile: GridTile = { x, y };
    const r = Math.random();
    
    if (r < 0.1) {
      tile.resource = 'rock';
    } else if (r < 0.3) {
      tile.resource = 'tree';
    } else if (r < 0.4) {
      tile.resource = 'bigTree';
    }
    
    initialGridTiles.push(tile);
  }
}

// Place initial structures
const lumberjackPos = Math.floor(Math.random() * initialGridTiles.length);
initialGridTiles[lumberjackPos] = {
  ...initialGridTiles[lumberjackPos],
  resource: undefined,
  structure: 'lumberjackHouse'
};

const minerPos = Math.floor(Math.random() * initialGridTiles.length);
if (minerPos !== lumberjackPos) {
  initialGridTiles[minerPos] = {
    ...initialGridTiles[minerPos],
    resource: undefined,
    structure: 'minerHouse'
  };
}

const storagePos = Math.floor(Math.random() * initialGridTiles.length);
if (storagePos !== lumberjackPos && storagePos !== minerPos) {
  initialGridTiles[storagePos] = {
    ...initialGridTiles[storagePos],
    resource: undefined,
    structure: 'storage'
  };
}

// Initialize agent positions
const lumberjackHouse = initialGridTiles.find(t => t.structure === 'lumberjackHouse');
const minerHouse = initialGridTiles.find(t => t.structure === 'minerHouse');

const initialAgentLumber: Agent = {
  x: lumberjackHouse ? lumberjackHouse.x * 50 : 0,
  y: lumberjackHouse ? lumberjackHouse.y * 50 : 0,
  state: 'idle',
  timer: 0,
  target: null,
  path: []
};

const initialAgentMiner: Agent = {
  x: minerHouse ? minerHouse.x * 50 : 0,
  y: minerHouse ? minerHouse.y * 50 : 0,
  state: 'idle',
  timer: 0,
  target: null,
  path: []
};

const initialState: GameState = {
  resources: {
    coins: 1000,
    wood: 0,
    stone: 0,
    seeds: { wheat: 0, corn: 0, carrot: 0, potato: 0, tomato: 0 },
    crops: { wheat: 0, corn: 0, carrot: 0, potato: 0, tomato: 0 }
  },
  gridTiles: initialGridTiles,
  agents: {
    lumber: initialAgentLumber,
    miner: initialAgentMiner
  },
  selected: null,
  structureMap: {
    lumberjackHouse: { name: 'Casa do Lenhador', cost: { wood: 50, stone: 20, coins: 200 }, emoji: '🏡' },
    minerHouse: { name: 'Casa do Minerador', cost: { wood: 60, stone: 30, coins: 250 }, emoji: '🏚' },
    storage: { name: 'Armazém', cost: { wood: 100, stone: 50, coins: 500 }, emoji: '🏦' }
  },
  fieldMap: {
    plantio: { name: 'Campo de Plantio', cost: { coins: 100 }, color: 'var(--resource-soil)', emoji: '🌱' },
    agua: { name: 'Campo de Água', cost: { coins: 150 }, color: 'var(--resource-water)', emoji: '' },
    pasto: { name: 'Campo de Pasto', cost: { coins: 120 }, color: 'var(--resource-pasture)', emoji: '' }
  },
  seedMap: {
    wheat: { emoji: '🌾', cost: 50, growthTime: 30 },
    corn: { emoji: '🌽', cost: 60, growthTime: 45 },
    carrot: { emoji: '🥕', cost: 40, growthTime: 25 },
    potato: { emoji: '🥔', cost: 45, growthTime: 35 },
    tomato: { emoji: '🍅', cost: 70, growthTime: 50 }
  },
  logMessages: [],
  tutorialVisible: false,
  soundEnabled: true,
  activePanel: null
};

// Actions
type GameAction =
  | { type: 'UPDATE_RESOURCES'; payload: Partial<GameState['resources']> }
  | { type: 'UPDATE_TILE'; payload: { tile: GridTile } }
  | { type: 'SET_SELECTED'; payload: SelectionType }
  | { type: 'UPDATE_AGENT'; payload: { agentType: 'lumber' | 'miner'; agent: Partial<Agent> } }
  | { type: 'ADD_LOG_MESSAGE'; payload: { text: string; icon: string } }
  | { type: 'SET_TUTORIAL_VISIBLE'; payload: boolean }
  | { type: 'SET_SOUND_ENABLED'; payload: boolean }
  | { type: 'SET_ACTIVE_PANEL'; payload: ActivePanelType };

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'UPDATE_RESOURCES':
      return {
        ...state,
        resources: {
          ...state.resources,
          ...action.payload,
          seeds: {
            ...state.resources.seeds,
            ...(action.payload.seeds || {})
          },
          crops: {
            ...state.resources.crops,
            ...(action.payload.crops || {})
          }
        }
      };
      
    case 'UPDATE_TILE':
      return {
        ...state,
        gridTiles: state.gridTiles.map(tile => 
          tile.x === action.payload.tile.x && tile.y === action.payload.tile.y
            ? { ...tile, ...action.payload.tile }
            : tile
        )
      };
      
    case 'SET_SELECTED':
      return {
        ...state,
        selected: action.payload
      };
      
    case 'UPDATE_AGENT':
      return {
        ...state,
        agents: {
          ...state.agents,
          [action.payload.agentType]: {
            ...state.agents[action.payload.agentType],
            ...action.payload.agent
          }
        }
      };
      
    case 'ADD_LOG_MESSAGE':
      // Create formatted timestamp
      const now = new Date();
      const timestamp = now.toLocaleTimeString();
      
      // Create new message
      const newMessage: LogMessage = {
        text: action.payload.text,
        timestamp,
        icon: action.payload.icon
      };
      
      // Limit log to last 100 messages
      const updatedLog = [...state.logMessages, newMessage].slice(-100);
      
      return {
        ...state,
        logMessages: updatedLog
      };
      
    case 'SET_TUTORIAL_VISIBLE':
      return {
        ...state,
        tutorialVisible: action.payload
      };
      
    case 'SET_SOUND_ENABLED':
      return {
        ...state,
        soundEnabled: action.payload
      };
      
    case 'SET_ACTIVE_PANEL':
      return {
        ...state,
        activePanel: action.payload
      };
      
    default:
      return state;
  }
}

// Create context
interface GameStateContextValue extends GameState {
  updateResources: (resources: Partial<GameState['resources']>) => void;
  updateTile: (tile: GridTile) => void;
  setSelected: (selected: SelectionType) => void;
  updateAgent: (agentType: 'lumber' | 'miner', agent: Partial<Agent>) => void;
  addLogMessage: (text: string, icon: string) => void;
  setTutorialVisible: (visible: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setActivePanel: (panel: ActivePanelType) => void;
}

const GameStateContext = createContext<GameStateContextValue | undefined>(undefined);

// Provider component
export function GameStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  const updateResources = (resources: Partial<GameState['resources']>) => {
    dispatch({ type: 'UPDATE_RESOURCES', payload: resources });
  };
  
  const updateTile = (tile: GridTile) => {
    dispatch({ type: 'UPDATE_TILE', payload: { tile } });
  };
  
  const setSelected = (selected: SelectionType) => {
    dispatch({ type: 'SET_SELECTED', payload: selected });
  };
  
  const updateAgent = (agentType: 'lumber' | 'miner', agent: Partial<Agent>) => {
    dispatch({ type: 'UPDATE_AGENT', payload: { agentType, agent } });
  };
  
  const addLogMessage = (text: string, icon: string) => {
    dispatch({ type: 'ADD_LOG_MESSAGE', payload: { text, icon } });
  };
  
  const setTutorialVisible = (visible: boolean) => {
    dispatch({ type: 'SET_TUTORIAL_VISIBLE', payload: visible });
  };
  
  const setSoundEnabled = (enabled: boolean) => {
    dispatch({ type: 'SET_SOUND_ENABLED', payload: enabled });
  };
  
  const setActivePanel = (panel: ActivePanelType) => {
    dispatch({ type: 'SET_ACTIVE_PANEL', payload: panel });
  };
  
  const value: GameStateContextValue = {
    ...state,
    updateResources,
    updateTile,
    setSelected,
    updateAgent,
    addLogMessage,
    setTutorialVisible,
    setSoundEnabled,
    setActivePanel
  };
  
  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}

// Custom hook to use the game state
export function useGameStateContext() {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameStateContext must be used within a GameStateProvider');
  }
  return context;
}
