
import React from "react";
import { useGameState } from "@/hooks/use-game-state";
import { motion } from "framer-motion";

const MobileMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { setActivePanel, setSelected } = useGameState();

  const handlePanelSelect = (panel: string) => {
    if (panel === 'shop') {
      setSelected({ type: 'store', key: null });
    } else if (panel === 'storage' || panel === 'resources' || panel === 'status') {
      setSelected({ type: panel, key: null });
    } else if (panel === 'options') {
      setSelected({ type: 'options', key: null });
    }
    setActivePanel(null);
    onClose();
  };

  const menuItems = [
    { id: 'shop', emoji: '🛍️', label: 'Loja' },
    { id: 'storage', emoji: '🏦', label: 'Armazém' },
    { id: 'status', emoji: '📊', label: 'Status' },
    { id: 'options', emoji: '⚙️', label: 'Opções' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="md:hidden bg-card/95 backdrop-blur-sm rounded-xl shadow-lg p-4 w-[95%] max-w-sm mx-auto"
    >
      <div className="grid grid-cols-3 gap-3">
        {menuItems.map(item => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-muted/50 hover:bg-primary/20 active:bg-primary/30 rounded-lg flex flex-col items-center gap-1 transition-colors"
            onClick={() => handlePanelSelect(item.id)}
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default MobileMenu;
