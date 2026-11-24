import { Outlet } from "react-router-dom";
import Topbar from "../components/Topbar.jsx";
import AmbientAudio from "../components/AmbientAudio.jsx";

// This layout wraps every page. <Outlet /> is where React Router
// renders whichever page component matches the current URL
// (Dashboard, Ideas, Planning or Settings).
export default function MainLayout() {
  return (
    <div className="min-h-screen bg-ui-page text-ui-text-primary">
      {/* Acessibilidade: primeiro item do Tab. Invisível até receber foco;
          leva direto ao conteúdo sem passar pela navegação do topo. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-accent-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>
      <Topbar />
      {/* min-w-0: sem isso, um filho flex nunca encolhe menor que seu
          conteúdo (min-width: auto é o padrão do Flexbox). Grids largos,
          como o calendário do Dashboard, "empurram" a página inteira mais
          larga que a tela em vez de se ajustar ao espaço disponível.
          tabIndex -1: o link "Skip to content" consegue mover o foco para cá. */}
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-[1700px] min-w-0 px-4 py-6 focus:outline-none sm:px-6 lg:px-8 lg:py-8"
      >
        <Outlet />
      </main>
      <AmbientAudio />
    </div>
  );
}
