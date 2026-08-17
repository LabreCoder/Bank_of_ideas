import { Outlet } from "react-router-dom";
import Topbar from "../components/Topbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import AmbientAudio from "../components/AmbientAudio.jsx";

// This layout wraps every page. <Outlet /> is where React Router
// renders whichever page component matches the current URL
// (Dashboard, Ideas, Planning or Settings).
export default function MainLayout() {
  return (
    <div className="min-h-screen bg-ui-page text-ui-text-primary">
      <Topbar />
      {/* min-w-0: sem isso, um filho flex nunca encolhe menor que seu
          conteúdo (min-width: auto é o padrão do Flexbox). Grids largos,
          como o calendário do Dashboard, "empurram" a página inteira mais
          larga que a tela em vez de se ajustar ao espaço disponível. */}
      <main className="mx-auto w-full max-w-[1400px] min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
      <AmbientAudio />
    </div>
  );
}