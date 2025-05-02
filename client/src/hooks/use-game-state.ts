
import { useGameStateContext } from "@/lib/gameState";
import { useEffect } from "react";
import { gameTick, setGameStateInstance } from "@/lib/gameLogic";

// Game tick duration in milliseconds
const TICK_INTERVAL = 100;

export function useGameState() {
  try {
    const gameState = useGameStateContext();
    
    // Set the game state instance for game logic functions
    useEffect(() => {
      setGameStateInstance(gameState);
    }, [gameState]);
    
    // Set up game loop
    useEffect(() => {
      const interval = setInterval(() => {
        gameTick();
      }, TICK_INTERVAL);
      
      return () => clearInterval(interval);
    }, []);
    
    return gameState;
  } catch (error) {
    console.error("GameState not available:", error);
    throw new Error("GameState must be used within GameStateProvider");
  }
}
