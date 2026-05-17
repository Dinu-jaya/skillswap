/**
 * XPWidget.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Compact XP + Level progression widget for the Dashboard right column.
 *
 * Reads live data directly from AuthContext (userProfile), which is already
 * subscribed to users/{uid} via onSnapshot — zero extra Firestore reads.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getXPProgress, getRankTitle } from '../services/xpService';

// ── Rank colour palette ───────────────────────────────────────────────────────
const RANK_STYLES = {
  'Beginner':     { bar: 'from-emerald-400 to-emerald-500', badge: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/[0.06]' },
  'Learner':      { bar: 'from-cyan-400 to-cyan-500',       badge: 'text-cyan-400 border-cyan-400/20 bg-cyan-400/[0.06]' },
  'Collaborator': { bar: 'from-violet-400 to-violet-500',   badge: 'text-violet-400 border-violet-400/20 bg-violet-400/[0.06]' },
  'Mentor':       { bar: 'from-amber-400 to-orange-400',    badge: 'text-amber-400 border-amber-400/20 bg-amber-400/[0.06]' },
  'Skill Master': { bar: 'from-cyan-300 via-violet-400 to-pink-400', badge: 'text-pink-400 border-pink-400/20 bg-pink-400/[0.06]' },
};

const XPWidget = () => {
  const { userProfile } = useAuth();

  const xp        = userProfile?.xp        ?? 0;
  const level     = userProfile?.level     ?? 1;
  const rankTitle = userProfile?.rankTitle ?? getRankTitle(level);

  const { current, required, remaining, percentage } = getXPProgress(xp, level);

  const styles = RANK_STYLES[rankTitle] || RANK_STYLES['Beginner'];

  return (
    <div className="glass-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-400/[0.08] border border-cyan-400/20 flex items-center justify-center shrink-0">
            <Zap size={14} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-600 uppercase tracking-widest font-semibold">Progression</p>
            <p className="text-[13px] font-semibold text-white leading-none mt-0.5">Level {level}</p>
          </div>
        </div>

        {/* Rank badge */}
        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${styles.badge}`}>
          {rankTitle}
        </span>
      </div>

      {/* XP progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-500">{current} / {required} XP</span>
          <span className="text-zinc-600">{remaining} XP to Lv.{level + 1}</span>
        </div>

        <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${styles.bar}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        <p className="text-[10px] text-zinc-700">{percentage}% through Level {level}</p>
      </div>

      {/* Total XP */}
      <div className="pt-1 border-t border-white/[0.04]">
        <p className="text-[11px] text-zinc-600">
          Total XP: <span className="text-zinc-400 font-medium">{xp.toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
};

export default XPWidget;
