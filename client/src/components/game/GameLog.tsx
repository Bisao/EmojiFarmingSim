import React, { useRef, useEffect } from "react";
import { useGameState } from "@/hooks/use-game-state";

const GameLog: React.FC = () => {
  const { logMessages } = useGameState();
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logMessages]);

  return (
    <div className="bg-card rounded-xl shadow-md p-3 h-32 md:h-40 overflow-y-auto" ref={logRef}>
      <h3 className="font-display text-sm font-bold text-primary-dark mb-1">Registro de Atividades</h3>
      <div className="space-y-1 text-sm">
        {logMessages.map((message, index) => (
          <p key={index} className="text-sm text-gray-700 dark:text-gray-200 font-medium">
            {message.icon} [{message.timestamp}] {message.text}
          </p>
        ))}
      </div>
    </div>
  );
};

export default GameLog;
