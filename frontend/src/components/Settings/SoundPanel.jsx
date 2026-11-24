import { AMBIENT_SOUNDS, useSound } from "../../context/SoundContext";
import { Button, Card } from "../ui";

export default function SoundPanel() {
  const { sound, setSound, playing, togglePlaying } = useSound();

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-2">Ambient Sound</h3>
      <p className="text-ui-text-muted text-sm mb-4">
        Background sound while you work. This lives here temporarily for testing —
        it'll move to a topbar icon later.
      </p>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {AMBIENT_SOUNDS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSound(s.id)}
            aria-pressed={sound === s.id}
            className={`px-3 py-2 rounded-md text-sm border transition-colors ${
              sound === s.id
                ? "border-accent-600 bg-ui-accent-soft text-ui-accent-strong"
                : "border-ui-border text-ui-text-secondary hover:bg-ui-surface-2"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <Button variant="primary" size="md" onClick={togglePlaying} disabled={sound === "none"}>
        {playing ? "Pause" : "Play"}
      </Button>
    </Card>
  );
}
