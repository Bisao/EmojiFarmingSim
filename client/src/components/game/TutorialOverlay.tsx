import React from "react";
import { useGameState } from "@/hooks/use-game-state";

const TutorialOverlay: React.FC = () => {
  const { setTutorialVisible } = useGameState();
  
  const handleClose = () => {
    setTutorialVisible(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
      <div className="bg-card max-w-md mx-auto rounded-xl p-6 max-h-[80vh] overflow-y-auto">
        <h2 className="font-display text-2xl font-bold text-primary-dark mb-4">Bem-vindo ao Emoji Farm!</h2>
        <div className="space-y-4">
          <p>Construa sua própria fazenda e gerencie seus recursos com sabedoria.</p>
          <div className="bg-muted p-3 rounded-lg">
            <h3 className="font-bold mb-2">Como jogar:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Compre estruturas para produzir recursos</li>
              <li>Crie campos para plantar sementes</li>
              <li>Colha e venda sua produção</li>
              <li>Expanda sua fazenda!</li>
            </ul>
          </div>
          
          <div className="bg-muted p-3 rounded-lg">
            <h3 className="font-bold mb-2">Dicas:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>O Lenhador (🧑🏼‍🦰) coleta madeira (🪵) das árvores</li>
              <li>O Minerador (👴🏼) coleta pedra (🪨) das rochas</li>
              <li>Plante sementes nos campos de plantio</li>
              <li>Venda recursos e colheitas para obter moedas (🪙)</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleClose}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Começar a jogar!
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
