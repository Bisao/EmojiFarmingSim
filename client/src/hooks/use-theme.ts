import { useContext } from "react";
import { ThemeContext } from "@/lib/ThemeProvider";

/**
 * Custom hook to access and manipulate theme settings
 * 
 * @returns Theme context with current theme and setter function
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
}

/**
 * Toggle between light and dark themes
 * 
 * @param currentTheme Current theme value
 * @param setTheme Function to update theme
 */
export function toggleTheme(currentTheme: string, setTheme: (theme: "light" | "dark") => void) {
  setTheme(currentTheme === "light" ? "dark" : "light");
}

/**
 * Check if the system prefers dark mode
 * 
 * @returns Boolean indicating if system prefers dark mode
 */
export function systemPrefersDarkMode(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Apply theme to document based on theme selection
 * 
 * @param theme Theme to apply
 */
export function applyTheme(theme: "light" | "dark") {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}
