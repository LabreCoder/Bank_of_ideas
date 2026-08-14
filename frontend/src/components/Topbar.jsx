import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../router/navigationItems";
import { useTheme } from "../context/ThemeContext";
import darkIcon from "../../public/icons/dark.png";
import brightIcon from "../../public/icons/bright.png";

export default function Topbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { mode, toggleMode } = useTheme();

  const modeIconSrc = mode === "dark" ? darkIcon : brightIcon;
  const modeLabel = mode === "dark" ? "Dark mode" : "Light mode";
  const modeSwitchLabel = mode === "dark" ? "Switch to light mode" : "Switch to dark mode";

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-ui-border bg-ui-surface/90 backdrop-blur">
      <div className="mx-auto flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => window.location.href = "/dashboard"}
        >
          <h1 className="text-sm font-semibold uppercase tracking-[0.16em] text-ui-text-primary sm:text-base">
            Bank of Ideas
          </h1>
        </button>
        {/*
        <span className="hidden rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-500 sm:inline-flex">
          Workspace
        </span>*/}
        <nav className="hidden items-center md:flex ml-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent-600 text-white"
                    : "text-ui-text-secondary hover:bg-ui-surface-2 hover:text-ui-text-primary"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

          <button
            type="button"
            onClick={toggleMode}
            className="inline-flex items-center gap-2 rounded-md border border-ui-border bg-ui-surface-2 px-2.5 py-1.5 text-xs font-medium text-ui-text-secondary transition-colors hover:text-ui-text-primary mr-8 ml-4"
            aria-label={modeSwitchLabel}
            title={modeSwitchLabel}
          >
            <img src={modeIconSrc} alt={modeLabel} className="h-4 w-4 object-contain" />
            <span className="hidden sm:inline">{mode === "dark" ? "Dark" : "Light"}</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-ui-border p-2 text-ui-text-secondary transition-colors hover:bg-ui-surface-2 hover:text-ui-text-primary md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
      </div>
      <div>
        {menuOpen && (
          <nav id="mobile-nav" className="border-t border-ui-border bg-ui-surface px-4 py-3 sm:px-6 md:hidden">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-accent-600 text-white"
                          : "text-ui-text-secondary hover:bg-ui-surface-2 hover:text-ui-text-primary"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}