import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NotificationDropdown from '../components/NotificationDropdown';
import { Menu } from 'lucide-react';

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-[#09090b] flex relative">
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        setIsOpen={setIsMobileMenuOpen}
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
      />

      <main 
        className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? 'lg:ml-[220px]' : 'lg:ml-[68px]'
        }`}
      >
        {/* Mobile-only header bar */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
            >
              <Menu size={18} />
            </button>
            <span
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              className="text-[15px] font-semibold text-white"
            >
              SkillSwap
            </span>
          </div>
          <NotificationDropdown align="right" />
        </div>

        {/* Page content */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

