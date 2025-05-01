import { Switch, Route } from "wouter";
import { ThemeProvider } from "./lib/ThemeProvider";
import { GameStateProvider } from "./lib/gameState";
import GamePage from "./pages/GamePage";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={GamePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Error boundary component to help with debugging
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Error caught by boundary:", event.error);
      setError(event.error);
      setHasError(true);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      <div className="p-8 bg-red-50 text-red-800 rounded-lg max-w-md mx-auto mt-8">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="mb-4">An error occurred while loading the application:</p>
        <pre className="bg-red-100 p-3 rounded text-sm overflow-auto">
          {error?.message || "Unknown error"}
        </pre>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <GameStateProvider>
        <ThemeProvider>
          <Router />
        </ThemeProvider>
      </GameStateProvider>
    </ErrorBoundary>
  );
}

export default App;
