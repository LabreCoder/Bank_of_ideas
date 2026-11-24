import { useTheme } from "../../context/ThemeContext";
import { Card } from "../ui";

function RadioOption({ name, checked, onChange, children }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ui-text-secondary">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="accent-accent-500 w-4 h-4" />
      {children}
    </label>
  );
}

export default function ThemePanel() {
  const { theme, setTheme, availableThemes, textSize, setTextSize, textSizes } = useTheme();

  return (
    <div className="flex flex-col gap-4">
      <Card role="radiogroup" aria-labelledby="settings-theme-heading">
        <h3 id="settings-theme-heading" className="text-lg font-semibold mb-2">Theme</h3>
        <p className="text-ui-text-secondary mb-4">Choose the accent color used across the app.</p>
        <div className="flex flex-wrap grid sm:grid-cols-5 gap-5">
          {availableThemes.map((t) => (
            <RadioOption key={t.id} name="theme" checked={theme === t.id} onChange={() => setTheme(t.id)}>
              {t.label}
            </RadioOption>
          ))}
        </div>
      </Card>

      {/* Acessibilidade: aumenta texto, espaçamentos e controles da interface toda. */}
      <Card role="radiogroup" aria-labelledby="settings-text-size-heading">
        <h3 id="settings-text-size-heading" className="text-lg font-semibold mb-2">Text size</h3>
        <p className="text-ui-text-secondary mb-4">Make text and controls larger across the app.</p>
        <div className="flex flex-wrap gap-5">
          {textSizes.map((s) => (
            <RadioOption key={s.id} name="text-size" checked={textSize === s.id} onChange={() => setTextSize(s.id)}>
              {s.label}
            </RadioOption>
          ))}
        </div>
      </Card>
    </div>
  );
}
