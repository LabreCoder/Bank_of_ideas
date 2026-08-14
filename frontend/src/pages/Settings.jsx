import { useState } from "react";
import CategoriesPanel from "../components/Settings/CategoriesPanel";
import ThemePanel from "../components/Settings/ThemePanel";
import OwnersPanel from "../components/Settings/OwnersPanel";

const TABS = [
  { id: "categories", label: "Categories" },
  { id: "owners", label: "Owners" },
  { id: "theme", label: "Theme" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-sm font-medium px-4 py-2 border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? "border-accent-600 text-accent-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "categories" ? (
        <CategoriesPanel />
      ) : activeTab === "theme" ? (
        <ThemePanel />
      ) : (
        <OwnersPanel />
      )}
    </div>
  );
}