import { motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';

/**
 * AuthLoadingScreen
 *
 * Shown while Firebase onAuthStateChanged is resolving.
 * Blocks ALL app rendering so no authenticated or unauthenticated UI
 * can flash before the auth state is known.
 *
 * Design: matches SkillSwap dark theme (bg #09090b, cyan accent).
 */
const AuthLoadingScreen = () => {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#09090b]"
      aria-label="Loading SkillSwap…"
      role="status"
    >
      {/* Logo mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col items-center gap-5"
      >
        {/* Icon + wordmark */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 180, 360] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-xl bg-cyan-400 flex items-center justify-center shrink-0"
          >
            <ArrowLeftRight className="w-5 h-5 text-zinc-950" strokeWidth={2.5} />
          </motion.div>
          <span
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            className="text-[22px] font-semibold text-white tracking-tight"
          >
            SkillSwap
          </span>
        </div>

        {/* Spinner ring */}
        <div className="relative flex items-center justify-center mt-2">
          <div className="w-9 h-9 rounded-full border-2 border-cyan-400/20" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            className="absolute w-9 h-9 rounded-full border-2 border-transparent border-t-cyan-400"
          />
        </div>

        {/* Subtle status text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[13px] text-zinc-600 font-medium tracking-wide"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Initializing session…
        </motion.p>
      </motion.div>

      {/* Bottom ambient glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[520px] h-[180px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center bottom, rgba(34,211,238,0.07) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};

export default AuthLoadingScreen;
