import { useState } from "react";
import CategoriesPanel from "../components/Settings/CategoriesPanel";
import ThemePanel from "../components/Settings/ThemePanel";
import OwnersPanel from "../components/Settings/OwnersPanel";
import SoundPanel from "../components/Settings/SoundPanel";

const TABS = [
  { id: "categories", label: "Categories" },
  { id: "owners", label: "Owners" },
  { id: "theme", label: "Theme" },
  { id: "sound", label: "Sound" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-1">Settings</h2>
        <p className="text-ui-text-muted">Customize your application settings.</p>
      </div>

      <div className="flex gap-2 mb-4 border-b border-ui-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-sm font-medium px-4 py-2 border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? "border-accent-600 text-accent-700"
                : "border-transparent text-ui-text-muted hover:text-ui-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "categories" && <CategoriesPanel />}
      {activeTab === "owners" && <OwnersPanel />}
      {activeTab === "theme" && <ThemePanel />}
      {activeTab === "sound" && <SoundPanel />}
    </div>
  );
}