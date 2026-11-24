import { createContext, useContext, useEffect, useState } from "react";

// Precisa bater exatamente com os blocos [data-theme="..."] definidos em theme-variables.css.
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

// Tamanho do texto da interface (acessibilidade). Precisa bater com os
// seletores html[data-text-size="..."] em index.css.
export const TEXT_SIZES = [
  { id: "default", label: "Default" },
  { id: "large", label: "Large" },
  { id: "xlarge", label: "Extra large" },
];

const STORAGE_KEY = "content-planner-theme";
const MODE_STORAGE_KEY = "content-planner-mode";
const TEXT_SIZE_STORAGE_KEY = "content-planner-text-size";
const DEFAULT_THEME = "cyan";
const DEFAULT_MODE = "dark";
const DEFAULT_TEXT_SIZE = "default";

// localStorage pode lançar exceção (modo privado, armazenamento bloqueado).
// Nesses casos a preferência só não persiste — a interface não quebra.
function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignora: preferência fica só na sessão atual
  }
}

const isTheme = (id) => AVAILABLE_THEMES.some((t) => t.id === id);
const isTextSize = (id) => TEXT_SIZES.some((s) => s.id === id);

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Valores salvos são validados: um tema removido ou valor corrompido no
  // storage cai no padrão em vez de deixar a página sem cor de destaque.
  const [theme, setThemeState] = useState(() => {
    const stored = readStorage(STORAGE_KEY);
    return isTheme(stored) ? stored : DEFAULT_THEME;
  });
  const [mode, setModeState] = useState(() => {
    const stored = readStorage(MODE_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : DEFAULT_MODE;
  });
  const [textSize, setTextSizeState] = useState(() => {
    const stored = readStorage(TEXT_SIZE_STORAGE_KEY);
    return isTextSize(stored) ? stored : DEFAULT_TEXT_SIZE;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    writeStorage(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-mode", mode);
    writeStorage(MODE_STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    document.documentElement.setAttribute("data-text-size", textSize);
    writeStorage(TEXT_SIZE_STORAGE_KEY, textSize);
  }, [textSize]);

  const setTheme = (newTheme) => {
    setThemeState(isTheme(newTheme) ? newTheme : DEFAULT_THEME);
  };

  const setMode = (newMode) => {
    setModeState(newMode === "light" ? "light" : "dark");
  };

  const toggleMode = () => {
    setModeState((currentMode) => (currentMode === "dark" ? "light" : "dark"));
  };

  const setTextSize = (size) => {
    setTextSizeState(isTextSize(size) ? size : DEFAULT_TEXT_SIZE);
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
        textSize,
        setTextSize,
        textSizes: TEXT_SIZES,
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
