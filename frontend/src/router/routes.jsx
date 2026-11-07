import Dashboard from "../pages/Dashboard.jsx";
import Ideas from "../pages/Ideas.jsx";
import Planning from "../pages/Planning.jsx";
import Cycles from "../pages/Cycles.jsx";
import Settings from "../pages/Settings.jsx";

// Centralized route definitions.
//
// D02: detalhe e criação têm URL própria. O segmento opcional mantém a mesma
// página montada entre lista, detalhe e criação (os dados já carregados não
// são buscados de novo):
//   /ideas            lista          /planning            lista
//   /ideas/new        criação        /planning/new        criação (?ideaId= pré-seleciona)
//   /ideas/:ideaId    detalhe        /planning/:planningId detalhe
export const routes = [
  { path: "dashboard", element: <Dashboard /> },
  { path: "ideas/:ideaId?", element: <Ideas /> },
  { path: "planning/:planningId?", element: <Planning /> },
  { path: "cycle", element: <Cycles /> },
  { path: "settings", element: <Settings /> },
];
