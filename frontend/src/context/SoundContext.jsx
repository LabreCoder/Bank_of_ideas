import { createContext, useContext, useEffect, useState } from "react";

export const AMBIENT_SOUNDS = [
  { id: "none", label: "None" },
  { id: "piano", label: "Piano" },
  { id: "soft", label: "Soft" },
];

const STORAGE_KEY = "content-planner-ambient-sound";
const DEFAULT_SOUND = "none";

const isValidSound = (id) => AMBIENT_SOUNDS.some((s) => s.id === id);

// Valor salvo pode ser de uma versão antiga (ex.: "lofi", removido) ou o
// storage pode estar indisponível (janela privada): cai no padrão.
function readStoredSound() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isValidSound(stored) ? stored : DEFAULT_SOUND;
  } catch {
    return DEFAULT_SOUND;
  }
}

const SoundContext = createContext(null);

export function SoundProvider({ children }) {
  const [sound, setSoundState] = useState(readStoredSound);
  // playing começa sempre false, mesmo que a última faixa escolhida não
  // seja "none" — autoplay ao carregar a página é bloqueado pela maioria
  // dos navegadores de qualquer forma, então nem vale tentar.
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, sound);
    } catch {
      // storage indisponível: a escolha vale só para esta sessão
    }
  }, [sound]);

  const setSound = (id) => {
    setSoundState(isValidSound(id) ? id : DEFAULT_SOUND);
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