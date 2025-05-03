import React from "react";
import { useTheme } from "@/lib/ThemeProvider";
import { useGameState } from "@/hooks/use-game-state";

const GameHeader: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { soundEnabled, setSoundEnabled, setTutorialVisible, setSelected } = useGameState();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const showHelp = () => {
    setTutorialVisible(true);
  };

  return (
    <header className="bg-primary shadow-md p-4 text-white flex justify-between items-center backdrop-blur-sm bg-opacity-95 sticky top-0 z-50">
      <h1 className="font-display text-xl md:text-2xl font-bold flex items-center gap-2">
        <span className="text-2xl md:text-3xl">🌻</span> 
        Emoji Farming 🐝
      </h1>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setSelected({ type: 'store', key: null })}
          className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-primary-dark transition-colors"
          aria-label="Open store"
        >
          🛍️
        </button>
        <button 
          onClick={toggleSound}
          className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-primary-dark transition-colors"
          aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
        >
          {soundEnabled ? "🔊" : "🔇"}
        </button>
        <button 
          onClick={showHelp}
          className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-primary-dark transition-colors"
          aria-label="Help"
        >
          ❓
        </button>
        <button 
          onClick={toggleTheme}
          className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-primary-dark transition-colors"
          aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>
    </header>
  );
};

export default GameHeader;
