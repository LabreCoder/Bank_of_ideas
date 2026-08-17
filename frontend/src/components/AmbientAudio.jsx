import { useEffect, useRef } from "react";
import { useSound } from "../context/SoundContext";

// Arquivos em public/ são servidos a partir da RAIZ do site pelo Vite —
// o caminho é absoluto (/audio/...), nunca relativo ao arquivo JS
// (../../public/audio/... nunca vai resolver certo).
const SOUNDS = {
  piano: "../../public/audio/piano.mp3",
  lofi: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
  soft: "../../public/audio/soft.mp3",
};

export default function AmbientAudio() {
  const { sound, playing } = useSound();
  const audioRef = useRef(null);
  const currentSrcRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const src = SOUNDS[sound];

    if (!playing || sound === "none" || !src) {
      audio.pause();
      return;
    }

    // Só troca o src se a faixa realmente mudou — trocar toda vez que
    // "playing" muda reiniciaria a faixa do zero mesmo sem trocar de som.
    if (currentSrcRef.current !== src) {
      audio.src = src;
      currentSrcRef.current = src;
    }

    audio.volume = 0.4;
    audio.loop = true;
    audio.play().catch(() => {
      // Autoplay bloqueado pelo navegador até o usuário interagir com a
      // página — comum no primeiro load, ignora silenciosamente.
    });
  }, [sound, playing]);

  // Sem `controls`: é headless de propósito, o play/pause é feito via
  // Context por outro componente (hoje o SoundPanel, depois o ícone).
  return <audio ref={audioRef} />;
}