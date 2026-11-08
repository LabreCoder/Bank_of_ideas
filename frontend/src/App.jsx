import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import { routes } from "./router/routes.jsx";

// Data router (createBrowserRouter) em vez de <BrowserRouter>: é o que permite
// usar useBlocker para confirmar a saída de telas com alterações não salvas (D01/D02).
export const router = createBrowserRouter([
  {
    // MainLayout renders the top bar once, and all pages below share it via <Outlet />.
    element: <MainLayout />,
    children: [
      // "/" vai direto para o Dashboard.
      { index: true, element: <Navigate to="/dashboard" replace /> },
      ...routes,
    ],
  },
]);
