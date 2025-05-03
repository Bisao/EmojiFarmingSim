
import React from "react";
import GameHeader from "./GameHeader";
import GameArea from "./GameArea";
import { useMobile } from "@/hooks/use-mobile";

const MainGameContainer: React.FC = () => {
  const isMobile = useMobile();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar with game name and player info */}
      <div className="bg-primary text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🐝</span>
          <h1 className="text-xl font-bold">BeeBuilder</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-primary-dark/50 px-3 py-1.5 rounded-lg">
            <span className="text-xl">🪙</span>
            <span className="font-medium">100,250</span>
          </div>
        </div>
      </div>
      
      <main className="flex-1 p-4 gap-4 overflow-hidden">
        <GameArea />
      </main>
    </div>
  );
};

export default MainGameContainer;
