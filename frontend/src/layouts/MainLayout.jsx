import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

// This layout wraps every page. <Outlet /> is where React Router
// renders whichever page component matches the current URL
// (Dashboard, Ideas, Planning or Settings).
export default function MainLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* min-w-0: sem isso, um filho flex nunca encolhe menor que seu
          conteúdo (min-width: auto é o padrão do Flexbox). Grids largos,
          como o calendário do Dashboard, "empurram" a página inteira mais
          larga que a tela em vez de se ajustar ao espaço disponível. */}
      <main className="flex-1 min-w-0 p-8">
        <Outlet />
      </main>
    </div>
  );
}