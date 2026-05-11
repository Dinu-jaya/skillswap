import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowLeftRight, ArrowLeft, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryButton } from './Button';
import NotificationBell from './NotificationDropdown';
import { useAuth } from '../context/AuthContext';
import { subscribeToConversations } from '../firebase/chatService';
import Avatar from './Avatar';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, userProfile, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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



  const navLinks = [
    { name: 'Explore', path: '/explore' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Community', path: '/community' },
    { name: 'About', path: '/about' },
  ];

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3 bg-[#09090b]/80 backdrop-blur-md border-b border-white/[0.06]' : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-[26px] h-[26px] rounded-md bg-cyan-400 flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-950" strokeWidth={2.5} />
            </div>
            <span
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              className="text-[17px] font-semibold text-white tracking-tight"
            >
              SkillSwap
            </span>
          </Link>
          
          {isAuthPage && (
            <Link to="/" className="hidden sm:flex items-center gap-2 text-[13px] font-medium text-zinc-500 hover:text-white transition-colors">
              <ArrowLeft size={14} />
              Back to Home
            </Link>
          )}
        </div>

        {/* Desktop Menu */}
        {!isAuthPage && (
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className="text-[13px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="w-px h-4 bg-white/[0.06]" />
            <div className="flex items-center gap-3">
              {!loading && (
                <>
                  {currentUser ? (
                    <div className="flex items-center gap-2">
                      <Link to="/chat" className="relative flex items-center justify-center w-9 h-9 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
                        <MessageSquare size={17} strokeWidth={1.8} />
                        {unreadCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full bg-cyan-400 text-zinc-950 text-[9px] font-black leading-none">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </Link>
                      <NotificationBell align="right" />
                      <Link to="/profile" className="flex shrink-0">
                        <Avatar
                          avatarId={userProfile?.avatar}
                          size={36}
                          className="rounded-xl border border-white/[0.08] hover:border-cyan-400/50 transition-colors"
                        />
                      </Link>
                    </div>
                  ) : (
                    <>
                      <Link to="/login" className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors">
                        Sign In
                      </Link>
                      <PrimaryButton 
                        to="/signup" 
                        className="px-4 py-1.5 rounded-full text-[12px] bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400/20 hover:border-cyan-400/40"
                      >
                        Join Now
                      </PrimaryButton>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Mobile Toggle */}
        {!isAuthPage && (
          <button 
            className="md:hidden text-zinc-400 hover:text-white p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && !isAuthPage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-[#09090b]/95 backdrop-blur-xl border-b border-white/[0.06] md:hidden"
          >
            <div className="flex flex-col p-6 gap-5">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-[15px] font-medium text-zinc-300 hover:text-white"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px w-full bg-white/[0.06] my-1" />
              {!loading && (
                <>
                  {currentUser ? (
                    <div className="flex items-center justify-between bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <Avatar
                          avatarId={userProfile?.avatar}
                          size={40}
                          className="rounded-full border border-white/10"
                        />
                        <div>
                          <p className="text-sm font-medium text-white truncate max-w-[120px]">{userProfile?.displayName || userProfile?.name || currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}</p>
                          <p className="text-[11px] text-zinc-500">Authenticated</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to="/chat" onClick={() => setIsOpen(false)} className="p-2.5 bg-white/[0.05] rounded-lg text-zinc-400 hover:text-cyan-400 transition-colors">
                          <MessageSquare size={18} />
                        </Link>
                        <Link to="/dashboard" onClick={() => setIsOpen(false)} className="p-2.5 bg-cyan-400/10 rounded-lg text-cyan-400 border border-cyan-400/20">
                          <ArrowLeftRight size={18} />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Link 
                        to="/login" 
                        onClick={() => setIsOpen(false)}
                        className="text-[15px] font-medium text-zinc-300 hover:text-white"
                      >
                        Sign In
                      </Link>
                      <PrimaryButton 
                        to="/signup" 
                        onClick={() => setIsOpen(false)}
                        className="py-2.5 rounded-lg bg-cyan-400 text-zinc-950 mt-2"
                      >
                        Join Now
                      </PrimaryButton>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
