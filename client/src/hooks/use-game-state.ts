import { useCallback, useEffect, useState } from "react";
import { useGameStateContext } from "@/lib/gameState";
import { gameTick, setGameStateInstance } from "@/lib/gameLogic";

// Game tick duration in milliseconds
const TICK_INTERVAL = 100;

export function useGameState() {
  const gameState = useGameStateContext();
  const [gameTime, setGameTime] = useState(0);
  
  // Set the game state instance for game logic functions
  useEffect(() => {
    setGameStateInstance(gameState);
  }, [gameState]);
  
  // Set up game loop
  useEffect(() => {
    const interval = setInterval(() => {
      gameTick();
      setGameTime(time => time + 1);
    }, TICK_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);
  
  return gameState;
}
