import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import { routes } from "./router/routes.jsx";

export default function App() {
  return (
    <Routes>
      {/* MainLayout renders the sidebar once, and all pages below
          share it via <Outlet /> — no need to repeat the sidebar
          in every page component. */}
      <Route element={<MainLayout />}>
        {/* Redirects "/" straight to the Dashboard, so the app always
            opens on a meaningful screen instead of a blank route. */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>
    </Routes>
  );
}
