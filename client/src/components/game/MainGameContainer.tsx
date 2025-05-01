import React from "react";
import GameHeader from "./GameHeader";
import LeftSidebar from "./LeftSidebar";
import GameArea from "./GameArea";
import RightSidebar from "./RightSidebar";
import { useMobile } from "@/hooks/use-mobile";

const MainGameContainer: React.FC = () => {
  const isMobile = useMobile();

  return (
    <div className="min-h-screen flex flex-col">
      <GameHeader />
      
      <main className="flex flex-1 p-2 md:p-4 gap-4 overflow-hidden max-h-[calc(100vh-64px)]">
        {!isMobile && <LeftSidebar />}
        <GameArea />
        {!isMobile && <RightSidebar />}
      </main>
    </div>
  );
};

export default MainGameContainer;
