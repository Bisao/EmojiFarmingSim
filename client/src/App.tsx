import { Switch, Route } from "wouter";
import { ThemeProvider } from "./lib/ThemeProvider";
import GamePage from "./pages/GamePage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={GamePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  );
}

export default App;
