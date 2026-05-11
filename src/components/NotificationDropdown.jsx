import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Check, Trash2, ArrowLeftRight, MessageSquare,
  UserCheck, Eye, Sparkles, BellOff, AlertTriangle, FileText, Clock
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import Avatar from './Avatar';

// ── Type → icon / color ──────────────────────────────────────────────────────
const TYPE_META = {
  request:  { icon: ArrowLeftRight, color: 'text-cyan-400',    bg: 'bg-cyan-400/10' },
  accept:   { icon: UserCheck,      color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  interest: { icon: Sparkles,       color: 'text-violet-400',  bg: 'bg-violet-400/10' },
  message:  { icon: MessageSquare,  color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  profile:  { icon: Eye,            color: 'text-amber-400',   bg: 'bg-amber-400/10' },
  connect:  { icon: UserCheck,      color: 'text-cyan-400',    bg: 'bg-cyan-400/10' },
  warning:  { icon: AlertTriangle,  color: 'text-amber-400',   bg: 'bg-amber-400/10' },
  contract: { icon: FileText,       color: 'text-violet-400',  bg: 'bg-violet-400/10' },
  session:  { icon: Clock,          color: 'text-cyan-400',    bg: 'bg-cyan-400/10' },
};

// ── Relative-time helper (works with Firestore Timestamps) ────────────────────
const formatRelativeTime = (ts) => {
  if (!ts) return '';
  // Firestore Timestamp → millis, JS Date → millis, plain number → millis
  const millis =
    typeof ts.toMillis === 'function'
      ? ts.toMillis()
      : ts instanceof Date
      ? ts.getTime()
      : Number(ts);

  const diff = Date.now() - millis;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(millis).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const dropdownVariants = {
  hidden:  { opacity: 0, scale: 0.96, y: -8 },
  visible: { opacity: 1, scale: 1,    y: 0,   transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, scale: 0.96, y: -8,  transition: { duration: 0.15 } },
};

const itemVariants = {
  hidden:  { opacity: 0, x: -6 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.04, duration: 0.25 } }),
};

/**
 * NotificationBell – bell icon with animated badge + fixed-position dropdown.
 * `align` controls whether the panel anchors to the right (default) or left.
 */
export default function NotificationBell({ align = 'right' }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const panelRef  = useRef(null);
  const [panelStyle, setPanelStyle] = useState({});

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        open &&
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        !buttonRef.current?.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Compute panel position whenever it opens or window resizes/scrolls
  useEffect(() => {
    const updatePosition = () => {
      if (!open || !buttonRef.current) return;
      const rect        = buttonRef.current.getBoundingClientRect();
      const panelHeight = 420;
      const panelWidth  = 360;
      const offset      = 8;
      const spaceBelow  = window.innerHeight - rect.bottom;
      const openUp      = spaceBelow < panelHeight + offset;

      let top  = openUp ? rect.top - panelHeight - offset : rect.bottom + offset;
      if (top < 8) top = 8;

      let left = align === 'right' ? rect.right - panelWidth : rect.left;
      if (left < 10) left = 10;
      if (left + panelWidth > window.innerWidth - 10) left = window.innerWidth - panelWidth - 10;

      setPanelStyle({ top: `${top}px`, left: `${left}px`, width: `${panelWidth}px` });
    };

    if (open) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, align]);

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={buttonRef}
        id="notification-bell"
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
        aria-label="Notifications"
      >
        <Bell size={17} strokeWidth={1.8} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full bg-cyan-400 text-zinc-950 text-[9px] font-black leading-none"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Fixed dropdown via portal */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={panelRef}
              className="fixed z-[9999] max-h-[420px] overflow-y-auto bg-[#111113] bg-opacity-90 backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-2xl"
              style={panelStyle}
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-[15px] font-semibold text-white font-display">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-1.5 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      title="Mark all as read"
                      className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-cyan-400 transition-colors"
                    >
                      <Check size={12} /> All read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      title="Clear all"
                      className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="max-h-[340px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 gap-3 text-center px-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                      <BellOff size={22} className="text-zinc-600" />
                    </div>
                    <p className="text-[14px] font-medium text-zinc-400">All caught up!</p>
                    <p className="text-[12px] text-zinc-600">
                      No notifications yet. Interactions will appear here.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-white/[0.04]">
                    {notifications.map((notif, i) => {
                      const meta = TYPE_META[notif.type] || TYPE_META.interest;
                      const Icon = meta.icon;
                      const avatarId = notif.avatar || null;

                      return (
                        <motion.li
                          key={notif.id}
                          custom={i}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          onClick={() => markAsRead(notif.id)}
                          className={`flex gap-3 px-5 py-3.5 cursor-pointer transition-colors ${
                            notif.read
                              ? 'hover:bg-white/[0.02]'
                              : 'bg-white/[0.025] hover:bg-white/[0.04]'
                          } group`}
                        >
                          {/* Avatar + type badge */}
                          <div className="relative shrink-0">
                            <Avatar
                              avatarId={avatarId}
                              size={36}
                              className="rounded-full bg-zinc-800 border border-white/[0.08]"
                            />
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${meta.bg} flex items-center justify-center border border-[#111113]`}
                            >
                              <Icon size={8} className={meta.color} />
                            </span>
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            {notif.type === 'warning' ? (
                              <p className="text-[13px] text-amber-400/90 leading-relaxed">
                                <span className="font-semibold text-amber-400 block mb-0.5">{notif.title || 'Admin Warning'}</span>
                                <span className="text-zinc-300">{notif.message}</span>
                              </p>
                            ) : (
                              <p className="text-[13px] text-zinc-200 leading-relaxed">
                                <span className="font-semibold text-white">{notif.name}</span>{' '}
                                {notif.message}
                              </p>
                            )}
                            <p className="text-[11px] text-zinc-600 mt-0.5">
                              {formatRelativeTime(notif.createdAt)}
                            </p>
                          </div>

                          {/* Unread dot */}
                          {!notif.read && (
                            <span className="mt-1.5 w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                          )}
                        </motion.li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-5 py-3 border-t border-white/[0.06] text-center">
                  <button
                    onClick={markAllAsRead}
                    className="text-[12px] text-zinc-600 hover:text-cyan-400 transition-colors"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
