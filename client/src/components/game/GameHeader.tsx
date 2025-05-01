import React from "react";
import { useTheme } from "@/lib/ThemeProvider";
import { useGameState } from "@/hooks/use-game-state";

const GameHeader: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { soundEnabled, setSoundEnabled, setTutorialVisible } = useGameState();

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
    <header className="bg-primary shadow-md p-3 text-white flex justify-between items-center">
      <h1 className="font-display text-xl md:text-2xl font-bold flex items-center gap-2">
        <span className="text-2xl md:text-3xl">🚜</span> 
        Em🙂ji Farm
        <span className="bg-accent text-primary-dark text-xs px-2 py-0.5 rounded-full ml-2">v3.0</span>
      </h1>
      <div className="flex items-center gap-3">
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
