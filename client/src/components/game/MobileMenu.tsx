
import React from "react";
import { useGameState } from "@/hooks/use-game-state";
import { motion } from "framer-motion";

const MobileMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { setActivePanel, setSelected } = useGameState();

  const handlePanelSelect = (panel: string) => {
    if (panel === 'shop') {
      setSelected({ type: 'store', key: null });
    } else if (panel === 'storage') {
      setSelected({ type: 'storage', key: null });
    }
    setActivePanel(null);
    onClose();
  };

  const menuItems = [
    { id: 'shop', emoji: '🛒', label: 'Loja' },
    { id: 'storage', emoji: '📦', label: 'Armazém' },
    { id: 'status', emoji: '📊', label: 'Status' },
    { id: 'options', emoji: '⚙️', label: 'Opções' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1a1b26]/95 backdrop-blur-sm rounded-xl shadow-lg p-4 z-50"
    >
      <div className="grid grid-cols-2 gap-4">
        {menuItems.map(item => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-[#24283b] hover:bg-[#2c324a] active:bg-[#363d5e] rounded-lg flex flex-col items-center gap-2 transition-colors w-24"
            onClick={() => handlePanelSelect(item.id)}
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="text-xs font-medium text-white/90">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default MobileMenu;
