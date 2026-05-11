/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, CheckCircle2, XCircle, Info } from 'lucide-react';
import { useAuth } from './AuthContext';
import {
  subscribeToNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
  createNotification,
} from '../firebase/notificationService';

export const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  
  const isFirstLoad = useRef(true);
  const prevNotifsRef = useRef([]);

  // ── Internal toast adder (used before showToast is defined) ──────────────
  const addToastInternal = useCallback((type, message, duration = 5000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  // ── Subscribe to real Firestore notifications ────────────────────────────
  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([]);
      isFirstLoad.current = true;
      return;
    }

    const unsubscribe = subscribeToNotifications(currentUser.uid, (data) => {
      console.log('[NOTIFICATION LISTENER] snapshot received, count:', data.length);
      
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        prevNotifsRef.current = data;
        setNotifications(data);
        return;
      }

      // Check for new warnings (not in previous snapshot, type warning, unread)
      const prevIds = new Set(prevNotifsRef.current.map((n) => n.id));
      const newWarnings = data.filter((n) => !prevIds.has(n.id) && n.type === 'warning' && !n.read);

      if (newWarnings.length > 0) {
        console.log('[NEW WARNING RECEIVED]', newWarnings);
        newWarnings.forEach((w) => {
          addToastInternal('warning', w.message);
        });
      }

      prevNotifsRef.current = data;
      setNotifications(data);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // ── Derived: unread count ────────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Actions ──────────────────────────────────────────────────────────────

  const markAsRead = useCallback(
    (id) => {
      markNotificationRead(id);
    },
    []
  );

  const markAllAsRead = useCallback(() => {
    if (currentUser?.uid) {
      markAllNotificationsRead(currentUser.uid);
    }
  }, [currentUser?.uid]);

  const clearAll = useCallback(() => {
    if (currentUser?.uid) {
      clearAllNotifications(currentUser.uid);
    }
  }, [currentUser?.uid]);

  /**
   * Generic toast — supports 'success' | 'error' | 'info' | 'warning'
   */
  const showToast = useCallback((type, message, duration = 4000) => {
    console.log(`[NotificationContext Toast] ${type}: ${message}`);
    addToastInternal(type, message, duration);
  }, [addToastInternal]);

  /**
   * Adds a notification for the CURRENT user (used for self-notifications like
   * "Your profile was viewed"). For cross-user notifications, use createNotification
   * directly in the service layer.
   */
  const addNotification = useCallback(
    ({ type, name, text, avatar }) => {
      if (!currentUser?.uid) return;
      createNotification(currentUser.uid, type, text, name, avatar || null);
    },
    [currentUser?.uid]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        addNotification,
        showToast,
      }}
    >
      {children}
      
      {/* Toast Portal / Overlay */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const cfg = {
              warning: { bar: 'bg-amber-500',   border: 'border-amber-500/30',   icon: <AlertTriangle size={16} className="text-amber-400" />,    iconBg: 'bg-amber-500/10',   label: 'ADMIN WARNING', labelColor: 'text-amber-400' },
              success: { bar: 'bg-emerald-500',  border: 'border-emerald-500/30', icon: <CheckCircle2  size={16} className="text-emerald-400" />,   iconBg: 'bg-emerald-500/10', label: null, labelColor: '' },
              error:   { bar: 'bg-red-500',      border: 'border-red-500/30',     icon: <XCircle      size={16} className="text-red-400" />,        iconBg: 'bg-red-500/10',     label: null, labelColor: '' },
              info:    { bar: 'bg-cyan-500',     border: 'border-cyan-500/30',    icon: <Info         size={16} className="text-cyan-400" />,        iconBg: 'bg-cyan-500/10',    label: null, labelColor: '' },
            }[t.type] || { bar: 'bg-amber-500', border: 'border-amber-500/30',   icon: <AlertTriangle size={16} className="text-amber-400" />,    iconBg: 'bg-amber-500/10',   label: 'INFO', labelColor: 'text-amber-400' };

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`bg-[#111113] border ${cfg.border} shadow-2xl rounded-xl p-4 flex items-start gap-3 w-80 relative overflow-hidden pointer-events-auto`}
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${cfg.bar}`} />
                <div className={`w-8 h-8 rounded-full ${cfg.iconBg} flex items-center justify-center shrink-0`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  {cfg.label && (
                    <p className={`text-[13px] font-bold ${cfg.labelColor} mb-0.5 tracking-wide`}>{cfg.label}</p>
                  )}
                  <p className="text-[13px] text-zinc-300 leading-relaxed">{t.message}</p>
                </div>
                <button
                  onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                  className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};
