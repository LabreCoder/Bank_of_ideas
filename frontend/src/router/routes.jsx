import Dashboard from "../pages/Dashboard.jsx";
import Ideas from "../pages/Ideas.jsx";
import Planning from "../pages/Planning.jsx";
import Cycles from "../pages/Cycles.jsx";
import Settings from "../pages/Settings.jsx";

// Centralized route definitions. Keeping this separate from App.jsx
// makes it easy to see the whole app's structure at a glance, and
// to add nested routes later (e.g. /ideas/:id) without touching App.jsx.
export const routes = [
  { path: "dashboard", element: <Dashboard /> },
  { path: "ideas", element: <Ideas /> },
  { path: "planning", element: <Planning /> },
  { path: "cycle", element: <Cycles /> },
  { path: "settings", element: <Settings /> },
];
