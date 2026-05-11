import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  User,
  Calendar,
  FileText,
  ExternalLink,
  StickyNote,
} from 'lucide-react';

// ── Date formatter ─────────────────────────────────────────────────────────────
const formatDate = (val) => {
  if (!val) return null;
  try {
    const d = val?.toDate ? val.toDate() : new Date(val);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return null;
  }
};

/**
 * SessionCard — timeline card for an individual session.
 *
 * Props:
 *  - session: Firestore session object
 *  - isLast: bool — hides the connector line on the last item
 *  - onMarkComplete: fn(session) — opens MarkCompleteModal
 *  - canMarkComplete: bool — only allowed if contract is active
 */
const SessionCard = ({ session, isLast = false, onMarkComplete, canMarkComplete = false, delay = 0 }) => {
  const isCompleted = session.status === 'completed';
  const scheduledDate = formatDate(session.scheduledAt);
  const completedDate = formatDate(session.completedAt);

  return (
    <div className="relative flex gap-4">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-[18px] top-[38px] w-px bottom-0 bg-white/[0.06]" />
      )}

      {/* Timeline dot */}
      <div className={`shrink-0 mt-1 w-9 h-9 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
        isCompleted
          ? 'border-emerald-400 bg-emerald-400/10'
          : 'border-white/[0.12] bg-[#0c0c0e]'
      }`}>
        {isCompleted
          ? <CheckCircle2 size={16} className="text-emerald-400" />
          : <span className="text-[11px] font-bold text-zinc-600">{session.sessionNumber}</span>
        }
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay, ease: 'easeOut' }}
        className={`flex-1 mb-5 p-4 rounded-xl border transition-all ${
          isCompleted
            ? 'bg-emerald-500/[0.04] border-emerald-500/20'
            : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
                Session {session.sessionNumber}
              </span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                isCompleted
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-white/[0.04] text-zinc-500 border-white/[0.06]'
              }`}>
                {isCompleted ? 'Completed' : 'Pending'}
              </span>
            </div>
            <p className="text-[14px] font-semibold text-white">{session.topic || 'Untitled Session'}</p>
          </div>

          {/* Mark complete button */}
          {!isCompleted && canMarkComplete && (
            <button
              onClick={() => onMarkComplete(session)}
              className="shrink-0 flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 border border-emerald-400/20 hover:border-emerald-400/40 px-3 py-1.5 rounded-lg bg-emerald-400/[0.06] hover:bg-emerald-400/[0.12] transition-all"
            >
              <CheckCircle2 size={11} />
              Complete
            </button>
          )}
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-3 text-[11px] text-zinc-600">
          {session.taughtByName && (
            <span className="flex items-center gap-1">
              <User size={10} /> Taught by {session.taughtByName}
            </span>
          )}
          {scheduledDate && (
            <span className="flex items-center gap-1">
              <Calendar size={10} /> {scheduledDate}
            </span>
          )}
          {isCompleted && completedDate && (
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 size={10} /> Done {completedDate}
            </span>
          )}
        </div>

        {/* Notes */}
        {session.notes && (
          <div className="mt-3 p-2.5 bg-white/[0.02] border border-white/[0.05] rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <StickyNote size={10} className="text-zinc-600" />
              <span className="text-[10px] text-zinc-600 uppercase tracking-wide">Notes</span>
            </div>
            <p className="text-[12px] text-zinc-400 leading-relaxed">{session.notes}</p>
          </div>
        )}

        {/* Proof URL */}
        {session.proofUrl && (
          <div className="mt-2">
            <a
              href={session.proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ExternalLink size={10} />
              View proof
            </a>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SessionCard;
