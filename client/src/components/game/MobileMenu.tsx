
import React from "react";
import { useGameState } from "@/hooks/use-game-state";
import { motion } from "framer-motion";

const MobileMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { setActivePanel } = useGameState();

  const handlePanelSelect = (panel: string) => {
    setActivePanel(panel === 'agriculture' ? 'right' : 'left');
    onClose();
  };

  const menuItems = [
    { id: 'shop', emoji: '🛍️', label: 'Loja' },
    { id: 'storage', emoji: '🏦', label: 'Armazém' },
    { id: 'resources', emoji: '💰', label: 'Recursos' },
    { id: 'status', emoji: '📊', label: 'Status' },
    { id: 'options', emoji: '⚙️', label: 'Opções' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="md:hidden bg-card/80 backdrop-blur-sm rounded-xl shadow-lg p-4"
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
