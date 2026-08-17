import { AMBIENT_SOUNDS, useSound } from "../../context/SoundContext";

export default function SoundPanel() {
  const { sound, setSound, playing, togglePlaying } = useSound();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-2">Ambient Sound</h3>
      <p className="text-gray-500 text-sm mb-4">
        Background sound while you work. This lives here temporarily for testing —
        it'll move to a topbar icon later.
      </p>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {AMBIENT_SOUNDS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSound(s.id)}
            className={`px-3 py-2 rounded-md text-sm border transition-colors ${
              sound === s.id
                ? "border-accent-600 bg-accent-50 text-accent-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={togglePlaying}
        disabled={sound === "none"}
        className="bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-md"
      >
        {playing ? "Pause" : "Play"}
      </button>
    </div>
  );
}