import React from "react";
import { useGameState } from "@/hooks/use-game-state";
import { buyStructure } from "@/lib/gameLogic";

const LeftSidebar: React.FC = () => {
  const { resources, structureMap, selected, setSelected, addLogMessage } = useGameState();

  const handleStructureSelect = (key: string) => {
    if (selected?.type === "structure" && selected.key === key) {
      setSelected(null);
      addLogMessage("Seleção cancelada.", "");
    } else {
      setSelected({ type: "structure", key });
      addLogMessage(`Selecionado ${structureMap[key].name}`, "");
    }
  };

  return (
    <aside className="flex flex-col gap-4 w-48 md:w-56 overflow-y-auto">
      {/* Resources panel */}
      <section className="bg-card rounded-xl shadow-md p-3 flex flex-col gap-2" id="resources-panel">
        <h3 className="font-display text-lg font-bold text-primary-dark border-b border-muted pb-1">
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
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪵</span>
                <span className="text-sm font-medium">Madeira</span>
              </div>
              <span className="text-sm font-semibold">{resources.wood}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪨</span>
                <span className="text-sm font-medium">Pedra</span>
              </div>
              <span className="text-sm font-semibold">{resources.stone}</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Structures shop panel */}
      <section className="bg-card rounded-xl shadow-md p-3 flex flex-col gap-2" id="shop-structures">
        <h3 className="font-display text-lg font-bold text-primary-dark border-b border-muted pb-1">
          Estruturas
        </h3>
        <div className="space-y-1">
          <div className="max-h-48 overflow-y-auto pr-1">
            {Object.entries(structureMap).map(([key, structure]) => (
              <div key={key} className="flex items-center justify-between p-2 bg-muted rounded-lg mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{structure.emoji}</span>
                  <span className="text-sm font-medium">{structure.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">{structure.cost.coins}🪙</span>
                  <button 
                    className={`text-white text-xs rounded-full w-6 h-6 flex items-center justify-center transition-colors ${
                      selected?.type === "structure" && selected.key === key
                        ? "bg-primary-dark"
                        : "bg-primary hover:bg-primary-dark"
                    }`}
                    onClick={() => handleStructureSelect(key)}
                    aria-label={`Select ${structure.name}`}
                  >
                    {selected?.type === "structure" && selected.key === key ? "✓" : "+"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </aside>
  );
};

export default LeftSidebar;
