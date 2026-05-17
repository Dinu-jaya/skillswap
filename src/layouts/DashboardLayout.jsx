import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NotificationDropdown from '../components/NotificationDropdown';
import { Menu } from 'lucide-react';

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const location = useLocation();

  const getPageTitle = (path) => {
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/browse')) return 'Browse Skills';
    if (path.startsWith('/requests')) return 'Requests';
    if (path.startsWith('/contracts')) return 'Contracts';
    if (path.startsWith('/chat')) return 'Messages';
    if (path.startsWith('/profile')) return 'Profile';
    if (path.startsWith('/learn')) return 'Learn';
    if (path.startsWith('/admin')) return 'Admin';
    return 'SkillSwap';
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex relative">
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        setIsOpen={setIsMobileMenuOpen}
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
      />

      <main 
        className={`flex-1 min-w-0 w-full min-h-[100dvh] flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? 'lg:ml-[220px]' : 'lg:ml-[68px]'
        }`}
      >
        {/* Mobile-only header bar */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-2 border-b border-white/[0.05] bg-[#09090b]/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-11 h-11 flex items-center justify-center -ml-2 text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-xl transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <span
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              className="text-[16px] font-semibold text-white ml-1"
            >
              {getPageTitle(location.pathname)}
            </span>
          </div>
          <NotificationDropdown align="right" />
        </div>

        {/* Page content */}
        <div className="flex-1 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

