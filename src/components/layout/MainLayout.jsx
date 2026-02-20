import { Outlet, Link, useLocation } from "react-router-dom";
import { ShieldCheck, Activity } from "lucide-react";

const MainLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">

      {/* Top Bar */}
      <header className="h-16 border-b border-white/10 bg-panel/80 backdrop-blur-md flex items-center px-8 justify-between">

        <div className="flex items-center gap-3">
          <ShieldCheck className="text-accent" size={22} />
          <span className="font-semibold tracking-wide">
            Ozark
          </span>
        </div>

        <div className="flex items-center gap-8 text-sm">
          <NavLink path="/dashboard" label="Dashboard" current={location.pathname} />
          <NavLink path="/analysis" label="Live Graph" current={location.pathname} />

          <div className="flex items-center gap-2 text-accent text-xs">
            <Activity size={14} />
            ENGINE READY
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 px-12 py-10">
        <Outlet />
      </main>

    </div>
  );
};

const NavLink = ({ path, label, current }) => (
  <Link
    to={path}
    className={`transition-all duration-200 ${current === path
        ? "text-accent border-b border-accent pb-1"
        : "text-muted hover:text-white"
      }`}
  >
    {label}
  </Link>
);

export default MainLayout;
