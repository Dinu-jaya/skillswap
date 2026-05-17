import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  User,
  ArrowLeftRight,
  LogOut,
  Shield,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { subscribeToConversations } from '../firebase/chatService';
import Avatar from './Avatar';

const Sidebar = ({ isOpen, setIsOpen, isExpanded, setIsExpanded }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentUser, userProfile, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  };

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeToConversations(currentUser.uid, (data) => {
      let total = 0;
      data.forEach(c => {
        if (c.unreadCounts?.[currentUser.uid]) {
          total += c.unreadCounts[currentUser.uid];
        }
      });
      setUnreadCount(total);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const menuItems = [
    { name: 'Dashboard',    icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Browse Skills', icon: BookOpen,        path: '/browse' },
    { name: 'Requests',     icon: ArrowLeftRight,  path: '/requests' },
    { name: 'Contracts',    icon: FileText,         path: '/contracts' },
    { name: 'Messages',     icon: MessageSquare,   path: '/chat' },
    { name: 'Profile',      icon: User,            path: '/profile' },
    { name: 'Learn',        icon: HelpCircle,      path: '/learn' },
    ...(isAdmin ? [{ name: 'Admin', icon: Shield, path: '/admin', accent: true }] : []),
  ];

  const displayName = userProfile?.displayName || userProfile?.name || (currentUser?.email ? currentUser.email.split('@')[0] : 'User');

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`${isExpanded ? 'w-[220px]' : 'w-[68px]'} h-screen fixed left-0 top-0 z-50 flex flex-col
          bg-[#0c0c0e] border-r border-white/[0.05]
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo Toggle */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center w-full focus:outline-none pt-6 pb-5 ${isExpanded ? 'px-5' : 'justify-center'}`}
        >
          <div className="flex items-center gap-2">
            <div className="w-[22px] h-[22px] rounded-md bg-cyan-400 flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-3 h-3 text-zinc-950" strokeWidth={2.5} />
            </div>
            {isExpanded && (
              <span
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                className="text-[15px] font-semibold text-white tracking-tight animate-in fade-in slide-in-from-left-2 duration-300"
              >
                SkillSwap
              </span>
            )}
          </div>
        </button>

        {/* Section label */}
        {isExpanded && (
          <p className="section-label px-5 mb-2 animate-in fade-in duration-300">Navigation</p>
        )}

        {/* Nav items */}
        <nav className={`flex-1 space-y-0.5 overflow-y-auto ${isExpanded ? 'px-2' : 'px-3'}`}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen && setIsOpen(false)}
                title={!isExpanded ? item.name : ''}
                className={`group flex items-center rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  isExpanded ? 'gap-2.5 px-3 py-[9px]' : 'justify-center p-2.5'
                } ${
                  isActive
                    ? 'bg-white/[0.06] text-white'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                <item.icon
                  size={14}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={`shrink-0 transition-colors ${
                    isActive
                      ? item.accent ? 'text-violet-400' : 'text-cyan-400'
                      : item.accent ? 'text-violet-600 group-hover:text-violet-400' : 'text-zinc-600 group-hover:text-zinc-400'
                  }`}
                />
                {isExpanded && (
                  <span className="truncate animate-in fade-in slide-in-from-left-2 duration-300 flex-1">
                    {item.name}
                  </span>
                )}
                {item.name === 'Messages' && unreadCount > 0 && (
                  <span className={`bg-cyan-400 text-zinc-950 text-[9px] font-black flex items-center justify-center rounded-full shrink-0 ${isExpanded ? 'w-4 h-4 ml-auto animate-in fade-in zoom-in duration-300' : 'absolute top-1 right-1 w-3.5 h-3.5'}`}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {isActive && isExpanded && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute left-0 w-[3px] h-5 bg-cyan-400 rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`p-2 border-t border-white/[0.05] space-y-0.5 ${!isExpanded && 'flex flex-col items-center'}`}>
          {/* Notification bell — expanded shows dropdown inline, collapsed shows icon only */}
          {isExpanded ? (
            <div className="w-full px-3 py-[9px] flex items-center">
              <NotificationDropdown align="left" />
            </div>
          ) : (
            <NotificationDropdown align="left" />
          )}

          <div className={`flex items-center rounded-lg ${isExpanded ? 'gap-2.5 px-3 py-[9px]' : 'p-2.5'}`}>
            <Avatar
              avatarId={userProfile?.avatar}
              avatarUrl={userProfile?.avatarType === 'custom' ? userProfile?.avatarUrl : null}
              size={20}
              className="rounded-full shrink-0"
            />
            {isExpanded && (
              <span className="text-[12px] text-zinc-500 truncate flex-1 capitalize animate-in fade-in duration-300">
                {displayName}
              </span>
            )}
            {isExpanded && (
              <button
                onClick={handleLogout}
                title="Sign out"
                className="text-zinc-600 hover:text-red-400 transition-colors"
              >
                <LogOut size={12} strokeWidth={1.8} />
              </button>
            )}
          </div>
          {!isExpanded && (
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-2.5 text-zinc-600 hover:text-red-400 transition-colors"
            >
              <LogOut size={12} strokeWidth={1.8} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
