import { useEffect } from "react";
import MainGameContainer from "@/components/game/MainGameContainer";
import TutorialOverlay from "@/components/game/TutorialOverlay";
import { useGameState } from "@/hooks/use-game-state";
import { useMobile } from "@/hooks/use-mobile";
import { requestFullscreen, requestRotation } from "@/lib/utils";

export default function GamePage() {
  const { tutorialVisible, setTutorialVisible } = useGameState();
  const isMobile = useMobile();
  
  useEffect(() => {
    if (isMobile) {
      const handleTouchStart = () => {
        requestFullscreen();
        requestRotation();
      };
      
      document.addEventListener('touchstart', handleTouchStart, { once: true });
      return () => document.removeEventListener('touchstart', handleTouchStart);
    }
  }, [isMobile]);
  
  useEffect(() => {
    // Show tutorial on first visit
    const hasVisitedBefore = localStorage.getItem("emojiFarmVisited");
    if (!hasVisitedBefore) {
      setTutorialVisible(true);
      localStorage.setItem("emojiFarmVisited", "true");
    }
  }, [setTutorialVisible]);

  return (
    <>
      <MainGameContainer />
      {tutorialVisible && <TutorialOverlay />}
    </>
  );
}
