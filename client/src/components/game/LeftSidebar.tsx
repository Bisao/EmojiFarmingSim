import React from "react";
import { useGameState } from "@/hooks/use-game-state";

const LeftSidebar: React.FC = () => {
  const { resources, setSelected } = useGameState();

  return (
    <aside className="flex flex-col gap-4 w-56 md:w-64 overflow-y-auto p-2">
      {/* Resources panel */}
      <section className="game-panel" id="resources-panel">
        <h3 className="panel-header">
          Recursos
        </h3>
        <div className="space-y-1">
          <div className="max-h-48 overflow-y-auto pr-1">
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪙</span>
                <span className="text-sm font-medium">Moedas</span>
              </div>
              <span className="text-sm font-semibold">{resources.coins}</span>
            </div>
            <button 
              className="w-full flex items-center justify-center gap-2 p-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              onClick={() => setSelected({ type: "store" })}
            >
              <span className="text-xl">🛍️</span>
              <span className="font-medium">Abrir Loja</span>
            </button>
          </div>
        </div>
      </section>
    </aside>
  );
};

export default LeftSidebar;