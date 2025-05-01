import { useEffect } from "react";
import MainGameContainer from "@/components/game/MainGameContainer";
import TutorialOverlay from "@/components/game/TutorialOverlay";
import { useGameState } from "@/hooks/use-game-state";

export default function GamePage() {
  const { tutorialVisible, setTutorialVisible } = useGameState();
  
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
