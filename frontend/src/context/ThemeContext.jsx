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
const DEFAULT_THEME = "cyan";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
  });

  // Aplica o atributo no <html> sempre que o tema mudar — é isso que faz
  // o CSS em index.css selecionar o bloco de variáveis certo.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    const isValid = AVAILABLE_THEMES.some((t) => t.id === newTheme);
    setThemeState(isValid ? newTheme : DEFAULT_THEME);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes: AVAILABLE_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook que a tela de Settings (ou qualquer outro componente) vai usar:
// const { theme, setTheme, availableThemes } = useTheme();
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme needs to be used within a <ThemeProvider>");
  }
  return context;
}