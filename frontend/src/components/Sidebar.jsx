import { NavLink } from "react-router-dom";

// Each entry maps a route path to a label shown in the sidebar.
// Centralizing this list here means adding a 5th screen later is
// just one more object in this array.
const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/ideas", label: "Ideas" },
  { to: "/planning", label: "Planning" },
  { to: "/settings", label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-gray-900 text-gray-200 min-h-screen flex flex-col">
      <div className="px-5 py-6 border-b border-gray-800">
        <h1 className="text-lg font-semibold text-white">Bank of Ideas</h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            // NavLink gives us an `isActive` flag for free, so the
            // current screen is visually highlighted without extra state.
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
