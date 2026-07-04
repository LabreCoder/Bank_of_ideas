import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

// This layout wraps every page. <Outlet /> is where React Router
// renders whichever page component matches the current URL
// (Dashboard, Ideas, Planning or Settings).
export default function MainLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
