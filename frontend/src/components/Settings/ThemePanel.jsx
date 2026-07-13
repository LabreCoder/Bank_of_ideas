import { useTheme } from "../../context/ThemeContext";

export default function ThemePanel() {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-2">Theme</h3>
      <p className="text-gray-700 mb-4">Choose the accent color used across the app.</p>
      <div className="flex flex-wrap grid sm:grid-cols-5 gap-5">
        {availableThemes.map((t) => (
          <label key={t.id} className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="theme"
              checked={theme === t.id}
              onChange={() => setTheme(t.id)}
              className="accent-accent-500 w-4 h-4"
            />
            {t.label}
          </label>
        ))}
      </div>
    </div>
  );
}