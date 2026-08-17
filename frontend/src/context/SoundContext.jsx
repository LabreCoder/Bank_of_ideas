import { createContext, useContext, useEffect, useState } from "react";

export const AMBIENT_SOUNDS = [
  { id: "none", label: "None" },
  { id: "piano", label: "Piano" },
  { id: "lofi", label: "Lo-fi" },
  { id: "soft", label: "Soft" },
];

const STORAGE_KEY = "content-planner-ambient-sound";
const DEFAULT_SOUND = "none";

const SoundContext = createContext(null);

export function SoundProvider({ children }) {
  const [sound, setSoundState] = useState(() => localStorage.getItem(STORAGE_KEY) || DEFAULT_SOUND);
  // playing começa sempre false, mesmo que a última faixa escolhida não
  // seja "none" — autoplay ao carregar a página é bloqueado pela maioria
  // dos navegadores de qualquer forma, então nem vale tentar.
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, sound);
  }, [sound]);

  const setSound = (id) => {
    const isValid = AMBIENT_SOUNDS.some((s) => s.id === id);
    setSoundState(isValid ? id : DEFAULT_SOUND);
  };

  const togglePlaying = () => setPlaying((p) => !p);

  return (
    <SoundContext.Provider value={{ sound, setSound, playing, setPlaying, togglePlaying }}>
      {children}
    </SoundContext.Provider>
  );
}

// Hook que qualquer componente usa: const { sound, setSound, playing, togglePlaying } = useSound();
export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}