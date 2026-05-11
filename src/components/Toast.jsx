import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const TYPE_CONFIG = {
  success: {
    icon: CheckCircle2,
    borderColor: 'border-emerald-500/30',
    barColor:    'bg-emerald-500',
    iconColor:   'text-emerald-400',
    iconBg:      'bg-emerald-500/10',
    shadow:      'shadow-emerald-500/10',
  },
  error: {
    icon: XCircle,
    borderColor: 'border-red-500/30',
    barColor:    'bg-red-500',
    iconColor:   'text-red-400',
    iconBg:      'bg-red-500/10',
    shadow:      'shadow-red-500/10',
  },
  info: {
    icon: Info,
    borderColor: 'border-cyan-500/30',
    barColor:    'bg-cyan-500',
    iconColor:   'text-cyan-400',
    iconBg:      'bg-cyan-500/10',
    shadow:      'shadow-cyan-500/10',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-amber-500/30',
    barColor:    'bg-amber-500',
    iconColor:   'text-amber-400',
    iconBg:      'bg-amber-500/10',
    shadow:      'shadow-amber-500/10',
  },
};

/**
 * Toast stack — renders fixed bottom-right via portal.
 * Receives toasts array and dismissToast callback from useToast hook.
 *
 * @param {{ toasts: Array<{id, type, message}>, onDismiss: function }} props
 */
const Toast = ({ toasts = [], onDismiss }) => {
  return createPortal(
    <div className="fixed bottom-6 right-6 z-[9998] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const cfg = TYPE_CONFIG[t.type] || TYPE_CONFIG.info;
          const Icon = cfg.icon;

          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 40, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`bg-[#111113] border ${cfg.borderColor} shadow-2xl ${cfg.shadow} rounded-xl p-4 flex items-start gap-3 w-80 relative overflow-hidden pointer-events-auto`}
            >
              {/* Left accent bar */}
              <div className={`absolute top-0 left-0 w-1 h-full ${cfg.barColor}`} />

              {/* Icon */}
              <div className={`w-8 h-8 rounded-full ${cfg.iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={16} className={cfg.iconColor} />
              </div>

              {/* Message */}
              <p className="flex-1 min-w-0 text-[13px] text-zinc-300 leading-relaxed pr-5">
                {t.message}
              </p>

              {/* Close */}
              <button
                onClick={() => onDismiss(t.id)}
                className="absolute top-3.5 right-3.5 text-zinc-600 hover:text-white transition-colors"
              >
                <X size={13} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
};

export default Toast;
