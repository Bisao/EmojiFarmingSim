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
        <div className="grid grid-cols-1 gap-2">
          <div className="flex justify-between items-center p-2 bg-muted rounded-lg">
            <span className="flex items-center gap-1">
              <span className="text-xl">🪙</span>
              <span>Moedas</span>
            </span>
            <span className="font-semibold">{resources.coins}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted rounded-lg">
            <span className="flex items-center gap-1">
              <span className="text-xl">🪵</span>
              <span>Madeira</span>
            </span>
            <span className="font-semibold">{resources.wood}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted rounded-lg">
            <span className="flex items-center gap-1">
              <span className="text-xl">🪨</span>
              <span>Pedra</span>
            </span>
            <span className="font-semibold">{resources.stone}</span>
          </div>
        </div>
      </section>
      
      {/* Structures shop panel */}
      <section className="bg-card rounded-xl shadow-md p-3 flex flex-col gap-2" id="shop-structures">
        <h3 className="font-display text-lg font-bold text-primary-dark border-b border-muted pb-1">
          Estruturas
        </h3>
        {Object.entries(structureMap).map(([key, structure]) => (
          <button 
            key={key}
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
              selected?.type === "structure" && selected.key === key
                ? "bg-primary text-white"
                : "hover:bg-primary hover:text-white"
            }`}
            onClick={() => handleStructureSelect(key)}
          >
            <span className="text-xl">{structure.emoji}</span>
            <div className="flex-1 text-left">
              <div>{structure.name}</div>
              <div className="text-xs flex items-center">
                <span>{structure.cost.coins}</span>
                <span className="text-xs">🪙</span>
              </div>
            </div>
          </button>
        ))}
      </section>
    </aside>
  );
};

export default LeftSidebar;
