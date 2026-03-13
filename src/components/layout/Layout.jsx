import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar  from "./Topbar";

export default function Layout() {
  const [collapsed,  setCollapsed]  = useState(false);
  const [darkMode,   setDarkMode]   = useState(false);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">

        {/* Sidebar */}
        <div
          className="flex-shrink-0 h-full transition-all duration-300"
          style={{ width: collapsed ? 60 : 220 }}
        >
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        {/* Main area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar darkMode={darkMode} setDarkMode={setDarkMode} />

          <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
            <Outlet />
          </main>
        </div>

      </div>
    </div>
  );
}
