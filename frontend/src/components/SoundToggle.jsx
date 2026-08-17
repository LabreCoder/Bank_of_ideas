import { useState } from "react";
import { AMBIENT_SOUNDS, useSound } from "../context/SoundContext";

function VolumeOnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" strokeLinecap="round" />
    </svg>
  );
}

function VolumeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" strokeLinecap="round" />
      <line x1="17" y1="9" x2="23" y2="15" strokeLinecap="round" />
    </svg>
  );
}

export default function SoundToggle() {
  const { sound, setSound, playing, setPlaying, togglePlaying } = useSound();
  const [menuOpen, setMenuOpen] = useState(false);

  const isPlaying = playing && sound !== "none";

  const handleClick = () => {
    if (sound === "none") {
      // Nunca escolheu uma faixa ainda — abre o mini menu em vez de
      // tentar "tocar" o valor none.
      setMenuOpen(true);
      return;
    }
    togglePlaying();
  };

  const handlePick = (id) => {
    setSound(id);
    setPlaying(true);
    setMenuOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center justify-center rounded-md border border-ui-border bg-ui-surface-2 p-2 text-ui-text-secondary transition-colors hover:text-ui-text-primary"
        aria-label={isPlaying ? "Pause ambient sound" : "Play ambient sound"}
        title={isPlaying ? "Pause ambient sound" : "Play ambient sound"}
      >
        {isPlaying ? <VolumeOnIcon /> : <VolumeOffIcon />}
      </button>

      {menuOpen && (
        <>
          {/* Fundo transparente cobrindo a tela — clicar fora fecha o menu,
              mesmo truque usado no DetailModal. */}
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 mt-2 w-36 rounded-md border border-ui-border bg-ui-surface shadow-lg z-50 py-1">
            {AMBIENT_SOUNDS.filter((s) => s.id !== "none").map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handlePick(s.id)}
                className="block w-full text-left px-3 py-1.5 text-sm text-ui-text-secondary hover:bg-ui-surface-2 hover:text-ui-text-primary"
              >
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}