import { createContext, useContext, useEffect, useState } from "react";

// Precisa bater exatamente com os blocos [data-theme="..."] definidos em index.css.
export const AVAILABLE_THEMES = [
  { id: "cyan", label: "Cyan" },
  { id: "indigo", label: "Blue" },
  { id: "green", label: "Green" },
  { id: "magenta", label: "Magenta" },
  { id: "pink", label: "Pink" },
  { id: "red", label: "Red" },
  { id: "yellow", label: "Yellow" },
  { id: "orange", label: "Orange" },
  { id: "purple", label: "Purple" },
  { id: "stone", label: "Stone" },
];

const STORAGE_KEY = "content-planner-theme";
const MODE_STORAGE_KEY = "content-planner-mode";
const DEFAULT_THEME = "cyan";
const DEFAULT_MODE = "dark";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
  });
  const [mode, setModeState] = useState(() => {
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : DEFAULT_MODE;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-mode", mode);
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, [mode]);

  const setTheme = (newTheme) => {
    const isValid = AVAILABLE_THEMES.some((t) => t.id === newTheme);
    setThemeState(isValid ? newTheme : DEFAULT_THEME);
  };

  const setMode = (newMode) => {
    setModeState(newMode === "light" ? "light" : "dark");
  };

  const toggleMode = () => {
    setModeState((currentMode) => (currentMode === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        availableThemes: AVAILABLE_THEMES,
        mode,
        setMode,
        toggleMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme needs to be used within a <ThemeProvider>");
  }
  return context;
}